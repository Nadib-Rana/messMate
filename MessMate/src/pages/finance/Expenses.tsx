import { useState } from "react";
import { PageHeader, Card, Badge, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Plus } from "lucide-react";

const CATEGORIES = ["Food / Bazar", "Electricity", "House Rent", "Buya / Maid", "Internet", "Gas", "Water", "Cleaning", "Maintenance", "Other"];

const categoryColor: Record<string, string> = {
  "Electricity": "bg-yellow-100 text-yellow-700",
  "House Rent": "bg-indigo-100 text-indigo-700",
  "Internet": "bg-cyan-100 text-cyan-700",
  "Buya / Maid": "bg-violet-100 text-violet-700",
  "Gas": "bg-orange-100 text-orange-700",
};

export default function Expenses() {
  const { expenses, members, addExpense } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState("Electricity");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.name || "");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!amount || !date) return;
    addExpense({
      category,
      amount: parseFloat(amount) || 0,
      date,
      paidBy: paidBy || members[0].name,
      description,
    });
    setShowModal(false);
    setAmount("");
    setDescription("");
  };

  const totalExpense = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses & Payments"
        subtitle="All house expenses excluding market food expenses"
        action={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} />Add Expense</Btn>}
      />

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">August 2026</h3>
          <span className="text-xs text-slate-500">
            Total: <strong className="text-slate-800">{fmt(totalExpense)}</strong>
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {expenses.map(e => (
            <div key={e.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryColor[e.category] || "bg-slate-100 text-slate-600"}`}>
                {e.category}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{e.description || e.category}</p>
                <p className="text-xs text-slate-500">{e.date} · Paid by {e.paidBy}</p>
              </div>
              <Badge variant={e.status === "paid" ? "success" : e.status === "pending" ? "warning" : "danger"}>
                {e.status}
              </Badge>
              <p className="text-base font-bold text-slate-900 font-mono">{fmt(e.amount)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Category breakdown */}
      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Category Breakdown</h3>
        <div className="space-y-2">
          {CATEGORIES.slice(1).map(cat => {
            const total = expenses.filter(e => e.category === cat).reduce((a, e) => a + e.amount, 0);
            if (!total) return null;
            const maxTotal = Math.max(...CATEGORIES.map(c => expenses.filter(e => e.category === c).reduce((a, e) => a + e.amount, 0))) || 1;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-24 shrink-0">{cat}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="h-2 bg-indigo-400 rounded-full transition-all" style={{ width: `${(total / maxTotal) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-800 font-mono w-20 text-right">{fmt(total)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Expense">
        <div className="space-y-4">
          <Select label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
          <Input label="Amount (৳)" type="number" value={amount} onChange={setAmount} required />
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <Select label="Paid By" options={members.map(m => m.name)} value={paidBy} onChange={setPaidBy} />
          <Input label="Description" placeholder="Monthly electricity bill..." value={description} onChange={setDescription} />
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Add Expense</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
