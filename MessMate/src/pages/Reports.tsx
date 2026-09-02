import { PageHeader, Card, Badge, Avatar, Btn, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { Download } from "lucide-react";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2">
      <div className="h-2 rounded-full" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }} />
    </div>
  );
}

export default function Reports() {
  const { totalFoodExpense, totalWeightedMeals, mealRate, expenses, memberSettlements, currentHouse } = useApp();
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const maxFood = Math.max(totalFoodExpense, 1);
  const totalOtherExpense = expenses.reduce((a, e) => a + e.amount, 0);

  const handleExportCSV = () => {
    let csv = `MessMate Financial Report - ${currentHouse?.name || "Mess"}\n`;
    csv += `Month,${currentMonthName}\n`;
    csv += `Total Food Expense,${totalFoodExpense}\n`;
    csv += `Total Other Bills,${totalOtherExpense}\n`;
    csv += `Total Meals,${totalWeightedMeals}\n`;
    csv += `Meal Rate,${mealRate}\n\n`;

    csv += `Member Name,Meals,Meal Cost,Other Share,Fines,Total Responsibility,Paid,Net Balance,Status\n`;
    memberSettlements.forEach(m => {
      csv += `"${m.name}",${m.meals},${m.mealCost},${m.otherShare},${m.fines},${m.totalResponsibility},${m.paid},${m.balance},${m.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MessMate_Report_${currentMonthName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Monthly financial and meal reports"
        action={
          <div className="flex gap-2 print:hidden">
            <Btn size="sm" variant="secondary" onClick={handleExportPDF}><Download size={14} />Export PDF / Print</Btn>
            <Btn size="sm" variant="secondary" onClick={handleExportCSV}><Download size={14} />Export CSV (Excel)</Btn>
          </div>
        }
      />

      {/* Month selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 print:hidden">
        <button className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-indigo-600 text-white shadow-sm">
          {currentMonthName}
        </button>
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-12 font-mono">{currentMonthName}</span>
              <MiniBar value={totalFoodExpense} max={maxFood} color="#4f46e5" />
              <span className="text-xs font-bold text-slate-700 font-mono w-20 text-right">{fmt(totalFoodExpense)}</span>
              <span className="text-xs text-slate-400 w-12 text-right">{totalWeightedMeals}m</span>
            </div>
          </div>
        </Card>

        {/* Member balances */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Member Balance Report — {currentMonthName}</h3>
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
