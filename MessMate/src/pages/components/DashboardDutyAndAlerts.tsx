import { Card, Badge, Avatar, fmt } from "../../components/ui";
import { ShoppingBasket, AlertTriangle, Calendar, Sparkles, UserCheck } from "lucide-react";

export function DashboardDutyAndAlerts({
  todayDuty,
  nextDuty,
  lowWallet,
  pendingExpenses,
  pendingPayments,
  currentMember,
}: {
  todayDuty: any;
  nextDuty?: any;
  lowWallet: any[];
  pendingExpenses: any[];
  pendingPayments: any[];
  currentMember?: any;
}) {
  const isMyDutyToday = todayDuty && (todayDuty.memberId === currentMember?.id || (currentMember?.name && todayDuty.memberName === currentMember.name));

  return (
    <div className="space-y-4">
      {/* Prominent Market Duty Card */}
      <Card className={`p-5 overflow-hidden relative transition-all ${isMyDutyToday ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-400 shadow-md" : "bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMyDutyToday ? "bg-emerald-600 text-white" : "bg-indigo-500/20 text-indigo-300"}`}>
              <ShoppingBasket size={18} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isMyDutyToday ? "text-emerald-950" : "text-white"}`}>
                Market Duty (আজকের বাজার)
              </h3>
              <p className={`text-[11px] ${isMyDutyToday ? "text-emerald-700" : "text-indigo-200"}`}>
                Current Shopping Schedule
              </p>
            </div>
          </div>
          {todayDuty ? (
            <Badge variant={isMyDutyToday ? "success" : "info"}>
              {isMyDutyToday ? "You're On Duty!" : "Active"}
            </Badge>
          ) : (
            <Badge variant="neutral">No Duty Today</Badge>
          )}
        </div>

        {todayDuty ? (
          <div className={`p-3.5 rounded-xl border ${isMyDutyToday ? "bg-white/80 border-emerald-200" : "bg-white/10 border-white/10 text-white backdrop-blur-xs"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  initials={todayDuty.memberName ? todayDuty.memberName.slice(0, 2).toUpperCase() : "MB"}
                  size="md"
                  color={isMyDutyToday ? "bg-emerald-600" : "bg-indigo-600"}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-base font-bold truncate ${isMyDutyToday ? "text-emerald-950" : "text-white"}`}>
                      {todayDuty.memberName}
                    </p>
                    {isMyDutyToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        <UserCheck size={10} /> YOU
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${isMyDutyToday ? "text-emerald-700 font-medium" : "text-indigo-200"}`}>
                    <Calendar size={12} />
                    <span>{todayDuty.startDate} &mdash; {todayDuty.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
            {todayDuty.notes && (
              <p className={`text-xs mt-2.5 pt-2 border-t text-ellipsis overflow-hidden whitespace-nowrap ${isMyDutyToday ? "border-emerald-100 text-emerald-600" : "border-white/10 text-indigo-200"}`}>
                📝 {todayDuty.notes}
              </p>
            )}
          </div>
        ) : (
          <div className={`p-3.5 rounded-xl border text-center ${isMyDutyToday ? "bg-white/60 border-emerald-200" : "bg-white/5 border-white/10 text-indigo-200"}`}>
            <p className="text-xs">No member is scheduled for market duty today.</p>
          </div>
        )}

        {nextDuty && (
          <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${isMyDutyToday ? "border-emerald-200/60 text-emerald-800" : "border-white/10 text-indigo-200"}`}>
            <span className="font-medium">Next Duty: <strong className={isMyDutyToday ? "text-emerald-950" : "text-white"}>{nextDuty.memberName}</strong></span>
            <span className="text-[11px] opacity-80">{nextDuty.startDate}</span>
          </div>
        )}
      </Card>

      {/* Alerts Card */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Alerts & Pending Actions</h3>
        <div className="space-y-2">
          {lowWallet.length > 0 && (
            <div className="p-3 bg-red-50 rounded-xl flex items-center justify-between border border-red-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-800">{lowWallet.length} member(s) with low wallet balance</span>
              </div>
            </div>
          )}
          {pendingExpenses.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl flex items-center justify-between border border-amber-100">
              <span className="text-xs font-semibold text-amber-800">{pendingExpenses.length} market expense(s) pending approval</span>
            </div>
          )}
          {pendingPayments.length > 0 && (
            <div className="p-3 bg-indigo-50 rounded-xl flex items-center justify-between border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-800">{pendingPayments.length} wallet deposit(s) pending approval</span>
            </div>
          )}
          {lowWallet.length === 0 && pendingExpenses.length === 0 && pendingPayments.length === 0 && (
            <div className="p-3 bg-slate-50 rounded-xl text-center">
              <p className="text-xs text-slate-400">All alerts clear & up to date</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
