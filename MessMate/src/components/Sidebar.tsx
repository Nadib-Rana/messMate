import {
  LayoutDashboard, Utensils, ShoppingBasket, Wallet, Bell, Settings,
  FileBarChart2, Users, ChevronDown, ChevronRight, X, LogOut,
  Calendar, Receipt, Gavel, CreditCard, FileText, Gift
} from "lucide-react";
import { useState } from "react";
import { UserRole } from "../data/mock";

export type Page =
  | "dashboard"
  | "meals.daily" | "meals.summary" | "meals.requests" | "meals.guests"
  | "market.duty" | "market.expenses"
  | "finance.wallets" | "finance.expenses" | "finance.bills" | "finance.fines"
  | "settlement"
  | "notifications"
  | "members"
  | "reports"
  | "settings";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  page?: Page;
  children?: { label: string; page: Page; icon: React.ReactNode }[];
  managerOnly?: boolean;
};

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} />, page: "dashboard" },
  {
    id: "meals", label: "Meals", icon: <Utensils size={17} />,
    children: [
      { label: "Daily Meals", page: "meals.daily", icon: <Calendar size={14} /> },
      { label: "Meal Summary", page: "meals.summary", icon: <FileText size={14} /> },
      { label: "Meal Requests", page: "meals.requests", icon: <Receipt size={14} /> },
      { label: "Guest Meals", page: "meals.guests", icon: <Gift size={14} /> },
    ]
  },
  {
    id: "market", label: "Market", icon: <ShoppingBasket size={17} />,
    children: [
      { label: "Market Duty", page: "market.duty", icon: <Calendar size={14} /> },
      { label: "Market Expenses", page: "market.expenses", icon: <Receipt size={14} /> },
    ]
  },
  {
    id: "finance", label: "Finance", icon: <Wallet size={17} />,
    children: [
      { label: "Wallets", page: "finance.wallets", icon: <Wallet size={14} /> },
      { label: "Payments", page: "finance.expenses", icon: <CreditCard size={14} /> },
      { label: "Expenses", page: "finance.expenses", icon: <Receipt size={14} /> },
      { label: "Bills", page: "finance.bills", icon: <FileText size={14} /> },
      { label: "Fines", page: "finance.fines", icon: <Gavel size={14} />, },
    ]
  },
  { id: "settlement", label: "Settlement", icon: <FileBarChart2 size={17} />, page: "settlement" },
  { id: "notifications", label: "Notifications", icon: <Bell size={17} />, page: "notifications" },
  { id: "members", label: "Members", icon: <Users size={17} />, page: "members", managerOnly: true },
  { id: "reports", label: "Reports", icon: <FileBarChart2 size={17} />, page: "reports" },
  { id: "settings", label: "Settings", icon: <Settings size={17} />, page: "settings", managerOnly: true },
];

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  role: UserRole;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

import { useApp } from "../context/AppContext";

export default function Sidebar({ currentPage, onNavigate, role, open, onClose, onLogout }: Props) {
  const { currentHouse, notifications } = useApp();
  const [expanded, setExpanded] = useState<string[]>(["meals", "market", "finance"]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggle = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  const navigate = (page: Page) => { onNavigate(page); onClose(); };

  const isActive = (page?: Page) => page === currentPage;
  const isGroupActive = (item: NavItem) => item.children?.some(c => c.page === currentPage);

  const visibleNav = role === "manager" ? NAV : NAV.filter(n => !n.managerOnly);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Utensils size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">MessMate</span>
        </div>
        <div className="mt-3 px-2 py-1.5 bg-white/10 rounded-lg">
          <p className="text-xs text-slate-400 font-medium">Current House</p>
          <p className="text-sm text-white font-semibold truncate">{currentHouse.name}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {visibleNav.map(item => {
            if (item.children) {
              const isOpen = expanded.includes(item.id);
              const groupActive = isGroupActive(item);
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${groupActive ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className={groupActive ? "text-indigo-300" : ""}>{item.icon}</span>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  {isOpen && (
                    <div className="ml-8 mt-0.5 space-y-0.5">
                      {item.children.map(child => (
                        <button
                          key={child.page + child.label}
                          onClick={() => navigate(child.page)}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors
                            ${isActive(child.page) ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                          {child.icon}
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => item.page && navigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive(item.page) ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">NH</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Nadib Hasan</p>
            <p className="text-xs text-indigo-300 capitalize">{role}</p>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 bg-slate-900 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative w-56 bg-slate-900 flex flex-col z-10">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
