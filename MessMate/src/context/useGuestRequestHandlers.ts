import { api } from "../services/api";
import { MealStopRequest, GuestMeal, Member } from "../types";

export function useGuestRequestHandlers(
  currentHouseId: string,
  currentMember: Member,
  mealRequests: MealStopRequest[],
  setMealRequests: React.Dispatch<React.SetStateAction<MealStopRequest[]>>,
  guestMeals: GuestMeal[],
  setGuestMeals: React.Dispatch<React.SetStateAction<GuestMeal[]>>,
  members: Member[],
  mealRate: number,
  onApproveWeeklySchedule?: (memberId: string, dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", value: boolean) => void
) {
  const submitMealRequest = (req: Omit<MealStopRequest, "id" | "houseId" | "memberId" | "memberName" | "avatar" | "status" | "submittedAt">) => {
    const member = currentMember;
    api.submitMealRequest(currentHouseId, { memberId: member.id, ...req }).catch(() => null);

    const newReq: MealStopRequest = {
      id: "r" + (mealRequests.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      avatar: member.avatar || "MB",
      startDate: req.startDate,
      endDate: req.endDate,
      meals: req.meals || { breakfast: true, lunch: true, dinner: true },
      weeklyScheduleChanges: req.weeklyScheduleChanges,
      reason: req.reason,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setMealRequests(prev => [newReq, ...prev]);
  };

  const approveMealRequest = (id: string) => {
    api.approveMealRequest(currentHouseId, id).catch(() => null);
    const req = mealRequests.find(r => r.id === id);
    if (req?.weeklyScheduleChanges && req.weeklyScheduleChanges.length > 0 && onApproveWeeklySchedule) {
      req.weeklyScheduleChanges.forEach((change: any) => {
        onApproveWeeklySchedule(req.memberId, change.dayOfWeek, change.meal, change.value);
      });
    }
    setMealRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  };

  const rejectMealRequest = (id: string) => {
    api.rejectMealRequest(currentHouseId, id).catch(() => null);
    setMealRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const addGuestMeal = (g: Omit<GuestMeal, "id" | "houseId" | "hostName" | "totalMeals" | "cost" | "status">) => {
    const host = members.find(m => m.id === g.hostId) || members[0] || { name: "Host" };
    const totalM = (g.meals.breakfast ? 0.5 : 0) + (g.meals.lunch ? 1.0 : 0) + (g.meals.dinner ? 1.0 : 0);
    const estimatedCost = totalM * mealRate;

    api.addGuestMeal(currentHouseId, { ...g, hostMemberId: g.hostId }).catch(() => null);

    const newG: GuestMeal = {
      id: "g" + (guestMeals.length + 1),
      houseId: currentHouseId,
      guestName: g.guestName,
      hostId: g.hostId,
      hostName: host.name,
      startDate: g.startDate,
      endDate: g.endDate,
      meals: g.meals,
      totalMeals: totalM,
      cost: estimatedCost,
      status: "active",
    };
    setGuestMeals(prev => [newG, ...prev]);
  };

  return { submitMealRequest, approveMealRequest, rejectMealRequest, addGuestMeal };
}
