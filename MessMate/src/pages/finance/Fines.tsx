import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Gavel, Plus } from "lucide-react";

export default function Fines() {
  const { fines, members, applyFine, currentHouse } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!amount || !reason) return;
    applyFine({
      memberId: selectedMemberId || members[0].id,
      amount: parseFloat(amount) || 0,
      reason,
      date: date || "Today",
    });
    setShowModal(false);
    setAmount("");
    setReason("");
  };

  const totalFines = fines.filter(f => f.status === "applied").reduce((a, f) => a + f.amount, 0);

  return (
    <div>
      <PageHeader
        title="Fine Management"
        subtitle="Apply and track fines — amounts go to the house fund"
        action={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} />Apply Fine</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Fines</p>
          <p className="text-2xl font-bold text-slate-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>
            {fmt(totalFines)}
          </p>
        </Card>
        <Card className="p-4 border-red-100 bg-red-50">
          <p className="text-xs text-red-600">Active Fines</p>
          <p className="text-2xl font-bold text-red-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>
            {fines.filter(f => f.status === "applied").length}
          </p>
        </Card>
        <Card className="p-4 bg-slate-50">
          <p className="text-xs text-slate-500">Allocation</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{currentHouse.setting.fineAllocation}</p>
          <p className="text-xs text-slate-400 mt-0.5">House Setting</p>
        </Card>
      </div>

      <div className="space-y-3">
        {fines.map(f => {
          const member = members.find(m => m.id === f.memberId) || members[0];
          return (
            <Card key={f.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${f.status === "applied" ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"}`}>
                  <Gavel size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Avatar initials={member.avatar} size="sm" />
                      <p className="text-sm font-bold text-slate-900">{f.memberName}</p>
                    </div>
                    <Badge variant={f.status === "applied" ? "danger" : "neutral"}>
                      {f.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 rounded-lg px-3 py-2">{f.reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{f.date}</span>
                    <span>→ {f.allocation}</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600 font-mono flex-shrink-0">{fmt(f.amount)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Apply Fine">
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
          <Input label="Amount (৳)" type="number" placeholder="200" value={amount} onChange={setAmount} required />
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Explain the reason for this fine..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={handleSubmit}>Apply Fine</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
