import { useState } from "react";
import { X } from "lucide-react";

export function OverrideModal({ members, onClose, onSave }: {
  members: any[];
  onClose: () => void;
  onSave: (memberId: string, date: string, breakfast: boolean, lunch: boolean, dinner: boolean) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedMember, setSelectedMember] = useState(members[0]?.id || "");
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);

  const handleSave = () => {
    if (!selectedMember || !date) return;
    onSave(selectedMember, date, breakfast, lunch, dinner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manual Override</h2>
            <p className="text-xs text-slate-500 mt-0.5">Override meal status for any member on any date</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Member</label>
            <select
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-3">Meals</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { key: "breakfast" as const, label: "Breakfast", val: breakfast, set: setBreakfast },
                { key: "lunch" as const, label: "Lunch", val: lunch, set: setLunch },
                { key: "dinner" as const, label: "Dinner", val: dinner, set: setDinner },
              ]).map(({ label, val, set }) => (
                <button
                  key={label}
                  onClick={() => set(!val)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    val
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors"
          >
            Save Override
          </button>
        </div>
      </div>
    </div>
  );
}
