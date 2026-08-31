import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Tabs, Btn } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { calculateDailyMealWeight } from "../../engine/mealEngine";

function MealToggle({ on, label, onClick }: { on: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 transition-transform active:scale-95 cursor-pointer`}
      title={`Toggle ${label}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
        ${on ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}>
        {label[0]}
      </div>
    </button>
  );
}

export default function DailyMeals() {
  const { dailyMeals, members, currentHouse, toggleDailyMeal } = useApp();
  const [view, setView] = useState("Table");

  const { mealWeights } = currentHouse.setting;

  return (
    <div>
      <PageHeader
        title="Daily Meals"
        subtitle="Track daily meal consumption for each member"
        action={
          <div className="flex gap-2">
            <Tabs tabs={["Table", "Calendar"]} active={view} onChange={setView} />
            <Btn size="sm" variant="primary">Override</Btn>
          </div>
        }
      />

      {/* Legend */}
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
      </div>

      <div className="space-y-4">
        {dailyMeals.map(day => {
          const totalMeals = day.members.reduce((acc, m) => {
            return acc + calculateDailyMealWeight(m.breakfast, m.lunch, m.dinner, mealWeights);
          }, 0);

          return (
            <Card key={day.date} className="overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{day.date}</p>
                    <p className="text-xs text-slate-500">{day.day}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Total: <strong className="text-slate-800">{totalMeals} meals</strong></span>
                  <Badge variant="info">{day.members.filter(m => m.lunch || m.dinner).length} active</Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500">Member</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500">Breakfast</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500">Lunch</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500">Dinner</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Meals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.members.map(dm => {
                      const member = members.find(m => m.id === dm.id);
                      if (!member) return null;
                      const meals = calculateDailyMealWeight(dm.breakfast, dm.lunch, dm.dinner, mealWeights);

                      return (
                        <tr key={dm.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar initials={member.avatar} size="sm" />
                              <span className="text-sm font-medium text-slate-800">{member.name}</span>
                              {dm.isOverride && <Badge variant="warning">Override</Badge>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <MealToggle
                              on={dm.breakfast}
                              label="Breakfast"
                              onClick={() => toggleDailyMeal(day.date, dm.id, "breakfast")}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <MealToggle
                              on={dm.lunch}
                              label="Lunch"
                              onClick={() => toggleDailyMeal(day.date, dm.id, "lunch")}
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <MealToggle
                              on={dm.dinner}
                              label="Dinner"
                              onClick={() => toggleDailyMeal(day.date, dm.id, "dinner")}
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="text-sm font-bold text-slate-800 font-mono">{meals}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
