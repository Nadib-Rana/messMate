import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getBills(houseId: string) {
    const bills = await this.prisma.houseExpense.findMany({
      where: { houseId },
      include: {
        paidByMember: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return bills.map(b => ({
      id: b.id,
      houseId: b.houseId,
      category: b.category,
      month: b.month,
      amount: Number(b.amount),
      paidBy: b.paidByMember?.user ? `${b.paidByMember.user.firstName || ''} ${b.paidByMember.user.lastName || ''}`.trim() : 'House',
      dueDate: b.dueDate ? b.dueDate.toISOString().split("T")[0] : undefined,
      status: b.status.toLowerCase(),
      description: b.description,
      units: b.units,
      prevReading: b.prevReading,
      currReading: b.currReading,
    }));
  }

  async addBill(data: { houseId: string; category: string; month: string; amount: number; paidByMemberId?: string; dueDate?: string; units?: number; prevReading?: number; currReading?: number }) {
    return this.prisma.houseExpense.create({
      data: {
        houseId: data.houseId,
        category: data.category,
        month: data.month,
        amount: data.amount,
        paidByMemberId: data.paidByMemberId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        units: data.units,
        prevReading: data.prevReading,
        currReading: data.currReading,
        status: "UNPAID",
      },
    });
  }

  async getPayments(houseId: string) {
    const payments = await this.prisma.walletPayment.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    return payments.map(p => ({
      id: p.id,
      houseId: p.houseId,
      memberId: p.memberId,
      memberName: p.member.user ? `${p.member.user.firstName || ''} ${p.member.user.lastName || ''}`.trim() : 'Member',
      amount: Number(p.amount),
      date: p.date.toISOString().split("T")[0],
      method: p.method,
      reference: p.reference,
      note: p.note,
      status: p.status.toLowerCase(),
    }));
  }

  async addPayment(data: { houseId: string; memberId: string; amount: number; date: string; method?: any; reference?: string; note?: string }) {
    return this.prisma.walletPayment.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        amount: data.amount,
        date: new Date(data.date),
        method: data.method || "CASH",
        reference: data.reference,
        note: data.note,
        status: "PENDING",
      },
    });
  }

  async updatePaymentStatus(id: string, status: "APPROVED" | "REJECTED") {
    return this.prisma.walletPayment.update({
      where: { id },
      data: { status },
    });
  }

  async getFines(houseId: string) {
    const fines = await this.prisma.fine.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });

    return fines.map(f => ({
      id: f.id,
      houseId: f.houseId,
      memberId: f.memberId,
      memberName: f.member.user ? `${f.member.user.firstName || ''} ${f.member.user.lastName || ''}`.trim() : 'Member',
      reason: f.reason,
      amount: Number(f.amount),
      date: f.date.toISOString().split("T")[0],
      status: f.status,
      allocation: f.allocation,
    }));
  }

  async applyFine(data: { houseId: string; memberId: string; amount: number; reason: string; date: string }) {
    return this.prisma.fine.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        amount: data.amount,
        reason: data.reason,
        date: new Date(data.date),
        status: "applied",
        allocation: "House fund",
      },
    });
  }
}
