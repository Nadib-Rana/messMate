import { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Card, Badge, fmt, Btn } from "../components/ui";
import { useApp } from "../context/AppContext";
import { MemberDepositModal } from "./components/MemberDepositModal";
import { MemberDutyOverview } from "./components/MemberDutyOverview";
import { MarketDutyHeroBanner } from "./components/MarketDutyHeroBanner";
import { Page } from "../components/Sidebar";

export default function MemberDashboard({ onNavigate }: { onNavigate?: (page: Page) => void }) {
  const { memberSettlements, mealRate, marketDuties, currentHouse, members, walletPayments, addPayment, currentMember } = useApp();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositMethod, setDepositMethod] = useState<any>("bKash");
  const [depositReference, setDepositReference] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const meMember = (currentMember && currentMember.role === "member") ? currentMember : (members.find(m => m.role === "member") || members[0]);
  const meSettlement = memberSettlements.find(s => s.memberId === meMember.id) || memberSettlements[0];

  const myMeals = meSettlement?.meals || 0;
  const mealCost = meSettlement?.mealCost || 0;
  const otherShare = meSettlement?.otherShare || 0;
  const fines = meSettlement?.fines || 0;
  const guestMealCost = meSettlement?.guestMealCost || 0;
  const totalResp = meSettlement?.totalResponsibility || 0;
  const paid = meSettlement?.paid || 0;
  const balance = meSettlement?.balance || 0;

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const todayStr = getTodayStr();

  const todayDuty = marketDuties.find(d => {
    if (d.startDate && d.endDate) {
      return todayStr >= d.startDate && todayStr <= d.endDate;
    }
    return d.status === "current";
  });

  const nextDuty = marketDuties
    .filter(d => d.startDate && d.startDate > todayStr)
    .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))[0];

  const myDuty = marketDuties.find(d => d.memberId === meMember.id && ((d.startDate && d.endDate && todayStr >= d.startDate && todayStr <= d.endDate) || d.status === "current")) || marketDuties.find(d => d.memberId === meMember.id);
  const myPayments = walletPayments.filter(p => p.memberId === meMember.id);

  const handleDepositSubmit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) { setDepositError("Please enter a valid deposit amount."); return; }
    if (!depositDate) { setDepositError("Please select a date."); return; }
    addPayment({ memberId: meMember.id, amount: amt, date: depositDate, method: depositMethod, reference: depositReference, note: depositNote });
    setDepositSuccess(true);
    setTimeout(() => { setShowDepositModal(false); setDepositSuccess(false); setDepositAmount(""); setDepositReference(""); setDepositNote(""); setDepositError(""); }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Top Market Duty Hero Banner */}
      <MarketDutyHeroBanner todayDuty={todayDuty} nextDuty={nextDuty} currentMember={meMember} onNavigate={onNavigate} />

      <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-white relative overflow-hidden">
        <p className="text-indigo-200 text-sm">Good afternoon,</p>
        <h2 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{meMember.name}</h2>
        <p className="text-indigo-200 text-xs mt-1">{meMember.role === "manager" ? "Manager" : "Member"} · {currentHouse.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Wallet size={16} className="text-indigo-500" /> My Wallet</div>
            <div className="flex items-center gap-2">
              <Badge variant={balance >= currentHouse.setting.lowWalletThreshold ? "success" : "danger"}>{balance >= currentHouse.setting.lowWalletThreshold ? "Good" : "Low"}</Badge>
              <Btn size="sm" onClick={() => { setDepositError(""); setShowDepositModal(true); }}><Plus size={12} /> Add Deposit</Btn>
            </div>
          </div>
          <p className="text-4xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{fmt(balance)}</p>
          <p className="text-xs text-slate-500 mt-1">Available balance</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50 rounded-lg"><p className="text-emerald-600 font-medium">Total Deposited</p><p className="font-bold text-slate-800 mt-0.5">{fmt(paid)}</p></div>
            <div className="p-2.5 bg-slate-50 rounded-lg"><p className="text-slate-500 font-medium">Spent / Allocated</p><p className="font-bold text-slate-800 mt-0.5">{fmt(totalResp)}</p></div>
          </div>
        </Card>

        <MemberDutyOverview myMeals={myMeals} mealRate={mealRate} mealCost={mealCost} otherShare={otherShare} fines={fines} guestMealCost={guestMealCost} myDuty={myDuty} todayDuty={todayDuty} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">My Deposit History</h3>
        {myPayments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No deposits submitted yet</p>
        ) : (
          <div className="space-y-2">
            {myPayments.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div><p className="text-xs font-bold text-slate-800">{fmt(p.amount)}</p><p className="text-[11px] text-slate-400">{p.date} · via {p.method}</p></div>
                <Badge variant={p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "warning"}>{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MemberDepositModal
        open={showDepositModal} onClose={() => setShowDepositModal(false)} depositAmount={depositAmount} setDepositAmount={setDepositAmount}
        depositDate={depositDate} setDepositDate={setDepositDate} depositMethod={depositMethod} setDepositMethod={setDepositMethod}
        depositReference={depositReference} setDepositReference={setDepositReference} depositNote={depositNote} setDepositNote={setDepositNote}
        depositError={depositError} depositSuccess={depositSuccess} onSubmit={handleDepositSubmit}
      />
    </div>
  );
}
