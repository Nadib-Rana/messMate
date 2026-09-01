import { useState } from "react";
import { PageHeader, Card, Btn, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Plus } from "lucide-react";
import { UserRole } from "../../types";
import { AddPaymentModal } from "./components/AddPaymentModal";
import { WalletHistoryModal } from "./components/WalletHistoryModal";
import { WalletCardGrid } from "./components/WalletCardGrid";

export default function Wallets({ role = "manager" }: { role?: UserRole }) {
  const { walletPayments, members, memberSettlements, addPayment, currentHouse, currentMember } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [historyMemberId, setHistoryMemberId] = useState<string | null>(null);

  const isManager = role === "manager";
  const meMember = (currentMember && currentMember.role === "member") ? currentMember : (members.find(m => m.role === "member") || members[0]);

  const [selectedMemberId, setSelectedMemberId] = useState(isManager ? (members[0]?.id || "") : meMember.id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState<any>("bKash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const openAddPaymentModal = (mId?: string) => {
    setSelectedMemberId(isManager ? (mId || members[0]?.id || "") : meMember.id);
    setDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    setFormError("");
    if (!amount || parseFloat(amount) <= 0) { setFormError("Please enter a valid payment amount."); return; }
    if (!date) { setFormError("Please select a payment date."); return; }
    addPayment({ memberId: selectedMemberId || members[0]?.id, amount: parseFloat(amount) || 0, date, method, reference, note });
    setShowModal(false);
    setAmount(""); setReference(""); setNote("");
  };

  const totalDeposited = walletPayments.filter(p => p.status === "approved").reduce((a, p) => a + p.amount, 0);
  const totalBalance = memberSettlements.reduce((a, w) => a + w.balance, 0);
  const lowCount = memberSettlements.filter(w => w.balance < currentHouse.setting.lowWalletThreshold).length;

  return (
    <div>
      <PageHeader
        title={isManager ? "Wallets & Deposits" : "My Wallet & Mess Balance"}
        subtitle={isManager ? "Member wallet balances, deposit requests, and payment approvals" : "View your deposit history and mess balance"}
        action={
          <Btn size="sm" onClick={() => openAddPaymentModal(isManager ? undefined : meMember.id)}>
            <Plus size={14} /> {isManager ? "Add Payment" : "Request Deposit"}
          </Btn>
        }
      />

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
          <p className="text-2xl font-bold text-red-900 mt-1" style={{ fontFamily: "var(--font-display)" }}>{lowCount} members</p>
        </Card>
      </div>

      <WalletCardGrid
        memberSettlements={memberSettlements}
        members={members}
        currentHouse={currentHouse}
        isManager={isManager}
        onHistory={setHistoryMemberId}
        onAddPayment={openAddPaymentModal}
      />

      <AddPaymentModal
        open={showModal} onClose={() => setShowModal(false)} isManager={isManager} members={members}
        selectedMemberId={selectedMemberId} setSelectedMemberId={setSelectedMemberId} amount={amount} setAmount={setAmount}
        date={date} setDate={setDate} method={method} setMethod={setMethod} reference={reference} setReference={setReference}
        note={note} setNote={setNote} formError={formError} onSubmit={handleSubmit}
      />
      <WalletHistoryModal historyMemberId={historyMemberId} onClose={() => setHistoryMemberId(null)} members={members} walletPayments={walletPayments} />
    </div>
  );
}
