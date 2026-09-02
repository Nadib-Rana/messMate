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

export function getMemberApprovedMealStopSlots(
  memberId: string,
  dateStr: string,
  mealStops: MealStopRequest[]
): { breakfastOff: boolean; lunchOff: boolean; dinnerOff: boolean; isOnStop: boolean } {
  const targetDate = dateStr.slice(0, 10);
  let breakfastOff = false;
  let lunchOff = false;
  let dinnerOff = false;

  for (const stop of mealStops) {
    if (stop.memberId !== memberId || stop.status !== "approved") continue;
    const startStr = (stop.startDate || "").slice(0, 10);
    const endStr = (stop.endDate || "").slice(0, 10);
    const b = stop.meals?.breakfast ?? (stop as any).breakfast ?? true;
    const l = stop.meals?.lunch ?? (stop as any).lunch ?? true;
    const d = stop.meals?.dinner ?? (stop as any).dinner ?? true;
    if (targetDate >= startStr && targetDate <= endStr) {
      if (b) breakfastOff = true;
      if (l) lunchOff = true;
      if (d) dinnerOff = true;
    }
  }

  return { breakfastOff, lunchOff, dinnerOff, isOnStop: breakfastOff || lunchOff || dinnerOff };
}

export function isMemberOnApprovedMealStop(
  memberId: string,
  dateStr: string,
  mealStops: MealStopRequest[]
): boolean {
  return getMemberApprovedMealStopSlots(memberId, dateStr, mealStops).isOnStop;
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
