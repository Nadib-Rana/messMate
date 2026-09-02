import { Users, Utensils, TrendingUp, ShoppingBasket, Check, Wallet, DollarSign } from "lucide-react";
import { StatCard, Card, Badge, fmt, Btn } from "../components/ui";
import { useApp } from "../context/AppContext";
import { DashboardDutyAndAlerts } from "./components/DashboardDutyAndAlerts";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity";
import { MarketDutyHeroBanner } from "./components/MarketDutyHeroBanner";
import { Page } from "../components/Sidebar";

export default function Dashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  const {
    members,
    totalFoodExpense,
    totalWeightedMeals,
    mealRate,
    expenses,
    marketDuties,
    marketExpenses,
    walletPayments,
    memberSettlements,
    currentHouse,
    approvePayment,
    currentMember,
    currentUser,
  } = useApp();

  const isManager = currentMember?.role === "manager" || currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const todayStr = getTodayStr();

  const todayDuty = marketDuties.find(d => {
    if (d.startDate && d.endDate) {
      return todayStr >= d.startDate && todayStr <= d.endDate;
    }
    return d.status === "current";
  });

  const nextDuty = marketDuties
    .filter(d => d.startDate && d.startDate > todayStr)
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))[0];
  const lowWallet = memberSettlements.filter(s => s.balance < currentHouse.setting.lowWalletThreshold);
  const pendingExpenses = marketExpenses.filter(e => e.status === "pending");
  const pendingPayments = walletPayments.filter(p => p.status === "pending");
  const totalOtherBills = expenses.reduce((a, b) => a + b.amount, 0);
  const totalExpense = totalFoodExpense + totalOtherBills;

  // Calculate Total Money Deposited/Collected from all members (approved wallet payments)
  const totalCollected = walletPayments
    .filter(p => p.status === "approved")
    .reduce((a, b) => a + b.amount, 0);
  
  // Calculate Net Remaining Cash in Hand / Mess Balance
  const netMessCash = totalCollected - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Prominent Market Duty Hero Banner */}
      <MarketDutyHeroBanner todayDuty={todayDuty} nextDuty={nextDuty} currentMember={currentMember} onNavigate={onNavigate} />
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatCard label="Members" value={members.length.toString()} sub="7 Active" icon={<Users size={18} />} color="indigo" />
        <StatCard label="Total Meals" value={totalWeightedMeals.toLocaleString()} icon={<Utensils size={18} />} color="violet" />
        <StatCard label="Meal Rate" value={`৳${mealRate}`} sub="per meal · estimated" icon={<TrendingUp size={18} />} color="emerald" />
        <StatCard label="Total Deposited" value={fmt(totalCollected)} sub="Collected from members" icon={<Wallet size={18} />} color="indigo" />
        <StatCard label="Food Expense" value={fmt(totalFoodExpense)} icon={<ShoppingBasket size={18} />} color="amber" />
        <StatCard label="Other Bills" value={fmt(totalOtherBills)} icon={<ShoppingBasket size={18} />} color="rose" />
        <StatCard label="Total Expense" value={fmt(totalExpense)} icon={<TrendingUp size={18} />} color="cyan" />
      </div>

      {isManager && pendingPayments.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 via-amber-50 to-amber-100/50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">৳</div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {pendingPayments.length} Member Wallet Deposit{pendingPayments.length > 1 ? "s" : ""} Waiting for Approval
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Requester: <strong className="text-slate-900 font-bold">{pendingPayments[0].memberName}</strong> deposited <strong>{fmt(pendingPayments[0].amount)}</strong> via {pendingPayments[0].method}
              </p>
            </div>
          </div>
          <Btn size="sm" onClick={() => approvePayment(pendingPayments[0].id)}>
            <Check size={13} /> Approve {pendingPayments[0].memberName}'s Deposit ({fmt(pendingPayments[0].amount)})
          </Btn>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Current Month Financials</h3>
            <Badge variant="info">Live</Badge>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-600 font-medium">Current Meal Rate</p>
                <p className="text-2xl font-bold text-indigo-700 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>৳{mealRate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-600 font-medium">Total Meals</p>
                <p className="text-xl font-bold text-indigo-800">{totalWeightedMeals}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-700 font-medium">Total Money Collected</p>
                <p className="text-lg font-bold text-emerald-900">{fmt(totalCollected)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-700 font-medium">From Members</p>
                <p className="text-sm font-bold text-emerald-800">{members.length} Members</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 font-medium">Total Spent (Food + Bills)</p>
                <p className="text-lg font-bold text-amber-900">{fmt(totalExpense)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-700 font-medium">Food: {fmt(totalFoodExpense)}</p>
                <p className="text-xs text-amber-700">Bills: {fmt(totalOtherBills)}</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl flex justify-between items-center ${netMessCash >= 0 ? "bg-cyan-50 border border-cyan-200" : "bg-rose-50 border border-rose-200"}`}>
              <div>
                <p className={`text-xs font-medium ${netMessCash >= 0 ? "text-cyan-700" : "text-rose-700"}`}>
                  Remaining Cash in Hand
                </p>
                <p className={`text-xl font-bold mt-0.5 ${netMessCash >= 0 ? "text-cyan-900" : "text-rose-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                  {fmt(netMessCash)}
                </p>
              </div>
              <Badge variant={netMessCash >= 0 ? "success" : "danger"}>
                {netMessCash >= 0 ? "Surplus" : "Deficit"}
              </Badge>
            </div>
          </div>
        </Card>

        <DashboardDutyAndAlerts
          todayDuty={todayDuty}
          nextDuty={nextDuty}
          lowWallet={lowWallet}
          pendingExpenses={pendingExpenses}
          pendingPayments={pendingPayments}
          currentMember={currentMember}
        />

        <DashboardRecentActivity marketExpenses={marketExpenses} walletPayments={walletPayments} />
      </div>
    </div>
  );
}
