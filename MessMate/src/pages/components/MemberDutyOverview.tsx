import { Card, Badge, fmt, Avatar } from "../../components/ui";
import { Utensils, Calendar, ShoppingBasket, UserCheck } from "lucide-react";

export function MemberDutyOverview({
  myMeals,
  mealRate,
  mealCost,
  otherShare,
  fines,
  guestMealCost,
  myDuty,
  todayDuty,
}: {
  myMeals: number;
  mealRate: number;
  mealCost: number;
  otherShare: number;
  fines: number;
  guestMealCost: number;
  myDuty: any;
  todayDuty?: any;
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

      <Card className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ShoppingBasket size={16} className="text-emerald-600" />
              Today's Market Duty
            </div>
            {todayDuty ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="neutral">None Today</Badge>
            )}
          </div>

          {todayDuty ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar initials={todayDuty.memberName ? todayDuty.memberName.slice(0, 2).toUpperCase() : "MB"} size="sm" color="bg-emerald-600" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{todayDuty.memberName}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">{todayDuty.startDate} &mdash; {todayDuty.endDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-xs text-slate-500">No member is scheduled on duty today.</p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Calendar size={12} className="text-indigo-500" /> My Next Duty:
            </span>
            {myDuty ? (
              <span className="font-bold text-slate-800">{myDuty.startDate} &mdash; {myDuty.endDate}</span>
            ) : (
              <span className="text-slate-400 italic">Not scheduled</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
