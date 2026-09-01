import { api } from "../services/api";
import { DailyMealRecord, MealStopRequest, GuestMeal, Member } from "../types";
import { useGuestRequestHandlers } from "./useGuestRequestHandlers";

export function useMealHandlers(
  currentHouseId: string,
  currentMember: Member,
  dailyMeals: DailyMealRecord[],
  setDailyMeals: React.Dispatch<React.SetStateAction<DailyMealRecord[]>>,
  weeklySchedules: any[],
  setWeeklySchedules: React.Dispatch<React.SetStateAction<any[]>>,
  mealRequests: MealStopRequest[],
  setMealRequests: React.Dispatch<React.SetStateAction<MealStopRequest[]>>,
  guestMeals: GuestMeal[],
  setGuestMeals: React.Dispatch<React.SetStateAction<GuestMeal[]>>,
  members: Member[],
  mealRate: number
) {
  const guestReqHandlers = useGuestRequestHandlers(
    currentHouseId,
    currentMember,
    mealRequests,
    setMealRequests,
    guestMeals,
    setGuestMeals,
    members,
    mealRate
  );

  const toggleDailyMeal = (memberId: string, meal: "breakfast" | "lunch" | "dinner", date?: string) => {
    const targetDate = date || new Date().toISOString().split("T")[0];

    setDailyMeals(prev => {
      const idx = prev.findIndex(r => r.date === targetDate);
      if (idx >= 0) {
        const record = prev[idx];
        const memberMeal = record.members.find(m => m.id === memberId);
        let newValue = true;
        let updatedMembers;
        if (memberMeal) {
          newValue = !memberMeal[meal];
          updatedMembers = record.members.map(m => m.id === memberId ? { ...m, [meal]: newValue, isOverride: true } : m);
        } else {
          updatedMembers = [...record.members, { id: memberId, breakfast: meal === "breakfast", lunch: meal === "lunch", dinner: meal === "dinner", isOverride: true }];
        }
        const updated = [...prev];
        updated[idx] = { ...record, members: updatedMembers };
        api.toggleDailyMeal(currentHouseId, { memberId, date: targetDate, [meal]: newValue }).catch(() => null);
        return updated;
      } else {
        api.toggleDailyMeal(currentHouseId, { memberId, date: targetDate, [meal]: true }).catch(() => null);
        return [{ date: targetDate, day: new Date(targetDate + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short" }), members: [{ id: memberId, breakfast: meal === "breakfast", lunch: meal === "lunch", dinner: meal === "dinner", isOverride: true }] }, ...prev];
      }
    });
  };

  const setMealExplicit = (memberId: string, date: string, breakfast: boolean, lunch: boolean, dinner: boolean) => {
    api.toggleDailyMeal(currentHouseId, { memberId, date, breakfast, lunch, dinner }).catch(() => null);
    setDailyMeals(prev => {
      const idx = prev.findIndex(r => r.date === date);
      const newEntry = { id: memberId, breakfast, lunch, dinner, isOverride: true };
      if (idx >= 0) {
        const record = prev[idx];
        const memberExists = record.members.find(m => m.id === memberId);
        const updatedMembers = memberExists ? record.members.map(m => m.id === memberId ? newEntry : m) : [...record.members, newEntry];
        const updated = [...prev];
        updated[idx] = { ...record, members: updatedMembers };
        return updated;
      } else {
        return [{ date, day: new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short" }), members: [newEntry] }, ...prev];
      }
    });
  };

  const updateWeeklySchedule = (memberId: string, dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", value: boolean) => {
    api.updateWeeklySchedule(currentHouseId, { memberId, dayOfWeek, [meal]: value }).catch(() => null);
    setWeeklySchedules(prev => {
      const idx = prev.findIndex(s => s.memberId === memberId && s.dayOfWeek === dayOfWeek);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [meal]: value };
        return updated;
      } else {
        return [...prev, { memberId, dayOfWeek, breakfast: meal === "breakfast" ? value : true, lunch: meal === "lunch" ? value : true, dinner: meal === "dinner" ? value : true }];
      }
    });
  };

  const disableAllMealsForDate = (date?: string) => {
    const targetDate = date || new Date().toISOString().split("T")[0];
    members.forEach(m => {
      setMealExplicit(m.id, targetDate, false, false, false);
    });
  };

  return {
    toggleDailyMeal,
    setMealExplicit,
    disableAllMealsForDate,
    updateWeeklySchedule,
    ...guestReqHandlers,
  };
}
