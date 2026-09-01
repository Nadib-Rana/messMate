import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CheckCircle, XCircle, Clock, ShoppingBag } from "lucide-react";
import { AddMarketExpenseModal } from "./components/AddMarketExpenseModal";

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle size={12} className="text-emerald-500" />,
  rejected: <XCircle size={12} className="text-red-500" />,
  pending: <Clock size={12} className="text-amber-500" />,
};
const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  approved: "success", rejected: "danger", pending: "warning",
};

export default function MarketExpenses() {
  const { marketExpenses, members, submitMarketExpense, approveMarketExpense, rejectMarketExpense, currentMember, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  const isManager = currentMember?.role === "manager" || currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  const totalApproved = marketExpenses.filter(e => e.status === "approved").reduce((a, e) => a + e.amount, 0);
  const pending = marketExpenses.filter(e => e.status === "pending");

  return (
    <div>
      <PageHeader
        title="Market Expenses & Item Breakdown"
        subtitle="Track daily grocery shopping, itemized bazar lists, and approvals"
        action={<Btn size="sm" onClick={() => setShowModal(true)}>+ Submit Expense</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Approved</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalApproved)}</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-600">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{pending.length} items</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">This Month</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{marketExpenses.length} entries</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Itemized Bazar Purchases</h3>
          <span className="text-xs text-slate-400">{marketExpenses.length} Total</span>
        </div>
        <div className="divide-y divide-slate-100">
          {marketExpenses.map(exp => (
            <div key={exp.id} className="p-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">{exp.category}</p>
                      <Badge variant={statusVariant[exp.status]}>
                        <span className="flex items-center gap-1">{statusIcon[exp.status]} {exp.status}</span>
                      </Badge>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${exp.paymentSource === "member_pocket" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                        {exp.paymentSource === "member_pocket" ? "👛 Personal Pocket" : "💵 Mess Cash"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{exp.date} · Purchased by <strong className="text-slate-700 font-bold">{exp.paidByMemberName || exp.memberName || "Member"}</strong></p>
                    {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
                    {exp.items && exp.items.length > 0 && (
                      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Itemized Breakdown:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                          {exp.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-100">
                              <span className="text-slate-700 truncate">{item.name} {item.quantity ? `(${item.quantity})` : ""}</span>
                              <span className="font-semibold text-slate-900 font-mono">৳{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-slate-900 font-mono">{fmt(exp.amount)}</p>
                  {isManager && exp.status === "pending" && (
                    <div className="flex gap-1.5 mt-2 justify-end">
                      <Btn size="xs" variant="success" onClick={() => approveMarketExpense(exp.id)}>Approve</Btn>
                      <Btn size="xs" variant="danger" onClick={() => rejectMarketExpense(exp.id)}>Reject</Btn>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <AddMarketExpenseModal open={showModal} onClose={() => setShowModal(false)} members={members} currentMember={currentMember} onSubmit={submitMarketExpense} />
    </div>
  );
}
