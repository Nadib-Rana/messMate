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
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Meal Weights & 1-Click Rules</h3>
        <p className="text-xs text-slate-500 mb-4">Set the relative weight of each meal type for rate calculation, or use 1-Click presets.</p>
        
        {/* 1-Click Manager Presets */}
        <div className="mb-4 p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 rounded-xl border border-indigo-100/80 space-y-2.5">
          <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>⚡ Manager 1-Click Quick Toggles</span>
            <span className="text-[10px] text-indigo-600 font-normal">Click to turn any meal slot ON/OFF for all</span>
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Breakfast Toggle */}
            <button
              type="button"
              onClick={() => {
                const newB = parseFloat(mealWeights.breakfast) > 0 ? "0" : "0.5";
                setMealWeights(w => ({ ...w, breakfast: newB }));
                setTimeout(onSaveWeights, 100);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                parseFloat(mealWeights.breakfast) > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {parseFloat(mealWeights.breakfast) > 0 ? "🚫 Turn OFF Breakfast for All" : "✅ Turn ON Breakfast for All (0.5)"}
            </button>

            {/* Lunch Toggle */}
            <button
              type="button"
              onClick={() => {
                const newL = parseFloat(mealWeights.lunch) > 0 ? "0" : "1.0";
                setMealWeights(w => ({ ...w, lunch: newL }));
                setTimeout(onSaveWeights, 100);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                parseFloat(mealWeights.lunch) > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {parseFloat(mealWeights.lunch) > 0 ? "🚫 Turn OFF Lunch for All" : "✅ Turn ON Lunch for All (1.0)"}
            </button>

            {/* Dinner Toggle */}
            <button
              type="button"
              onClick={() => {
                const newD = parseFloat(mealWeights.dinner) > 0 ? "0" : "1.0";
                setMealWeights(w => ({ ...w, dinner: newD }));
                setTimeout(onSaveWeights, 100);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                parseFloat(mealWeights.dinner) > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {parseFloat(mealWeights.dinner) > 0 ? "🚫 Turn OFF Dinner for All" : "✅ Turn ON Dinner for All (1.0)"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setMealWeights({ breakfast: "0.5", lunch: "1.0", dinner: "1.0" });
                setTimeout(onSaveWeights, 100);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors text-left flex flex-col justify-center"
            >
              <span>✅ Reset Standard 3 Meals</span>
              <span className="text-[10px] font-normal text-slate-400">Breakfast 0.5 · Lunch 1.0 · Dinner 1.0</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMealWeights({ breakfast: "0", lunch: "0", dinner: "1.0" });
                setTimeout(onSaveWeights, 100);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors text-left flex flex-col justify-center"
            >
              <span>🌙 Dinner Only (Ramadan / Fasting)</span>
              <span className="text-[10px] font-normal text-slate-400">Sets Dinner = 1.0 Only</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <Input label="Breakfast Weight" type="number" step="0.1" value={mealWeights.breakfast} onChange={v => setMealWeights(w => ({ ...w, breakfast: v }))} />
          <Input label="Lunch Weight" type="number" step="0.1" value={mealWeights.lunch} onChange={v => setMealWeights(w => ({ ...w, lunch: v }))} />
          <Input label="Dinner Weight" type="number" step="0.1" value={mealWeights.dinner} onChange={v => setMealWeights(w => ({ ...w, dinner: v }))} />
          <div className="flex justify-end">
            <Btn onClick={onSaveWeights}>Save Custom Weights</Btn>
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
