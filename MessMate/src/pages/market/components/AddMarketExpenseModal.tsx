import { useState } from "react";
import { Modal, Input, Select, Btn } from "../../../components/ui";
import { MarketItem } from "../../types";
import { Plus, Trash2 } from "lucide-react";

export function AddMarketExpenseModal({
  open,
  onClose,
  members,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  members: any[];
  onSubmit: (exp: any) => void;
}) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Bazar");
  const [description, setDescription] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState(members[0]?.id || "");
  const [items, setItems] = useState<MarketItem[]>([{ name: "", quantity: "", price: 0 }]);

  const handleAddItem = () => setItems(prev => [...prev, { name: "", quantity: "", price: 0 }]);
  const handleRemoveItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: keyof MarketItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const itemsTotal = items.reduce((sum, item, i) => sum + (i === index ? (field === "price" ? parseFloat(value) || 0 : item.price) : item.price), 0);
    if (itemsTotal > 0) setAmount(itemsTotal.toString());
  };

  const handleSubmit = () => {
    const totalAmt = parseFloat(amount) || items.reduce((a, b) => a + (b.price || 0), 0);
    if (!date || !totalAmt) return;
    const validItems = items.filter(i => i.name.trim() !== "");
    onSubmit({
      date,
      amount: totalAmt,
      category,
      description,
      paidByMemberId: paidByMemberId || members[0]?.id,
      items: validItems.length > 0 ? validItems : undefined,
    });
    onClose();
    setAmount("");
    setDescription("");
    setItems([{ name: "", quantity: "", price: 0 }]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Market Expense">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <Input label="Total Amount (৳)" type="number" placeholder="1250" value={amount} onChange={setAmount} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" options={["Bazar", "Spices", "Oil & Rice", "Vegetables", "Fish & Meat", "Other"]} value={category} onChange={setCategory} />
          <Select label="Purchased By" options={members.map(m => m.name)} value={members.find(m => m.id === paidByMemberId)?.name} onChange={name => setPaidByMemberId(members.find(x => x.name === name)?.id || "")} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700">Itemized Breakdown (Optional)</label>
            <button type="button" onClick={handleAddItem} className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
              <Plus size={12} /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="Item name (e.g. Potato)" value={item.name} onChange={e => handleItemChange(idx, "name", e.target.value)} className="flex-2 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="Qty (e.g. 2 kg)" value={item.quantity || ""} onChange={e => handleItemChange(idx, "quantity", e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <input type="number" placeholder="Price ৳" value={item.price || ""} onChange={e => handleItemChange(idx, "price", parseFloat(e.target.value) || 0)} className="w-20 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <Input label="Description / Note" placeholder="Brief note about the purchase..." value={description} onChange={setDescription} />
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSubmit}>Submit Expense</Btn>
        </div>
      </div>
    </Modal>
  );
}
