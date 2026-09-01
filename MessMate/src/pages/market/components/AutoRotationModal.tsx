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
  moveMemberUp,
  moveMemberDown,
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
  moveMemberUp?: (id: string) => void;
  moveMemberDown?: (id: string) => void;
  replaceExisting: boolean;
  setReplaceExisting: (v: boolean) => void;
  hasOverlapWithSelectedStart?: boolean;
  onGenerate: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Auto-Rotation Settings & Custom Sequence (Manager)">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
          <UserCheck size={16} className="shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <p className="font-bold text-indigo-950">Manager Control & Duty Exclusion Policy</p>
            <p className="text-indigo-800 mt-0.5">Toggle "Included/Excluded" to exclude members (or manager) from market duty for this month. Use ▲/▼ buttons to customize the exact sequence of who goes 1st, 2nd, 3rd.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Rotation Start Date" type="date" value={rotationStartDate} onChange={setRotationStartDate} required />
          <Select label="Duty Duration Per Member" options={["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "7 Days"]} value={`${dutyDays} Days`} onChange={val => setDutyDays(val.split(" ")[0])} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-800">
              Participating Members & Custom Sequence ({selectedMemberIds.length}/{members.length})
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={selectAllMembers} className="text-xs font-semibold text-indigo-600 hover:underline">Select All</button>
              <span className="text-slate-300">·</span>
              <button type="button" onClick={deselectAllMembers} className="text-xs font-semibold text-slate-500 hover:underline">Clear</button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
            {selectedMemberIds.map((id, index) => {
              const m = members.find(x => x.id === id);
              if (!m) return null;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-indigo-200 bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <Avatar initials={m.avatar} size="xs" color="bg-indigo-600" />
                    <span className="text-xs font-bold text-slate-800 truncate">{m.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {moveMemberUp && index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveMemberUp(m.id)}
                        className="px-1.5 py-0.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded border border-slate-200"
                        title="Move Up in sequence"
                      >
                        ▲
                      </button>
                    )}
                    {moveMemberDown && index < selectedMemberIds.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveMemberDown(m.id)}
                        className="px-1.5 py-0.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded border border-slate-200"
                        title="Move Down in sequence"
                      >
                        ▼
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection(m.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    >
                      Exclude
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Excluded members */}
            {members.filter(m => !selectedMemberIds.includes(m.id)).map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-100/70 opacity-65"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    -
                  </span>
                  <Avatar initials={m.avatar} size="xs" color="bg-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 truncate">{m.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMemberSelection(m.id)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                >
                  Include in Rotation
                </button>
              </div>
            ))}
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
