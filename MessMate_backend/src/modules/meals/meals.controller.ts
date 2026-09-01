import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { MealsService } from "./meals.service";

@ApiTags("Meals")
@Controller("houses/:houseId/meals")
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get("daily")
  @ApiOperation({ summary: "Get daily meals" })
  async getDailyMeals(@Param("houseId") houseId: string, @Query("date") date?: string) {
    return this.mealsService.getDailyMeals(houseId, date);
  }

  @Post("toggle")
  @ApiOperation({ summary: "Toggle member daily meal" })
  async toggleMeal(@Param("houseId") houseId: string, @Body() body: any) {
    return this.mealsService.toggleMeal({ ...body, houseId });
  }

  @Get("stop-requests")
  @ApiOperation({ summary: "Get meal stop requests" })
  async getMealStopRequests(@Param("houseId") houseId: string) {
    return this.mealsService.getMealStopRequests(houseId);
  }

  @Post("stop-requests")
  @ApiOperation({ summary: "Submit meal stop request" })
  async submitMealStopRequest(@Param("houseId") houseId: string, @Body() body: any) {
    return this.mealsService.submitMealStopRequest({ ...body, houseId });
  }

  @Patch("stop-requests/:id/approve")
  @ApiOperation({ summary: "Approve meal stop request" })
  async approveMealStopRequest(@Param("id") id: string) {
    return this.mealsService.updateMealStopStatus(id, "APPROVED");
  }

  @Patch("stop-requests/:id/reject")
  @ApiOperation({ summary: "Reject meal stop request" })
  async rejectMealStopRequest(@Param("id") id: string) {
    return this.mealsService.updateMealStopStatus(id, "REJECTED");
  }

  @Get("guests")
  @ApiOperation({ summary: "Get guest meals" })
  async getGuestMeals(@Param("houseId") houseId: string) {
    return this.mealsService.getGuestMeals(houseId);
  }

  @Post("guests")
  @ApiOperation({ summary: "Add guest meal" })
  async addGuestMeal(@Param("houseId") houseId: string, @Body() body: any) {
    return this.mealsService.addGuestMeal({ ...body, houseId });
  }

  @Get("weekly-schedules")
  @ApiOperation({ summary: "Get weekly meal schedules" })
  async getWeeklySchedules(@Param("houseId") houseId: string) {
    return this.mealsService.getWeeklySchedules(houseId);
  }

  @Post("weekly-schedules")
  @ApiOperation({ summary: "Update weekly meal schedule" })
  async updateWeeklySchedule(@Param("houseId") houseId: string, @Body() body: any) {
    return this.mealsService.updateWeeklySchedule({ ...body, houseId });
  }
}
