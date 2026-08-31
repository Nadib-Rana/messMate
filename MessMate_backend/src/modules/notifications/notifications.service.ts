import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(houseId: string) {
    return this.prisma.notification.findMany({
      where: { houseId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async sendAnnouncement(data: { houseId: string; title: string; message: string; priority?: any }) {
    return this.prisma.notification.create({
      data: {
        houseId: data.houseId,
        type: "ANNOUNCEMENT",
        title: data.title,
        message: data.message,
        priority: data.priority || "NORMAL",
      },
    });
  }
}
