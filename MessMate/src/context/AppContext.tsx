import React, { createContext, useContext, useState, useMemo } from "react";
import {
  House, Member, DailyMealRecord, MealStopRequest, GuestMeal,
  MarketDuty, MarketExpense, HouseExpense, WalletPayment, Fine,
  NotificationItem, MemberSettlement, MonthlyClosingRecord, HouseSetting
} from "../types";
import { calculateTotalFoodExpense, calculateTotalWeightedMeals, calculateMealRate } from "../engine/mealEngine";
import { calculateMemberFinancials } from "../engine/financialEngine";

interface AppContextType {
  currentHouse: House;
  houses: House[];
  members: Member[];
  dailyMeals: DailyMealRecord[];
  mealRequests: MealStopRequest[];
  guestMeals: GuestMeal[];
  marketDuties: MarketDuty[];
  marketExpenses: MarketExpense[];
  expenses: HouseExpense[];
  bills: HouseExpense[];
  fines: Fine[];
  walletPayments: WalletPayment[];
  notifications: NotificationItem[];
  monthlyClosing: MonthlyClosingRecord;

  // Actions
  switchHouse: (houseId: string) => void;
  addMember: (member: Omit<Member, "id" | "houseId" | "status">) => void;
  toggleDailyMeal: (date: string, memberId: string, meal: "breakfast" | "lunch" | "dinner") => void;
  submitMealRequest: (req: { startDate: string; endDate: string; reason: string }) => void;
  approveMealRequest: (id: string) => void;
  rejectMealRequest: (id: string) => void;
  addGuestMeal: (guest: { guestName: string; hostId: string; startDate: string; endDate: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } }) => void;
  assignMarketDuty: (duty: { memberId: string; startDate: string; endDate: string; notes?: string }) => void;
  submitMarketExpense: (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string }) => void;
  approveMarketExpense: (id: string) => void;
  rejectMarketExpense: (id: string) => void;
  addExpense: (exp: { category: string; amount: number; date: string; paidBy: string; description?: string }) => void;
  addBill: (bill: { category: string; amount: number; month: string; dueDate?: string; paidBy: string; units?: number; prevReading?: number; currReading?: number }) => void;
  applyFine: (fine: { memberId: string; amount: number; reason: string; date: string }) => void;
  addPayment: (payment: { memberId: string; amount: number; date: string; method: any; reference?: string; note?: string }) => void;
  approvePayment: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAnnouncement: (title: string, message: string, priority: any) => void;
  updateSettings: (newSettings: Partial<HouseSetting>) => void;
  generateSettlement: () => void;
  closeMonth: () => void;
  reopenMonth: () => void;

  // Derived Computed Values
  totalFoodExpense: number;
  totalWeightedMeals: number;
  mealRate: number;
  memberSettlements: MemberSettlement[];
}

const DEFAULT_SETTINGS: HouseSetting = {
  mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 },
  lowWalletThreshold: 500,
  guestMealRule: "Host Pays",
  fineAllocation: "House fund",
  dutyDurationDays: 3,
};

const INITIAL_HOUSES: House[] = [
  { id: "h1", name: "Bashundhara Mess", address: "Block B, Bashundhara R/A, Dhaka", inviteCode: "BM-1024", setting: DEFAULT_SETTINGS },
  { id: "h2", name: "Mirpur Bachelor House", address: "Section 10, Mirpur, Dhaka", inviteCode: "MB-2048", setting: DEFAULT_SETTINGS },
];

