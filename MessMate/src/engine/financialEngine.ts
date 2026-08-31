import { Member, DailyMealRecord, HouseExpense, GuestMeal, Fine, WalletPayment, MemberSettlement, HouseSetting } from "../types";
import { calculateDailyMealWeight, calculateMealRate } from "./mealEngine";

export function calculateMemberFinancials(
  members: Member[],
  dailyMeals: DailyMealRecord[],
  foodExpense: number,
  totalWeightedMeals: number,
  houseExpenses: HouseExpense[],
  guestMeals: GuestMeal[],
  fines: Fine[],
  walletPayments: WalletPayment[],
  settings: HouseSetting
): MemberSettlement[] {
  const activeMembers = members.filter(m => m.status === "active");
  const activeCount = activeMembers.length || 1;

  // Food expenses are ONLY used for meal rate. House bills are shared.
  const totalOtherExpense = houseExpenses
    .filter(e => e.status === "paid" || e.status === "unpaid")
    .reduce((sum, e) => sum + e.amount, 0);

  const otherSharePerMember = Math.round((totalOtherExpense / activeCount) * 100) / 100;
  const mealRate = calculateMealRate(foodExpense, totalWeightedMeals);

  return members.map(member => {
    // Member meals sum
    const memberMealCount = dailyMeals.reduce((sum, day) => {
      const dm = day.members.find(m => m.id === member.id);
      if (!dm) return sum;
      return sum + calculateDailyMealWeight(dm.breakfast, dm.lunch, dm.dinner, settings.mealWeights);
    }, 0);

    const mealCost = Math.round(memberMealCount * mealRate * 100) / 100;

    // Guest meals cost (Host Pays rule)
    const memberGuestMealCost = guestMeals
      .filter(g => g.hostId === member.id)
      .reduce((sum, g) => sum + (g.cost || g.totalMeals * mealRate), 0);

    // Fines applied to member
    const memberFines = fines
      .filter(f => f.memberId === member.id && f.status === "applied")
      .reduce((sum, f) => sum + f.amount, 0);

    const totalResponsibility = Math.round((mealCost + otherSharePerMember + memberGuestMealCost + memberFines) * 100) / 100;

    // Total approved payments
    const totalPaid = walletPayments
      .filter(p => p.memberId === member.id && p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);

    const balance = Math.round((totalPaid - totalResponsibility) * 100) / 100;
    const status: "receive" | "pay" | "settled" =
      balance > 0 ? "receive" : balance < 0 ? "pay" : "settled";

    return {
      memberId: member.id,
      name: member.name,
      avatar: member.avatar,
      meals: memberMealCount,
      mealCost,
      otherShare: otherSharePerMember,
      fines: memberFines,
      guestMealCost: memberGuestMealCost,
      totalResponsibility,
      paid: totalPaid,
      balance,
      status,
    };
  });
}
