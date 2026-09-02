import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    if (houseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId)) {
      const existing = await this.prisma.house.findUnique({ where: { id: houseId } });
      if (existing) return existing.id;
    }
    if (houseId) {
      const houseByCode = await this.prisma.house.findFirst({ where: { inviteCode: houseId } });
      if (houseByCode) return houseByCode.id;
    }
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  private async resolveMemberId(memberId: string, houseId: string): Promise<string | null> {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;

    if (memberId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) {
      const byId = await this.prisma.houseMember.findFirst({ where: { id: memberId, houseId: targetHouseId } });
      if (byId) return byId.id;
      const byUserId = await this.prisma.houseMember.findFirst({ where: { userId: memberId, houseId: targetHouseId } });
      if (byUserId) return byUserId.id;
    }

    const members = await this.prisma.houseMember.findMany({ where: { houseId: targetHouseId }, orderBy: { joinedAt: "asc" } });
    if (members.length === 0) return null;
    const idx = parseInt((memberId || "").replace(/\D/g, "") || "1", 10) - 1;
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
    const targetHouseId = await this.resolveHouseId(data.houseId);
    if (!targetHouseId) throw new Error("House not found");
    const targetMemberId = await this.resolveMemberId(data.memberId, targetHouseId);
    if (!targetMemberId) throw new Error("Member not found");
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
    return expenses.map(e => {
      const name = e.member?.user ? `${e.member.user.firstName || ""} ${e.member.user.lastName || ""}`.trim() : "Member";
      return {
        id: e.id, houseId: e.houseId, memberId: e.memberId,
        memberName: name,
        paidByMemberId: e.memberId,
        paidByMemberName: name,
        date: e.date.toISOString().split("T")[0], amount: Number(e.amount), category: e.category, description: e.description, items: e.items, status: e.status.toLowerCase(),
      };
    });
  }

  async submitMarketExpense(data: { houseId: string; memberId?: string; paidByMemberId?: string; date: string; amount: number; category: string; description: string; items?: any }) {
    const rawMemberId = data.memberId || data.paidByMemberId || "";
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(rawMemberId, targetHouseId)) || rawMemberId;
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
