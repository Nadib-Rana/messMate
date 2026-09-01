import { useState } from "react";
import { PageHeader, Card, Badge, Btn, Modal, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { Lock, Unlock } from "lucide-react";
import { SettlementTable } from "./components/SettlementTable";

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

      <SettlementTable memberSettlements={memberSettlements} isGenerated={isGenerated} isClosed={isClosed} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-4 border-red-100 bg-red-50">
          <p className="text-xs text-red-600">Total to Collect from Deficit Members</p>
          <p className="text-xl font-bold text-red-800 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalPay)}</p>
        </Card>
        <Card className="p-4 border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600">Total Surplus to Refund / Carry Forward</p>
          <p className="text-xl font-bold text-emerald-800 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalReceive)}</p>
        </Card>
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Generate Monthly Settlement">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will calculate final meal costs for each member based on total approved expenses and meals consumed up to today.
          </p>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Btn>
            <Btn onClick={() => { generateSettlement(); setShowConfirm(false); }}>Confirm & Generate</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
