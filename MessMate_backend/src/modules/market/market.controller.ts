import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { MarketService } from "./market.service";

@ApiTags("Market")
@Controller("houses/:houseId/market")
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get("duties")
  @ApiOperation({ summary: "Get market duties" })
  async getMarketDuties(@Param("houseId") houseId: string) {
    return this.marketService.getMarketDuties(houseId);
  }

  @Post("duties")
  @ApiOperation({ summary: "Assign market duty" })
  async assignMarketDuty(@Param("houseId") houseId: string, @Body() body: any) {
    return this.marketService.assignMarketDuty({ ...body, houseId });
  }

  @Get("expenses")
  @ApiOperation({ summary: "Get market food expenses" })
  async getMarketExpenses(@Param("houseId") houseId: string) {
    return this.marketService.getMarketExpenses(houseId);
  }

  @Post("expenses")
  @ApiOperation({ summary: "Submit market food expense" })
  async submitMarketExpense(@Param("houseId") houseId: string, @Body() body: any) {
    return this.marketService.submitMarketExpense({ ...body, houseId });
  }

  @Patch("expenses/:id/approve")
  @ApiOperation({ summary: "Approve market expense" })
  async approveMarketExpense(@Param("id") id: string) {
    return this.marketService.updateMarketExpenseStatus(id, "APPROVED");
  }

  @Patch("expenses/:id/reject")
  @ApiOperation({ summary: "Reject market expense" })
  async rejectMarketExpense(@Param("id") id: string) {
    return this.marketService.updateMarketExpenseStatus(id, "REJECTED");
  }
}
