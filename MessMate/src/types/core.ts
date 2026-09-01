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
  guestMealRule: "Host Pays" | "House Shared" | "House Pays" | "Custom";
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
