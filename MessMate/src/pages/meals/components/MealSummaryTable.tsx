import { Card, Avatar, fmt } from "../../../components/ui";

export function MealSummaryTable({
  visibleSettlements,
  members,
  currentMember,
  isManager,
  mealRate,
  totalWeightedMeals,
  totalFoodExpense,
  memberSettlements,
  monthLabel,
}: {
  visibleSettlements: any[];
  members: any[];
  currentMember: any;
  isManager: boolean;
  mealRate: number;
  totalWeightedMeals: number;
  totalFoodExpense: number;
  memberSettlements: any[];
  monthLabel: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          {isManager ? "Member Meal Breakdown" : "Your Meal Breakdown"}
        </h3>
        <span className="text-xs text-slate-400">{monthLabel}</span>
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
            {visibleSettlements.map(w => {
              const member = members.find(m => m.id === w.memberId);
              const isMe = w.memberId === currentMember?.id;
              return (
                <tr
                  key={w.memberId}
                  className={`hover:bg-slate-50/60 transition-colors ${isMe && !isManager ? "bg-indigo-50/30" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={w.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {w.name}
                          {isMe && !isManager && (
                            <span className="ml-2 text-xs text-indigo-500 font-normal">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{member?.mealPlan || "Full"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {typeof w.meals === "number" ? w.meals.toFixed(1) : w.meals}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-xs text-slate-500 font-mono">৳{mealRate.toFixed(2)}</span>
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
          {isManager && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td className="px-5 py-3 text-sm font-bold text-slate-800" colSpan={1}>Total</td>
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">
                  {totalWeightedMeals.toFixed(1)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">
                  {fmt(totalFoodExpense)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold font-mono text-slate-800">
                  {fmt(memberSettlements.reduce((a, w) => a + w.otherShare, 0))}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold font-mono text-indigo-700">
                  {fmt(memberSettlements.reduce((a, w) => a + w.totalResponsibility, 0))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
}
