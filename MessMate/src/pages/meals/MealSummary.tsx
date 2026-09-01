import { PageHeader, Card, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { TrendingUp } from "lucide-react";
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

  const { mealWeights } = currentHouse.setting;
  const isManager = currentMember?.role === "manager";

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const visibleSettlements = isManager
    ? memberSettlements
    : memberSettlements.filter(w => w.memberId === currentMember?.id);

  return (
    <div>
      <PageHeader
        title="Meal Summary"
        subtitle={`${monthLabel} · Live estimate`}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-indigo-100 bg-indigo-50">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Food Expense</p>
          <p className="text-3xl font-bold text-indigo-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>
            {fmt(totalFoodExpense)}
          </p>
          <p className="text-xs text-indigo-600 mt-1">Market expenses only · bills excluded</p>
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
            Total food/market expense is divided by total weighted meal count.
            Breakfast counts as <strong>{mealWeights.breakfast}</strong>,
            Lunch and Dinner each count as <strong>{mealWeights.lunch}</strong>.
            Bills (rent, electricity, etc.) are excluded and shared equally among all members.
          </div>
        </div>
      </Card>

      {visibleSettlements.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No meal data for {monthLabel}</p>
          <p className="text-xs text-slate-400 mt-1">Meal records will appear here once meals are logged</p>
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
