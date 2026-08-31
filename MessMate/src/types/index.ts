export type UserRole = "manager" | "member";

export type MemberStatus = "active" | "inactive";

export type RequestStatus = "pending" | "approved" | "rejected";

export type BillStatus = "paid" | "unpaid" | "pending";

export type DutyStatus = "upcoming" | "current" | "completed";

export type PaymentMethod = "Cash" | "bKash" | "Nagad" | "Bank Transfer" | "Rocket";

export type MonthStatus = "open" | "generated" | "closed";

export type NotificationPriority = "normal" | "warning" | "important";

export interface HouseSetting {
  mealWeights: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  lowWalletThreshold: number;
  guestMealRule: "Host Pays" | "House Pays" | "Custom";
  fineAllocation: "House fund" | "Shared equally";
  dutyDurationDays: number;
}

export interface House {
  id: string;
  name: string;
  address: string;
  description?: string;
  inviteCode: string;
  setting: HouseSetting;
}

export interface Member {
  id: string;
  houseId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: MemberStatus;
  mealPlan: string;
}

export interface WeeklyMealSchedule {
  memberId: string;
  schedule: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>; 
  // key: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
}

export interface DailyMealRecord {
  date: string; // "YYYY-MM-DD" or "Aug 31"
  day: string;  // "Mon", "Tue", etc.
  members: {
    id: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    isOverride?: boolean;
  }[];
}

export interface MealStopRequest {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  avatar: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string;
}

export interface GuestMeal {
  id: string;
  houseId: string;
  guestName: string;
  hostId: string;
  hostName: string;
  startDate: string;
  endDate: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  totalMeals: number;
  cost: number;
  status: "active" | "completed";
}

export interface MarketDuty {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  startDate: string;
  endDate: string;
  status: DutyStatus;
  notes?: string;
}

export interface MarketExpense {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: RequestStatus;
}

export interface HouseExpense {
  id: string;
  houseId: string;
  category: string; // "Electricity", "House Rent", "Buya / Maid", "Internet", "Gas", "Water", "Other"
  month: string;
  amount: number;
  paidBy: string;
  dueDate?: string;
  status: BillStatus;
  description?: string;
  units?: number;
  prevReading?: number;
  currReading?: number;
}

export interface WalletPayment {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  status: RequestStatus;
}

export interface Fine {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  reason: string;
  amount: number;
  date: string;
  status: "applied" | "cancelled";
  allocation: string;
}

export interface NotificationItem {
  id: string;
  houseId: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: NotificationPriority;
}

export interface MemberSettlement {
  memberId: string;
  name: string;
  avatar: string;
  meals: number;
  mealCost: number;
  otherShare: number;
  fines: number;
  guestMealCost: number;
  totalResponsibility: number;
  paid: number;
  balance: number; // positive = receive, negative = pay
  status: "receive" | "pay" | "settled";
}

export interface MonthlyClosingRecord {
  month: string; // e.g. "August 2026"
  status: MonthStatus;
  totalFoodExpense: number;
  totalMeals: number;
  mealRate: number;
  totalOtherExpense: number;
  settlements: MemberSettlement[];
}
