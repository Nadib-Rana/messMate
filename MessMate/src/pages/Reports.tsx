import { PageHeader, Card, Badge, Avatar, Btn, fmt } from "../components/ui";
import { MONTHLY_TREND } from "../data/mock";
import { useApp } from "../context/AppContext";
import { Download } from "lucide-react";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2">
      <div className="h-2 rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
  );
}

export default function Reports() {
  const { totalFoodExpense, totalWeightedMeals, mealRate, expenses, memberSettlements } = useApp();
  const maxFood = Math.max(...MONTHLY_TREND.map(d => d.food));
  const totalOtherExpense = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Monthly financial and meal reports"
        action={
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary"><Download size={14} />Export PDF</Btn>
            <Btn size="sm" variant="secondary"><Download size={14} />Export Excel</Btn>
          </div>
        }
      />

      {/* Month selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {MONTHLY_TREND.map((m, i) => (
          <button
            key={m.month}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${i === MONTHLY_TREND.length - 1 ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {m.month} 2026
          </button>
        ))}
      </div>

      {/* Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Food Expense", value: fmt(totalFoodExpense), color: "indigo" },
          { label: "Other Bills", value: fmt(totalOtherExpense), color: "slate" },
          { label: "Total Meals", value: totalWeightedMeals.toString(), color: "violet" },
          { label: "Meal Rate", value: `৳${mealRate}`, color: "emerald" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Food expense trend */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Food Expense Trend</h3>
          <div className="space-y-3">
            {MONTHLY_TREND.map((d, i) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-8 font-mono">{d.month}</span>
                <MiniBar value={d.food} max={maxFood} color={i === MONTHLY_TREND.length - 1 ? "#4f46e5" : "#c7d2fe"} />
                <span className="text-xs font-bold text-slate-700 font-mono w-20 text-right">{fmt(d.food)}</span>
                <span className="text-xs text-slate-400 w-12 text-right">{d.meals}m</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Member balances */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Member Balance Report — August</h3>
          <div className="space-y-2">
            {memberSettlements.map(m => (
              <div key={m.memberId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <Avatar initials={m.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400">Resp: {fmt(m.totalResponsibility)} · Paid: {fmt(m.paid)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold font-mono ${m.status === "receive" ? "text-emerald-600" : "text-red-600"}`}>
                    {m.status === "receive" ? "+" : "-"}{fmt(Math.abs(m.balance))}
                  </p>
                  <Badge variant={m.status === "receive" ? "success" : "danger"} >{m.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