const INITIAL_MEMBERS: Member[] = [
  { id: "m1", houseId: "h1", name: "Nadib Hasan", phone: "01711-123456", email: "nadib@example.com", role: "manager", avatar: "NH", status: "active", mealPlan: "Full" },
  { id: "m2", houseId: "h1", name: "Rakib Ahmed", phone: "01712-234567", email: "rakib@example.com", role: "member", avatar: "RA", status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m3", houseId: "h1", name: "Hasan Mahmud", phone: "01713-345678", email: "hasan@example.com", role: "member", avatar: "HM", status: "active", mealPlan: "Full" },
  { id: "m4", houseId: "h1", name: "Sakib Alam", phone: "01714-456789", email: "sakib@example.com", role: "member", avatar: "SA", status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m5", houseId: "h1", name: "Rahim Uddin", phone: "01715-567890", email: "rahim@example.com", role: "member", avatar: "RU", status: "active", mealPlan: "Full" },
];

const INITIAL_DAILY_MEALS: DailyMealRecord[] = [
  {
    date: "Aug 31", day: "Mon", members: [
      { id: "m1", breakfast: true, lunch: true, dinner: true },
      { id: "m2", breakfast: false, lunch: true, dinner: true },
      { id: "m3", breakfast: true, lunch: true, dinner: true },
      { id: "m4", breakfast: false, lunch: true, dinner: false },
      { id: "m5", breakfast: true, lunch: true, dinner: true },
    ]
  },
  {
    date: "Aug 30", day: "Sun", members: [
      { id: "m1", breakfast: true, lunch: true, dinner: true },
      { id: "m2", breakfast: false, lunch: true, dinner: true },
      { id: "m3", breakfast: false, lunch: false, dinner: false },
      { id: "m4", breakfast: false, lunch: true, dinner: true },
      { id: "m5", breakfast: true, lunch: true, dinner: true },
    ]
  },
  {
    date: "Aug 29", day: "Sat", members: [
      { id: "m1", breakfast: true, lunch: true, dinner: true },
      { id: "m2", breakfast: true, lunch: true, dinner: true },
      { id: "m3", breakfast: true, lunch: true, dinner: true },
      { id: "m4", breakfast: false, lunch: true, dinner: true },
      { id: "m5", breakfast: false, lunch: true, dinner: true },
    ]
  },
];

const INITIAL_MARKET_EXPENSES: MarketExpense[] = [
  { id: "e1", houseId: "h1", memberId: "m2", memberName: "Rakib Ahmed", date: "Aug 31", amount: 2500, category: "Bazar", description: "Weekly groceries", status: "pending" },
  { id: "e2", houseId: "h1", memberId: "m2", memberName: "Rakib Ahmed", date: "Aug 30", amount: 1800, category: "Bazar", description: "Rice and lentils", status: "approved" },
  { id: "e3", houseId: "h1", memberId: "m3", memberName: "Hasan Mahmud", date: "Aug 27", amount: 3200, category: "Bazar", description: "Monthly vegetables", status: "approved" },
  { id: "e4", houseId: "h1", memberId: "m1", memberName: "Nadib Hasan", date: "Aug 25", amount: 900, category: "Bazar", description: "Spices and condiments", status: "approved" },
];

const INITIAL_EXPENSES: HouseExpense[] = [
  { id: "x1", houseId: "h1", date: "Aug 28", category: "Electricity", amount: 8040, paidBy: "Nadib Hasan", status: "paid", description: "August electricity bill", month: "August 2026" },
  { id: "x2", houseId: "h1", date: "Aug 1", category: "House Rent", amount: 18000, paidBy: "Nadib Hasan", status: "paid", description: "August rent", month: "August 2026" },
  { id: "x3", houseId: "h1", date: "Aug 5", category: "Internet", amount: 1200, paidBy: "Rakib Ahmed", status: "paid", description: "Monthly internet", month: "August 2026" },
  { id: "x4", houseId: "h1", date: "Aug 10", category: "Buya / Maid", amount: 3000, paidBy: "Nadib Hasan", status: "paid", description: "Maid salary August", month: "August 2026" },
  { id: "x5", houseId: "h1", date: "Aug 15", category: "Gas", amount: 960, paidBy: "Hasan Mahmud", status: "unpaid", description: "Gas cylinder", month: "August 2026" },
];

const INITIAL_WALLETS_PAYMENTS: WalletPayment[] = [
  { id: "wp1", houseId: "h1", memberId: "m1", memberName: "Nadib Hasan", amount: 15000, date: "Aug 1", method: "bKash", status: "approved" },
  { id: "wp2", houseId: "h1", memberId: "m2", memberName: "Rakib Ahmed", amount: 6000, date: "Aug 2", method: "Cash", status: "approved" },
  { id: "wp3", houseId: "h1", memberId: "m3", memberName: "Hasan Mahmud", amount: 4000, date: "Aug 5", method: "Nagad", status: "approved" },
  { id: "wp4", houseId: "h1", memberId: "m4", memberName: "Sakib Alam", amount: 5500, date: "Aug 4", method: "Rocket", status: "approved" },
  { id: "wp5", houseId: "h1", memberId: "m5", memberName: "Rahim Uddin", amount: 5200, date: "Aug 3", method: "bKash", status: "approved" },
];

const INITIAL_FINES: Fine[] = [
  { id: "f1", houseId: "h1", memberId: "m3", memberName: "Hasan Mahmud", reason: "Failed to complete market duty", amount: 200, date: "Aug 27", status: "applied", allocation: "House fund" },
];

const INITIAL_GUEST_MEALS: GuestMeal[] = [
  { id: "g1", houseId: "h1", guestName: "Farhan Hossain", hostId: "m1", hostName: "Nadib Hasan", startDate: "Aug 28", endDate: "Aug 29", meals: { breakfast: true, lunch: true, dinner: true }, totalMeals: 5, cost: 212.5, status: "active" },
  { id: "g2", houseId: "h1", guestName: "Mithun Roy", hostId: "m4", hostName: "Sakib Alam", startDate: "Aug 25", endDate: "Aug 25", meals: { breakfast: false, lunch: true, dinner: true }, totalMeals: 2, cost: 85, status: "completed" },
];

const INITIAL_MARKET_DUTIES: MarketDuty[] = [
  { id: "d1", houseId: "h1", memberId: "m1", memberName: "Nadib Hasan", startDate: "Sep 1", endDate: "Sep 3", status: "upcoming" },
  { id: "d2", houseId: "h1", memberId: "m2", memberName: "Rakib Ahmed", startDate: "Aug 28", endDate: "Aug 31", status: "current" },
  { id: "d3", houseId: "h1", memberId: "m3", memberName: "Hasan Mahmud", startDate: "Aug 25", endDate: "Aug 27", status: "completed" },
  { id: "d4", houseId: "h1", memberId: "m4", memberName: "Sakib Alam", startDate: "Sep 4", endDate: "Sep 6", status: "upcoming" },
  { id: "d5", houseId: "h1", memberId: "m5", memberName: "Rahim Uddin", startDate: "Sep 7", endDate: "Sep 9", status: "upcoming" },
];

const INITIAL_MEAL_REQUESTS: MealStopRequest[] = [
  { id: "r1", houseId: "h1", memberId: "m2", memberName: "Rakib Ahmed", avatar: "RA", startDate: "Sep 5", endDate: "Sep 10", reason: "Travelling home for Eid", status: "pending", submittedAt: "Aug 31, 2026" },
  { id: "r2", houseId: "h1", memberId: "m5", memberName: "Rahim Uddin", avatar: "RU", startDate: "Aug 20", endDate: "Aug 23", reason: "Medical leave", status: "approved", submittedAt: "Aug 19, 2026" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", houseId: "h1", type: "low_wallet", title: "Low Wallet Alert", message: "Hasan Mahmud's wallet balance is ৳180. Please deposit soon.", time: "2 hours ago", read: false, priority: "warning" },
  { id: "n2", houseId: "h1", type: "meal_stop", title: "Meal Stop Request", message: "Rakib Ahmed requested meal stop from Sep 5–10.", time: "5 hours ago", read: false, priority: "normal" },
  { id: "n3", houseId: "h1", type: "expense", title: "Expense Submitted", message: "Rakib Ahmed submitted market expense of ৳2,500.", time: "1 day ago", read: false, priority: "normal" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [houses] = useState<House[]>(INITIAL_HOUSES);
  const [currentHouseId, setCurrentHouseId] = useState<string>("h1");

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [dailyMeals, setDailyMeals] = useState<DailyMealRecord[]>(INITIAL_DAILY_MEALS);
  const [mealRequests, setMealRequests] = useState<MealStopRequest[]>(INITIAL_MEAL_REQUESTS);
  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>(INITIAL_GUEST_MEALS);
  const [marketDuties, setMarketDuties] = useState<MarketDuty[]>(INITIAL_MARKET_DUTIES);
  const [marketExpenses, setMarketExpenses] = useState<MarketExpense[]>(INITIAL_MARKET_EXPENSES);
  const [expenses, setExpenses] = useState<HouseExpense[]>(INITIAL_EXPENSES);
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [walletPayments, setWalletPayments] = useState<WalletPayment[]>(INITIAL_WALLETS_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [monthlyClosing, setMonthlyClosing] = useState<MonthlyClosingRecord>({
    month: "August 2026",
    status: "open",
    totalFoodExpense: 0,
    totalMeals: 0,
    mealRate: 0,
    totalOtherExpense: 0,
    settlements: [],
  });

  const currentHouse = useMemo(() => houses.find(h => h.id === currentHouseId) || houses[0], [houses, currentHouseId]);

  // Derived Calculations
  const totalFoodExpense = useMemo(() => calculateTotalFoodExpense(marketExpenses), [marketExpenses]);
  const totalWeightedMeals = useMemo(() => calculateTotalWeightedMeals(dailyMeals, currentHouse.setting.mealWeights), [dailyMeals, currentHouse.setting.mealWeights]);
  const mealRate = useMemo(() => calculateMealRate(totalFoodExpense, totalWeightedMeals), [totalFoodExpense, totalWeightedMeals]);

  const memberSettlements = useMemo(() => {
    return calculateMemberFinancials(
      members,
      dailyMeals,
      totalFoodExpense,
      totalWeightedMeals,
      expenses,
      guestMeals,
      fines,
      walletPayments,
      currentHouse.setting
    );
  }, [members, dailyMeals, totalFoodExpense, totalWeightedMeals, expenses, guestMeals, fines, walletPayments, currentHouse.setting]);

  // Action handlers
  const switchHouse = (houseId: string) => setCurrentHouseId(houseId);

  const addMember = (m: Omit<Member, "id" | "houseId" | "status">) => {
    const newM: Member = {
      ...m,
      id: "m" + (members.length + 1),
      houseId: currentHouseId,
      status: "active",
    };
    setMembers(prev => [...prev, newM]);
  };

  const toggleDailyMeal = (date: string, memberId: string, meal: "breakfast" | "lunch" | "dinner") => {
    setDailyMeals(prev => prev.map(day => {
      if (day.date !== date) return day;
      return {
        ...day,
        members: day.members.map(m => {
          if (m.id !== memberId) return m;
          return { ...m, [meal]: !m[meal], isOverride: true };
        })
      };
    }));
  };

  const submitMealRequest = (req: { startDate: string; endDate: string; reason: string }) => {
    const userMember = members[0]; // Active user
    const newReq: MealStopRequest = {
      id: "r" + (mealRequests.length + 1),
      houseId: currentHouseId,
      memberId: userMember.id,
      memberName: userMember.name,
      avatar: userMember.avatar,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      status: "pending",
      submittedAt: "Today",
    };
    setMealRequests(prev => [newReq, ...prev]);
  };

  const approveMealRequest = (id: string) => {
    setMealRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  };

  const rejectMealRequest = (id: string) => {
    setMealRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const addGuestMeal = (g: { guestName: string; hostId: string; startDate: string; endDate: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } }) => {
    const host = members.find(m => m.id === g.hostId) || members[0];
    let mealCount = (g.meals.breakfast ? 0.5 : 0) + (g.meals.lunch ? 1 : 0) + (g.meals.dinner ? 1 : 0);
    const newGuest: GuestMeal = {
      id: "g" + (guestMeals.length + 1),
      houseId: currentHouseId,
      guestName: g.guestName,
      hostId: host.id,
      hostName: host.name,
      startDate: g.startDate,
      endDate: g.endDate,
      meals: g.meals,
      totalMeals: mealCount,
      cost: Math.round(mealCount * mealRate * 100) / 100,
      status: "active",
    };
    setGuestMeals(prev => [newGuest, ...prev]);
  };

  const assignMarketDuty = (duty: { memberId: string; startDate: string; endDate: string; notes?: string }) => {
    const member = members.find(m => m.id === duty.memberId)!;
    const newDuty: MarketDuty = {
      id: "d" + (marketDuties.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      startDate: duty.startDate,
      endDate: duty.endDate,
      status: "upcoming",
      notes: duty.notes,
    };
    setMarketDuties(prev => [...prev, newDuty]);
  };

  const submitMarketExpense = (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string }) => {
    const member = members.find(m => m.id === exp.paidByMemberId) || members[0];
    const newExp: MarketExpense = {
      id: "e" + (marketExpenses.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      date: exp.date,
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
      status: "pending",
    };
    setMarketExpenses(prev => [newExp, ...prev]);
  };

  const approveMarketExpense = (id: string) => {
    setMarketExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
  };

  const rejectMarketExpense = (id: string) => {
    setMarketExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
  };

  const addExpense = (exp: { category: string; amount: number; date: string; paidBy: string; description?: string }) => {
    const newExp: HouseExpense = {
      id: "x" + (expenses.length + 1),
      houseId: currentHouseId,
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      paidBy: exp.paidBy,
      description: exp.description,
      month: "August 2026",
      status: "paid",
    };
    setExpenses(prev => [...prev, newExp]);
  };

  const addBill = (bill: { category: string; amount: number; month: string; dueDate?: string; paidBy: string; units?: number; prevReading?: number; currReading?: number }) => {
    const newBill: HouseExpense = {
      id: "b" + (expenses.length + 1),
      houseId: currentHouseId,
      category: bill.category,
      amount: bill.amount,
      date: bill.month,
      month: bill.month,
      dueDate: bill.dueDate,
      paidBy: bill.paidBy,
      status: "unpaid",
      units: bill.units,
      prevReading: bill.prevReading,
      currReading: bill.currReading,
    };
    setExpenses(prev => [...prev, newBill]);
  };

  const applyFine = (fine: { memberId: string; amount: number; reason: string; date: string }) => {
    const member = members.find(m => m.id === fine.memberId)!;
    const newFine: Fine = {
      id: "f" + (fines.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      amount: fine.amount,
      reason: fine.reason,
      date: fine.date,
      status: "applied",
      allocation: "House fund",
    };
    setFines(prev => [...prev, newFine]);
  };

  const addPayment = (p: { memberId: string; amount: number; date: string; method: any; reference?: string; note?: string }) => {
    const member = members.find(m => m.id === p.memberId)!;
    const newP: WalletPayment = {
      id: "wp" + (walletPayments.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      amount: p.amount,
      date: p.date,
      method: p.method,
      reference: p.reference,
      note: p.note,
      status: "pending",
    };
    setWalletPayments(prev => [...prev, newP]);
  };

  const approvePayment = (id: string) => {
    setWalletPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addAnnouncement = (title: string, message: string, priority: any) => {
    const newN: NotificationItem = {
      id: "n" + (notifications.length + 1),
      houseId: currentHouseId,
      type: "announcement",
      title,
      message,
      time: "Just now",
      read: false,
      priority,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const updateSettings = (newSettings: Partial<HouseSetting>) => {
    currentHouse.setting = { ...currentHouse.setting, ...newSettings };
  };

  const generateSettlement = () => {
    setMonthlyClosing({
      month: "August 2026",
      status: "generated",
      totalFoodExpense,
      totalMeals: totalWeightedMeals,
      mealRate,
      totalOtherExpense: expenses.reduce((a, e) => a + e.amount, 0),
      settlements: memberSettlements,
    });
  };

  const closeMonth = () => {
    setMonthlyClosing(prev => ({ ...prev, status: "closed" }));
  };

  const reopenMonth = () => {
    setMonthlyClosing(prev => ({ ...prev, status: "open" }));
  };

  return (
    <AppContext.Provider value={{
      currentHouse,
      houses,
      members,
      dailyMeals,
      mealRequests,
      guestMeals,
      marketDuties,
      marketExpenses,
      expenses,
      bills: expenses,
      fines,
      walletPayments,
      notifications,
      monthlyClosing,

      switchHouse,
      addMember,
      toggleDailyMeal,
      submitMealRequest,
      approveMealRequest,
      rejectMealRequest,
      addGuestMeal,
      assignMarketDuty,
      submitMarketExpense,
      approveMarketExpense,
      rejectMarketExpense,
      addExpense,
      addBill,
      applyFine,
      addPayment,
      approvePayment,
      markNotificationRead,
      markAllNotificationsRead,
      addAnnouncement,
      updateSettings,
      generateSettlement,
      closeMonth,
      reopenMonth,

      totalFoodExpense,
      totalWeightedMeals,
      mealRate,
      memberSettlements,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
