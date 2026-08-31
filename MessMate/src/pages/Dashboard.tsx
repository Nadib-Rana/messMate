import { Users, Utensils, TrendingUp, ShoppingBasket, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { StatCard, Card, Badge, Avatar, fmt } from "../components/ui";
import { MONTHLY_TREND } from "../data/mock";
import { useApp } from "../context/AppContext";

function BarChart({ data }: { data: { month: string; food: number; other: number }[] }) {
  const maxFood = Math.max(...data.map(d => d.food));
  const maxOther = Math.max(...data.map(d => d.other));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex gap-0.5 items-end" style={{ height: "80px" }}>
            <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${(d.food / maxFood) * 100}%`, backgroundColor: "#4f46e5", opacity: i === data.length - 1 ? 1 : 0.4 }} />
            <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${(d.other / maxOther) * 100}%`, backgroundColor: "#0891b2", opacity: i === data.length - 1 ? 1 : 0.4 }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const {
    members,
    totalFoodExpense,
    totalWeightedMeals,
    mealRate,
    expenses,
    marketDuties,
    marketExpenses,
    notifications,
    memberSettlements,
    currentHouse,
  } = useApp();

  const todayDuty = marketDuties.find(d => d.status === "current");
  const lowWallet = memberSettlements.filter(s => s.balance < currentHouse.setting.lowWalletThreshold);
  const pendingExpenses = marketExpenses.filter(e => e.status === "pending");
  const totalOtherBills = expenses.reduce((a, b) => a + b.amount, 0);
  const totalExpense = totalFoodExpense + totalOtherBills;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Members" value={members.length.toString()} icon={<Users size={18} />} color="indigo" />
        <StatCard label="Total Meals" value={totalWeightedMeals.toLocaleString()} icon={<Utensils size={18} />} color="violet" />
        <StatCard label="Meal Rate" value={`৳${mealRate}`} sub="per meal · estimated" icon={<TrendingUp size={18} />} color="emerald" />
        <StatCard label="Food Expense" value={fmt(totalFoodExpense)} icon={<ShoppingBasket size={18} />} color="amber" />
        <StatCard label="Other Bills" value={fmt(totalOtherBills)} icon={<ShoppingBasket size={18} />} color="rose" />
        <StatCard label="Total Expense" value={fmt(totalExpense)} icon={<TrendingUp size={18} />} color="cyan" />
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Month summary */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">August 2026</h3>
            <Badge variant="info">Live</Badge>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <p className="text-xs text-indigo-600 font-medium">Current Meal Rate</p>
              <p className="text-3xl font-bold text-indigo-700 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>৳{mealRate}</p>
              <p className="text-xs text-indigo-500 mt-0.5">Estimated · finalised at month close</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Total Meals</p>
                <p className="text-lg font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{totalWeightedMeals}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Food Expense</p>
                <p className="text-lg font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalFoodExpense)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2.5">
              <strong className="text-slate-600">Formula:</strong> Meal Rate = Food Expense ÷ Total Meals. Other bills are shared equally and do not affect the meal rate.
            </p>
          </div>
        </Card>

        {/* Expense trend chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Expense Trend</h3>
              <p className="text-xs text-slate-500">Last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />Food</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block" />Other</span>
            </div>
          </div>
          <BarChart data={MONTHLY_TREND} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Food/meal", "Rent/bills", "Total"].map((l, i) => (
              <div key={l} className="text-center">
                <p className="text-xs text-slate-500">{l}</p>
                <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
                  {i === 0 ? fmt(totalFoodExpense) : i === 1 ? fmt(totalOtherBills) : fmt(totalExpense)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Today's duty */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Today — Aug 31</h3>
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Market Duty</p>
            {todayDuty ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Avatar initials={todayDuty.memberName.slice(0, 2).toUpperCase()} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{todayDuty.memberName}</p>
                  <p className="text-xs text-amber-600">{todayDuty.startDate} – {todayDuty.endDate}</p>
                </div>
                <Badge variant="warning">On Duty</Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No one assigned</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">House Members ({members.length})</p>
            <div className="space-y-1.5">
              {members.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <Avatar initials={m.avatar} size="sm" />
                  <span className="flex-1 text-xs text-slate-700">{m.name}</span>
                  <Badge variant={m.role === "manager" ? "info" : "default"}>{m.mealPlan}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Pending actions */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Pending Actions</h3>
          <div className="space-y-3">
            {pendingExpenses.map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Clock size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Market Expense</p>
                  <p className="text-xs text-slate-500 truncate">{e.memberName} · {fmt(e.amount)}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
            {lowWallet.map(w => (
              <div key={w.memberId} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Low Wallet</p>
                  <p className="text-xs text-slate-500">{w.name} · {fmt(w.balance)}</p>
                </div>
                <Badge variant="danger">Low</Badge>
              </div>
            ))}
            {pendingExpenses.length === 0 && lowWallet.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} />
                <p className="text-sm font-medium">All clear!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Member wallet status */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Wallet Status</h3>
          <div className="space-y-2">
            {memberSettlements.map(w => (
              <div key={w.memberId} className="flex items-center gap-3">
                <Avatar initials={w.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{w.name}</p>
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                    <div
                      className={`h-1 rounded-full ${w.balance < currentHouse.setting.lowWalletThreshold ? "bg-red-400" : "bg-emerald-400"}`}
                      style={{ width: `${Math.min(Math.max((w.balance / 2000) * 100, 5), 100)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono ${w.balance < currentHouse.setting.lowWalletThreshold ? "text-red-600" : "text-emerald-600"}`}>
                  {fmt(w.balance)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h3>
        <div className="divide-y divide-slate-100">
          {notifications.slice(0, 4).map(n => (
            <div key={n.id} className="flex items-start gap-3 py-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-slate-300" : "bg-indigo-500"}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
