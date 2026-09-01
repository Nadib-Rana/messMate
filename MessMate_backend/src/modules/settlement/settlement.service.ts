import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class SettlementService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId);
    if (isUuid) return houseId;
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  async getSettlement(houseId: string, month: string = "August 2026") {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;

    const closing = await this.prisma.monthlyClosing.findUnique({
      where: { houseId_month: { houseId: targetHouseId, month } },
      include: {
        snapshots: {
          include: { member: { include: { user: true } } },
        },
      },
    });

    if (!closing) return null;

    return {
      month: closing.month,
      status: closing.status.toLowerCase(),
      totalFoodExpense: Number(closing.totalFoodExpense),
      totalMeals: Number(closing.totalWeightedMeals),
      mealRate: Number(closing.finalMealRate),
      totalOtherExpense: Number(closing.totalOtherExpense),
      settlements: closing.snapshots.map(s => ({
        memberId: s.memberId,
        name: s.member.user ? `${s.member.user.firstName || ''} ${s.member.user.lastName || ''}`.trim() : 'Member',
        avatar: s.member.user ? (s.member.user.firstName?.[0] || 'M') : 'M',
        meals: Number(s.totalMeals),
        mealCost: Number(s.mealCost),
        otherShare: Number(s.otherShare),
        fines: Number(s.fines),
        guestMealCost: Number(s.guestMealCost),
        totalResponsibility: Number(s.totalResponsibility),
        paid: Number(s.paid),
        balance: Number(s.balance),
        status: s.status.toLowerCase(),
      })),
    };
  }

  async generateSettlement(houseId: string, month: string = "August 2026") {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;

    const marketExpenses = await this.prisma.marketExpense.findMany({
      where: { houseId: targetHouseId, status: "APPROVED" },
    });
    const totalFoodExpense = marketExpenses.reduce((a, e) => a + Number(e.amount), 0);

    const meals = await this.prisma.dailyMealRecord.findMany({ where: { houseId: targetHouseId } });
    const totalWeightedMeals = meals.reduce((a, m) => a + Number(m.weightedCount), 0) || 1;
    const finalMealRate = Math.round((totalFoodExpense / totalWeightedMeals) * 100) / 100;

    const houseExpenses = await this.prisma.houseExpense.findMany({ where: { houseId: targetHouseId } });
    const totalOtherExpense = houseExpenses.reduce((a, e) => a + Number(e.amount), 0);

    return this.prisma.monthlyClosing.upsert({
      where: { houseId_month: { houseId: targetHouseId, month } },
      update: {
        totalFoodExpense,
        totalWeightedMeals,
        finalMealRate,
        totalOtherExpense,
        status: "GENERATED",
      },
      create: {
        houseId: targetHouseId,
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
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;

    return this.prisma.monthlyClosing.update({
      where: { houseId_month: { houseId: targetHouseId, month } },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  }

  async reopenMonth(houseId: string, month: string = "August 2026") {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;

    return this.prisma.monthlyClosing.update({
      where: { houseId_month: { houseId: targetHouseId, month } },
      data: { status: "OPEN", closedAt: null },
    });
  }
}
