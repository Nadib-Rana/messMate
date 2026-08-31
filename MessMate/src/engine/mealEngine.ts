import { DailyMealRecord, MealStopRequest, MarketExpense, HouseSetting } from "../types";

export function calculateDailyMealWeight(
  breakfast: boolean,
  lunch: boolean,
  dinner: boolean,
  weights: HouseSetting["mealWeights"]
): number {
  let count = 0;
  if (breakfast) count += weights.breakfast;
  if (lunch) count += weights.lunch;
  if (dinner) count += weights.dinner;
  return Math.round(count * 100) / 100;
}

export function isMemberOnApprovedMealStop(
  memberId: string,
  dateStr: string,
  mealStops: MealStopRequest[]
): boolean {
  const date = new Date(dateStr);
  return mealStops.some(stop => {
    if (stop.memberId !== memberId || stop.status !== "approved") return false;
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    return date >= start && date <= end;
  });
}

export function calculateTotalFoodExpense(marketExpenses: MarketExpense[]): number {
  return marketExpenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function calculateTotalWeightedMeals(
  dailyMeals: DailyMealRecord[],
  weights: HouseSetting["mealWeights"]
): number {
  return dailyMeals.reduce((total, day) => {
    const dayTotal = day.members.reduce((mSum, m) => {
      return mSum + calculateDailyMealWeight(m.breakfast, m.lunch, m.dinner, weights);
    }, 0);
    return total + dayTotal;
  }, 0);
}

export function calculateMealRate(
  foodExpense: number,
  totalWeightedMeals: number
): number {
  if (totalWeightedMeals <= 0) return 0;
  const rate = foodExpense / totalWeightedMeals;
  return Math.round(rate * 100) / 100;
}
