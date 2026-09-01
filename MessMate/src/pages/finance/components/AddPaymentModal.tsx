import { Modal, Input, Select, Btn } from "../../../components/ui";

export function AddPaymentModal({
  open,
  onClose,
  isManager,
  members,
  selectedMemberId,
  setSelectedMemberId,
  amount,
  setAmount,
  date,
  setDate,
  method,
  setMethod,
  reference,
  setReference,
  note,
  setNote,
  formError,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  isManager: boolean;
  members: any[];
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  method: any;
  setMethod: (v: any) => void;
  reference: string;
  setReference: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  formError: string;
  onSubmit: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={isManager ? "Record Member Payment" : "Submit Deposit Request"}>
      <div className="space-y-4">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        {isManager ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Member</label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Depositing for: <strong className="text-slate-800">{members.find(m => m.id === selectedMemberId)?.name}</strong>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount (৳)" type="number" placeholder="2000" value={amount} onChange={setAmount} required />
          <Input label="Date" type="date" value={date} onChange={setDate} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Payment Method" options={["bKash", "Nagad", "Cash", "Bank Transfer", "Rocket"]} value={method} onChange={setMethod} />
          <Input label="Reference / TrxID" placeholder="e.g. 9J283KA92" value={reference} onChange={setReference} />
        </div>
        <Input label="Note (Optional)" placeholder="e.g. Advance mess deposit for this month" value={note} onChange={setNote} />
        <div className="flex gap-2 justify-end pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={onSubmit}>{isManager ? "Record Payment" : "Submit Request"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
