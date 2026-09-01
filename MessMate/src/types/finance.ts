import { PaymentMethod, RequestStatus, MonthStatus } from "./core";

export interface MarketItem {
  name: string;
  quantity?: string;
  price: number;
}

export interface MarketExpense {
  id: string;
  houseId: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paidByMemberId: string;
  paidByMemberName: string;
  status: RequestStatus;
  items?: MarketItem[];
}

export interface HouseExpense {
  id: string;
  houseId: string;
  title?: string;
  amount: number;
  category: string;
  date?: string;
  month?: string;
  dueDate?: string;
  paidBy?: string;
  paidByMemberId?: string;
  description?: string;
  status: "paid" | "unpaid" | "pending";
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
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  date: string;
  status: RequestStatus;
  note?: string;
}

export interface Fine {
  id: string;
  houseId: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  date: string;
  status: "paid" | "unpaid" | "applied" | "cancelled";
  allocation: "House fund" | "Shared equally";
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
  balance: number;
  status: "pay" | "receive" | "settled";
}

export interface MonthlyClosingRecord {
  month: string;
  status: MonthStatus;
  totalFoodExpense: number;
  totalMeals: number;
  mealRate: number;
  totalOtherExpense: number;
  settlements: MemberSettlement[];
}
