import { Modal, Input, Select, Btn, Avatar } from "../../../components/ui";
import { UserCheck } from "lucide-react";

export function AutoRotationModal({
  open,
  onClose,
  members,
  rotationStartDate,
  setRotationStartDate,
  dutyDays,
  setDutyDays,
  selectedMemberIds,
  toggleMemberSelection,
  selectAllMembers,
  deselectAllMembers,
  participatingMembers,
  effectiveStartMemberId,
  setStartMemberId,
  replaceExisting,
  setReplaceExisting,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  members: any[];
  rotationStartDate: string;
  setRotationStartDate: (v: string) => void;
  dutyDays: string;
  setDutyDays: (v: string) => void;
  selectedMemberIds: string[];
  toggleMemberSelection: (id: string) => void;
  selectAllMembers: () => void;
  deselectAllMembers: () => void;
  participatingMembers: any[];
  excludedMembers?: any[];
  effectiveStartMemberId: string;
  setStartMemberId: (id: string) => void;
  replaceExisting: boolean;
  setReplaceExisting: (v: boolean) => void;
  hasOverlapWithSelectedStart?: boolean;
  onGenerate: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Auto-Rotation Settings (Manager)">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
          <UserCheck size={16} className="shrink-0 text-indigo-600 mt-0.5" />
          <p className="text-indigo-700"><strong>Fair Policy:</strong> Each selected member receives exactly 1 shopping duty in this cycle covering the month equally.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Rotation Start Date" type="date" value={rotationStartDate} onChange={setRotationStartDate} required />
          <Select label="Duty Duration Per Member" options={["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "7 Days"]} value={`${dutyDays} Days`} onChange={val => setDutyDays(val.split(" ")[0])} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-800">
              Participating Members ({selectedMemberIds.length}/{members.length})
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={selectAllMembers} className="text-xs font-semibold text-indigo-600 hover:underline">Select All</button>
              <span className="text-slate-300">·</span>
              <button type="button" onClick={deselectAllMembers} className="text-xs font-semibold text-slate-500 hover:underline">Clear</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
            {members.map(m => {
              const isSelected = selectedMemberIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMemberSelection(m.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${isSelected ? "bg-white border-indigo-300" : "bg-slate-100/70 border-slate-200 opacity-60"}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar initials={m.avatar} size="xs" color={isSelected ? "bg-indigo-600" : "bg-slate-400"} />
                    <span className="text-xs font-semibold text-slate-800 truncate">{m.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                    {isSelected ? "Included" : "Excluded"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">First Duty Member in Sequence</label>
          <select value={effectiveStartMemberId} onChange={e => setStartMemberId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium">
            {participatingMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50">
          <div>
            <p className="text-xs font-bold text-slate-800">Clear Existing Duties First</p>
            <p className="text-[11px] text-slate-500">Removes old duties before generating new cycle</p>
          </div>
          <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer" />
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={onGenerate} disabled={selectedMemberIds.length === 0}>Generate Schedule</Btn>
        </div>
      </div>
    </Modal>
  );
}
