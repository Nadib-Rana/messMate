import { useState } from "react";
import { PageHeader, Card, Avatar, Badge, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { TrendingUp, TrendingDown, Plus, Check } from "lucide-react";

export default function Wallets() {
  const { walletPayments, members, memberSettlements, addPayment, approvePayment, currentHouse } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState<any>("bKash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!amount || !date) return;
    addPayment({
      memberId: selectedMemberId || members[0].id,
      amount: parseFloat(amount) || 0,
      date,
      method,
      reference,
      note,
    });
    setShowModal(false);
    setAmount("");
  };

  const totalDeposited = walletPayments.filter(p => p.status === "approved").reduce((a, p) => a + p.amount, 0);
  const totalBalance = memberSettlements.reduce((a, w) => a + w.balance, 0);
  const lowCount = memberSettlements.filter(w => w.balance < currentHouse.setting.lowWalletThreshold).length;

  return (
    <div>
      <PageHeader
        title="Wallets"
        subtitle="Member wallet balances and payment history"
        action={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} />Add Payment</Btn>}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Deposited</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalDeposited)}</p>
        </Card>
        <Card className="p-4 border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600">Total Balance</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{fmt(totalBalance)}</p>
        </Card>
        <Card className="p-4 border-red-100 bg-red-50">
          <p className="text-xs text-red-600">Low Balance Alert</p>
          <p className="text-2xl font-bold text-red-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>
            {lowCount} members
          </p>
        </Card>
      </div>

      {/* Wallet cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {memberSettlements.map(w => {
          const member = members.find(m => m.id === w.memberId) || members[0];
          const isPos = w.balance >= 0;
          const isLow = w.balance < currentHouse.setting.lowWalletThreshold;
          return (
            <Card key={w.memberId} className={`p-5 ${isLow ? "border-red-200" : ""}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={w.avatar} size="md" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{w.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                  </div>
                </div>
                <Badge variant={isLow ? "danger" : "success"}>
                  {isLow ? "Low" : "Good"}
                </Badge>
              </div>

              <div className="text-center py-3 bg-slate-50 rounded-xl mb-4">
                <p className="text-xs text-slate-500 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{fmt(w.balance)}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Deposited</span>
                  <span className="font-semibold text-emerald-600 font-mono">{fmt(w.paid)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Meal Cost</span>
                  <span className="font-mono">{fmt(w.mealCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Other Share</span>
                  <span className="font-mono">{fmt(w.otherShare)}</span>
                </div>
                {w.fines > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Fines</span>
                    <span className="font-mono">{fmt(w.fines)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between font-semibold">
                  <span>Est. Balance</span>
                  <span className={`font-mono flex items-center gap-1 ${isPos ? "text-emerald-600" : "text-red-600"}`}>
                    {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isPos ? "+" : "-"}{fmt(Math.abs(w.balance))}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Btn size="sm" variant="secondary" className="flex-1">History</Btn>
                <Btn size="sm" className="flex-1" onClick={() => { setSelectedMemberId(w.memberId); setShowModal(true); }}>
                  <Plus size={12} /> Payment
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payments table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Recent Payment Submissions</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {walletPayments.map(p => (
            <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{p.memberName}</p>
                <p className="text-xs text-slate-500">{p.date} · {p.method} {p.reference ? `· ${p.reference}` : ""}</p>
              </div>
              <p className="text-sm font-bold font-mono text-slate-800">{fmt(p.amount)}</p>
              <Badge variant={p.status === "approved" ? "success" : p.status === "pending" ? "warning" : "danger"}>
                {p.status}
              </Badge>
              {p.status === "pending" && (
                <Btn size="sm" variant="success" onClick={() => approvePayment(p.id)}>
                  <Check size={12} /> Approve
                </Btn>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Payment">
        <div className="space-y-4">
          <Select
            label="Member"
            options={members.map(m => m.name)}
            value={members.find(m => m.id === selectedMemberId)?.name}
            onChange={name => {
              const m = members.find(x => x.name === name);
              if (m) setSelectedMemberId(m.id);
            }}
          />
          <Input label="Amount (৳)" type="number" placeholder="2000" value={amount} onChange={setAmount} required />
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <Select label="Payment Method" options={["Cash", "bKash", "Nagad", "Bank Transfer", "Rocket"]} value={method} onChange={setMethod} />
          <Input label="Reference / Transaction ID" placeholder="TXN123456" value={reference} onChange={setReference} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            Payment will be marked as Pending until manager approves it.
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Submit Payment</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
