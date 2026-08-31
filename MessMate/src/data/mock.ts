export type UserRole = "manager" | "member";

export const HOUSES = [
  { id: "h1", name: "Bashundhara Mess", address: "Block B, Bashundhara R/A, Dhaka", members: 5 },
  { id: "h2", name: "Mirpur Bachelor House", address: "Section 10, Mirpur, Dhaka", members: 7 },
];

export const CURRENT_HOUSE = HOUSES[0];

export const MEMBERS = [
  { id: "m1", name: "Nadib Hasan", phone: "01711-123456", email: "nadib@example.com", role: "manager" as UserRole, avatar: "NH", meals: 65, wallet: 850, status: "active", mealPlan: "Full" },
  { id: "m2", name: "Rakib Ahmed", phone: "01712-234567", email: "rakib@example.com", role: "member" as UserRole, avatar: "RA", meals: 52.5, wallet: 1200, status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m3", name: "Hasan Mahmud", phone: "01713-345678", email: "hasan@example.com", role: "member" as UserRole, avatar: "HM", meals: 48, wallet: 180, status: "active", mealPlan: "Full" },
  { id: "m4", name: "Sakib Alam", phone: "01714-456789", email: "sakib@example.com", role: "member" as UserRole, avatar: "SA", meals: 60, wallet: 620, status: "active", mealPlan: "Lunch + Dinner" },
  { id: "m5", name: "Rahim Uddin", phone: "01715-567890", email: "rahim@example.com", role: "member" as UserRole, avatar: "RU", meals: 55, wallet: 950, status: "active", mealPlan: "Full" },
];

export const CURRENT_MONTH = {
  name: "August 2026",
  totalMeals: 425,
  totalFoodExpense: 18062,
  mealRate: 42.5,
  totalOtherExpense: 31200,
  totalExpense: 49262,
};

export const DAILY_MEALS = [
  { date: "Aug 31", day: "Mon", members: [
    { id: "m1", breakfast: true, lunch: true, dinner: true },
    { id: "m2", breakfast: false, lunch: true, dinner: true },
    { id: "m3", breakfast: true, lunch: true, dinner: true },
    { id: "m4", breakfast: false, lunch: true, dinner: false },
    { id: "m5", breakfast: true, lunch: true, dinner: true },
  ]},
  { date: "Aug 30", day: "Sun", members: [
    { id: "m1", breakfast: true, lunch: true, dinner: true },
    { id: "m2", breakfast: false, lunch: true, dinner: true },
    { id: "m3", breakfast: false, lunch: false, dinner: false },
    { id: "m4", breakfast: false, lunch: true, dinner: true },
    { id: "m5", breakfast: true, lunch: true, dinner: true },
  ]},
  { date: "Aug 29", day: "Sat", members: [
    { id: "m1", breakfast: true, lunch: true, dinner: true },
    { id: "m2", breakfast: true, lunch: true, dinner: true },
    { id: "m3", breakfast: true, lunch: true, dinner: true },
    { id: "m4", breakfast: false, lunch: true, dinner: true },
    { id: "m5", breakfast: false, lunch: true, dinner: true },
  ]},
];

export const MEAL_WEIGHTS = { breakfast: 0.5, lunch: 1, dinner: 1 };

export const MARKET_DUTIES = [
  { id: "d1", memberId: "m1", memberName: "Nadib Hasan", startDate: "Sep 1", endDate: "Sep 3", status: "upcoming" },
  { id: "d2", memberId: "m2", memberName: "Rakib Ahmed", startDate: "Aug 28", endDate: "Aug 31", status: "current" },
  { id: "d3", memberId: "m3", memberName: "Hasan Mahmud", startDate: "Aug 25", endDate: "Aug 27", status: "completed" },
  { id: "d4", memberId: "m4", memberName: "Sakib Alam", startDate: "Sep 4", endDate: "Sep 6", status: "upcoming" },
  { id: "d5", memberId: "m5", memberName: "Rahim Uddin", startDate: "Sep 7", endDate: "Sep 9", status: "upcoming" },
];

export const MARKET_EXPENSES = [
  { id: "e1", memberId: "m2", memberName: "Rakib Ahmed", date: "Aug 31", amount: 2500, category: "Bazar", description: "Weekly groceries", status: "pending" },
  { id: "e2", memberId: "m2", memberName: "Rakib Ahmed", date: "Aug 30", amount: 1800, category: "Bazar", description: "Rice and lentils", status: "approved" },
  { id: "e3", memberId: "m3", memberName: "Hasan Mahmud", date: "Aug 27", amount: 3200, category: "Bazar", description: "Monthly vegetables", status: "approved" },
  { id: "e4", memberId: "m1", memberName: "Nadib Hasan", date: "Aug 25", amount: 900, category: "Bazar", description: "Spices and condiments", status: "approved" },
];

export const EXPENSES = [
  { id: "x1", date: "Aug 28", category: "Electricity", amount: 8040, paidBy: "Nadib Hasan", status: "approved", description: "August electricity bill" },
  { id: "x2", date: "Aug 1", category: "House Rent", amount: 18000, paidBy: "Nadib Hasan", status: "approved", description: "August rent" },
  { id: "x3", date: "Aug 5", category: "Internet", amount: 1200, paidBy: "Rakib Ahmed", status: "approved", description: "Monthly internet" },
  { id: "x4", date: "Aug 10", category: "Buya / Maid", amount: 3000, paidBy: "Nadib Hasan", status: "approved", description: "Maid salary August" },
  { id: "x5", date: "Aug 15", category: "Gas", amount: 960, paidBy: "Hasan Mahmud", status: "pending", description: "Gas cylinder" },
];

export const BILLS = [
  { id: "b1", category: "Electricity", month: "August 2026", amount: 8040, dueDate: "Sep 5", paidBy: "Nadib Hasan", status: "paid", units: 670, prevReading: 4230, currReading: 4900 },
  { id: "b2", category: "House Rent", month: "August 2026", amount: 18000, dueDate: "Aug 1", paidBy: "Nadib Hasan", status: "paid" },
  { id: "b3", category: "Internet", month: "August 2026", amount: 1200, dueDate: "Aug 10", paidBy: "Rakib Ahmed", status: "paid" },
  { id: "b4", category: "Buya / Maid", month: "August 2026", amount: 3000, dueDate: "Aug 31", paidBy: "Nadib Hasan", status: "paid" },
  { id: "b5", category: "Gas", month: "August 2026", amount: 960, dueDate: "Sep 1", paidBy: "-", status: "unpaid" },
];

export const WALLETS = [
  { memberId: "m1", memberName: "Nadib Hasan", avatar: "NH", balance: 850, deposited: 5000, mealCost: 2762.5, otherShare: 6240, fines: 0, totalResponsibility: 9002.5, status: "good" },
  { memberId: "m2", memberName: "Rakib Ahmed", avatar: "RA", balance: 1200, deposited: 6000, mealCost: 2231.25, otherShare: 6240, fines: 0, totalResponsibility: 8471.25, status: "good" },
  { memberId: "m3", memberName: "Hasan Mahmud", avatar: "HM", balance: 180, deposited: 4000, mealCost: 2040, otherShare: 6240, fines: 200, totalResponsibility: 8480, status: "low" },
  { memberId: "m4", memberName: "Sakib Alam", avatar: "SA", balance: 620, deposited: 5500, mealCost: 2550, otherShare: 6240, fines: 0, totalResponsibility: 8790, status: "good" },
  { memberId: "m5", memberName: "Rahim Uddin", avatar: "RU", balance: 950, deposited: 5200, mealCost: 2337.5, otherShare: 6240, fines: 0, totalResponsibility: 8577.5, status: "good" },
];

export const FINES = [
  { id: "f1", memberId: "m3", memberName: "Hasan Mahmud", reason: "Failed to complete market duty", amount: 200, date: "Aug 27", status: "applied", allocation: "House fund" },
  { id: "f2", memberId: "m4", memberName: "Sakib Alam", reason: "Late wallet payment", amount: 100, date: "Aug 20", status: "cancelled", allocation: "House fund" },
];

export const NOTIFICATIONS = [
  { id: "n1", type: "low_wallet", title: "Low Wallet Alert", message: "Hasan Mahmud's wallet balance is ৳180. Please deposit soon.", time: "2 hours ago", read: false, priority: "warning" },
  { id: "n2", type: "meal_stop", title: "Meal Stop Request", message: "Rakib Ahmed requested meal stop from Sep 5–10.", time: "5 hours ago", read: false, priority: "normal" },
  { id: "n3", type: "expense", title: "Expense Submitted", message: "Rakib Ahmed submitted market expense of ৳2,500.", time: "1 day ago", read: false, priority: "normal" },
  { id: "n4", type: "settlement", title: "Settlement Ready", message: "July 2026 monthly settlement is ready. Please review.", time: "3 days ago", read: true, priority: "important" },
  { id: "n5", type: "duty", title: "Market Duty Assigned", message: "You are assigned market duty from Sep 1–3.", time: "4 days ago", read: true, priority: "normal" },
  { id: "n6", type: "fine", title: "Fine Applied", message: "A fine of ৳200 has been applied to Hasan Mahmud.", time: "5 days ago", read: true, priority: "warning" },
];

export const MEAL_REQUESTS = [
  { id: "r1", memberId: "m2", memberName: "Rakib Ahmed", avatar: "RA", startDate: "Sep 5", endDate: "Sep 10", reason: "Travelling home for Eid", status: "pending", submittedAt: "Aug 31, 2026" },
  { id: "r2", memberId: "m5", memberName: "Rahim Uddin", avatar: "RU", startDate: "Aug 20", endDate: "Aug 23", reason: "Medical leave", status: "approved", submittedAt: "Aug 19, 2026" },
  { id: "r3", memberId: "m3", memberName: "Hasan Mahmud", avatar: "HM", startDate: "Aug 10", endDate: "Aug 12", reason: "Out of town", status: "rejected", submittedAt: "Aug 9, 2026" },
];

export const GUEST_MEALS = [
  { id: "g1", guestName: "Farhan Hossain", hostId: "m1", hostName: "Nadib Hasan", startDate: "Aug 28", endDate: "Aug 29", meals: { breakfast: true, lunch: true, dinner: true }, totalMeals: 5, cost: 212.5, status: "active" },
  { id: "g2", guestName: "Mithun Roy", hostId: "m4", hostName: "Sakib Alam", startDate: "Aug 25", endDate: "Aug 25", meals: { breakfast: false, lunch: true, dinner: true }, totalMeals: 2, cost: 85, status: "completed" },
];

export const SETTLEMENT_MEMBERS = [
  { memberId: "m1", name: "Nadib Hasan", avatar: "NH", meals: 65, mealCost: 2762.5, otherShare: 6240, fines: 0, guestMealCost: 212.5, totalResponsibility: 9215, paid: 15000, balance: 5785, status: "receive" },
  { memberId: "m2", name: "Rakib Ahmed", avatar: "RA", meals: 52.5, mealCost: 2231.25, otherShare: 6240, fines: 0, guestMealCost: 0, totalResponsibility: 8471.25, paid: 6000, balance: -2471.25, status: "pay" },
  { memberId: "m3", name: "Hasan Mahmud", avatar: "HM", meals: 48, mealCost: 2040, otherShare: 6240, fines: 200, guestMealCost: 0, totalResponsibility: 8480, paid: 4000, balance: -4480, status: "pay" },
  { memberId: "m4", name: "Sakib Alam", avatar: "SA", meals: 60, mealCost: 2550, otherShare: 6240, fines: 0, guestMealCost: 85, totalResponsibility: 8875, paid: 5500, balance: -3375, status: "pay" },
  { memberId: "m5", name: "Rahim Uddin", avatar: "RU", meals: 55, mealCost: 2337.5, otherShare: 6240, fines: 0, guestMealCost: 0, totalResponsibility: 8577.5, paid: 5200, balance: -3377.5, status: "pay" },
];

export const MONTHLY_TREND = [
  { month: "Mar", food: 15200, other: 28000, meals: 380 },
  { month: "Apr", food: 16800, other: 29500, meals: 402 },
  { month: "May", food: 14900, other: 27800, meals: 365 },
  { month: "Jun", food: 17200, other: 31000, meals: 418 },
  { month: "Jul", food: 16500, other: 30200, meals: 395 },
  { month: "Aug", food: 18062, other: 31200, meals: 425 },
];
