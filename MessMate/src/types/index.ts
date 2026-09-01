export * from "./core";
export * from "./finance";
import { RequestStatus, NotificationPriority } from "./core";

export interface WeeklyMealSchedule {
  memberId: string;
  schedule: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>;
}

export interface DailyMealRecord {
  date: string;
  day: string;
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
  meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
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
  status: "upcoming" | "current" | "completed";
  notes?: string;
}

export interface NotificationItem {
  id: string;
  houseId: string;
  title: string;
  message: string;
  type: "duty" | "bill" | "payment" | "meal" | "announcement" | "fine";
  priority: NotificationPriority;
  createdAt: string;
  time?: string;
  read: boolean;
}
