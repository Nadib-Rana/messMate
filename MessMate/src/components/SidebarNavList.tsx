import { ChevronDown, ChevronRight } from "lucide-react";
import { Page } from "./Sidebar";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  page?: Page;
  children?: { label: string; page: Page; icon: React.ReactNode }[];
  managerOnly?: boolean;
};

export function SidebarNavList({
  visibleNav,
  expanded,
  toggle,
  currentPage,
  navigate,
  unreadCount,
}: {
  visibleNav: NavItem[];
  expanded: string[];
  toggle: (id: string) => void;
  currentPage: Page;
  navigate: (p: Page) => void;
  unreadCount: number;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {visibleNav.map(item => {
        if (item.children) {
          const isExp = expanded.includes(item.id);
          const hasActiveChild = item.children.some(c => c.page === currentPage);
          return (
            <div key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  hasActiveChild ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isExp && (
                <div className="ml-5 pl-2.5 border-l border-white/10 mt-1 space-y-0.5">
                  {item.children.map(c => {
                    const isChildActive = c.page === currentPage;
                    return (
                      <button
                        key={c.page}
                        onClick={() => navigate(c.page)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isChildActive ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {c.icon}
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const isAct = item.page === currentPage;
        return (
          <button
            key={item.id}
            onClick={() => item.page && navigate(item.page)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isAct ? "text-white bg-indigo-600 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.id === "notifications" && unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
