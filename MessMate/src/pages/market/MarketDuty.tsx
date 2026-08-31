import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Select, Input } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { generateRotationSchedule } from "../../engine/dutyEngine";
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, UserCheck } from "lucide-react";

const statusConfig: Record<string, { variant: "success" | "warning" | "info" | "neutral"; icon: React.ReactNode; label: string }> = {
  current: { variant: "warning", icon: <AlertCircle size={10} />, label: "On Duty" },
  upcoming: { variant: "info", icon: <Clock size={10} />, label: "Upcoming" },
  completed: { variant: "success", icon: <CheckCircle size={10} />, label: "Completed" },
};

export default function MarketDuty() {
  const { marketDuties, members, assignMarketDuty, currentHouse, updateSettings } = useApp();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAutoRotationModal, setShowAutoRotationModal] = useState(false);

  // Manual Assign Form
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  // Auto-Rotation Controls (Manager selected)
  const [rotationStartDate, setRotationStartDate] = useState("2026-09-01");
  const [dutyDays, setDutyDays] = useState(currentHouse.setting.dutyDurationDays.toString() || "3");
  const [startMemberId, setStartMemberId] = useState(members[0]?.id || "");

  const handleAssign = () => {
    if (!startDate || !endDate) return;
    assignMarketDuty({
      memberId: selectedMemberId || members[0].id,
      startDate,
      endDate,
      notes,
    });
    setShowAssignModal(false);
    setStartDate("");
    setEndDate("");
  };

  // Generate & Apply Auto-Rotation Schedule for all members
  const handleApplyAutoRotation = () => {
    if (!rotationStartDate) return;

    const duration = parseInt(dutyDays) || 3;
    updateSettings({ dutyDurationDays: duration });

    // Order members starting from the selected member
    const startIndex = members.findIndex(m => m.id === startMemberId);
    const orderedMembers = startIndex >= 0
      ? [...members.slice(startIndex), ...members.slice(0, startIndex)]
      : members;

    const start = new Date(rotationStartDate);

    // Generate schedule for all members in sequence
    orderedMembers.forEach((member, idx) => {
      const dutyStart = new Date(start);
      dutyStart.setDate(start.getDate() + idx * duration);

      const dutyEnd = new Date(dutyStart);
      dutyEnd.setDate(dutyStart.getDate() + duration - 1);

      const sStr = dutyStart.toISOString().split("T")[0];
      const eStr = dutyEnd.toISOString().split("T")[0];

      assignMarketDuty({
        memberId: member.id,
        startDate: sStr,
        endDate: eStr,
        notes: `Auto-rotated duty (${duration} days duration)`,
      });
    });

    setShowAutoRotationModal(false);
  };

  const selectedStartMember = members.find(m => m.id === startMemberId) || members[0];
  const previewRotation = generateRotationSchedule(
    members,
    new Date(rotationStartDate || "2026-09-01"),
    parseInt(dutyDays) || 3,
    members.length || 7
  );

  return (
    <div>
      <PageHeader
        title="Market Duty & Rotation"
        subtitle="Manage member shopping duties and configure manager auto-rotation schedules"
        action={
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" onClick={() => setShowAutoRotationModal(true)}>
              <RefreshCw size={13} /> Auto-Rotation Config
            </Btn>
            <Btn size="sm" onClick={() => setShowAssignModal(true)}>+ Assign Duty</Btn>
          </div>
        }
      />

      {/* Currently On Duty Highlight */}
      {marketDuties.filter(d => d.status === "current").map(d => (
        <Card key={d.id} className="p-5 mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Currently On Market Duty</p>
              <p className="text-lg font-bold text-amber-900" style={{ fontFamily: "var(--font-display)" }}>{d.memberName}</p>
              <p className="text-sm text-amber-700">{d.startDate} → {d.endDate}</p>
            </div>
            <Badge variant="warning"><AlertCircle size={10} /> On Duty</Badge>
          </div>
        </Card>
      ))}

      {/* All Duties Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {marketDuties.map(d => {
          const cfg = statusConfig[d.status] || statusConfig.upcoming;
          const member = members.find(m => m.id === d.memberId) || members[0];
          return (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={member?.avatar || "MB"} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{d.memberName}</p>
                    <p className="text-xs text-slate-400">{d.startDate} – {d.endDate}</p>
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
              </div>
              {d.notes && <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">{d.notes}</p>}
            </Card>
          );
        })}
      </div>

      {/* Live Rotation Preview Section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Auto-Rotation Schedule Preview</h3>
            <p className="text-xs text-slate-500">Starting from {rotationStartDate} · {dutyDays} days per member</p>
          </div>
          <Btn size="sm" variant="outline" onClick={() => setShowAutoRotationModal(true)}>
            Configure Settings
          </Btn>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {previewRotation.map((item, i) => (
            <div key={i} className="flex-shrink-0 text-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl min-w-[110px]">
              <Avatar initials={item.member.avatar} size="sm" color="bg-indigo-600" />
              <p className="text-xs font-bold text-slate-800 mt-2">{item.member.name.split(" ")[0]}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.period}</p>
              <span className="inline-block text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded mt-1.5 font-semibold">
                {dutyDays} Days
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-Rotation Configuration Modal */}
      <Modal open={showAutoRotationModal} onClose={() => setShowAutoRotationModal(false)} title="Auto-Rotation Settings (Manager)">
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
            <UserCheck size={16} className="shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-bold">Manager Rotation Generator</p>
              <p className="text-indigo-700 mt-0.5">Select start date, duty duration, and starting member to auto-generate shopping duty for all members.</p>
            </div>
          </div>

          <Input
            label="Rotation Start Date"
            type="date"
            value={rotationStartDate}
            onChange={setRotationStartDate}
            required
          />

          <Select
            label="Duty Duration Per Member (Days)"
            options={["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "7 Days"]}
            value={`${dutyDays} Days`}
            onChange={val => setDutyDays(val.split(" ")[0])}
          />

          <Select
            label="Starting Member (Who goes first?)"
            options={members.map(m => m.name)}
            value={selectedStartMember?.name}
            onChange={name => {
              const m = members.find(x => x.name === name);
              if (m) setStartMemberId(m.id);
            }}
          />

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Rotation Sequence: </span>
            {members.map(m => m.name).join(" → ")}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Btn variant="secondary" onClick={() => setShowAutoRotationModal(false)}>Cancel</Btn>
            <Btn onClick={handleApplyAutoRotation}>
              <RefreshCw size={13} /> Generate & Apply Schedule
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Manual Single Duty Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Single Market Duty">
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
            <Btn variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Btn>
            <Btn onClick={handleAssign}>Assign Duty</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
