import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class HousesService {
  constructor(private readonly prisma: PrismaService) {}

  private transformHouse(house: any) {
    const { settings, members, ...rest } = house;
    return {
      ...rest,
      members: members ? members.map((m: any) => ({
        id: m.id, houseId: m.houseId, userId: m.userId,
        name: m.user ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() : "Member",
        email: m.user?.email || "", phone: m.user?.phoneNumber || "",
        role: m.role ? m.role.toLowerCase() : "member",
        avatar: m.user?.firstName ? m.user.firstName.slice(0, 2).toUpperCase() : "MB",
        status: m.status ? m.status.toLowerCase() : "active",
        mealPlan: m.mealPlan || "Full",
      })) : [],
      setting: settings ? {
        mealWeights: { breakfast: Number(settings.breakfastWeight), lunch: Number(settings.lunchWeight), dinner: Number(settings.dinnerWeight) },
        lowWalletThreshold: Number(settings.lowWalletThreshold), guestMealRule: settings.guestMealRule, fineAllocation: settings.fineAllocation, dutyDurationDays: settings.dutyDurationDays,
      } : { mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 }, lowWalletThreshold: 500, guestMealRule: "Host Pays", fineAllocation: "House fund", dutyDurationDays: 3 },
    };
  }

  async createHouse(data: { name: string; address: string; description?: string; managerUserId: string }) {
    const inviteCode = "HM-" + Math.floor(1000 + Math.random() * 9000);
    const house = await this.prisma.house.create({
      data: {
        name: data.name, address: data.address, description: data.description, inviteCode,
        settings: { create: { breakfastWeight: 0.5, lunchWeight: 1.0, dinnerWeight: 1.0, lowWalletThreshold: 500, guestMealRule: "Host Pays", fineAllocation: "House fund", dutyDurationDays: 3 } },
        members: { create: { userId: data.managerUserId, role: "MANAGER", status: "ACTIVE" } },
      },
      include: { settings: true, members: true },
    });
    return this.transformHouse(house);
  }

  async findMyHouses(userId?: string) {
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const include = { settings: true, members: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true } } } } };
    let houses = isUuid ? await this.prisma.house.findMany({ where: { members: { some: { userId } } }, include }) : [];
    if (houses.length === 0) houses = await this.prisma.house.findMany({ include });
    return houses.map(h => this.transformHouse(h));
  }

  async findHouseById(houseId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId);
    const house = await this.prisma.house.findFirst({
      where: isUuid ? { id: houseId } : {},
      include: { settings: true, members: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true } } } } },
    });
    if (!house) throw new NotFoundException(`House not found`);
    return this.transformHouse(house);
  }

  async updateSettings(houseId: string, settingsDto: any) {
    const resolvedHouse = await this.findHouseById(houseId);
    const updateData: any = {};
    if (settingsDto.mealWeights) {
      if (settingsDto.mealWeights.breakfast !== undefined) updateData.breakfastWeight = settingsDto.mealWeights.breakfast;
      if (settingsDto.mealWeights.lunch !== undefined) updateData.lunchWeight = settingsDto.mealWeights.lunch;
      if (settingsDto.mealWeights.dinner !== undefined) updateData.dinnerWeight = settingsDto.mealWeights.dinner;
    }
    if (settingsDto.lowWalletThreshold !== undefined) updateData.lowWalletThreshold = settingsDto.lowWalletThreshold;
    if (settingsDto.guestMealRule !== undefined) updateData.guestMealRule = settingsDto.guestMealRule;
    if (settingsDto.fineAllocation !== undefined) updateData.fineAllocation = settingsDto.fineAllocation;
    if (settingsDto.dutyDurationDays !== undefined) updateData.dutyDurationDays = settingsDto.dutyDurationDays;
    return this.prisma.houseSetting.update({ where: { houseId: resolvedHouse.id }, data: updateData });
  }

  async updateMember(houseId: string, memberId: string, data: { mealPlan?: string; role?: string; status?: string }) {
    const resolvedHouse = await this.findHouseById(houseId);
    if (!resolvedHouse) return null;
    let targetMemberId = memberId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId)) {
      const members = await this.prisma.houseMember.findMany({ where: { houseId: resolvedHouse.id }, orderBy: { joinedAt: "asc" } });
      const idx = parseInt(memberId.replace(/\D/g, "") || "1", 10) - 1;
      targetMemberId = members[idx]?.id || members[0]?.id || memberId;
    }
    const updateData: any = {};
    if (data.mealPlan) updateData.mealPlan = data.mealPlan;
    if (data.role) updateData.role = data.role.toUpperCase() === "MANAGER" ? "MANAGER" : "MEMBER";
    if (data.status) updateData.status = data.status.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    return this.prisma.houseMember.update({ where: { id: targetMemberId }, data: updateData });
  }
}
