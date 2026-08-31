import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class HousesService {
  constructor(private readonly prisma: PrismaService) {}

  async createHouse(data: { name: string; address: string; description?: string; managerUserId: string }) {
    const inviteCode = "HM-" + Math.floor(1000 + Math.random() * 9000);
    const house = await this.prisma.house.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        inviteCode,
        settings: {
          create: {
            breakfastWeight: 0.5,
            lunchWeight: 1.0,
            dinnerWeight: 1.0,
            lowWalletThreshold: 500,
            guestMealRule: "Host Pays",
            fineAllocation: "House fund",
            dutyDurationDays: 3,
          },
        },
        members: {
          create: {
            userId: data.managerUserId,
            role: "MANAGER",
            status: "ACTIVE",
          },
        },
      },
      include: {
        settings: true,
        members: true,
      },
    });

    return this.transformHouse(house);
  }

  async findMyHouses(userId: string) {
    const houses = await this.prisma.house.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        settings: true,
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return houses.map(h => this.transformHouse(h));
  }

  async findHouseById(houseId: string) {
    const house = await this.prisma.house.findUnique({
      where: { id: houseId },
      include: {
        settings: true,
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!house) throw new NotFoundException(`House with ID ${houseId} not found`);
    return this.transformHouse(house);
  }

  async updateSettings(houseId: string, settingsDto: any) {
    await this.findHouseById(houseId);

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

    return this.prisma.houseSetting.update({
      where: { houseId },
      data: updateData,
    });
  }

  private transformHouse(house: any) {
    const { settings, ...rest } = house;
    return {
      ...rest,
      setting: settings ? {
        mealWeights: {
          breakfast: Number(settings.breakfastWeight),
          lunch: Number(settings.lunchWeight),
          dinner: Number(settings.dinnerWeight),
        },
        lowWalletThreshold: Number(settings.lowWalletThreshold),
        guestMealRule: settings.guestMealRule,
        fineAllocation: settings.fineAllocation,
        dutyDurationDays: settings.dutyDurationDays,
      } : {
        mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 },
        lowWalletThreshold: 500,
        guestMealRule: "Host Pays",
        fineAllocation: "House fund",
        dutyDurationDays: 3,
      },
    };
  }
}
