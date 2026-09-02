import { useState } from "react";
import { PageHeader, Card, Btn, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { TrendingUp, Search, Download } from "lucide-react";
import { MealSummaryTable } from "./components/MealSummaryTable";

export default function MealSummary() {
  const {
    totalFoodExpense,
    totalWeightedMeals,
    mealRate,
    memberSettlements,
    currentHouse,
    members,
    currentMember,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const { mealWeights } = currentHouse.setting;
  const isManager = currentMember?.role === "manager";

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Any user (manager or member) can view all users' total meals, counts, and cost breakdown
  const visibleSettlements = memberSettlements.filter(s =>
    !searchTerm.trim() || s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleExportCSV = () => {
    let csv = `Meal Summary Report - ${currentHouse?.name || "Mess"}\n`;
    csv += `Month,${monthLabel}\n`;
    csv += `Total Food Expense,${totalFoodExpense}\n`;
    csv += `Total Weighted Meals,${totalWeightedMeals}\n`;
    csv += `Current Meal Rate,${mealRate}\n\n`;

    csv += `Member Name,Meals,Meal Rate,Meal Cost,Other Bills Share,Total Cost Responsibility\n`;
    memberSettlements.forEach(m => {
      csv += `"${m.name}",${m.meals},${mealRate},${m.mealCost},${m.otherShare},${m.totalResponsibility}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Meal_Summary_${monthLabel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Meal Summary"
        subtitle={`${monthLabel} · Live calculation for all mess members`}
        action={
          <Btn size="sm" variant="secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export Summary
          </Btn>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-indigo-100 bg-indigo-50">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Food Expense</p>
          <p className="text-3xl font-bold text-indigo-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>
            {fmt(totalFoodExpense)}
          </p>
          <p className="text-xs text-indigo-600 mt-1">Market food expenses only</p>
        </Card>
        <Card className="p-5 border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Meals</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>
            {totalWeightedMeals.toFixed(1)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Weighted sum of all member meals</p>
        </Card>
        <Card className="p-5 border-emerald-100 bg-emerald-50">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Current Meal Rate</p>
          <p className="text-3xl font-bold text-emerald-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>
            ৳{mealRate.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            = {fmt(totalFoodExpense)} ÷ {totalWeightedMeals.toFixed(1)} meals
          </p>
        </Card>
      </div>

      <Card className="p-4 mb-6 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">?</div>
          <div className="text-sm text-slate-600">
            <strong className="text-slate-800">How meal rate is calculated: </strong>
            Total market food expense is divided by total weighted meal count across all members.
            Breakfast counts as <strong>{mealWeights.breakfast}</strong>,
            Lunch and Dinner each count as <strong>{mealWeights.lunch}</strong>.
            House bills (rent, electricity, gas, maid, etc.) are shared equally among active members.
          </div>
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search member name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Showing {visibleSettlements.length} of {memberSettlements.length} members
        </p>
      </div>

      {visibleSettlements.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No member meal records found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search filter or checking meal logs</p>
        </Card>
      ) : (
        <MealSummaryTable
          visibleSettlements={visibleSettlements}
          members={members}
          currentMember={currentMember}
          isManager={isManager}
          mealRate={mealRate}
          totalWeightedMeals={totalWeightedMeals}
          totalFoodExpense={totalFoodExpense}
          memberSettlements={memberSettlements}
          monthLabel={monthLabel}
        />
      )}
    </div>
  );
}
