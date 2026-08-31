import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SettlementService } from "./settlement.service";

@ApiTags("Settlement")
@Controller("houses/:houseId/settlement")
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  @ApiOperation({ summary: "Get monthly settlement" })
  async getSettlement(@Param("houseId") houseId: string, @Query("month") month?: string) {
    return this.settlementService.getSettlement(houseId, month);
  }

  @Post("generate")
  @ApiOperation({ summary: "Generate monthly settlement" })
  async generateSettlement(@Param("houseId") houseId: string, @Body("month") month?: string) {
    return this.settlementService.generateSettlement(houseId, month);
  }

  @Post("close")
  @ApiOperation({ summary: "Close month" })
  async closeMonth(@Param("houseId") houseId: string, @Body("month") month?: string) {
    return this.settlementService.closeMonth(houseId, month);
  }

  @Post("reopen")
  @ApiOperation({ summary: "Reopen month" })
  async reopenMonth(@Param("houseId") houseId: string, @Body("month") month?: string) {
    return this.settlementService.reopenMonth(houseId, month);
  }
}
