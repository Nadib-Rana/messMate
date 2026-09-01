import { Card, Badge, Avatar } from "../../../components/ui";
import { Clock, CheckCircle, Trash2 } from "lucide-react";

const statusConfig: Record<string, { variant: "success" | "warning" | "info" | "neutral"; icon: React.ReactNode; label: string }> = {
  current: { 
    variant: "success", 
    icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />, 
    label: "Active (On Duty)" 
  },
  upcoming: { variant: "info", icon: <Clock size={10} />, label: "Upcoming" },
  completed: { variant: "neutral", icon: <CheckCircle size={10} />, label: "Completed" },
};

export function DutyCardGrid({
  marketDuties,
  members,
  deleteMarketDuty,
}: {
  marketDuties: any[];
  members: any[];
  deleteMarketDuty: (id: string) => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {marketDuties.map(d => {
        const isCurrent = (d.startDate && d.endDate && todayStr >= d.startDate && todayStr <= d.endDate) || d.status === "current";
        const isCompleted = d.endDate && todayStr > d.endDate;
        const effectiveStatus = isCurrent ? "current" : isCompleted ? "completed" : "upcoming";
        const cfg = statusConfig[effectiveStatus] || statusConfig.upcoming;
        const member = members.find(m => m.id === d.memberId) || members[0];
        return (
          <Card
            key={d.id}
            className={`p-4 relative group transition-all ${
              isCurrent
                ? "border-emerald-400 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-sm"
                : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar initials={member?.avatar || "MB"} size="sm" color={isCurrent ? "bg-emerald-600" : undefined} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900">{d.memberName}</p>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{d.startDate} – {d.endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
                <button
                  onClick={() => deleteMarketDuty(d.id)}
                  title="Remove duty"
                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {d.notes && <p className="text-xs text-slate-500 mb-2 bg-slate-50 p-2 rounded-lg">{d.notes}</p>}
          </Card>
        );
      })}
    </div>
  );
}
