import { Modal, Badge, fmt } from "../../../components/ui";

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

export function WalletHistoryModal({
  historyMemberId,
  onClose,
  members,
  walletPayments,
}: {
  historyMemberId: string | null;
  onClose: () => void;
  members: any[];
  walletPayments: any[];
}) {
  if (!historyMemberId) return null;
  const historyMember = members.find(m => m.id === historyMemberId);
  const memberHistory = walletPayments.filter(p => p.memberId === historyMemberId);

  return (
    <Modal open={!!historyMemberId} onClose={onClose} title={`Payment History — ${historyMember?.name || "Member"}`}>
      <div className="space-y-3">
        {memberHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No payment transactions found for this member.</p>
        ) : (
          memberHistory.map(p => (
            <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">{fmt(p.amount)}</span>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{p.date} · via {p.method} {p.reference ? `(Ref: ${p.reference})` : ""}</p>
                {p.note && <p className="text-[11px] text-slate-500 mt-0.5">{p.note}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
