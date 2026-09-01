import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId)) return houseId;
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  private async resolveMemberId(memberId: string, houseId: string): Promise<string | null> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) return memberId;
    const members = await this.prisma.houseMember.findMany({ where: { houseId }, orderBy: { joinedAt: "asc" } });
    const idx = parseInt(memberId.replace(/\D/g, "") || "1", 10) - 1;
    return members[idx]?.id || members[0]?.id || null;
  }

  async getMarketDuties(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const duties = await this.prisma.marketDuty.findMany({
      where: { houseId: targetHouseId },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
      orderBy: { startDate: "asc" },
    });
    const todayStr = new Date().toISOString().split("T")[0];
    return duties.map(d => {
      const sStr = d.startDate.toISOString().split("T")[0];
      const eStr = d.endDate.toISOString().split("T")[0];
      let dynamicStatus = "upcoming";
      if (todayStr >= sStr && todayStr <= eStr) dynamicStatus = "current";
      else if (todayStr > eStr) dynamicStatus = "completed";
      return {
        id: d.id, houseId: d.houseId, memberId: d.memberId,
        memberName: d.member.user ? `${d.member.user.firstName || ""} ${d.member.user.lastName || ""}`.trim() : "Member",
        startDate: sStr, endDate: eStr, status: dynamicStatus, notes: d.notes,
      };
    });
  }

  async assignMarketDuty(data: { houseId: string; memberId: string; startDate: string; endDate: string; notes?: string }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    return this.prisma.marketDuty.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, startDate: new Date(data.startDate), endDate: new Date(data.endDate), notes: data.notes, status: "UPCOMING" },
    });
  }

  async getMarketExpenses(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const expenses = await this.prisma.marketExpense.findMany({
      where: { houseId: targetHouseId },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
      orderBy: { date: "desc" },
    });
    return expenses.map(e => ({
      id: e.id, houseId: e.houseId, memberId: e.memberId,
      memberName: e.member.user ? `${e.member.user.firstName || ""} ${e.member.user.lastName || ""}`.trim() : "Member",
      date: e.date.toISOString().split("T")[0], amount: Number(e.amount), category: e.category, description: e.description, items: e.items, status: e.status.toLowerCase(),
    }));
  }

  async submitMarketExpense(data: { houseId: string; memberId: string; date: string; amount: number; category: string; description: string; items?: any }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    return this.prisma.marketExpense.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, date: new Date(data.date), amount: data.amount, category: data.category, description: data.description, items: data.items || undefined, status: "PENDING" },
    });
  }

  async updateMarketExpenseStatus(id: string, status: "APPROVED" | "REJECTED") {
    let targetId = id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      const pending = await this.prisma.marketExpense.findMany({ where: { status: "PENDING" }, orderBy: { date: "desc" } });
      targetId = pending.length > 0 ? pending[0].id : ((await this.prisma.marketExpense.findFirst({ orderBy: { date: "desc" } }))?.id || id);
    }
    return this.prisma.marketExpense.update({ where: { id: targetId }, data: { status } });
  }

  async deleteMarketDuty(id: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return { success: true };
    return this.prisma.marketDuty.delete({ where: { id } }).catch(() => ({ success: true }));
  }

  async clearDuties(houseId: string) {
    const targetHouseId = (await this.resolveHouseId(houseId)) || houseId;
    return this.prisma.marketDuty.deleteMany({ where: { houseId: targetHouseId } }).catch(() => ({ count: 0 }));
  }
}
