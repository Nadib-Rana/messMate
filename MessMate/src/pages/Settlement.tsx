import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Lock, Unlock } from "lucide-react";

export default function Settlement() {
  const {
    memberSettlements,
    totalFoodExpense,
    totalWeightedMeals,
    mealRate,
    expenses,
    monthlyClosing,
    generateSettlement,
    closeMonth,
    reopenMonth
  } = useApp();

  const [showConfirm, setShowConfirm] = useState(false);

  const totalOtherExpense = expenses.reduce((a, e) => a + e.amount, 0);
  const totalPay = memberSettlements.filter(m => m.status === "pay").reduce((a, m) => a + Math.abs(m.balance), 0);
  const totalReceive = memberSettlements.filter(m => m.status === "receive").reduce((a, m) => a + m.balance, 0);

  const isClosed = monthlyClosing.status === "closed";
  const isGenerated = monthlyClosing.status === "generated" || isClosed;

  return (
    <div>
      <PageHeader
        title="Monthly Settlement"
        subtitle="August 2026 · Generate and review settlement"
        action={
          <div className="flex gap-2">
            {isClosed ? (
              <Btn size="sm" variant="secondary" onClick={reopenMonth}><Unlock size={14} />Reopen Month</Btn>
            ) : isGenerated ? (
              <Btn size="sm" variant="secondary" onClick={closeMonth}><Lock size={14} />Close Month</Btn>
            ) : null}

            {!isClosed && (
              <Btn size="sm" onClick={() => setShowConfirm(true)}>
                {isGenerated ? "Regenerate Settlement" : "Generate Settlement"}
              </Btn>
            )}
          </div>
        }
      />

      {/* Status banner if closed */}
      {isClosed && (
        <div className="mb-6 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Lock size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold">Month Accounts Closed</p>
              <p className="text-xs text-slate-400">All data for August 2026 is locked and read-only.</p>
            </div>
          </div>
          <Badge variant="warning">Closed</Badge>
        </div>
      )}

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-indigo-100 bg-indigo-50">
          <p className="text-xs text-indigo-600">Total Food Expense</p>
          <p className="text-xl font-bold text-indigo-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalFoodExpense)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Meals</p>
          <p className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{totalWeightedMeals}</p>
        </Card>
        <Card className="p-4 border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600">Final Meal Rate</p>
          <p className="text-xl font-bold text-emerald-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>৳{mealRate}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Other Expenses</p>
          <p className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalOtherExpense)}</p>
        </Card>
      </div>

      {/* Member settlements */}
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
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Paid</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {memberSettlements.map(m => (
                <tr key={m.memberId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.avatar} size="sm" />
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-mono text-slate-700">{m.meals}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-mono text-slate-700">{fmt(m.mealCost)}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-mono text-slate-700">{fmt(m.otherShare)}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-mono text-slate-700">{m.fines ? <span className="text-red-500">{fmt(m.fines)}</span> : "—"}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-slate-900 font-mono">{fmt(m.totalResponsibility)}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-mono text-emerald-600">{fmt(m.paid)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {m.status === "receive" ? (
                        <>
                          <TrendingUp size={13} className="text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-600 font-mono">+{fmt(m.balance)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={13} className="text-red-500" />
                          <span className="text-sm font-bold text-red-600 font-mono">-{fmt(Math.abs(m.balance))}</span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 text-right">{m.status === "receive" ? "RECEIVE" : "PAY"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Net summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">Total to Receive</p>
          </div>
          <p className="text-3xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalReceive)}</p>
          <p className="text-xs text-emerald-600 mt-1">{memberSettlements.filter(m => m.status === "receive").length} members</p>
        </Card>
        <Card className="p-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-600" />
            <p className="text-sm font-semibold text-red-800">Total to Pay</p>
          </div>
          <p className="text-3xl font-bold text-red-700" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalPay)}</p>
          <p className="text-xs text-red-600 mt-1">{memberSettlements.filter(m => m.status === "pay").length} members</p>
        </Card>
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Generate Settlement — August 2026">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Once confirmed, settlement will be generated and all members will be notified via in-app notification.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Food Expense", fmt(totalFoodExpense)],
              ["Total Meals", totalWeightedMeals.toString()],
              ["Meal Rate", `৳${mealRate}`],
              ["Other Expense", fmt(totalOtherExpense)],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="font-bold text-slate-800 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Btn>
            <Btn onClick={() => { generateSettlement(); setShowConfirm(false); }}>Confirm & Notify Members</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
