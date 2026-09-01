import React, { createContext, useContext, useState, useMemo } from "react";
import { House, Member, DailyMealRecord, MealStopRequest, GuestMeal, MarketDuty, MarketExpense, HouseExpense, WalletPayment, Fine, NotificationItem, MonthlyClosingRecord } from "../types";
import { calculateTotalWeightedMeals, calculateTotalFoodExpense, calculateMealRate } from "../engine/mealEngine";
import { calculateMemberFinancials } from "../engine/financialEngine";
import { api } from "../services/api";
import { AppContextType } from "./AppContextTypes";
import { useMealHandlers } from "./useMealHandlers";
import { useFinanceHandlers } from "./useFinanceHandlers";
import { useAppDataSync } from "./useAppDataSync";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouseId, setCurrentHouseId] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [dailyMeals, setDailyMeals] = useState<DailyMealRecord[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([]);
  const [mealRequests, setMealRequests] = useState<MealStopRequest[]>([]);
  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>([]);
  const [marketDuties, setMarketDuties] = useState<MarketDuty[]>([]);
  const [marketExpenses, setMarketExpenses] = useState<MarketExpense[]>([]);
  const [expenses, setExpenses] = useState<HouseExpense[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [walletPayments, setWalletPayments] = useState<WalletPayment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [monthlyClosing, setMonthlyClosing] = useState<MonthlyClosingRecord>({
    month: "August 2026", status: "open", totalFoodExpense: 0, totalMeals: 0, mealRate: 0, totalOtherExpense: 0, settlements: [],
  });

  const [currentUser, setCurrentUserState] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("messmate_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setCurrentUser = (user: any) => {
    setCurrentUserState(user);
    if (user) localStorage.setItem("messmate_user", JSON.stringify(user));
    else localStorage.removeItem("messmate_user");
  };

  const currentHouse = useMemo(() => {
    return houses.find(h => h.id === currentHouseId) || houses[0] || {
      id: "", name: "Mess", address: "", inviteCode: "",
      setting: { mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 }, lowWalletThreshold: 500, guestMealRule: "Host Pays" as const, fineAllocation: "House fund" as const, dutyDurationDays: 3 },
    };
  }, [houses, currentHouseId]);

  const currentMember = useMemo(() => {
    if (currentUser?.email && members.length > 0) {
      const found = members.find(m => m.email?.toLowerCase() === currentUser.email?.toLowerCase());
      if (found) return found;
    }
    return members[0] || {
      id: currentUser?.id || "", houseId: currentHouseId, name: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : "Member",
      role: (currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") ? "manager" as const : "member" as const, email: currentUser?.email || "", phone: currentUser?.phone || "",
      avatar: currentUser?.firstName ? currentUser.firstName.slice(0, 2).toUpperCase() : "M", status: "active" as const, mealPlan: "Full" as const,
    };
  }, [currentUser, members, currentHouseId]);

  useAppDataSync(currentHouseId, setCurrentHouseId, setHouses, setMembers, setDailyMeals, setWeeklySchedules, setMealRequests, setGuestMeals, setMarketDuties, setMarketExpenses, setExpenses, setWalletPayments, setFines, setNotifications, setMonthlyClosing);

  const totalFoodExpense = useMemo(() => calculateTotalFoodExpense(marketExpenses), [marketExpenses]);
  const totalWeightedMeals = useMemo(() => calculateTotalWeightedMeals(dailyMeals, currentHouse.setting.mealWeights), [dailyMeals, currentHouse.setting.mealWeights]);
  const mealRate = useMemo(() => calculateMealRate(totalFoodExpense, totalWeightedMeals), [totalFoodExpense, totalWeightedMeals]);
  const memberSettlements = useMemo(() => calculateMemberFinancials(members, dailyMeals, totalFoodExpense, totalWeightedMeals, expenses, guestMeals, fines, walletPayments, currentHouse.setting), [members, dailyMeals, totalFoodExpense, totalWeightedMeals, expenses, guestMeals, fines, walletPayments, currentHouse.setting]);

  const switchHouse = (houseId: string) => setCurrentHouseId(houseId);
  const addMember = (m: Omit<Member, "id" | "houseId" | "status">) => setMembers(prev => [...prev, { ...m, id: "m" + (members.length + 1), houseId: currentHouseId, status: "active" }]);
  const updateMember = (memberId: string, data: { mealPlan?: string; role?: string; status?: string }) => {
    api.updateMember(currentHouseId, memberId, data).catch(() => null);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...(data.mealPlan ? { mealPlan: data.mealPlan } : {}), ...(data.role ? { role: data.role as any } : {}), ...(data.status ? { status: data.status as any } : {}) } : m));
  };
  const updateSettings = (setting: Partial<House["setting"]>) => {
    api.updateHouseSettings(currentHouseId, setting).catch(() => null);
    setHouses(prev => prev.map(h => h.id === currentHouseId ? { ...h, setting: { ...h.setting, ...setting } } : h));
  };

  const updateUserProfile = async (data: { firstName?: string; lastName?: string; phoneNumber?: string; avatarUrl?: string }) => {
    try {
      const updated = await api.updateProfile(data);
      const newUserData = { ...currentUser, ...data, ...(updated || {}) };
      setCurrentUser(newUserData);
    } catch (err) {
      const newUserData = { ...currentUser, ...data };
      setCurrentUser(newUserData);
      throw err;
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await api.changePassword(data);
  };

  const mealHandlers = useMealHandlers(currentHouseId, currentMember, dailyMeals, setDailyMeals, weeklySchedules, setWeeklySchedules, mealRequests, setMealRequests, guestMeals, setGuestMeals, members, mealRate);
  const financeHandlers = useFinanceHandlers(currentHouseId, members, marketDuties, setMarketDuties, marketExpenses, setMarketExpenses, expenses, setExpenses, walletPayments, setWalletPayments, fines, setFines, notifications, setNotifications);

  const generateSettlement = () => api.generateSettlement(currentHouseId).catch(() => null);
  const closeMonth = () => { api.closeMonth(currentHouseId).catch(() => null); setMonthlyClosing(prev => ({ ...prev, status: "closed" })); };
  const reopenMonth = () => { api.reopenMonth(currentHouseId).catch(() => null); setMonthlyClosing(prev => ({ ...prev, status: "open" })); };

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser, currentMember, houses, currentHouse, switchHouse, members, addMember, updateMember,
        dailyMeals, ...mealHandlers, weeklySchedules, mealRequests, guestMeals, marketDuties, marketExpenses,
        expenses, bills: expenses, walletPayments, fines, notifications,
        updateSettings, updateUserProfile, changePassword, totalFoodExpense, totalWeightedMeals, mealRate, memberSettlements, monthlyClosing,
        generateSettlement, closeMonth, reopenMonth, ...financeHandlers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
