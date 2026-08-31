import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { FinanceService } from "./finance.service";

@ApiTags("Finance")
@Controller("houses/:houseId/finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("bills")
  @ApiOperation({ summary: "Get utility bills" })
  async getBills(@Param("houseId") houseId: string) {
    return this.financeService.getBills(houseId);
  }

  @Post("bills")
  @ApiOperation({ summary: "Add utility bill" })
  async addBill(@Param("houseId") houseId: string, @Body() body: any) {
    return this.financeService.addBill({ ...body, houseId });
  }

  @Get("payments")
  @ApiOperation({ summary: "Get wallet advance payments" })
  async getPayments(@Param("houseId") houseId: string) {
    return this.financeService.getPayments(houseId);
  }

  @Post("payments")
  @ApiOperation({ summary: "Add advance payment" })
  async addPayment(@Param("houseId") houseId: string, @Body() body: any) {
    return this.financeService.addPayment({ ...body, houseId });
  }

  @Patch("payments/:id/approve")
  @ApiOperation({ summary: "Approve advance payment" })
  async approvePayment(@Param("id") id: string) {
    return this.financeService.updatePaymentStatus(id, "APPROVED");
  }

  @Get("fines")
  @ApiOperation({ summary: "Get member fines" })
  async getFines(@Param("houseId") houseId: string) {
    return this.financeService.getFines(houseId);
  }

  @Post("fines")
  @ApiOperation({ summary: "Apply fine" })
  async applyFine(@Param("houseId") houseId: string, @Body() body: any) {
    return this.financeService.applyFine({ ...body, houseId });
  }
}
