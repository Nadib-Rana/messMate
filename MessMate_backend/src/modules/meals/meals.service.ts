import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyMeals(houseId: string, date?: string) {
    const records = await this.prisma.dailyMealRecord.findMany({
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

    return records.map(r => ({
      id: r.id,
      houseId: r.houseId,
      memberId: r.memberId,
      memberName: r.member.user ? `${r.member.user.firstName || ''} ${r.member.user.lastName || ''}`.trim() : 'Member',
      date: r.date.toISOString().split("T")[0],
      breakfast: r.breakfast,
      lunch: r.lunch,
      dinner: r.dinner,
      weightedCount: Number(r.weightedCount),
      isOverride: r.isOverride,
    }));
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
    const requests = await this.prisma.mealStopRequest.findMany({
      where: { houseId },
      include: {
        member: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map(r => {
      const memberName = r.member.user ? `${r.member.user.firstName || ''} ${r.member.user.lastName || ''}`.trim() : 'Member';
      const avatar = memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      return {
        id: r.id,
        houseId: r.houseId,
        memberId: r.memberId,
        memberName,
        avatar,
        startDate: r.startDate.toISOString().split("T")[0],
        endDate: r.endDate.toISOString().split("T")[0],
        reason: r.reason,
        status: r.status.toLowerCase(),
        submittedAt: r.createdAt.toISOString().split("T")[0],
      };
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
    const guests = await this.prisma.guestMeal.findMany({
      where: { houseId },
      include: {
        hostMember: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return guests.map(g => ({
      id: g.id,
      houseId: g.houseId,
      guestName: g.guestName,
      hostId: g.hostMemberId,
      hostName: g.hostMember.user ? `${g.hostMember.user.firstName || ''} ${g.hostMember.user.lastName || ''}`.trim() : 'Host',
      startDate: g.startDate.toISOString().split("T")[0],
      endDate: g.endDate.toISOString().split("T")[0],
      meals: { breakfast: g.breakfast, lunch: g.lunch, dinner: g.dinner },
      totalMeals: Number(g.totalMeals),
      cost: Number(g.cost),
      status: g.status.toLowerCase(),
    }));
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
