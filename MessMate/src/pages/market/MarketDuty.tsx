import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Select, Input } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { generateRotationSchedule } from "../../engine/dutyEngine";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { variant: "success" | "warning" | "info" | "neutral"; icon: React.ReactNode; label: string }> = {
  current: { variant: "warning", icon: <AlertCircle size={10} />, label: "On Duty" },
  upcoming: { variant: "info", icon: <Clock size={10} />, label: "Upcoming" },
  completed: { variant: "success", icon: <CheckCircle size={10} />, label: "Completed" },
};

export default function MarketDuty() {
  const { marketDuties, members, assignMarketDuty, currentHouse } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleAssign = () => {
    if (!startDate || !endDate) return;
    assignMarketDuty({
      memberId: selectedMemberId || members[0].id,
      startDate,
      endDate,
      notes,
    });
    setShowModal(false);
  };

  const rotationPlan = generateRotationSchedule(members, new Date(2026, 8, 1), currentHouse.setting.dutyDurationDays, 5);

  return (
    <div>
      <PageHeader
        title="Market Duty"
        subtitle="Assign and track member market duties"
        action={<Btn size="sm" onClick={() => setShowModal(true)}>+ Assign Duty</Btn>}
      />

      {/* Current duty highlight */}
      {marketDuties.filter(d => d.status === "current").map(d => (
        <Card key={d.id} className="p-5 mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Currently On Duty</p>
              <p className="text-lg font-bold text-amber-900" style={{ fontFamily: "var(--font-display)" }}>{d.memberName}</p>
              <p className="text-sm text-amber-700">{d.startDate} → {d.endDate}</p>
            </div>
            <Badge variant="warning"><AlertCircle size={10} /> On Duty</Badge>
          </div>
        </Card>
      ))}

      {/* All duties */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketDuties.map(d => {
          const cfg = statusConfig[d.status] || statusConfig.upcoming;
          const member = members.find(m => m.id === d.memberId) || members[0];
          return (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={member.avatar} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{d.memberName}</p>
                    <p className="text-xs text-slate-400">{d.startDate} – {d.endDate}</p>
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
              </div>
              <div className="flex gap-2">
                <Btn size="sm" variant="ghost" className="flex-1">Edit</Btn>
                {d.status === "upcoming" && <Btn size="sm" variant="ghost" className="text-red-500">Cancel</Btn>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Rotation preview */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">September Rotation Plan</h3>
          <Badge variant="info">Auto-rotation · {currentHouse.setting.dutyDurationDays} days</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {rotationPlan.map((item, i) => (
            <div key={i} className="flex-shrink-0 text-center p-3 bg-slate-50 rounded-xl min-w-[88px]">
              <Avatar initials={item.member.avatar} size="sm" color="bg-indigo-400" />
              <p className="text-xs font-semibold text-slate-700 mt-2">{item.member.name.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.period}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Assign Market Duty">
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
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
            <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAssign}>Assign Duty</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
