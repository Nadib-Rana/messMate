import { useState } from "react";
import { PageHeader, Card, Btn, Input, Tabs } from "../components/ui";
import { useApp } from "../context/AppContext";
import { SettingsMealTab } from "./components/SettingsMealTab";
import { SettingsDutyAndFines } from "./components/SettingsOtherTabs";

const TABS = ["House", "Meals", "Market Duty", "Fines", "Notifications"];

export default function Settings() {
  const { currentHouse, updateSettings } = useApp();
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

  const triggerSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

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
    updateSettings({ lowWalletThreshold: parseFloat(walletThreshold) || 500 });
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
        </div>
      )}

      {activeTab === "Meals" && (
        <SettingsMealTab
          mealWeights={mealWeights}
          setMealWeights={setMealWeights}
          guestMealRule={guestMealRule}
          setGuestMealRule={setGuestMealRule}
          onSaveWeights={handleSaveWeights}
          onSaveGuestRule={handleSaveGuestRule}
        />
      )}

      <SettingsDutyAndFines
        activeTab={activeTab}
        dutyDuration={dutyDuration}
        setDutyDuration={setDutyDuration}
        onSaveDutyDuration={handleSaveDutyDuration}
        triggerSaved={triggerSaved}
      />
    </div>
  );
}
