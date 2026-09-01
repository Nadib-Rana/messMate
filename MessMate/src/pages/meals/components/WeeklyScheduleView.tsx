import { useState } from "react";
import { Card } from "../../../components/ui";
import { Settings2 } from "lucide-react";

export function WeeklyScheduleView({ members, currentMember, weeklySchedules, updateWeeklySchedule, isManager }: {
  members: any[];
  currentMember: any;
  weeklySchedules: any[];
  updateWeeklySchedule: (memberId: string, dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", value: boolean) => void;
  isManager: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember?.id || members[0]?.id || "");
  const days = [
    { key: "Mon", name: "Monday" },
    { key: "Tue", name: "Tuesday" },
    { key: "Wed", name: "Wednesday" },
    { key: "Thu", name: "Thursday" },
    { key: "Fri", name: "Friday" },
    { key: "Sat", name: "Saturday" },
    { key: "Sun", name: "Sunday" },
  ];

  const targetMember = members.find(m => m.id === selectedMemberId) || currentMember;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-indigo-50 border-indigo-100 flex items-start gap-3">
        <Settings2 size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-indigo-800">
          <strong className="font-bold">Recurring Weekly Preference: </strong>
          Set your default meal preferences for each day of the week. If you want to keep a specific meal off every week (e.g. <strong>Every Friday Lunch OFF</strong>), toggle it OFF here.
        </div>
      </Card>

      {isManager && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <label className="text-xs font-semibold text-slate-600">Select Member:</label>
          <select
            value={selectedMemberId}
            onChange={e => setSelectedMemberId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.id === currentMember?.id ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Weekly Schedule for <span className="text-indigo-600">{targetMember?.name || "Member"}</span>
          </h3>
          <span className="text-xs text-slate-400">Recurring Every Week</span>
        </div>

        <div className="divide-y divide-slate-100">
          {days.map(d => {
            const entry = weeklySchedules.find(s => s.memberId === selectedMemberId && s.dayOfWeek === d.key);
            const b = entry ? entry.breakfast : true;
            const l = entry ? entry.lunch : true;
            const din = entry ? entry.dinner : true;

            return (
              <div key={d.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">{d.name}</p>
                  <p className="text-[11px] text-slate-400">Default schedule for every {d.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { key: "breakfast" as const, label: "Breakfast (B)", val: b },
                    { key: "lunch" as const, label: "Lunch (L)", val: l },
                    { key: "dinner" as const, label: "Dinner (D)", val: din },
                  ].map(({ key, label, val }) => (
                    <button
                      key={key}
                      onClick={() => updateWeeklySchedule(selectedMemberId, d.key, key, !val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                        val
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200"
                      }`}
                    >
                      {val ? `✓ ${label[0]}` : `✕ ${label[0]}`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
