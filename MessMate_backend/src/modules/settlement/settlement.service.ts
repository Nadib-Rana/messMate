import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class SettlementService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettlement(houseId: string, month: string = "August 2026") {
    return this.prisma.monthlyClosing.findUnique({
      where: { houseId_month: { houseId, month } },
      include: { snapshots: { include: { member: { include: { user: true } } } } },
    });
  }

  async generateSettlement(houseId: string, month: string = "August 2026") {
    const marketExpenses = await this.prisma.marketExpense.findMany({
      where: { houseId, status: "APPROVED" },
    });
    const totalFoodExpense = marketExpenses.reduce((a, e) => a + Number(e.amount), 0);

    const meals = await this.prisma.dailyMealRecord.findMany({ where: { houseId } });
    const totalWeightedMeals = meals.reduce((a, m) => a + Number(m.weightedCount), 0) || 1;
    const finalMealRate = totalFoodExpense / totalWeightedMeals;

    const houseExpenses = await this.prisma.houseExpense.findMany({ where: { houseId } });
    const totalOtherExpense = houseExpenses.reduce((a, e) => a + Number(e.amount), 0);

    return this.prisma.monthlyClosing.upsert({
      where: { houseId_month: { houseId, month } },
      update: {
        totalFoodExpense,
        totalWeightedMeals,
        finalMealRate,
        totalOtherExpense,
        status: "GENERATED",
      },
      create: {
        houseId,
        month,
        totalFoodExpense,
        totalWeightedMeals,
        finalMealRate,
        totalOtherExpense,
        status: "GENERATED",
      },
    });
  }

  async closeMonth(houseId: string, month: string = "August 2026") {
    return this.prisma.monthlyClosing.update({
      where: { houseId_month: { houseId, month } },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  }

  async reopenMonth(houseId: string, month: string = "August 2026") {
    return this.prisma.monthlyClosing.update({
      where: { houseId_month: { houseId, month } },
      data: { status: "OPEN", closedAt: null },
    });
  }
}
