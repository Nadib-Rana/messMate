import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyMeals(houseId: string, date?: string) {
    return this.prisma.dailyMealRecord.findMany({
      where: {
        houseId,
        ...(date ? { date: new Date(date) } : {}),
      },
      include: {
        member: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async toggleMeal(data: { houseId: string; memberId: string; date: string; breakfast?: boolean; lunch?: boolean; dinner?: boolean }) {
    const recordDate = new Date(data.date);
    const existing = await this.prisma.dailyMealRecord.findFirst({
      where: { memberId: data.memberId, date: recordDate },
    });

    const b = data.breakfast !== undefined ? data.breakfast : existing?.breakfast ?? true;
    const l = data.lunch !== undefined ? data.lunch : existing?.lunch ?? true;
    const d = data.dinner !== undefined ? data.dinner : existing?.dinner ?? true;

    const weightedCount = (b ? 0.5 : 0) + (l ? 1.0 : 0) + (d ? 1.0 : 0);

    if (existing) {
      return this.prisma.dailyMealRecord.update({
        where: { id: existing.id },
        data: { breakfast: b, lunch: l, dinner: d, weightedCount, isOverride: true },
      });
    }

    return this.prisma.dailyMealRecord.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        date: recordDate,
        breakfast: b,
        lunch: l,
        dinner: d,
        weightedCount,
        isOverride: true,
      },
    });
  }

  async getMealStopRequests(houseId: string) {
    return this.prisma.mealStopRequest.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async submitMealStopRequest(data: { houseId: string; memberId: string; startDate: string; endDate: string; reason: string }) {
    return this.prisma.mealStopRequest.create({
      data: {
        houseId: data.houseId,
        memberId: data.memberId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: "PENDING",
      },
    });
  }

  async updateMealStopStatus(id: string, status: "APPROVED" | "REJECTED") {
    return this.prisma.mealStopRequest.update({
      where: { id },
      data: { status },
    });
  }

  async getGuestMeals(houseId: string) {
    return this.prisma.guestMeal.findMany({
      where: { houseId },
      include: {
        hostMember: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async addGuestMeal(data: { houseId: string; hostMemberId: string; guestName: string; startDate: string; endDate: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } }) {
    const mealCount = (data.meals.breakfast ? 0.5 : 0) + (data.meals.lunch ? 1.0 : 0) + (data.meals.dinner ? 1.0 : 0);
    const estimatedCost = mealCount * 42.5;

    return this.prisma.guestMeal.create({
      data: {
        houseId: data.houseId,
        hostMemberId: data.hostMemberId,
        guestName: data.guestName,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        breakfast: data.meals.breakfast,
        lunch: data.meals.lunch,
        dinner: data.meals.dinner,
        totalMeals: mealCount,
        cost: estimatedCost,
      },
    });
  }
}
