import { api } from "../services/api";
import { MarketDuty, WalletPayment, Member } from "../types";

export function usePaymentDutyHandlers(
  currentHouseId: string,
  members: Member[],
  marketDuties: MarketDuty[],
  setMarketDuties: React.Dispatch<React.SetStateAction<MarketDuty[]>>,
  walletPayments: WalletPayment[],
  setWalletPayments: React.Dispatch<React.SetStateAction<WalletPayment[]>>
) {
  const assignMarketDuty = async (duty: Omit<MarketDuty, "id" | "houseId" | "memberName" | "status">) => {
    const member = members.find(m => m.id === duty.memberId) || members[0] || { name: "Member" };
    const todayStr = new Date().toISOString().split("T")[0];
    let computedStatus: "current" | "upcoming" | "completed" = "upcoming";
    if (duty.startDate && duty.endDate) {
      if (todayStr >= duty.startDate && todayStr <= duty.endDate) computedStatus = "current";
      else if (todayStr > duty.endDate) computedStatus = "completed";
    }

    try {
      const created = await api.assignMarketDuty(currentHouseId, duty);
      const realId = created?.id || created?.data?.id || ("d" + (marketDuties.length + 1));
      setMarketDuties(prev => [{ id: realId, houseId: currentHouseId, memberId: duty.memberId, memberName: member.name, startDate: duty.startDate, endDate: duty.endDate, status: computedStatus }, ...prev]);
    } catch {
      setMarketDuties(prev => [{ id: "d" + (marketDuties.length + 1), houseId: currentHouseId, memberId: duty.memberId, memberName: member.name, startDate: duty.startDate, endDate: duty.endDate, status: computedStatus }, ...prev]);
    }
  };

  const deleteMarketDuty = (id: string) => {
    api.deleteMarketDuty(currentHouseId, id).catch(() => null);
    setMarketDuties(prev => prev.filter(d => d.id !== id));
  };

  const clearMarketDuties = () => {
    api.clearMarketDuties(currentHouseId).catch(() => null);
    setMarketDuties([]);
  };

  const addPayment = (pay: Omit<WalletPayment, "id" | "houseId" | "memberName" | "status">) => {
    const member = members.find(m => m.id === pay.memberId) || members[0] || { name: "Member" };
    api.addPayment(currentHouseId, pay).catch(() => null);
    setWalletPayments(prev => [{ id: "wp" + (walletPayments.length + 1), houseId: currentHouseId, memberId: pay.memberId, memberName: member.name, amount: pay.amount, method: pay.method, transactionId: pay.transactionId, date: pay.date, status: "pending" }, ...prev]);
  };

  const approvePayment = (id: string) => {
    api.approvePayment(currentHouseId, id).catch(() => null);
    setWalletPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
  };

  const rejectPayment = (id: string) => {
    api.rejectPayment(currentHouseId, id).catch(() => null);
    setWalletPayments(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
  };

  return { assignMarketDuty, deleteMarketDuty, clearMarketDuties, addPayment, approvePayment, rejectPayment };
}
