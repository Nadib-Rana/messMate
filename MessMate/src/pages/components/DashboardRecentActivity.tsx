import { Card, Badge } from "../../components/ui";

export function DashboardRecentActivity({
  marketExpenses,
  walletPayments,
}: {
  marketExpenses: any[];
  walletPayments: any[];
}) {
  const recent = [
    ...marketExpenses.slice(0, 3).map(e => ({ title: `Market: ${e.category} (৳${e.amount})`, desc: `by ${e.paidByMemberName}`, time: e.date, type: "market" })),
    ...walletPayments.slice(0, 3).map(p => ({ title: `Payment: ৳${p.amount}`, desc: `by ${p.memberName} via ${p.method}`, time: p.date, type: "payment" })),
  ].slice(0, 5);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h3>
      <div className="space-y-2.5">
        {recent.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
            <div>
              <p className="font-semibold text-slate-800">{r.title}</p>
              <p className="text-slate-400 text-[11px]">{r.desc}</p>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">{r.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
