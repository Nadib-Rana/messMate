import {
  LayoutDashboard, Utensils, ShoppingBasket, Wallet, Bell, Settings,
  FileBarChart2, Users, X, LogOut, Calendar, Receipt, Gavel, FileText, Gift, User
} from "lucide-react";
import { useState } from "react";
import { UserRole } from "../types";
import { useApp } from "../context/AppContext";
import { SidebarNavList, NavItem } from "./SidebarNavList";

export type Page =
  | "dashboard"
  | "meals.daily" | "meals.summary" | "meals.requests" | "meals.guests"
  | "market.duty" | "market.expenses"
  | "finance.wallets" | "finance.expenses" | "finance.bills" | "finance.fines"
  | "settlement" | "notifications" | "members" | "reports" | "settings";

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
      { label: "Wallets & Deposits", page: "finance.wallets", icon: <Wallet size={14} /> },
      { label: "Expenses", page: "finance.expenses", icon: <Receipt size={14} /> },
      { label: "Bills", page: "finance.bills", icon: <FileText size={14} /> },
      { label: "Fines", page: "finance.fines", icon: <Gavel size={14} /> },
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
  onOpenProfile?: () => void;
}

export default function Sidebar({ currentPage, onNavigate, role, open, onClose, onLogout, onOpenProfile }: Props) {
  const { currentHouse, notifications } = useApp();
  const [expanded, setExpanded] = useState<string[]>(["meals", "market", "finance"]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const toggle = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
  const navigate = (page: Page) => { onNavigate(page); onClose(); };
  const visibleNav = role === "manager" ? NAV : NAV.filter(n => !n.managerOnly);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Utensils size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">MessMate</span>
        </div>
        <div className="mt-3 px-2 py-1.5 bg-white/10 rounded-lg">
          <p className="text-xs text-slate-400 font-medium">Current House</p>
          <p className="text-xs text-white font-semibold truncate">{currentHouse?.name || "Mess"}</p>
        </div>
      </div>

      <SidebarNavList
        visibleNav={visibleNav}
        expanded={expanded}
        toggle={toggle}
        currentPage={currentPage}
        navigate={navigate}
        unreadCount={unreadCount}
      />

      <div className="p-3 border-t border-white/10 space-y-1">
        {onOpenProfile && (
          <button
            onClick={() => { onOpenProfile(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <User size={16} /> My Profile
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-30 shadow-xl">{sidebarContent}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
          <div className="relative w-64 h-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
