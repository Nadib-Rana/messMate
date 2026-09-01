import { Card, Badge, Avatar } from "../../components/ui";

const mealPlanBadge: Record<string, "success" | "info" | "default" | "warning" | "danger"> = {
  Full: "success",
  "Lunch + Dinner": "info",
  "Lunch only": "default",
  "Breakfast + Dinner": "warning",
  Off: "danger",
};

export function MemberWeeklyOverview({ members }: { members: any[] }) {
  return (
    <Card className="mt-6 p-5 overflow-hidden">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Weekly Meal Plan Overview</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 text-slate-500 font-semibold">Member</th>
              <th className="text-left py-2 px-3 text-slate-500 font-semibold">Active Meal Plan</th>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <th key={d} className="py-2 px-2 text-center text-slate-500 font-semibold">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <Avatar initials={m.avatar} size="sm" />
                    <span className="font-medium text-slate-700">{m.name.split(" ")[0]}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant={mealPlanBadge[m.mealPlan] || "default"}>
                    {m.mealPlan || "Full"}
                  </Badge>
                </td>
                {[true, true, true, true, true, true, true].map((active, i) => (
                  <td key={i} className="py-2.5 px-2 text-center">
                    <div className="flex justify-center gap-0.5">
                      {["B", "L", "D"].map((meal, mi) => {
                        const hasNoB = m.mealPlan === "Lunch + Dinner" || m.mealPlan === "Lunch only";
                        const hasNoL = m.mealPlan === "Breakfast + Dinner" || m.mealPlan === "Off";
                        const hasNoD = m.mealPlan === "Lunch only" || m.mealPlan === "Off";

                        let on = true;
                        if (mi === 0 && hasNoB) on = false;
                        if (mi === 1 && hasNoL) on = false;
                        if (mi === 2 && hasNoD) on = false;

                        return (
                          <span
                            key={meal}
                            className={`w-4 h-4 rounded-sm text-[8px] flex items-center justify-center font-bold
                              ${on ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-300"}`}
                          >
                            {meal}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
