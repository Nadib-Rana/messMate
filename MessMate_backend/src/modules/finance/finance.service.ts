import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getBills(houseId: string) {
    return this.prisma.houseExpense.findMany({
      where: { houseId },
      include: {
        paidByMember: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
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
    return this.prisma.walletPayment.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
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
    return this.prisma.fine.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
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
