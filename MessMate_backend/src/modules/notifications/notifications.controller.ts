import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@Controller("houses/:houseId/notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get house notifications" })
  async getNotifications(@Param("houseId") houseId: string) {
    return this.notificationsService.getNotifications(houseId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification read" })
  async markRead(@Param("id") id: string) {
    return this.notificationsService.markRead(id);
  }

  @Post("announce")
  @ApiOperation({ summary: "Broadcast manager announcement" })
  async sendAnnouncement(@Param("houseId") houseId: string, @Body() body: any) {
    return this.notificationsService.sendAnnouncement({ ...body, houseId });
  }
}
