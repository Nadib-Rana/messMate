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

  const submitMarketExpense = (exp: { date: string; amount: number; category: string; description: string; paidByMemberId: string; paymentSource?: "mess_cash" | "member_pocket"; items?: MarketItem[] }) => {
    const member = members.find(m => m.id === exp.paidByMemberId) || members[0] || { name: "Member" };
    const tempId = "e" + Date.now();

    // If paid from personal pocket, automatically credit member's wallet balance
    if (exp.paymentSource === "member_pocket") {
      pdHandlers.addPayment({
        memberId: exp.paidByMemberId,
        amount: exp.amount,
        date: exp.date,
        method: "Cash",
        reference: "Bazar Reimbursement",
        note: `Personal Pocket Bazar (${exp.category}): ৳${exp.amount}`,
      });
    }

    api.submitMarketExpense(currentHouseId, { ...exp, memberId: exp.paidByMemberId }).then((created: any) => {
      const realId = created?.id || created?.data?.id;
      if (realId) {
        setMarketExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: realId } : e));
      }
    }).catch(() => null);

    setMarketExpenses(prev => [{ id: tempId, houseId: currentHouseId, date: exp.date, amount: exp.amount, category: exp.category, description: exp.description, paidByMemberId: exp.paidByMemberId, paidByMemberName: member.name, paymentSource: exp.paymentSource || "mess_cash", status: "pending", items: exp.items || [] }, ...prev]);
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
    const tempId = "b" + Date.now();
    api.addBill(currentHouseId, exp).then((created: any) => {
      const realId = created?.id || created?.data?.id;
      if (realId) {
        setExpenses(prev => prev.map(b => b.id === tempId ? { ...b, id: realId } : b));
      }
    }).catch(() => null);
    setExpenses(prev => [{ ...exp, id: tempId, houseId: currentHouseId, status: "paid" }, ...prev]);
  };

  const applyFine = (fine: Omit<Fine, "id" | "houseId" | "memberName" | "status" | "allocation">) => {
    const member = members.find(m => m.id === fine.memberId) || members[0] || { name: "Member" };
    const tempId = "f" + Date.now();
    api.applyFine(currentHouseId, fine).then((created: any) => {
      const realId = created?.id || created?.data?.id;
      if (realId) {
        setFines(prev => prev.map(f => f.id === tempId ? { ...f, id: realId } : f));
      }
    }).catch(() => null);
    setFines(prev => [{ id: tempId, houseId: currentHouseId, memberId: fine.memberId, memberName: member.name, amount: fine.amount, reason: fine.reason, date: fine.date, status: "unpaid", allocation: "House fund" }, ...prev]);
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
