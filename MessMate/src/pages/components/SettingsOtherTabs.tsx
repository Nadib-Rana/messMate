import { Card, Input, Btn } from "../../components/ui";

export function SettingsDutyAndFines({
  activeTab,
  dutyDuration,
  setDutyDuration,
  onSaveDutyDuration,
  triggerSaved,
}: {
  activeTab: string;
  dutyDuration: string;
  setDutyDuration: (v: string) => void;
  onSaveDutyDuration: () => void;
  triggerSaved: () => void;
}) {
  if (activeTab === "Market Duty") {
    return (
      <div className="space-y-4 max-w-xl">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Market Duty Duration</h3>
          <p className="text-xs text-slate-500 mb-4">Default number of days a member stays on market duty</p>
          <div className="space-y-3">
            <Input label="Days Per Turn" type="number" value={dutyDuration} onChange={setDutyDuration} />
            <div className="flex justify-end">
              <Btn onClick={onSaveDutyDuration}>Save Duty Settings</Btn>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (activeTab === "Fines") {
    return (
      <div className="space-y-4 max-w-xl">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Fine Rules & Types</h3>
          <p className="text-xs text-slate-500 mb-4">Standard fine amounts for policy violations</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-800">Missed Duty Fine</p>
                <p className="text-[11px] text-slate-400">Charged when a member skips assigned market duty</p>
              </div>
              <span className="text-xs font-bold text-slate-800 font-mono">৳100</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-800">Late Deposit Penalty</p>
                <p className="text-[11px] text-slate-400">Charged for deposits overdue by more than 5 days</p>
              </div>
              <span className="text-xs font-bold text-slate-800 font-mono">৳50</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (activeTab === "Notifications") {
    return (
      <div className="space-y-4 max-w-xl">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Notification Preferences</h3>
          <div className="space-y-3 text-xs">
            {["Duty turn reminder (1 day before)", "Meal stop request status updates", "Low wallet balance alert (< ৳500)", "New bill / announcement published"].map((item, i) => (
              <label key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="text-slate-700 font-medium">{item}</span>
              </label>
            ))}
            <div className="flex justify-end pt-2">
              <Btn onClick={triggerSaved}>Save Preferences</Btn>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
