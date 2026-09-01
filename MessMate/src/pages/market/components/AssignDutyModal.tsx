import { useState } from "react";
import { Modal, Input, Btn } from "../../../components/ui";

export function AssignDutyModal({
  open,
  onClose,
  members,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  members: any[];
  onAssign: (duty: { memberId: string; startDate: string; endDate: string; notes?: string }) => void;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!selectedMemberId || !startDate || !endDate) return;
    onAssign({ memberId: selectedMemberId, startDate, endDate, notes });
    onClose();
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Market Duty">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Member</label>
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
          <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            placeholder="e.g. Special weekend market duty..."
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSubmit}>Assign Duty</Btn>
        </div>
      </div>
    </Modal>
  );
}
