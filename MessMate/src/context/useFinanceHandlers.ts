import { api } from "../services/api";
import {
  MarketDuty,
  MarketExpense,
  HouseExpense,
  WalletPayment,
  Fine,
  NotificationItem,
  Member,
  MarketItem,
} from "../types";
import { usePaymentDutyHandlers } from "./usePaymentDutyHandlers";

export function useFinanceHandlers(
  currentHouseId: string,
  members: Member[],
  marketDuties: MarketDuty[],
  setMarketDuties: React.Dispatch<React.SetStateAction<MarketDuty[]>>,
  marketExpenses: MarketExpense[],
  setMarketExpenses: React.Dispatch<React.SetStateAction<MarketExpense[]>>,
  expenses: HouseExpense[],
  setExpenses: React.Dispatch<React.SetStateAction<HouseExpense[]>>,
  walletPayments: WalletPayment[],
  setWalletPayments: React.Dispatch<React.SetStateAction<WalletPayment[]>>,
  fines: Fine[],
  setFines: React.Dispatch<React.SetStateAction<Fine[]>>,
  notifications: NotificationItem[],
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
) {
  const pdHandlers = usePaymentDutyHandlers(currentHouseId, members, marketDuties, setMarketDuties, walletPayments, setWalletPayments);

  const submitMarketExpense = (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string; items?: MarketItem[] }) => {
    const member = members.find(m => m.id === exp.paidByMemberId) || members[0] || { name: "Member" };
    api.submitMarketExpense(currentHouseId, exp).catch(() => null);
    setMarketExpenses(prev => [{ id: "e" + (marketExpenses.length + 1), houseId: currentHouseId, date: exp.date, amount: exp.amount, category: exp.category, description: exp.description, paidByMemberId: exp.paidByMemberId, paidByMemberName: member.name, status: "pending", items: exp.items || [] }, ...prev]);
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
    setExpenses(prev => [{ ...exp, id: "b" + (expenses.length + 1), houseId: currentHouseId, status: "paid" }, ...prev]);
  };

  const applyFine = (fine: Omit<Fine, "id" | "houseId" | "memberName" | "status" | "allocation">) => {
    const member = members.find(m => m.id === fine.memberId) || members[0] || { name: "Member" };
    api.applyFine(currentHouseId, fine).catch(() => null);
    setFines(prev => [{ id: "f" + (fines.length + 1), houseId: currentHouseId, memberId: fine.memberId, memberName: member.name, amount: fine.amount, reason: fine.reason, date: fine.date, status: "unpaid", allocation: "House fund" }, ...prev]);
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
    setNotifications(prev => [{ id: "n" + (notifications.length + 1), houseId: currentHouseId, title, message, type: "announcement", priority, createdAt: "Just now", read: false }, ...prev]);
  };

  return {
    ...pdHandlers,
    submitMarketExpense,
    approveMarketExpense,
    rejectMarketExpense,
    addExpense,
    addBill: addExpense,
    applyFine,
    markNotificationRead,
    markAllNotificationsRead,
    addAnnouncement,
  };
}
