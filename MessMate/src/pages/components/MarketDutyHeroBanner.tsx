import { ShoppingBasket, Calendar, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { Avatar } from "../../components/ui";
import { Page } from "../../components/Sidebar";

export function MarketDutyHeroBanner({
  todayDuty,
  nextDuty,
  currentMember,
  onNavigate,
}: {
  todayDuty: any;
  nextDuty?: any;
  currentMember?: any;
  onNavigate?: (page: Page) => void;
}) {
  const isMyDutyToday = todayDuty && (todayDuty.memberId === currentMember?.id || (currentMember?.name && todayDuty.memberName === currentMember.name));

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all shadow-md ${
      isMyDutyToday
        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-2 border-emerald-300"
        : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/20"
    }`}>
      {/* Background Glow Accents */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-1/3 -top-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Side: Badge & Label */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
            isMyDutyToday ? "bg-white text-emerald-700 font-bold" : "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white"
          }`}>
            <ShoppingBasket size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isMyDutyToday ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
              }`}>
                🛒 Active Market Duty
              </span>
              {isMyDutyToday && (
                <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                  <Sparkles size={12} /> YOUR DUTY TODAY!
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              {todayDuty ? todayDuty.memberName : "No Duty Assigned Today"}
            </h2>
            {todayDuty && (
              <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
                <Calendar size={13} className="shrink-0" />
                <span>Duty Period: <strong className="font-semibold">{todayDuty.startDate} &mdash; {todayDuty.endDate}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
          {nextDuty && (
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
              <span className="opacity-75 block text-[10px] uppercase font-bold tracking-wider">Up Next</span>
              <span className="font-bold">{nextDuty.memberName}</span>
              <span className="opacity-75 text-[11px] ml-1.5">({nextDuty.startDate})</span>
            </div>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate("market.duty")}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                isMyDutyToday
                  ? "bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 border border-indigo-400/30"
              }`}
            >
              <span>View Duty Schedule</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
