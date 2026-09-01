import { Card, Input, Btn } from "../../components/ui";

export function SettingsMealTab({
  mealWeights,
  setMealWeights,
  guestMealRule,
  setGuestMealRule,
  onSaveWeights,
  onSaveGuestRule,
}: {
  mealWeights: { breakfast: string; lunch: string; dinner: string };
  setMealWeights: React.Dispatch<React.SetStateAction<{ breakfast: string; lunch: string; dinner: string }>>;
  guestMealRule: any;
  setGuestMealRule: (v: any) => void;
  onSaveWeights: () => void;
  onSaveGuestRule: () => void;
}) {
  return (
    <div className="space-y-4 max-w-xl">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Meal Weights</h3>
        <p className="text-xs text-slate-500 mb-4">Set the relative weight of each meal type for rate calculation</p>
        <div className="space-y-3">
          <Input label="Breakfast Weight" type="number" step="0.1" value={mealWeights.breakfast} onChange={v => setMealWeights(w => ({ ...w, breakfast: v }))} />
          <Input label="Lunch Weight" type="number" step="0.1" value={mealWeights.lunch} onChange={v => setMealWeights(w => ({ ...w, lunch: v }))} />
          <Input label="Dinner Weight" type="number" step="0.1" value={mealWeights.dinner} onChange={v => setMealWeights(w => ({ ...w, dinner: v }))} />
          <div className="flex justify-end">
            <Btn onClick={onSaveWeights}>Save Weights</Btn>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Guest Meal Policy</h3>
        <div className="space-y-3">
          {["Host Pays", "House Shared"].map(rule => (
            <label key={rule} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/70">
              <input type="radio" name="guestRule" value={rule} checked={guestMealRule === rule} onChange={() => setGuestMealRule(rule)} className="text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="text-xs font-semibold text-slate-800">{rule}</p>
                <p className="text-[11px] text-slate-500">{rule === "Host Pays" ? "Cost is added to the hosting member's total" : "Cost is split equally among all members"}</p>
              </div>
            </label>
          ))}
          <div className="flex justify-end">
            <Btn onClick={onSaveGuestRule}>Save Guest Policy</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
