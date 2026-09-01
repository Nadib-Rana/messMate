import { useState } from "react";
import { PageHeader, Tabs, Btn } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Calendar as CalIcon, Plus, AlertCircle } from "lucide-react";

import { OverrideModal } from "./components/OverrideModal";
import { EmergencyAllMealsOffModal } from "./components/EmergencyAllMealsOffModal";
import { NewMealRequestModal } from "./components/NewMealRequestModal";
import { CalendarView } from "./components/CalendarView";
import { WeeklyScheduleView } from "./components/WeeklyScheduleView";
import { DailyMealTable } from "./components/DailyMealTable";

export default function DailyMeals({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const {
    dailyMeals,
    members,
    currentHouse,
    toggleDailyMeal,
    setMealExplicit,
    weeklySchedules,
    updateWeeklySchedule,
    currentMember,
    updateSettings,
    disableAllMealsForDate,
    submitMealRequest,
    mealRequests,
  } = useApp();

  const [view, setView] = useState("Table");
  const [showOverride, setShowOverride] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMealRequestModal, setShowMealRequestModal] = useState(false);
  const [selectedRequestDate, setSelectedRequestDate] = useState<string | undefined>(undefined);

  const { mealWeights } = currentHouse.setting;
  const isManager = currentMember?.role === "manager";
  const pendingRequestsCount = mealRequests.filter(r => r.status === "pending").length;

  const handleOverrideSave = (memberId: string, date: string, breakfast: boolean, lunch: boolean, dinner: boolean) => {
    setMealExplicit(memberId, date, breakfast, lunch, dinner);
  };

  const handleOpenMealRequest = (date?: string) => {
    setSelectedRequestDate(date);
    setShowMealRequestModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Daily Meals"
        subtitle="Track daily meal consumption and recurring weekly schedules"
        action={
          <div className="flex gap-2 items-center flex-wrap">
            <Tabs tabs={["Table", "Calendar", "Weekly Schedule"]} active={view} onChange={setView} />
            {isManager && pendingRequestsCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("meals.requests")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer animate-pulse"
              >
                <AlertCircle size={14} className="text-amber-600" />
                {pendingRequestsCount} Pending Request{pendingRequestsCount > 1 ? "s" : ""}
              </button>
            )}
            {!isManager && (
              <Btn size="sm" variant="primary" onClick={() => handleOpenMealRequest()}>
                <Plus size={14} /> Request Meal Off / On
              </Btn>
            )}
            {isManager && view === "Table" && (
              <Btn size="sm" variant="primary" onClick={() => setShowOverride(true)}>
                <CalIcon size={14} /> Override
              </Btn>
            )}
          </div>
        }
      />

      {showOverride && (
        <OverrideModal
          members={members}
          onClose={() => setShowOverride(false)}
          onSave={handleOverrideSave}
        />
      )}

      {view === "Calendar" && (
        <CalendarView dailyMeals={dailyMeals} members={members} mealWeights={mealWeights} />
      )}

      {view === "Weekly Schedule" && (
        <WeeklyScheduleView
          members={members}
          currentMember={currentMember}
          weeklySchedules={weeklySchedules}
          updateWeeklySchedule={updateWeeklySchedule}
          submitMealRequest={submitMealRequest}
          isManager={isManager}
        />
      )}

      {view === "Table" && (
        <>
          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">B</span>
              Breakfast ({mealWeights.breakfast})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">L</span>
              Lunch ({mealWeights.lunch})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">D</span>
              Dinner ({mealWeights.dinner})
            </span>

            {isManager && (
              <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1-Click Rules:</span>
                <button
                  type="button"
                  onClick={() => updateSettings({ mealWeights: { breakfast: mealWeights.breakfast > 0 ? 0 : 0.5, lunch: mealWeights.lunch, dinner: mealWeights.dinner } })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
                    mealWeights.breakfast > 0
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {mealWeights.breakfast > 0 ? "🚫 Breakfast OFF" : "✅ Breakfast ON (0.5)"}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ mealWeights: { breakfast: mealWeights.breakfast, lunch: mealWeights.lunch > 0 ? 0 : 1.0, dinner: mealWeights.dinner } })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
                    mealWeights.lunch > 0
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {mealWeights.lunch > 0 ? "🚫 Lunch OFF" : "✅ Lunch ON (1.0)"}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ mealWeights: { breakfast: mealWeights.breakfast, lunch: mealWeights.lunch, dinner: mealWeights.dinner > 0 ? 0 : 1.0 } })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
                    mealWeights.dinner > 0
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {mealWeights.dinner > 0 ? "🚫 Dinner OFF" : "✅ Dinner ON (1.0)"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(true)}
                  className="px-2.5 py-1 bg-amber-500 text-white border border-amber-600 rounded-lg hover:bg-amber-600 font-bold text-xs transition-colors shadow-xs flex items-center gap-1"
                >
                  🚨 Emergency ALL Meals OFF (Select Date)
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ mealWeights: { breakfast: 0.5, lunch: 1.0, dinner: 1.0 } })}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-semibold text-xs transition-colors shadow-2xs"
                >
                  ⚡ Reset (0.5/1/1)
                </button>
              </div>
            )}
          </div>

          <DailyMealTable
            dailyMeals={dailyMeals}
            members={members}
            mealWeights={mealWeights}
            isManager={isManager}
            toggleDailyMeal={toggleDailyMeal}
            onRequestMealChange={handleOpenMealRequest}
          />
        </>
      )}

      {showEmergencyModal && (
        <EmergencyAllMealsOffModal
          open={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={(dateStr) => disableAllMealsForDate(dateStr)}
        />
      )}

      {showMealRequestModal && (
        <NewMealRequestModal
          open={showMealRequestModal}
          onClose={() => setShowMealRequestModal(false)}
          initialDate={selectedRequestDate}
          onSubmit={submitMealRequest}
        />
      )}
    </div>
  );
}
