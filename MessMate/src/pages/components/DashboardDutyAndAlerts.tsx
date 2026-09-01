import { Card, Badge, Avatar, fmt } from "../../components/ui";
import { ShoppingBasket, AlertTriangle } from "lucide-react";

export function DashboardDutyAndAlerts({
  todayDuty,
  lowWallet,
  pendingExpenses,
  pendingPayments,
}: {
  todayDuty: any;
  lowWallet: any[];
  pendingExpenses: any[];
  pendingPayments: any[];
}) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Today's Market Duty</h3>
        {todayDuty ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <Avatar initials={todayDuty.memberName.slice(0, 2).toUpperCase()} size="md" color="bg-emerald-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{todayDuty.memberName}</p>
              <p className="text-xs text-emerald-700 font-medium">On duty today ({todayDuty.startDate} – {todayDuty.endDate})</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-xs text-slate-400">No one on duty today</p>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Alerts & Pending</h3>
        <div className="space-y-2">
          {lowWallet.length > 0 && (
            <div className="p-3 bg-red-50 rounded-xl flex items-center justify-between border border-red-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
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
        </div>
      </Card>
    </div>
  );
}
