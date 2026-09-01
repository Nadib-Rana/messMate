import { useState, useMemo } from "react";
import { PageHeader, Card, Avatar, Btn } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { generateRotationSchedule } from "../../engine/dutyEngine";
import { RefreshCw } from "lucide-react";
import { AssignDutyModal } from "./components/AssignDutyModal";
import { AutoRotationModal } from "./components/AutoRotationModal";
import { DutyCardGrid } from "./components/DutyCardGrid";

export default function MarketDuty() {
  const { marketDuties, members, assignMarketDuty, deleteMarketDuty, clearMarketDuties, currentHouse, updateSettings } = useApp();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAutoRotationModal, setShowAutoRotationModal] = useState(false);

  const [rotationStartDate, setRotationStartDate] = useState("2026-09-01");
  const [dutyDays, setDutyDays] = useState(currentHouse.setting.dutyDurationDays.toString() || "3");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map(m => m.id));
  const [startMemberId, setStartMemberId] = useState(members[0]?.id || "");
  const [replaceExisting, setReplaceExisting] = useState(true);

  const toggleMemberSelection = (id: string) => setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]);
  const selectAllMembers = () => setSelectedMemberIds(members.map(m => m.id));
  const deselectAllMembers = () => setSelectedMemberIds([]);

  const participatingMembers = members.filter(m => selectedMemberIds.includes(m.id));
  const effectiveStartMemberId = participatingMembers.some(m => m.id === startMemberId) ? startMemberId : (participatingMembers[0]?.id || "");
  const startIndex = participatingMembers.findIndex(m => m.id === effectiveStartMemberId);
  const orderedMembers = startIndex >= 0 ? [...participatingMembers.slice(startIndex), ...participatingMembers.slice(0, startIndex)] : participatingMembers;

  const previewRotation = generateRotationSchedule(orderedMembers.length > 0 ? orderedMembers : members, new Date(rotationStartDate || "2026-09-01"), parseInt(dutyDays) || 3, orderedMembers.length > 0 ? orderedMembers.length : members.length);

  const duplicateDutiesExist = useMemo(() => {
    const seen = new Set<string>();
    for (const d of marketDuties) {
      const key = `${d.memberId}_${d.startDate?.slice(0, 7) || "2026-09"}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  }, [marketDuties]);

  const handleCleanDuplicates = () => {
    const seen = new Set<string>();
    const toDelete: string[] = [];
    const sorted = [...marketDuties].sort((a, b) => a.startDate.localeCompare(b.startDate));
    for (const d of sorted) {
      const key = `${d.memberId}_${d.startDate?.slice(0, 7) || "2026-09"}`;
      if (!seen.has(key)) seen.add(key);
      else toDelete.push(d.id);
    }
    toDelete.forEach(id => deleteMarketDuty(id));
  };

  const handleGenerateRotation = () => {
    if (replaceExisting) clearMarketDuties();
    updateSettings({ dutyDurationDays: parseInt(dutyDays) || 3 });
    previewRotation.forEach(r => {
      const dates = r.period.split(" – ");
      assignMarketDuty({ memberId: r.member.id, startDate: dates[0], endDate: dates[1], notes: `Auto-assigned (${dutyDays}-day fair cycle)` });
    });
    setShowAutoRotationModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Market Duty Schedule"
        subtitle="Manage bazaar duties fairly with 1 turn per member"
        action={
          <div className="flex gap-2">
            {duplicateDutiesExist && <Btn size="sm" variant="danger" onClick={handleCleanDuplicates}>Clean Duplicates</Btn>}
            <Btn size="sm" variant="secondary" onClick={() => setShowAutoRotationModal(true)}><RefreshCw size={14} /> Auto-Rotate</Btn>
            <Btn size="sm" onClick={() => setShowAssignModal(true)}>+ Assign Duty</Btn>
          </div>
        }
      />

      <DutyCardGrid marketDuties={marketDuties} members={members} deleteMarketDuty={deleteMarketDuty} />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Auto-Rotation Schedule Preview</h3>
            <p className="text-xs text-slate-500">Starting from {rotationStartDate} · {dutyDays} days per member</p>
          </div>
          <Btn size="sm" variant="outline" onClick={() => setShowAutoRotationModal(true)}>Configure Settings</Btn>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {previewRotation.map((item, i) => (
            <div key={i} className="shrink-0 text-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl min-w-[110px]">
              <Avatar initials={item.member.avatar} size="sm" color="bg-indigo-600" />
              <p className="text-xs font-bold text-slate-800 mt-2">{item.member.name.split(" ")[0]}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.period}</p>
              <span className="inline-block text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded mt-1.5 font-semibold">{dutyDays} Days</span>
            </div>
          ))}
        </div>
      </Card>

      <AssignDutyModal open={showAssignModal} onClose={() => setShowAssignModal(false)} members={members} onAssign={assignMarketDuty} />
      <AutoRotationModal
        open={showAutoRotationModal} onClose={() => setShowAutoRotationModal(false)} members={members}
        rotationStartDate={rotationStartDate} setRotationStartDate={setRotationStartDate} dutyDays={dutyDays} setDutyDays={setDutyDays}
        selectedMemberIds={selectedMemberIds} toggleMemberSelection={toggleMemberSelection} selectAllMembers={selectAllMembers}
        deselectAllMembers={deselectAllMembers} participatingMembers={participatingMembers} effectiveStartMemberId={effectiveStartMemberId}
        setStartMemberId={setStartMemberId} replaceExisting={replaceExisting} setReplaceExisting={setReplaceExisting} onGenerate={handleGenerateRotation}
      />
    </div>
  );
}
