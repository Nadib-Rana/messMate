import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async getMarketDuties(houseId: string) {
    const duties = await this.prisma.marketDuty.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });

    return duties.map(d => ({
      id: d.id,
      houseId: d.houseId,
      memberId: d.memberId,
      memberName: d.member.user ? `${d.member.user.firstName || ''} ${d.member.user.lastName || ''}`.trim() : 'Member',
      startDate: d.startDate.toISOString().split("T")[0],
      endDate: d.endDate.toISOString().split("T")[0],
      status: d.status.toLowerCase(),
      notes: d.notes,
    }));
  }

  async assignMarketDuty(data: { houseId: string; memberId: string; startDate: string; endDate: string; notes?: string }) {
    return this.prisma.marketDuty.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
        status: "UPCOMING",
      },
    });
  }

  async getMarketExpenses(houseId: string) {
    const expenses = await this.prisma.marketExpense.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { date: "desc" },
    });

    return expenses.map(e => ({
      id: e.id,
      houseId: e.houseId,
      memberId: e.memberId,
      memberName: e.member.user ? `${e.member.user.firstName || ''} ${e.member.user.lastName || ''}`.trim() : 'Member',
      date: e.date.toISOString().split("T")[0],
      amount: Number(e.amount),
      category: e.category,
      description: e.description,
      items: e.items,
      status: e.status.toLowerCase(),
    }));
  }

  async submitMarketExpense(data: { houseId: string; memberId: string; date: string; amount: number; category: string; description: string; items?: any }) {
    return this.prisma.marketExpense.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        date: new Date(data.date),
        amount: data.amount,
        category: data.category,
        description: data.description,
        items: data.items ? data.items : undefined,
        status: "PENDING",
      },
    });
  }

  async updateMarketExpenseStatus(id: string, status: "APPROVED" | "REJECTED") {
    return this.prisma.marketExpense.update({
      where: { id },
      data: { status },
    });
  }
}
