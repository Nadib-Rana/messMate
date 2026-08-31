import { TrendingUp, TrendingDown, Wallet, Utensils, Calendar, Bell } from "lucide-react";
import { Card, Badge, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";

export default function MemberDashboard() {
  const { memberSettlements, mealRate, marketDuties, notifications, currentHouse, members } = useApp();

  const meMember = members[0]; // Logged in user
  const meSettlement = memberSettlements.find(s => s.memberId === meMember.id) || memberSettlements[0];

  const myMeals = meSettlement?.meals || 0;
  const mealCost = meSettlement?.mealCost || 0;
  const otherShare = meSettlement?.otherShare || 0;
  const fines = meSettlement?.fines || 0;
  const guestMealCost = meSettlement?.guestMealCost || 0;
  const totalResp = meSettlement?.totalResponsibility || 0;
  const paid = meSettlement?.paid || 0;
  const balance = meSettlement?.balance || 0;
  const isPositive = balance >= 0;

  const myDuty = marketDuties.find(d => d.memberId === meMember.id);

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white rounded-full" />
          <div className="absolute -bottom-12 -left-4 w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="relative">
          <p className="text-indigo-200 text-sm">Good afternoon,</p>
          <h2 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{meMember.name}</h2>
          <p className="text-indigo-200 text-xs mt-1">Manager · {currentHouse.name} · August 2026</p>
        </div>
      </div>

      {/* Wallet card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Wallet size={16} className="text-indigo-500" />
              My Wallet
            </div>
            <Badge variant={balance >= currentHouse.setting.lowWalletThreshold ? "success" : "danger"}>
              {balance >= currentHouse.setting.lowWalletThreshold ? "Good" : "Low"}
            </Badge>
          </div>
          <p className="text-4xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{fmt(balance)}</p>
          <p className="text-xs text-slate-500 mt-1">Available balance</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <p className="text-emerald-600 font-medium">Total Deposited</p>
              <p className="font-bold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{fmt(paid)}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <p className="text-slate-500 font-medium">Spent / Allocated</p>
              <p className="font-bold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalResp)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Utensils size={16} className="text-indigo-500" />
            My Meals — August 2026
          </div>
          <p className="text-4xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{myMeals}</p>
          <p className="text-xs text-slate-500 mt-1">Total meal count (weighted)</p>
          <div className="mt-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Meal Rate</span>
              <span className="font-semibold text-slate-800">৳{mealRate} / meal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">My Meal Cost</span>
              <span className="font-semibold text-slate-800">{fmt(mealCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Meal plan</span>
              <Badge variant="info">{meMember.mealPlan}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Current responsibility */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Current Month Responsibility</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">My Meal Cost</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(mealCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Other Share (Bills)</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(otherShare)}</span>
            </div>
            {guestMealCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Guest Meals Cost</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(guestMealCost)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Fines</span>
              <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(fines)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-bold text-slate-900">Total Responsibility</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{fmt(totalResp)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Paid</span>
              <span className="text-sm font-semibold text-emerald-600 font-mono">{fmt(paid)}</span>
            </div>
            <div className="p-4 rounded-xl mt-2 text-center" style={{ backgroundColor: isPositive ? "#f0fdf4" : "#fff1f2" }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {isPositive ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
                <p className="text-xs font-medium" style={{ color: isPositive ? "#059669" : "#e11d48" }}>
                  {isPositive ? "Estimated to Receive" : "Estimated to Pay"}
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: isPositive ? "#047857" : "#be123c" }}>
                {isPositive ? "+" : "-"}{fmt(Math.abs(balance))}
              </p>
              <p className="text-xs mt-2 text-slate-500">This is a live estimate. Final settlement at month end.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Market duty */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Calendar size={16} className="text-indigo-500" />
            My Market Duty
          </div>
          {myDuty ? (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs font-medium text-indigo-600">{myDuty.status === "current" ? "On Duty Now" : "Upcoming Duty"}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{myDuty.startDate} – {myDuty.endDate}</p>
              <Badge variant={myDuty.status === "current" ? "warning" : "info"}>{myDuty.status}</Badge>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No upcoming duty</p>
          )}
        </Card>

        {/* Recent notifications */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Bell size={16} className="text-indigo-500" />
            Notifications
          </div>
          <div className="space-y-2">
            {notifications.filter(n => !n.read).map(n => (
              <div key={n.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
