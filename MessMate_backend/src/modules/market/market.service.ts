import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async getMarketDuties(houseId: string) {
    return this.prisma.marketDuty.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
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
    return this.prisma.marketExpense.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { date: "desc" },
    });
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
