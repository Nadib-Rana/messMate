import { useState, useEffect } from "react";
import { Card, Btn } from "../../../components/ui";
import { Settings2, Send, CheckCircle2 } from "lucide-react";

export function WeeklyScheduleView({
  members,
  currentMember,
  weeklySchedules,
  updateWeeklySchedule,
  submitMealRequest,
  isManager,
}: {
  members: any[];
  currentMember: any;
  weeklySchedules: any[];
  updateWeeklySchedule: (memberId: string, dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", value: boolean) => void;
  submitMealRequest?: (req: any) => void;
  isManager: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember?.id || members[0]?.id || "");
  const [pendingChanges, setPendingChanges] = useState<{ dayOfWeek: string; meal: "breakfast" | "lunch" | "dinner"; value: boolean }[]>([]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!isManager && currentMember?.id) {
      setSelectedMemberId(currentMember.id);
    }
  }, [isManager, currentMember?.id]);

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

  const handleToggle = (dayOfWeek: string, meal: "breakfast" | "lunch" | "dinner", currentVal: boolean) => {
    if (isManager) {
      updateWeeklySchedule(selectedMemberId, dayOfWeek, meal, !currentVal);
    } else {
      setPendingChanges(prev => {
        const existingIdx = prev.findIndex(p => p.dayOfWeek === dayOfWeek && p.meal === meal);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const newTargetVal = !currentVal;
          if (updated[existingIdx].value === currentVal) {
            updated.splice(existingIdx, 1);
          } else {
            updated[existingIdx] = { dayOfWeek, meal, value: newTargetVal };
          }
          return updated;
        } else {
          return [...prev, { dayOfWeek, meal, value: !currentVal }];
        }
      });
    }
  };

  const handleSubmitWeeklyRequest = () => {
    if (!pendingChanges.length || !submitMealRequest) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const summaryText = pendingChanges.map(c => `${c.dayOfWeek} ${c.meal.toUpperCase()} -> ${c.value ? "ON" : "OFF"}`).join(", ");
    submitMealRequest({
      startDate: todayStr,
      endDate: "Recurring Every Week",
      meals: { breakfast: true, lunch: true, dinner: true },
      weeklyScheduleChanges: pendingChanges,
      reason: `Weekly Recurring Schedule Change Request (${summaryText})`,
    });
    setPendingChanges([]);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-indigo-50 border-indigo-100 flex items-start gap-3">
        <Settings2 size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-indigo-800">
          <strong className="font-bold">Recurring Weekly Preference (স্থায়ী রুটিন টেমপ্লেট): </strong>
          {isManager
            ? "Set default meal preferences for members. Changes apply permanently to all current & upcoming weeks."
            : "Set your permanent default meal preferences for every week (e.g. Every Friday Lunch OFF). Once approved by Manager, it automatically applies to all current and upcoming weeks."}
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
            const origB = entry ? entry.breakfast : true;
            const origL = entry ? entry.lunch : true;
            const origDin = entry ? entry.dinner : true;

            const changeB = pendingChanges.find(p => p.dayOfWeek === d.key && p.meal === "breakfast");
            const changeL = pendingChanges.find(p => p.dayOfWeek === d.key && p.meal === "lunch");
            const changeDin = pendingChanges.find(p => p.dayOfWeek === d.key && p.meal === "dinner");

            const b = changeB ? changeB.value : origB;
            const l = changeL ? changeL.value : origL;
            const din = changeDin ? changeDin.value : origDin;

            return (
              <div key={d.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">{d.name}</p>
                  <p className="text-[11px] text-slate-400">Default schedule for every {d.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { key: "breakfast" as const, label: "Breakfast (B)", val: b, modified: !!changeB },
                    { key: "lunch" as const, label: "Lunch (L)", val: l, modified: !!changeL },
                    { key: "dinner" as const, label: "Dinner (D)", val: din, modified: !!changeDin },
                  ].map(({ key, label, val, modified }) => (
                    <button
                      key={key}
                      onClick={() => handleToggle(d.key, key, val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                        val
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-400 border-slate-200 hover:border-indigo-200"
                      } ${modified ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
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

      {!isManager && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border-indigo-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {pendingChanges.length > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  {pendingChanges.length} Preference Change(s) Drafted
                </>
              ) : (
                "Submit Weekly Recurring Schedule Change Request"
              )}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingChanges.length > 0
                ? "Click the button to send these weekly schedule preferences to your Manager for approval."
                : "Toggle your desired B/L/D preferences above, then click submit to send request to Manager."}
            </p>
          </div>

          <Btn
            disabled={pendingChanges.length === 0}
            onClick={handleSubmitWeeklyRequest}
            className={pendingChanges.length > 0 ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" : ""}
          >
            {submittedSuccess ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Send size={14} />}
            {submittedSuccess ? "Request Submitted!" : "Submit Request to Manager"}
          </Btn>
        </Card>
      )}
    </div>
  );
}
