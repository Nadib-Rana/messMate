import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(houseId: string) {
    const list = await this.prisma.notification.findMany({
      where: { houseId },
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
    const priorityUpper = (data.priority || "NORMAL").toUpperCase();
    return this.prisma.notification.create({
      data: {
        houseId: data.houseId,
        type: "announcement",
        title: data.title,
        message: data.message,
        priority: priorityUpper === "IMPORTANT" ? "IMPORTANT" : priorityUpper === "WARNING" ? "WARNING" : "NORMAL",
      },
    });
  }
}
