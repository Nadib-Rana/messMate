import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  House,
  Member,
  DailyMealRecord,
  MealStopRequest,
  GuestMeal,
  MarketDuty,
  MarketExpense,
  HouseExpense,
  WalletPayment,
  Fine,
  NotificationItem,
  MemberSettlement,
  MonthlyClosingRecord,
  MarketItem,
} from "../types";
import { calculateTotalWeightedMeals, calculateTotalFoodExpense, calculateMealRate } from "../engine/mealEngine";
import { calculateMemberFinancials } from "../engine/financialEngine";
import { api } from "../services/api";

interface AppContextType {
  houses: House[];
  currentHouse: House;
  switchHouse: (houseId: string) => void;

  members: Member[];
  addMember: (member: Omit<Member, "id" | "houseId" | "status">) => void;

  dailyMeals: DailyMealRecord[];
  toggleDailyMeal: (memberId: string, meal: "breakfast" | "lunch" | "dinner", date?: string) => void;

  mealRequests: MealStopRequest[];
  submitMealRequest: (req: Omit<MealStopRequest, "id" | "houseId" | "memberId" | "memberName" | "avatar" | "status" | "submittedAt">) => void;
  approveMealRequest: (id: string) => void;
  rejectMealRequest: (id: string) => void;

  guestMeals: GuestMeal[];
  addGuestMeal: (guest: Omit<GuestMeal, "id" | "houseId" | "hostName" | "totalMeals" | "cost" | "status">) => void;

  marketDuties: MarketDuty[];
  assignMarketDuty: (duty: Omit<MarketDuty, "id" | "houseId" | "memberName" | "status">) => void;

  marketExpenses: MarketExpense[];
  submitMarketExpense: (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string; items?: MarketItem[] }) => void;
  approveMarketExpense: (id: string) => void;
  rejectMarketExpense: (id: string) => void;

  expenses: HouseExpense[];
  addExpense: (exp: Omit<HouseExpense, "id" | "houseId" | "status">) => void;

  bills: HouseExpense[];
  addBill: (bill: Omit<HouseExpense, "id" | "houseId" | "status">) => void;

  walletPayments: WalletPayment[];
  addPayment: (pay: Omit<WalletPayment, "id" | "houseId" | "memberName" | "status">) => void;
  approvePayment: (id: string) => void;

  fines: Fine[];
  applyFine: (fine: Omit<Fine, "id" | "houseId" | "memberName" | "status" | "allocation">) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAnnouncement: (title: string, message: string, priority?: "normal" | "warning" | "important") => void;

  updateSettings: (setting: Partial<House["setting"]>) => void;

  // Derived financial metrics
  totalFoodExpense: number;
  totalWeightedMeals: number;
  mealRate: number;
  memberSettlements: MemberSettlement[];

  // Monthly closing
  monthlyClosing: MonthlyClosingRecord;
  generateSettlement: () => void;
  closeMonth: () => void;
  reopenMonth: () => void;
}

const DEFAULT_HOUSE: House = {
  id: "h1",
  name: "Bashundhara Mess",
  address: "Block B, Bashundhara R/A, Dhaka",
  inviteCode: "HM-1024",
  setting: {
    mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 },
    lowWalletThreshold: 500,
    guestMealRule: "Host Pays",
    fineAllocation: "House fund",
    dutyDurationDays: 3,
  },
};

