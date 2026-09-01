import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveHouseId(houseId: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(houseId);
    if (isUuid) return houseId;
    const firstHouse = await this.prisma.house.findFirst();
    return firstHouse ? firstHouse.id : null;
  }

  async getNotifications(houseId: string) {
    const targetHouseId = await this.resolveHouseId(houseId);
    if (!targetHouseId) return [];

    const list = await this.prisma.notification.findMany({
      where: { houseId: targetHouseId },
      orderBy: { createdAt: "desc" },
    });

    return list.map(n => ({
      id: n.id,
      houseId: n.houseId,
      type: n.type.toLowerCase(),
      title: n.title,
      message: n.message,
      time: n.createdAt.toISOString().split("T")[0],
      read: n.read,
      priority: n.priority.toLowerCase(),
    }));
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async sendAnnouncement(data: { houseId: string; title: string; message: string; priority?: any }) {
    const targetHouseId = (await this.resolveHouseId(data.houseId)) || data.houseId;
    const priorityUpper = (data.priority || "NORMAL").toUpperCase();
    return this.prisma.notification.create({
      data: {
        houseId: targetHouseId,
        type: "announcement",
        title: data.title,
        message: data.message,
        priority: priorityUpper === "IMPORTANT" ? "IMPORTANT" : priorityUpper === "WARNING" ? "WARNING" : "NORMAL",
      },
    });
  }
}
