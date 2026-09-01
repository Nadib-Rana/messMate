import { Modal, Input, Select, Btn } from "../../components/ui";
import { Check } from "lucide-react";

export function MemberDepositModal({
  open,
  onClose,
  depositAmount,
  setDepositAmount,
  depositDate,
  setDepositDate,
  depositMethod,
  setDepositMethod,
  depositReference,
  setDepositReference,
  depositNote,
  setDepositNote,
  depositError,
  depositSuccess,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  depositAmount: string;
  setDepositAmount: (v: string) => void;
  depositDate: string;
  setDepositDate: (v: string) => void;
  depositMethod: any;
  setDepositMethod: (v: any) => void;
  depositReference: string;
  setDepositReference: (v: string) => void;
  depositNote: string;
  setDepositNote: (v: string) => void;
  depositError: string;
  depositSuccess: boolean;
  onSubmit: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Request Wallet Deposit">
      <div className="space-y-4">
        {depositError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{depositError}</div>
        )}
        {depositSuccess ? (
          <div className="py-6 text-center text-emerald-600">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={24} /></div>
            <p className="font-bold">Deposit Request Submitted!</p>
            <p className="text-xs text-slate-500 mt-1">Your manager will review and approve your payment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount (৳)" type="number" placeholder="2000" value={depositAmount} onChange={setDepositAmount} required />
              <Input label="Date" type="date" value={depositDate} onChange={setDepositDate} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Payment Method" options={["bKash", "Nagad", "Cash", "Bank Transfer", "Rocket"]} value={depositMethod} onChange={setDepositMethod} />
              <Input label="TrxID / Reference" placeholder="e.g. 9J283KA92" value={depositReference} onChange={setDepositReference} />
            </div>
            <Input label="Note (Optional)" placeholder="e.g. Advance deposit for this month" value={depositNote} onChange={setDepositNote} />
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
              <Btn onClick={onSubmit}>Submit Request</Btn>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
