import { Card, Badge, Avatar } from "../../../components/ui";
import { calculateDailyMealWeight } from "../../../engine/mealEngine";
import { MealToggle } from "./MealToggle";
import { Calendar as CalIcon } from "lucide-react";

export function DailyMealTable({
  dailyMeals,
  members,
  mealWeights,
  isManager,
  toggleDailyMeal,
  onRequestMealChange,
}: {
  dailyMeals: any[];
  members: any[];
  mealWeights: any;
  isManager: boolean;
  toggleDailyMeal: (memberId: string, meal: "breakfast" | "lunch" | "dinner", date?: string) => void;
  onRequestMealChange?: (date: string) => void;
}) {
  if (dailyMeals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CalIcon size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">No meal records yet</p>
        <p className="text-xs text-slate-400 mt-1">Records will appear here once meals are logged</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dailyMeals.map(day => {
        const totalMeals = day.members.reduce((acc: number, m: any) => {
          return acc + calculateDailyMealWeight(m.breakfast, m.lunch, m.dinner, mealWeights);
        }, 0);
        const isToday = day.date === new Date().toISOString().split("T")[0];

        return (
          <Card key={day.date} className="overflow-hidden">
            <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between ${isToday ? "bg-indigo-50" : "bg-slate-50"}`}>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(day.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isToday && <Badge variant="success"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1" />Today</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Total: <strong className="text-slate-800">{totalMeals.toFixed(1)} meals</strong></span>
                <Badge variant="info">{day.members.filter((m: any) => m.lunch || m.dinner).length} active</Badge>
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
                  {day.members.map((dm: any) => {
                    const member = members.find(m => m.id === dm.id);
                    if (!member) return null;
                    const meals = calculateDailyMealWeight(dm.breakfast, dm.lunch, dm.dinner, mealWeights);
                    const canToggle = isManager;
                    const handleMealClick = () => {
                      if (canToggle) {
                        toggleDailyMeal(dm.id, "breakfast", day.date);
                      } else if (!isManager && onRequestMealChange) {
                        onRequestMealChange(day.date);
                      }
                    };

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
                            disabled={!canToggle && !onRequestMealChange}
                            onClick={canToggle ? () => toggleDailyMeal(dm.id, "breakfast", day.date) : (onRequestMealChange ? () => onRequestMealChange(day.date) : undefined)}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <MealToggle
                            on={dm.lunch}
                            label="Lunch"
                            disabled={!canToggle && !onRequestMealChange}
                            onClick={canToggle ? () => toggleDailyMeal(dm.id, "lunch", day.date) : (onRequestMealChange ? () => onRequestMealChange(day.date) : undefined)}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <MealToggle
                            on={dm.dinner}
                            label="Dinner"
                            disabled={!canToggle && !onRequestMealChange}
                            onClick={canToggle ? () => toggleDailyMeal(dm.id, "dinner", day.date) : (onRequestMealChange ? () => onRequestMealChange(day.date) : undefined)}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-sm font-bold text-slate-800 font-mono">{meals.toFixed(1)}</span>
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
  );
}
