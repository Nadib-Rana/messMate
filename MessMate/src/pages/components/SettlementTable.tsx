import { Card, Badge, Avatar, fmt } from "../../components/ui";
import { CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

export function SettlementTable({
  memberSettlements,
  isGenerated,
  isClosed,
}: {
  memberSettlements: any[];
  isGenerated: boolean;
  isClosed: boolean;
}) {
  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Member Settlement</h3>
        {isGenerated && <Badge variant="success"><CheckCircle size={10} /> {isClosed ? "Finalized" : "Generated"}</Badge>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Member</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Meals</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Meal Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Other Share</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Fines</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Total Due</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Paid</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Final Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {memberSettlements.map(m => {
              const isPay = m.status === "pay";
              return (
                <tr key={m.memberId} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.avatar} size="sm" />
                      <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-700">{m.meals}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-700">{fmt(m.mealCost)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-700">{fmt(m.otherShare)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-700">{fmt(m.fines)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-bold text-slate-900">{fmt(m.totalResponsibility)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm text-emerald-600 font-semibold">{fmt(m.paid)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 font-bold font-mono text-sm">
                      {isPay ? (
                        <>
                          <TrendingDown size={14} className="text-red-500" />
                          <span className="text-red-600">-{fmt(Math.abs(m.balance))} (Pay)</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp size={14} className="text-emerald-500" />
                          <span className="text-emerald-600">+{fmt(m.balance)} (Receive)</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
