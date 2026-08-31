import { PageHeader, Card, Avatar, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";

export default function MealSummary() {
  const { totalFoodExpense, totalWeightedMeals, mealRate, memberSettlements, currentHouse, members } = useApp();
  const { mealWeights } = currentHouse.setting;

  return (
    <div>
      <PageHeader title="Meal Summary" subtitle="August 2026 · Live estimate" />

      {/* Rate calculation card */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-indigo-100 bg-indigo-50">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Food Expense</p>
          <p className="text-3xl font-bold text-indigo-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalFoodExpense)}</p>
          <p className="text-xs text-indigo-600 mt-1">Market expenses only · bills excluded</p>
        </Card>
        <Card className="p-5 border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Meals</p>
          <p className="text-3xl font-bold text-slate-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>{totalWeightedMeals}</p>
          <p className="text-xs text-slate-400 mt-1">Weighted sum of all member meals</p>
        </Card>
        <Card className="p-5 border-emerald-100 bg-emerald-50">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Current Meal Rate</p>
          <p className="text-3xl font-bold text-emerald-900 mt-1.5" style={{ fontFamily: "var(--font-display)" }}>৳{mealRate}</p>
          <p className="text-xs text-emerald-600 mt-1">= {fmt(totalFoodExpense)} ÷ {totalWeightedMeals} meals</p>
        </Card>
      </div>

      {/* Formula explanation */}
      <Card className="p-4 mb-6 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">?</div>
          <div className="text-sm text-slate-600">
            <strong className="text-slate-800">How meal rate is calculated:</strong> Total food/market expense is divided by total weighted meal count. Breakfast counts as {mealWeights.breakfast}, Lunch and Dinner each count as {mealWeights.lunch}. Bills (rent, electricity, etc.) are excluded and shared equally.
          </div>
        </div>
      </Card>

      {/* Member breakdown */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">Member Meal Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Member</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Meals</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Meal Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Other Share</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {memberSettlements.map(w => {
                const member = members.find(m => m.id === w.memberId);
                return (
                  <tr key={w.memberId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={w.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                          <p className="text-xs text-slate-400">{member?.mealPlan || "Full"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-800 font-mono">{w.meals}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs text-slate-500 font-mono">৳{mealRate}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-slate-800 font-mono">{fmt(w.mealCost)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-slate-600 font-mono">{fmt(w.otherShare)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-indigo-700 font-mono">{fmt(w.totalResponsibility)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="px-5 py-3 text-sm font-bold text-slate-800" colSpan={1}>Total</td>
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">{totalWeightedMeals}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">{fmt(totalFoodExpense)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">
                  {fmt(memberSettlements.reduce((a, w) => a + w.otherShare, 0))}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold font-mono text-indigo-700">
                  {fmt(memberSettlements.reduce((a, w) => a + w.totalResponsibility, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
