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

export interface AppContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  currentMember: Member;

  houses: House[];
  currentHouse: House;
  switchHouse: (houseId: string) => void;

  members: Member[];
  addMember: (member: Omit<Member, "id" | "houseId" | "status">) => void;
  updateMember: (memberId: string, data: { mealPlan?: string; role?: string; status?: string }) => void;

  dailyMeals: DailyMealRecord[];
  toggleDailyMeal: (memberId: string, meal: "breakfast" | "lunch" | "dinner", date?: string) => void;
  setMealExplicit: (memberId: string, date: string, breakfast: boolean, lunch: boolean, dinner: boolean) => void;

  weeklySchedules: { memberId: string; dayOfWeek: string; breakfast: boolean; lunch: boolean; dinner: boolean }[];
  updateWeeklySchedule: (memberId: string, dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", value: boolean) => void;

  mealRequests: MealStopRequest[];
  submitMealRequest: (req: Omit<MealStopRequest, "id" | "houseId" | "memberId" | "memberName" | "avatar" | "status" | "submittedAt">) => void;
  approveMealRequest: (id: string) => void;
  rejectMealRequest: (id: string) => void;

  guestMeals: GuestMeal[];
  addGuestMeal: (guest: Omit<GuestMeal, "id" | "houseId" | "hostName" | "totalMeals" | "cost" | "status">) => void;

  marketDuties: MarketDuty[];
  assignMarketDuty: (duty: Omit<MarketDuty, "id" | "houseId" | "memberName" | "status">) => void;
  deleteMarketDuty: (id: string) => void;
  clearMarketDuties: () => void;

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
  rejectPayment: (id: string) => void;

  fines: Fine[];
  applyFine: (fine: Omit<Fine, "id" | "houseId" | "memberName" | "status" | "allocation">) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAnnouncement: (title: string, message: string, priority?: "normal" | "warning" | "important") => void;

  updateSettings: (setting: Partial<House["setting"]>) => void;

  totalFoodExpense: number;
  totalWeightedMeals: number;
  mealRate: number;
  memberSettlements: MemberSettlement[];

  monthlyClosing: MonthlyClosingRecord;
  generateSettlement: () => void;
  closeMonth: () => void;
  reopenMonth: () => void;
}
