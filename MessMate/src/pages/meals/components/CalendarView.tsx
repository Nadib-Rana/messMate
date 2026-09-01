import { useState, useMemo } from "react";
import { Card, Avatar } from "../../../components/ui";
import { calculateDailyMealWeight } from "../../../engine/mealEngine";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarView({ dailyMeals, members, mealWeights }: { dailyMeals: any[]; members: any[]; mealWeights: any }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const mealMap = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    for (const day of dailyMeals) {
      const total = day.members.reduce((a: number, m: any) =>
        a + calculateDailyMealWeight(m.breakfast, m.lunch, m.dinner, mealWeights), 0);
      map[day.date] = { total, active: day.members.filter((m: any) => m.lunch || m.dinner).length };
    }
    return map;
  }, [dailyMeals, mealWeights]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft size={16} className="text-slate-600" />
        </button>
        <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
        <button
          onClick={nextMonth}
          disabled={month === today.getMonth() && year === today.getFullYear()}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} className="text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = mealMap[dateStr];
          const isToday = dateStr === today.toISOString().split("T")[0];
          const isFuture = dateStr > today.toISOString().split("T")[0];

          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-colors
                ${isToday ? "bg-indigo-600 text-white" : data ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-slate-50"}
                ${isFuture ? "opacity-30" : ""}`}
            >
              <span className={`text-xs font-bold ${isToday ? "text-white" : "text-slate-700"}`}>{day}</span>
              {data && (
                <span className={`text-[10px] font-mono mt-0.5 ${isToday ? "text-indigo-200" : "text-indigo-500"}`}>
                  {data.total.toFixed(1)}m
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" />Today</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-50 border border-indigo-200 inline-block" />Has meals</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 inline-block" />No data</span>
      </div>

      {members.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 mb-3">Month Summary — {monthName}</p>
          <div className="space-y-2">
            {members.map(member => {
              const totalMeals = dailyMeals
                .filter(d => d.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
                .reduce((acc, d) => {
                  const mm = d.members.find((m: any) => m.id === member.id);
                  return acc + (mm ? calculateDailyMealWeight(mm.breakfast, mm.lunch, mm.dinner, mealWeights) : 0);
                }, 0);
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar initials={member.avatar} size="sm" />
                  <span className="flex-1 text-xs font-medium text-slate-700">{member.name}</span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">{totalMeals.toFixed(1)} meals</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
