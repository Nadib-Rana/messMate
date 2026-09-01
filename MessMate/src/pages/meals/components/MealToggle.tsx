export function MealToggle({ on, label, onClick, disabled }: { on: boolean; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Only today's meals can be toggled" : `Toggle ${label}`}
      className={`flex flex-col items-center gap-0.5 transition-transform ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95 cursor-pointer"}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
        ${on ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}>
        {label[0]}
      </div>
    </button>
  );
}
