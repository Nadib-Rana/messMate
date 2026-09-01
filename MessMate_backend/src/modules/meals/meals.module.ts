import { Module } from "@nestjs/common";
import { MealsService } from "./meals.service";
import { MealsRequestsService } from "./meals_requests.service";
import { MealsController } from "./meals.controller";

@Module({
  controllers: [MealsController],
  providers: [MealsService, MealsRequestsService],
  exports: [MealsService, MealsRequestsService],
})
export class MealsModule {}
