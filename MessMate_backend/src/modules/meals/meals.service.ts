import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { MealsRequestsService } from "./meals_requests.service";

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reqService: MealsRequestsService,
  ) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    return this.reqService.resolveHouseId(houseId);
  }

  private async resolveMemberId(memberId: string, houseId: string): Promise<string | null> {
    return this.reqService.resolveMemberId(memberId, houseId);
  }

  async getDailyMeals(houseId: string, date?: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];

    const records = await this.prisma.dailyMealRecord.findMany({
      where: { houseId: targetHouseId, ...(date ? { date: new Date(date) } : {}) },
      include: { member: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
      orderBy: { date: "desc" },
    });

    const map = new Map<string, any[]>();
    for (const r of records) {
      const dateStr = r.date.toISOString().split("T")[0];
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push({ id: r.memberId, breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner, isOverride: r.isOverride });
    }

    return Array.from(map.entries()).map(([dateStr, dayMembers]) => ({
      date: dateStr,
      day: new Date(dateStr + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short" }),
      members: dayMembers,
    }));
  }

  async toggleMeal(data: { houseId: string; memberId: string; date: string; breakfast?: boolean; lunch?: boolean; dinner?: boolean }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    const recordDate = new Date(data.date + "T12:00:00Z");

    const [existing, settings] = await Promise.all([
      this.prisma.dailyMealRecord.findFirst({ where: { memberId: targetMemberId, date: recordDate } }),
      this.prisma.houseSetting.findFirst({ where: { houseId: targetHouseId } }),
    ]);

    const bw = settings ? Number(settings.breakfastWeight) : 0.5;
    const lw = settings ? Number(settings.lunchWeight) : 1.0;
    const dw = settings ? Number(settings.dinnerWeight) : 1.0;

    const b = data.breakfast !== undefined ? data.breakfast : (existing ? !existing.breakfast : true);
    const l = data.lunch     !== undefined ? data.lunch     : (existing ? !existing.lunch     : true);
    const d = data.dinner    !== undefined ? data.dinner    : (existing ? !existing.dinner    : true);
    const weightedCount = (b ? bw : 0) + (l ? lw : 0) + (d ? dw : 0);

    if (existing) {
      return this.prisma.dailyMealRecord.update({
        where: { id: existing.id },
        data: { breakfast: b, lunch: l, dinner: d, weightedCount, isOverride: true },
      });
    }

    return this.prisma.dailyMealRecord.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, date: recordDate, breakfast: b, lunch: l, dinner: d, weightedCount, isOverride: true },
    });
  }

  async getWeeklySchedules(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];
    return this.prisma.weeklySchedule.findMany({ where: { member: { houseId: targetHouseId } } });
  }

  async updateWeeklySchedule(data: { houseId: string; memberId: string; dayOfWeek: string | number; breakfast?: boolean; lunch?: boolean; dinner?: boolean }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const targetMemberId = (await this.resolveMemberId(data.memberId, targetHouseId)) || data.memberId;
    const dayInt = typeof data.dayOfWeek === "number" ? data.dayOfWeek : (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(data.dayOfWeek) >= 0 ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(data.dayOfWeek) : 0);
    const existing = await this.prisma.weeklySchedule.findFirst({
      where: { memberId: targetMemberId, dayOfWeek: dayInt },
    });
    if (existing) {
      return this.prisma.weeklySchedule.update({
        where: { id: existing.id },
        data: { ...(data.breakfast !== undefined && { breakfast: data.breakfast }), ...(data.lunch !== undefined && { lunch: data.lunch }), ...(data.dinner !== undefined && { dinner: data.dinner }) },
      });
    }
    return this.prisma.weeklySchedule.create({
      data: { houseId: targetHouseId, memberId: targetMemberId, dayOfWeek: dayInt, breakfast: data.breakfast ?? true, lunch: data.lunch ?? true, dinner: data.dinner ?? true },
    });
  }

  getMealStopRequests(houseId: string) { return this.reqService.getMealStopRequests(houseId); }
  submitMealStopRequest(data: any) { return this.reqService.submitMealStopRequest(data); }
  updateMealStopStatus(id: string, status: "APPROVED" | "REJECTED") { return this.reqService.updateMealStopStatus(id, status); }
  getGuestMeals(houseId: string) { return this.reqService.getGuestMeals(houseId); }
  addGuestMeal(data: any) { return this.reqService.addGuestMeal(data); }
}
