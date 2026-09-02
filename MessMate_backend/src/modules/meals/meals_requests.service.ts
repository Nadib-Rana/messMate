import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MealsRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveHouseId(houseId: string): Promise<string | null> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId)) return houseId;
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  async resolveMemberId(memberId: string, houseId: string): Promise<string | null> {
    if (memberId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) return memberId;
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return null;
    const indexMatch = memberId ? memberId.match(/^m(\d+)$/i) : null;
    const members = await this.prisma.houseMember.findMany({ where: { houseId: targetHouseId }, orderBy: { joinedAt: "asc" } });
    if (indexMatch && members.length > 0) {
      const idx = parseInt(indexMatch[1], 10) - 1;
      if (members[idx]) return members[idx].id;
    }
    return members[0]?.id || null;
  }

  async getMealStopRequests(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const requests = await this.prisma.mealStopRequest.findMany({
      where: { houseId: targetHouseId },
      include: { member: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return requests.map(r => {
      const memberName = r.member.user ? `${r.member.user.firstName || ""} ${r.member.user.lastName || ""}`.trim() : "Member";
      return {
        id: r.id, houseId: r.houseId, memberId: r.memberId, memberName,
        avatar: memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        startDate: r.startDate.toISOString().split("T")[0], endDate: r.endDate.toISOString().split("T")[0],
        meals: { breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner },
        reason: r.reason, status: r.status.toLowerCase(), submittedAt: r.createdAt.toISOString().split("T")[0],
      };
    });
  }

  async submitMealStopRequest(data: { houseId: string; memberId: string; startDate: string; endDate: string; reason: string; meals?: { breakfast: boolean; lunch: boolean; dinner: boolean } }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    return this.prisma.mealStopRequest.create({
      data: {
        houseId: targetHouseId, memberId: targetMemberId,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        breakfast: data.meals?.breakfast ?? true, lunch: data.meals?.lunch ?? true, dinner: data.meals?.dinner ?? true,
        reason: data.reason,
      },
    });
  }

  async updateMealStopStatus(requestId: string, status: "APPROVED" | "REJECTED") {
    const updatedRequest = await this.prisma.mealStopRequest.update({
      where: { id: requestId },
      data: { status },
    });

    if (status === "APPROVED" && updatedRequest) {
      try {
        const { houseId, memberId, startDate, endDate, breakfast, lunch, dinner } = updatedRequest;
        const settings = await this.prisma.houseSetting.findFirst({ where: { houseId } });
        const bw = settings ? Number(settings.breakfastWeight) : 0.5;
        const lw = settings ? Number(settings.lunchWeight) : 1.0;
        const dw = settings ? Number(settings.dinnerWeight) : 1.0;

        const curr = new Date(startDate);
        const end = new Date(endDate);

        while (curr <= end) {
          const recordDate = new Date(curr.toISOString().split("T")[0] + "T12:00:00Z");
          const existing = await this.prisma.dailyMealRecord.findFirst({
            where: { memberId, date: recordDate },
          });

          // Meal stop request specifies which slots are requested to be OFF (if breakfast=true in stop request, breakfast becomes false)
          const newB = breakfast ? false : (existing ? existing.breakfast : true);
          const newL = lunch ? false : (existing ? existing.lunch : true);
          const newD = dinner ? false : (existing ? existing.dinner : true);
          const weightedCount = (newB ? bw : 0) + (newL ? lw : 0) + (newD ? dw : 0);

          if (existing) {
            await this.prisma.dailyMealRecord.update({
              where: { id: existing.id },
              data: { breakfast: newB, lunch: newL, dinner: newD, weightedCount, stopRequestId: requestId, isOverride: true },
            });
          } else {
            await this.prisma.dailyMealRecord.create({
              data: { houseId, memberId, date: recordDate, breakfast: newB, lunch: newL, dinner: newD, weightedCount, stopRequestId: requestId, isOverride: true },
            });
          }

          curr.setDate(curr.getDate() + 1);
        }
      } catch (err) {
        console.error("❌ Error auto-syncing approved meal stop request to daily records:", err);
      }
    }

    return updatedRequest;
  }

  async getGuestMeals(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    const guests = await this.prisma.guestMeal.findMany({
      where: { houseId: targetHouseId },
      include: { hostMember: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { startDate: "desc" },
    });
    return guests.map(g => ({
      id: g.id, houseId: g.houseId, guestName: g.guestName, hostId: g.hostMemberId,
      hostName: g.hostMember?.user ? `${g.hostMember.user.firstName || ""} ${g.hostMember.user.lastName || ""}`.trim() : "Host",
      startDate: g.startDate.toISOString().split("T")[0], endDate: g.endDate.toISOString().split("T")[0],
      meals: { breakfast: g.breakfast, lunch: g.lunch, dinner: g.dinner }, totalMeals: Number(g.totalMeals), cost: Number(g.cost), status: "active",
    }));
  }

  async addGuestMeal(data: { houseId: string; hostMemberId: string; guestName: string; startDate: string; endDate: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetHostId = (await this.resolveMemberId(data.hostMemberId, targetHouseId)) || data.hostMemberId;

    const settings = await this.prisma.houseSetting.findFirst({ where: { houseId: targetHouseId } });
    const bw = settings ? Number(settings.breakfastWeight) : 0.5;
    const lw = settings ? Number(settings.lunchWeight) : 1.0;
    const dw = settings ? Number(settings.dinnerWeight) : 1.0;

    const mealCount = (data.meals.breakfast ? bw : 0) + (data.meals.lunch ? lw : 0) + (data.meals.dinner ? dw : 0);
    const dayCount = Math.max(1, Math.round((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000) + 1);

    const [expenses, dailyRecords] = await Promise.all([
      this.prisma.marketExpense.findMany({ where: { houseId: targetHouseId, status: "APPROVED" }, select: { amount: true } }),
      this.prisma.dailyMealRecord.findMany({ where: { houseId: targetHouseId }, select: { weightedCount: true } }),
    ]);
    const totalFoodExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalWeightedMeals = dailyRecords.reduce((sum, r) => sum + Number(r.weightedCount), 0);
    const mealRate = totalWeightedMeals > 0 ? totalFoodExpense / totalWeightedMeals : 0;
    const estimatedCost = mealCount * dayCount * mealRate;

    return this.prisma.guestMeal.create({
      data: {
        houseId: targetHouseId, hostMemberId: targetHostId, guestName: data.guestName,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        breakfast: data.meals.breakfast, lunch: data.meals.lunch, dinner: data.meals.dinner,
        totalMeals: mealCount * dayCount, cost: estimatedCost,
      },
    });
  }
}
