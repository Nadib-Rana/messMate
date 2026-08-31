import { useState } from "react";
import { PageHeader, Card, Btn, Input, Select, Tabs } from "../components/ui";
import { useApp } from "../context/AppContext";

const TABS = ["House", "Meals", "Market Duty", "Fines", "Notifications"];

export default function Settings() {
  const { currentHouse, updateSettings, members } = useApp();
  const [activeTab, setActiveTab] = useState("House");

  const [mealWeights, setMealWeights] = useState({
    breakfast: currentHouse.setting.mealWeights.breakfast.toString(),
    lunch: currentHouse.setting.mealWeights.lunch.toString(),
    dinner: currentHouse.setting.mealWeights.dinner.toString(),
  });
  const [walletThreshold, setWalletThreshold] = useState(currentHouse.setting.lowWalletThreshold.toString());
  const [guestMealRule, setGuestMealRule] = useState<any>(currentHouse.setting.guestMealRule);
  const [dutyDuration, setDutyDuration] = useState(currentHouse.setting.dutyDurationDays.toString());
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveWeights = () => {
    updateSettings({
      mealWeights: {
        breakfast: parseFloat(mealWeights.breakfast) || 0.5,
        lunch: parseFloat(mealWeights.lunch) || 1.0,
        dinner: parseFloat(mealWeights.dinner) || 1.0,
      },
    });
    triggerSaved();
  };

  const handleSaveThreshold = () => {
    updateSettings({
      lowWalletThreshold: parseFloat(walletThreshold) || 500,
    });
    triggerSaved();
  };

  const handleSaveGuestRule = () => {
    updateSettings({ guestMealRule });
    triggerSaved();
  };

  const handleSaveDutyDuration = () => {
    updateSettings({ dutyDurationDays: parseInt(dutyDuration) || 3 });
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div>
      <PageHeader title="House Settings" subtitle={`Configure rules and preferences for ${currentHouse.name}`} />

      {savedMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          Settings saved successfully!
        </div>
      )}

      <div className="mb-6">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "House" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">House Information</h3>
            <div className="space-y-4">
              <Input label="House / Mess Name" value={currentHouse.name} />
              <Input label="Address" value={currentHouse.address} />
              <Input label="Invite Code" value={currentHouse.inviteCode} />
              <div className="flex justify-end">
                <Btn onClick={triggerSaved}>Save Changes</Btn>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Wallet Alert Threshold</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Minimum balance before alert</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">৳</span>
                  <input
                    type="number"
                    value={walletThreshold}
                    onChange={e => setWalletThreshold(e.target.value)}
                    className="w-32 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Members with balance below ৳{walletThreshold} will show as "Low Balance"</p>
              </div>
              <div className="flex justify-end">
                <Btn onClick={handleSaveThreshold}>Save Threshold</Btn>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-red-100">
            <h3 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h3>
            <p className="text-xs text-slate-500 mb-4">These actions cannot be undone easily.</p>
            <div className="flex gap-3">
              <Btn variant="danger" size="sm">Delete House</Btn>
              <Btn variant="secondary" size="sm">Transfer Manager</Btn>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Meals" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Meal Weights</h3>
            <p className="text-xs text-slate-500 mb-4">Configure fractional meal values for rate calculation.</p>
            <div className="space-y-3">
              {(["breakfast", "lunch", "dinner"] as const).map(meal => (
                <div key={meal} className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700 capitalize w-24">{meal}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="2"
                    value={mealWeights[meal]}
                    onChange={e => setMealWeights(w => ({ ...w, [meal]: e.target.value }))}
                    className="w-24 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400">meals</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
              Full day (B+L+D) = {(parseFloat(mealWeights.breakfast || "0.5") + parseFloat(mealWeights.lunch || "1") + parseFloat(mealWeights.dinner || "1")).toFixed(1)} meals
            </div>
            <div className="mt-4 flex justify-end">
              <Btn onClick={handleSaveWeights}>Save Meal Weights</Btn>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Guest Meal Rule</h3>
            <Select label="Default guest meal cost goes to" options={["Host Pays", "House Pays", "Custom"]} value={guestMealRule} onChange={setGuestMealRule} />
            <div className="mt-4 flex justify-end">
              <Btn onClick={handleSaveGuestRule}>Save Rule</Btn>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Market Duty" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Rotation Settings</h3>
            <div className="space-y-4">
              <Select label="Rotation Mode" options={["Auto-rotate by days", "Manual Assignment", "Fixed schedule"]} />
              <Input label="Duty Duration (days)" value={dutyDuration} onChange={setDutyDuration} />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Rotation Order</label>
                <div className="space-y-1.5">
                  {members.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs font-mono text-slate-400 w-4">{i + 1}.</span>
                      <span className="text-sm text-slate-700 flex-1">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Btn onClick={handleSaveDutyDuration}>Save Rotation Settings</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Fines" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Fine Rules</h3>
            <div className="space-y-4">
              <Select label="Fine money allocated to" options={["House fund", "Shared equally"]} />
              <div className="flex justify-end">
                <Btn onClick={triggerSaved}>Save Rules</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                "Low wallet balance alert",
                "Meal stop request submitted",
                "Meal stop approved / rejected",
                "Market duty assigned",
                "Market expense submitted",
                "Payment approved / rejected",
                "Fine applied",
                "Monthly settlement ready",
                "Manager announcements",
              ].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Btn onClick={triggerSaved}>Save Preferences</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
