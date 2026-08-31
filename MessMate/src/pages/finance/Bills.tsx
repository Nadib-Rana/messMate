import { useState } from "react";
import { PageHeader, Card, Badge, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Zap, Home, Wifi, Flame, Droplets, Plus } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  Electricity: <Zap size={15} />,
  "House Rent": <Home size={15} />,
  Internet: <Wifi size={15} />,
  "Buya / Maid": <Home size={15} />,
  Gas: <Flame size={15} />,
  Water: <Droplets size={15} />,
};

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  paid: "success", unpaid: "danger", pending: "warning",
};

export default function Bills() {
  const { bills, members, addBill } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState("Electricity");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("August 2026");
  const [dueDate, setDueDate] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.name || "");
  const [prevReading, setPrevReading] = useState("");
  const [currReading, setCurrReading] = useState("");

  const handleSubmit = () => {
    if (!amount) return;
    const prev = parseFloat(prevReading) || 0;
    const curr = parseFloat(currReading) || 0;
    const units = curr > prev ? curr - prev : undefined;

    addBill({
      category,
      amount: parseFloat(amount) || 0,
      month,
      dueDate,
      paidBy: paidBy || members[0].name,
      units,
      prevReading: prev || undefined,
      currReading: curr || undefined,
    });
    setShowModal(false);
    setAmount("");
  };

  return (
    <div>
      <PageHeader
        title="Bills"
        subtitle="House utility bills — separate from food/meal expenses"
        action={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} />Add Bill</Btn>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map(b => (
          <Card key={b.id} className={`p-5 ${b.status === "unpaid" ? "border-red-200" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${b.status === "paid" ? "bg-emerald-50 text-emerald-600" : b.status === "unpaid" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                {icons[b.category] || <Home size={15} />}
              </div>
              <Badge variant={statusVariant[b.status] || "neutral"}>{b.status}</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{b.category}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{b.month}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2 font-display" style={{ fontFamily: "var(--font-display)" }}>{fmt(b.amount)}</p>
            {b.category === "Electricity" && b.units !== undefined && (
              <p className="text-xs text-slate-400 mt-1">Units: {b.units} · Reading: {b.prevReading}→{b.currReading}</p>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Due date</span>
                <span className="font-medium text-slate-700">{b.dueDate || "N/A"}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Paid by</span>
                <span className="font-medium text-slate-700">{b.paidBy}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Bill">
        <div className="space-y-4">
          <Select label="Category" options={["Electricity", "House Rent", "Internet", "Buya / Maid", "Gas", "Water", "Other"]} value={category} onChange={setCategory} />
          <Input label="Amount (৳)" type="number" value={amount} onChange={setAmount} required />
          <Input label="Month" placeholder="August 2026" value={month} onChange={setMonth} />
          <Input label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
          <Select label="Paid By" options={members.map(m => m.name)} value={paidBy} onChange={setPaidBy} />

          {category === "Electricity" && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-yellow-50/50 rounded-xl border border-yellow-100">
              <Input label="Previous Reading" type="number" value={prevReading} onChange={setPrevReading} />
              <Input label="Current Reading" type="number" value={currReading} onChange={setCurrReading} />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Save Bill</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
