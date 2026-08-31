import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { MarketItem } from "../../types";
import { CheckCircle, XCircle, Clock, ShoppingBag, Plus, Trash2 } from "lucide-react";

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
  const [items, setItems] = useState<MarketItem[]>([
    { name: "", quantity: "", price: 0 }
  ]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { name: "", quantity: "", price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof MarketItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Auto update total amount if items exist
    const itemsTotal = items.reduce((sum, item, i) => sum + (i === index ? (field === "price" ? parseFloat(value) || 0 : item.price) : item.price), 0);
    if (itemsTotal > 0) {
      setAmount(itemsTotal.toString());
    }
  };

  const handleSubmit = () => {
    const totalAmt = parseFloat(amount) || items.reduce((a, b) => a + (b.price || 0), 0);
    if (!date || !totalAmt) return;

    const validItems = items.filter(i => i.name.trim() !== "");

    submitMarketExpense({
      date,
      amount: totalAmt,
      category,
      description,
      paidByMemberId: paidByMemberId || members[0].id,
      items: validItems.length > 0 ? validItems : undefined,
    });

    setShowModal(false);
    setAmount("");
    setDescription("");
    setItems([{ name: "", quantity: "", price: 0 }]);
  };

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
        </div>
        <div className="divide-y divide-slate-100">
          {marketExpenses.map(e => {
            const member = members.find(m => m.id === e.memberId) || members[0];
            return (
              <div key={e.id} className="px-5 py-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar initials={member.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{e.memberName}</p>
                        <Badge variant={statusVariant[e.status]}>
                          {statusIcon[e.status]} {e.status}
                        </Badge>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-mono">{fmt(e.amount)}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{e.date} · {e.category} · {e.description}</p>

                    {/* Itemized shopping list */}
                    {e.items && e.items.length > 0 && (
                      <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                          <ShoppingBag size={12} className="text-indigo-600" />
                          <span>Purchased Items Breakdown ({e.items.length} items)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {e.items.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
                              <span>{item.name}</span>
                              {item.quantity && <span className="text-slate-400 text-[11px]">({item.quantity})</span>}
                              <span className="font-bold text-slate-900 font-mono">৳{item.price}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {e.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <Btn size="sm" variant="success" onClick={() => approveMarketExpense(e.id)}>Approve</Btn>
                      <Btn size="sm" variant="danger" onClick={() => rejectMarketExpense(e.id)}>Reject</Btn>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit Market Expense with Item List">
        <div className="space-y-4">
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <Select
            label="Paid By"
            options={members.map(m => m.name)}
            value={members.find(m => m.id === paidByMemberId)?.name}
            onChange={name => {
              const m = members.find(x => x.name === name);
              if (m) setPaidByMemberId(m.id);
            }}
          />
          <Select label="Category" options={["Bazar", "Vegetables", "Meat/Fish", "Rice/Lentils", "Spices", "Other"]} value={category} onChange={setCategory} />
          <Input label="Description / Summary" placeholder="Weekly groceries shopping..." value={description} onChange={setDescription} />

          {/* Itemized input builder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Itemized Grocery List (কি কি বাজার করা হয়েছে)</label>
              <Btn size="sm" variant="ghost" onClick={handleAddItem} className="text-xs">
                <Plus size={12} /> Add Item
              </Btn>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Item (e.g. Rice, Chicken)"
                    value={item.name}
                    onChange={e => handleItemChange(index, "name", e.target.value)}
                    className="flex-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Qty (5kg, 2L)"
                    value={item.quantity || ""}
                    onChange={e => handleItemChange(index, "quantity", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Price (৳)"
                    value={item.price || ""}
                    onChange={e => handleItemChange(index, "price", e.target.value)}
                    className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  {items.length > 1 && (
                    <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Input label="Total Amount (৳)" type="number" placeholder="2500" value={amount} onChange={setAmount} required />

          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Submit Expense</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
