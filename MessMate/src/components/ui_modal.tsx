import React from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  step,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (v: string) => void;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        step={step}
        onChange={e => onChange && onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

export function Select({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: (string | { label: string; value: string })[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      >
        {options.map(opt => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}
