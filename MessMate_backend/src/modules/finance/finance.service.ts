import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId)) return houseId;
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  private async resolveMemberId(memberId: string, houseId: string): Promise<string | null> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) return memberId;
    const indexMatch = memberId.match(/^m(\d+)$/i);
    const members = await this.prisma.houseMember.findMany({ where: { houseId }, orderBy: { joinedAt: "asc" } });
    if (indexMatch && members.length > 0) {
      const idx = parseInt(indexMatch[1], 10) - 1;
      if (members[idx]) return members[idx].id;
    }
    return members[0]?.id || null;
  }

  async getBills(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const bills = await this.prisma.houseExpense.findMany({
      where: { houseId: targetHouseId },
      include: { paidByMember: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    return bills.map(b => ({
      id: b.id, houseId: b.houseId, category: b.category, month: b.month, amount: Number(b.amount),
      paidBy: b.paidByMember?.user ? `${b.paidByMember.user.firstName || ""} ${b.paidByMember.user.lastName || ""}`.trim() : "House",
      dueDate: b.dueDate ? b.dueDate.toISOString().split("T")[0] : undefined,
      status: b.status.toLowerCase(), description: b.description, units: b.units, prevReading: b.prevReading, currReading: b.currReading,
    }));
  }

  async addBill(data: { houseId: string; category: string; month: string; amount: number; paidByMemberId?: string; dueDate?: string; units?: number; prevReading?: number; currReading?: number }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    return this.prisma.houseExpense.create({
      data: { houseId: targetHouseId, category: data.category, month: data.month, amount: data.amount, paidByMemberId: data.paidByMemberId, dueDate: data.dueDate ? new Date(data.dueDate) : null, units: data.units, prevReading: data.prevReading, currReading: data.currReading, status: "UNPAID" },
    });
  }

  async getPayments(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const payments = await this.prisma.walletPayment.findMany({
      where: { houseId: targetHouseId },
      include: { member: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
      orderBy: { date: "desc" },
    });
    return payments.map(p => ({
      id: p.id, houseId: p.houseId, memberId: p.memberId,
      memberName: p.member.user ? `${p.member.user.firstName || ""} ${p.member.user.lastName || ""}`.trim() : "Member",
      amount: Number(p.amount), date: p.date.toISOString().split("T")[0], method: p.method, reference: p.reference, note: p.note, status: p.status.toLowerCase(),
    }));
  }

  async addPayment(data: { houseId: string; memberId: string; amount: number; date: string; method?: any; reference?: string; note?: string }) {
    let paymentMethod: any = "CASH";
    if (data.method) {
      const clean = data.method.toString().toUpperCase().replace(/\s+/g, "_");
      if (["CASH", "BKASH", "NAGAD", "BANK_TRANSFER", "ROCKET"].includes(clean)) paymentMethod = clean;
    }
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    return this.prisma.walletPayment.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, amount: data.amount, date: new Date(data.date), method: paymentMethod, reference: data.reference, note: data.note, status: "PENDING" },
    });
  }

  async updatePaymentStatus(id: string, status: "APPROVED" | "REJECTED") {
    let targetId = id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      const pending = await this.prisma.walletPayment.findMany({ where: { status: "PENDING" }, orderBy: { date: "desc" } });
      targetId = pending.length > 0 ? pending[0].id : ((await this.prisma.walletPayment.findFirst({ orderBy: { date: "desc" } }))?.id || id);
    }
    return this.prisma.walletPayment.update({ where: { id: targetId }, data: { status } });
  }

  async getFines(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const fines = await this.prisma.fine.findMany({
      where: { houseId: targetHouseId },
      include: { member: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    return fines.map(f => ({
      id: f.id, houseId: f.houseId, memberId: f.memberId,
      memberName: f.member.user ? `${f.member.user.firstName || ""} ${f.member.user.lastName || ""}`.trim() : "Member",
      reason: f.reason, amount: Number(f.amount), date: f.date.toISOString().split("T")[0], status: f.status, allocation: f.allocation,
    }));
  }

  async applyFine(data: { houseId: string; memberId: string; amount: number; reason: string; date: string }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    return this.prisma.fine.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, amount: data.amount, reason: data.reason, date: new Date(data.date), status: "applied", allocation: "House fund" },
    });
  }
}
