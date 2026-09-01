import { useState } from "react";
import { PageHeader, Tabs, Btn } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Calendar as CalIcon } from "lucide-react";

import { OverrideModal } from "./components/OverrideModal";
import { CalendarView } from "./components/CalendarView";
import { WeeklyScheduleView } from "./components/WeeklyScheduleView";
import { DailyMealTable } from "./components/DailyMealTable";

export default function DailyMeals() {
  const {
    dailyMeals,
    members,
    currentHouse,
    toggleDailyMeal,
    setMealExplicit,
    weeklySchedules,
    updateWeeklySchedule,
    currentMember,
  } = useApp();

  const [view, setView] = useState("Table");
  const [showOverride, setShowOverride] = useState(false);

  const { mealWeights } = currentHouse.setting;
  const isManager = currentMember?.role === "manager";

  const handleOverrideSave = (memberId: string, date: string, breakfast: boolean, lunch: boolean, dinner: boolean) => {
    setMealExplicit(memberId, date, breakfast, lunch, dinner);
  };

  return (
    <div>
      <PageHeader
        title="Daily Meals"
        subtitle="Track daily meal consumption and recurring weekly schedules"
        action={
          <div className="flex gap-2">
            <Tabs tabs={["Table", "Calendar", "Weekly Schedule"]} active={view} onChange={setView} />
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
          isManager={isManager}
        />
      )}

      {view === "Table" && (
        <>
          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">B</span>
              Breakfast ({mealWeights.breakfast})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">L</span>
              Lunch ({mealWeights.lunch})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">D</span>
              Dinner ({mealWeights.dinner})
            </span>
            {isManager && (
              <span className="ml-auto text-slate-400 italic">Toggles only active on today's row</span>
            )}
          </div>

          <DailyMealTable
            dailyMeals={dailyMeals}
            members={members}
            mealWeights={mealWeights}
            isManager={isManager}
            toggleDailyMeal={toggleDailyMeal}
          />
        </>
      )}
    </div>
  );
}
