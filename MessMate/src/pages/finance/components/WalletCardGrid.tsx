import { Card, Avatar, fmt } from "../../../components/ui";
import { History, Plus } from "lucide-react";

export function WalletCardGrid({
  memberSettlements,
  members,
  currentHouse,
  isManager,
  onHistory,
  onAddPayment,
}: {
  memberSettlements: any[];
  members: any[];
  currentHouse: any;
  isManager: boolean;
  onHistory: (id: string) => void;
  onAddPayment: (id: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {memberSettlements.map(w => {
        const member = members.find(m => m.id === w.memberId) || members[0];
        const isPos = w.balance >= 0;
        return (
          <Card key={w.memberId} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar initials={w.avatar} size="sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{w.name}</p>
                  <p className="text-xs text-slate-400">{member?.phone}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onHistory(w.memberId)} className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer">
                  <History size={14} />
                </button>
                {isManager && (
                  <button onClick={() => onAddPayment(w.memberId)} className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer">
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Balance:</span>
                <span className={`font-bold font-mono ${isPos ? "text-emerald-600" : "text-red-600"}`}>{fmt(w.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-mono text-slate-700">{fmt(w.paid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Due:</span>
                <span className="font-mono text-slate-700">{fmt(w.totalResponsibility)}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
