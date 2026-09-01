import React from "react";
export { Modal, Input, Select } from "./ui_modal";

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" }) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    info: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    neutral: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>{children}</span>;
}

export function Avatar({ initials, size = "md", color }: { initials: string; size?: "xs" | "sm" | "md" | "lg"; color?: string }) {
  const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  const colors = ["bg-indigo-500", "bg-teal-500", "bg-violet-500", "bg-rose-500", "bg-amber-500"];
  const colorClass = color || colors[initials.charCodeAt(0) % colors.length];
  return <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>{initials}</div>;
}

export function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all" : ""} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = "indigo" }: { label: string; value: string; sub?: string; icon: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600", cyan: "bg-cyan-50 text-cyan-600", violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Card>
      <div className="p-5 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color] || colorMap.indigo}`}>{icon}</div>
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "md", className = "", onClick, disabled }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success"; size?: "xs" | "sm" | "md" | "lg"; className?: string; onClick?: () => void; disabled?: boolean;
}) {
  const v = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-xs",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs",
  };
  const s = { xs: "px-2 py-1 text-xs", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer ${v[variant]} ${s[size]} ${className}`}>
      {children}
    </button>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${active === tab ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export function fmt(n: number) {
  return "৳" + Math.round(n).toLocaleString();
}
