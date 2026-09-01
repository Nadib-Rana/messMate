import { Card, Badge, fmt } from "../../components/ui";
import { Utensils, Calendar } from "lucide-react";

export function MemberDutyOverview({
  myMeals,
  mealRate,
  mealCost,
  otherShare,
  fines,
  guestMealCost,
  myDuty,
}: {
  myMeals: number;
  mealRate: number;
  mealCost: number;
  otherShare: number;
  fines: number;
  guestMealCost: number;
  myDuty: any;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
          <Utensils size={16} className="text-indigo-500" />
          My Meals & Rates
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <p className="text-slate-500 font-medium">My Meals</p>
            <p className="font-bold text-slate-800 text-lg mt-0.5">{myMeals}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg">
            <p className="text-indigo-600 font-medium">Meal Rate</p>
            <p className="font-bold text-indigo-700 text-lg mt-0.5">৳{mealRate}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600"><span>Meal Cost:</span><span className="font-mono font-semibold">{fmt(mealCost)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Other Share:</span><span className="font-mono">{fmt(otherShare)}</span></div>
          {fines > 0 && <div className="flex justify-between text-red-600"><span>Fines:</span><span className="font-mono">+{fmt(fines)}</span></div>}
          {guestMealCost > 0 && <div className="flex justify-between text-indigo-600"><span>Guest Meals:</span><span className="font-mono">+{fmt(guestMealCost)}</span></div>}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar size={16} className="text-indigo-500" />
            My Market Duty
          </div>
          {myDuty && <Badge variant={myDuty.status === "current" ? "success" : "info"}>{myDuty.status}</Badge>}
        </div>
        {myDuty ? (
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-800">{myDuty.startDate} → {myDuty.endDate}</p>
            <p className="text-[11px] text-slate-500 mt-1">{myDuty.notes || "Assigned shopping rotation period"}</p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-xs text-slate-400">No active or upcoming market duty assigned</p>
          </div>
        )}
      </Card>
    </div>
  );
}