const INITIAL_MEMBERS: Member[] = [
  { id: "m1", houseId: "h1", name: "Nadib Rana", phone: "01711-000001", email: "nadib@messmate.com", role: "manager", avatar: "NR", status: "active", mealPlan: "Full" },
  { id: "m2", houseId: "h1", name: "Sumon", phone: "01711-000002", email: "sumon@messmate.com", role: "member", avatar: "SM", status: "active", mealPlan: "Full" },
  { id: "m3", houseId: "h1", name: "Monna", phone: "01711-000003", email: "monna@messmate.com", role: "member", avatar: "MN", status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m4", houseId: "h1", name: "Foysan", phone: "01711-000004", email: "foysan@messmate.com", role: "member", avatar: "FY", status: "active", mealPlan: "Full" },
  { id: "m5", houseId: "h1", name: "Azijul", phone: "01711-000005", email: "azijul@messmate.com", role: "member", avatar: "AZ", status: "active", mealPlan: "Full" },
  { id: "m6", houseId: "h1", name: "Shohan", phone: "01711-000006", email: "shohan@messmate.com", role: "member", avatar: "SH", status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m7", houseId: "h1", name: "Showhan", phone: "01711-000007", email: "showhan@messmate.com", role: "member", avatar: "SW", status: "active", mealPlan: "Full" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [houses, setHouses] = useState<House[]>([DEFAULT_HOUSE]);
  const [currentHouseId, setCurrentHouseId] = useState<string>("h1");

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [dailyMeals, setDailyMeals] = useState<DailyMealRecord[]>([]);
  const [mealRequests, setMealRequests] = useState<MealStopRequest[]>([]);
  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>([]);
  const [marketDuties, setMarketDuties] = useState<MarketDuty[]>([]);
  const [marketExpenses, setMarketExpenses] = useState<MarketExpense[]>([]);
  const [expenses, setExpenses] = useState<HouseExpense[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [walletPayments, setWalletPayments] = useState<WalletPayment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  // Load Live Data from REST API Backend
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveData() {
      try {
        const houseData = await api.getHouseDetails(currentHouseId).catch(() => null);
        if (houseData && isMounted) {
          setHouses(prev => [houseData, ...prev.filter(h => h.id !== houseData.id)]);
        }

        const dailyMealsData = await api.getDailyMeals(currentHouseId).catch(() => null);
        if (dailyMealsData && Array.isArray(dailyMealsData) && isMounted) {
          setDailyMeals(dailyMealsData);
        }

        const requestsData = await api.getMealRequests(currentHouseId).catch(() => null);
        if (requestsData && Array.isArray(requestsData) && isMounted) {
          setMealRequests(requestsData);
        }

        const guestsData = await api.getGuestMeals(currentHouseId).catch(() => null);
        if (guestsData && Array.isArray(guestsData) && isMounted) {
          setGuestMeals(guestsData);
        }

        const dutiesData = await api.getMarketDuties(currentHouseId).catch(() => null);
        if (dutiesData && Array.isArray(dutiesData) && isMounted) {
          setMarketDuties(dutiesData);
        }

        const marketExpensesData = await api.getMarketExpenses(currentHouseId).catch(() => null);
        if (marketExpensesData && Array.isArray(marketExpensesData) && isMounted) {
          setMarketExpenses(marketExpensesData);
        }

        const billsData = await api.getBills(currentHouseId).catch(() => null);
        if (billsData && Array.isArray(billsData) && isMounted) {
          setExpenses(billsData);
        }

        const paymentsData = await api.getWallets(currentHouseId).catch(() => null);
        if (paymentsData && Array.isArray(paymentsData) && isMounted) {
          setWalletPayments(paymentsData);
        }

        const finesData = await api.getFines(currentHouseId).catch(() => null);
        if (finesData && Array.isArray(finesData) && isMounted) {
          setFines(finesData);
        }

        const notificationsData = await api.getNotifications(currentHouseId).catch(() => null);
        if (notificationsData && Array.isArray(notificationsData) && isMounted) {
          setNotifications(notificationsData);
        }

        const settlementData = await api.getSettlement(currentHouseId).catch(() => null);
        if (settlementData && isMounted) {
          setMonthlyClosing(settlementData);
        }
      } catch (err) {
        console.error("Live API Sync Error:", err);
      }
    }

    fetchLiveData();
    return () => { isMounted = false; };
  }, [currentHouseId]);

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

  const toggleDailyMeal = (memberId: string, meal: "breakfast" | "lunch" | "dinner", date: string = "Aug 31") => {
    api.toggleDailyMeal(currentHouseId, { memberId, date, [meal]: true }).catch(() => null);

    setDailyMeals(prev => {
      const existingRecordIndex = prev.findIndex(r => r.date === date);
      if (existingRecordIndex >= 0) {
        const record = prev[existingRecordIndex];
        const memberMeal = record.members.find(m => m.id === memberId);

        let updatedMembers;
        if (memberMeal) {
          updatedMembers = record.members.map(m =>
            m.id === memberId ? { ...m, [meal]: !m[meal], isOverride: true } : m
          );
        } else {
          updatedMembers = [...record.members, { id: memberId, breakfast: meal === "breakfast", lunch: meal === "lunch", dinner: meal === "dinner", isOverride: true }];
        }

        const updated = [...prev];
        updated[existingRecordIndex] = { ...record, members: updatedMembers };
        return updated;
      } else {
        return [
          {
            date,
            day: "Mon",
            members: [
              { id: memberId, breakfast: meal === "breakfast", lunch: meal === "lunch", dinner: meal === "dinner", isOverride: true }
            ]
          },
          ...prev
        ];
      }
    });
  };

  const submitMealRequest = (req: Omit<MealStopRequest, "id" | "houseId" | "memberId" | "memberName" | "avatar" | "status" | "submittedAt">) => {
    const member = members[0] || { id: "m1", name: "User", avatar: "US" };
    api.submitMealRequest(currentHouseId, { memberId: member.id, ...req }).catch(() => null);

    const newReq: MealStopRequest = {
      id: "r" + (mealRequests.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      avatar: member.avatar || "MB",
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      status: "pending",
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setMealRequests(prev => [newReq, ...prev]);
  };

  const approveMealRequest = (id: string) => {
    api.approveMealRequest(currentHouseId, id).catch(() => null);
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

  const assignMarketDuty = (duty: Omit<MarketDuty, "id" | "houseId" | "memberName" | "status">) => {
    const member = members.find(m => m.id === duty.memberId) || members[0] || { name: "Member" };
    api.assignMarketDuty(currentHouseId, duty).catch(() => null);

    const newDuty: MarketDuty = {
      id: "d" + (marketDuties.length + 1),
      houseId: currentHouseId,
      memberId: duty.memberId,
      memberName: member.name,
      startDate: duty.startDate,
      endDate: duty.endDate,
      status: "upcoming",
      notes: duty.notes,
    };
    setMarketDuties(prev => [...prev, newDuty]);
  };

  const submitMarketExpense = (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string; items?: MarketItem[] }) => {
    const member = members.find(m => m.id === exp.paidByMemberId) || members[0] || { id: "m1", name: "Member" };
    api.submitMarketExpense(currentHouseId, { memberId: member.id, ...exp }).catch(() => null);

    const newExp: MarketExpense = {
      id: "e" + (marketExpenses.length + 1),
      houseId: currentHouseId,
      memberId: member.id,
      memberName: member.name,
      date: exp.date,
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
      items: exp.items,
      status: "pending",
    };
    setMarketExpenses(prev => [newExp, ...prev]);
  };

  const approveMarketExpense = (id: string) => {
    api.approveMarketExpense(currentHouseId, id).catch(() => null);
    setMarketExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
  };

  const rejectMarketExpense = (id: string) => {
    api.rejectMarketExpense(currentHouseId, id).catch(() => null);
    setMarketExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
  };

  const addExpense = (exp: Omit<HouseExpense, "id" | "houseId" | "status">) => {
    api.addBill(currentHouseId, exp).catch(() => null);
    const newX: HouseExpense = {
      ...exp,
      id: "x" + (expenses.length + 1),
      houseId: currentHouseId,
      status: "paid",
    };
    setExpenses(prev => [newX, ...prev]);
  };

  const addBill = (bill: Omit<HouseExpense, "id" | "houseId" | "status">) => {
    api.addBill(currentHouseId, bill).catch(() => null);
    const newB: HouseExpense = {
      ...bill,
      id: "b" + (expenses.length + 1),
      houseId: currentHouseId,
      status: "unpaid",
    };
    setExpenses(prev => [newB, ...prev]);
  };

  const addPayment = (pay: Omit<WalletPayment, "id" | "houseId" | "memberName" | "status">) => {
    const member = members.find(m => m.id === pay.memberId) || members[0] || { name: "Member" };
    api.addPayment(currentHouseId, pay).catch(() => null);

    const newP: WalletPayment = {
      ...pay,
      id: "wp" + (walletPayments.length + 1),
      houseId: currentHouseId,
      memberName: member.name,
      status: "pending",
    };
    setWalletPayments(prev => [newP, ...prev]);
  };

  const approvePayment = (id: string) => {
    api.approvePayment(currentHouseId, id).catch(() => null);
    setWalletPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  };

  const applyFine = (fine: Omit<Fine, "id" | "houseId" | "memberName" | "status" | "allocation">) => {
    const member = members.find(m => m.id === fine.memberId) || members[0] || { name: "Member" };
    api.applyFine(currentHouseId, fine).catch(() => null);

    const newF: Fine = {
      ...fine,
      id: "f" + (fines.length + 1),
      houseId: currentHouseId,
      memberName: member.name,
      status: "applied",
      allocation: currentHouse.setting.fineAllocation,
    };
    setFines(prev => [newF, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    api.markNotificationRead(currentHouseId, id).catch(() => null);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addAnnouncement = (title: string, message: string, priority: "normal" | "warning" | "important" = "normal") => {
    api.sendAnnouncement(currentHouseId, { title, message, priority }).catch(() => null);

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

  const updateSettings = (setting: Partial<House["setting"]>) => {
    api.updateHouseSettings(currentHouseId, setting).catch(() => null);

    setHouses(prev =>
      prev.map(h =>
        h.id === currentHouseId
          ? { ...h, setting: { ...h.setting, ...setting } }
          : h
      )
    );
  };

  const generateSettlement = () => {
    api.generateSettlement(currentHouseId).catch(() => null);

    setMonthlyClosing(prev => ({
      ...prev,
      status: "generated",
      totalFoodExpense,
      totalMeals: totalWeightedMeals,
      mealRate,
      settlements: memberSettlements,
    }));

    addAnnouncement("Monthly Settlement Generated", `August 2026 settlement generated with meal rate ৳${mealRate}`, "important");
  };

  const closeMonth = () => {
    api.closeMonth(currentHouseId).catch(() => null);
    setMonthlyClosing(prev => ({ ...prev, status: "closed" }));
  };

  const reopenMonth = () => {
    api.reopenMonth(currentHouseId).catch(() => null);
    setMonthlyClosing(prev => ({ ...prev, status: "open" }));
  };

  return (
    <AppContext.Provider
      value={{
        houses,
        currentHouse,
        switchHouse,
        members,
        addMember,
        dailyMeals,
        toggleDailyMeal,
        mealRequests,
        submitMealRequest,
        approveMealRequest,
        rejectMealRequest,
        guestMeals,
        addGuestMeal,
        marketDuties,
        assignMarketDuty,
        marketExpenses,
        submitMarketExpense,
        approveMarketExpense,
        rejectMarketExpense,
        expenses,
        addExpense,
        bills: expenses,
        addBill,
        walletPayments,
        addPayment,
        approvePayment,
        fines,
        applyFine,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addAnnouncement,
        updateSettings,
        totalFoodExpense,
        totalWeightedMeals,
        mealRate,
        memberSettlements,
        monthlyClosing,
        generateSettlement,
        closeMonth,
        reopenMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
