import { useState } from "react";
import { Menu, Bell, ChevronDown, Building2, Check } from "lucide-react";
import { UserRole } from "../types";
import { Page } from "./Sidebar";
import { useApp } from "../context/AppContext";

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "meals.daily": "Daily Meals",
  "meals.summary": "Meal Summary",
  "meals.requests": "Meal Requests",
  "meals.guests": "Guest Meals",
  "market.duty": "Market Duty",
  "market.expenses": "Market Expenses",
  "finance.wallets": "Wallets",
  "finance.expenses": "Expenses & Payments",
  "finance.bills": "Bills",
  "finance.fines": "Fines",
  settlement: "Monthly Settlement",
  notifications: "Notifications",
  members: "Members",
  reports: "Reports",
  settings: "Settings",
};

interface Props {
  onMenuClick: () => void;
  role: UserRole;
  onRoleChange?: (r: UserRole) => void;
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onOpenProfile?: () => void;
}

export default function Header({ onMenuClick, role, onRoleChange, currentPage, onNavigate, onOpenProfile }: Props) {
  const { currentHouse, houses, switchHouse, notifications, currentMember } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
        <Menu size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 truncate">{PAGE_LABELS[currentPage] || "Dashboard"}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">August 2026 · {currentHouse.name}</p>
      </div>

      {/* House switcher dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(open => !open)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Building2 size={13} className="text-slate-400" />
          <span>{currentHouse.name}</span>
          <ChevronDown size={12} className="text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch House</p>
            </div>
            {houses.map(h => (
              <button
                key={h.id}
                onClick={() => { switchHouse(h.id); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{h.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{h.address}</p>
                </div>
                {h.id === currentHouse.id && <Check size={14} className="text-indigo-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>


      <button onClick={() => onNavigate("notifications")} className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <button
        type="button"
        onClick={onOpenProfile}
        className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 py-1 px-1.5 rounded-lg transition-colors group cursor-pointer"
        title="Edit Profile"
      >
        <div className="w-8 h-8 bg-indigo-600 group-hover:bg-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm transition-colors">
          {currentMember?.avatar || currentMember?.name?.slice(0, 2).toUpperCase() || "MM"}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{currentMember?.name || "Member"}</p>
          <p className="text-[10px] text-slate-400 capitalize">{role}</p>
        </div>
      </button>
    </header>
  );
}
