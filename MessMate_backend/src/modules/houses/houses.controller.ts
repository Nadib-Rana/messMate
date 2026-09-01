import { Controller, Get, Post, Patch, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { HousesService } from "./houses.service";

@ApiTags("Houses")
@Controller("houses")
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new mess/house" })
  async createHouse(@Body() body: { name: string; address: string; description?: string; managerUserId: string }) {
    return this.housesService.createHouse(body);
  }

  @Get("my-houses")
  @ApiOperation({ summary: "Get user messes" })
  async getMyHouses() {
    // Demo user ID fallback for open API testing
    return this.housesService.findMyHouses("demo-user-id");
  }

  @Get(":houseId")
  @ApiOperation({ summary: "Get house details" })
  async getHouse(@Param("houseId") houseId: string) {
    return this.housesService.findHouseById(houseId);
  }

  @Patch(":houseId/settings")
  @ApiOperation({ summary: "Update house settings" })
  async updateSettings(@Param("houseId") houseId: string, @Body() body: any) {
    return this.housesService.updateSettings(houseId, body);
  }

  @Patch(":houseId/members/:memberId")
  @ApiOperation({ summary: "Update member role, status, or meal plan" })
  async updateMember(
    @Param("houseId") houseId: string,
    @Param("memberId") memberId: string,
    @Body() body: { mealPlan?: string; role?: string; status?: string }
  ) {
    return this.housesService.updateMember(houseId, memberId, body);
  }
}
