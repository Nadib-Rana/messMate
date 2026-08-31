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
            guestMealRule: "HOST_PAYS",
            fineAllocation: "HOUSE_FUND",
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
    return house;
  }

  async findMyHouses(userId: string) {
    return this.prisma.house.findMany({
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
    return house;
  }

  async updateSettings(houseId: string, settingsDto: any) {
    await this.findHouseById(houseId);
    return this.prisma.houseSetting.update({
      where: { houseId },
      data: settingsDto,
    });
  }
}
