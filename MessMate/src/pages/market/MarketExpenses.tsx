import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle size={12} className="text-emerald-500" />,
  rejected: <XCircle size={12} className="text-red-500" />,
  pending: <Clock size={12} className="text-amber-500" />,
};
const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  approved: "success", rejected: "danger", pending: "warning",
};

export default function MarketExpenses() {
  const { marketExpenses, members, submitMarketExpense, approveMarketExpense, rejectMarketExpense } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Bazar");
  const [description, setDescription] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState(members[0]?.id || "");

  const handleSubmit = () => {
    if (!date || !amount) return;
    submitMarketExpense({
      date,
      amount: parseFloat(amount) || 0,
      category,
      description,
      paidByMemberId: paidByMemberId || members[0].id,
    });
    setShowModal(false);
    setAmount("");
    setDescription("");
  };

  const totalApproved = marketExpenses.filter(e => e.status === "approved").reduce((a, e) => a + e.amount, 0);
  const pending = marketExpenses.filter(e => e.status === "pending");

  return (
    <div>
      <PageHeader
        title="Market Expenses"
        subtitle="Track and approve market shopping expenses"
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
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">All Expenses</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {marketExpenses.map(e => {
            const member = members.find(m => m.id === e.memberId) || members[0];
            return (
              <div key={e.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                <Avatar initials={member.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{e.memberName}</p>
                    <Badge variant={statusVariant[e.status]}>
                      {statusIcon[e.status]} {e.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{e.date} · {e.category} · {e.description}</p>
                </div>
                <p className="text-base font-bold text-slate-900 font-mono">{fmt(e.amount)}</p>
                {e.status === "pending" && (
                  <div className="flex gap-1.5">
                    <Btn size="sm" variant="success" onClick={() => approveMarketExpense(e.id)}>Approve</Btn>
                    <Btn size="sm" variant="danger" onClick={() => rejectMarketExpense(e.id)}>Reject</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit Market Expense">
        <div className="space-y-4">
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <Input label="Amount (৳)" type="number" placeholder="2500" value={amount} onChange={setAmount} required />
          <Select label="Category" options={["Bazar", "Vegetables", "Meat/Fish", "Rice/Lentils", "Spices", "Other"]} value={category} onChange={setCategory} />
          <Input label="Description" placeholder="Weekly groceries..." value={description} onChange={setDescription} />
          <Select
            label="Paid By"
            options={members.map(m => m.name)}
            value={members.find(m => m.id === paidByMemberId)?.name}
            onChange={name => {
              const m = members.find(x => x.name === name);
              if (m) setPaidByMemberId(m.id);
            }}
          />
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Submit</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
