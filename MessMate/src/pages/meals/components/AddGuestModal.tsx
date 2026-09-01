import { useState } from "react";
import { Modal, Input, Btn, fmt } from "../../../components/ui";

export function AddGuestModal({
  open,
  onClose,
  members,
  currentMember,
  mealRate,
  onAddGuest,
}: {
  open: boolean;
  onClose: () => void;
  members: any[];
  currentMember: any;
  mealRate: number;
  onAddGuest: (guest: any) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const defaultHostId = currentMember?.id || members[0]?.id || "";
  const [guestName, setGuestName] = useState("");
  const [hostId, setHostId] = useState(defaultHostId);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [breakfast, setBreakfast] = useState(false);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);

  const mealsPerDay = (breakfast ? 0.5 : 0) + (lunch ? 1.0 : 0) + (dinner ? 1.0 : 0);
  const dayCount = startDate && endDate
    ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 1;
  const estimatedCost = mealsPerDay * dayCount * (mealRate || 42.5);

  const handleSubmit = () => {
    if (!guestName.trim() || !startDate || !endDate) return;
    const resolvedHostId = hostId || currentMember?.id || members[0]?.id;
    if (!resolvedHostId) return;
    onAddGuest({
      guestName: guestName.trim(),
      hostId: resolvedHostId,
      startDate,
      endDate,
      meals: { breakfast, lunch, dinner },
    });
    onClose();
    setGuestName("");
    setStartDate(today);
    setEndDate(today);
    setBreakfast(false);
    setLunch(true);
    setDinner(true);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Guest Meal">
      <div className="space-y-4">
        <Input label="Guest Name" placeholder="e.g. Farhan Hossain" value={guestName} onChange={setGuestName} required />
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Host Member</label>
          <select
            value={hostId}
            onChange={e => setHostId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.id === currentMember?.id ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
          <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">Meal Selection</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Breakfast (0.5)", val: breakfast, set: setBreakfast },
              { label: "Lunch (1.0)", val: lunch, set: setLunch },
              { label: "Dinner (1.0)", val: dinner, set: setDinner },
            ].map(({ label, val, set }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!val)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all border-2 ${
                  val ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {guestName && startDate && endDate && mealsPerDay > 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-xs text-emerald-700">
              Estimated cost: <strong>{dayCount} day{dayCount > 1 ? "s" : ""}</strong> ×{" "}
              <strong>{mealsPerDay} meals/day</strong> × <strong>৳{(mealRate || 42.5).toFixed(2)}/meal</strong> ={" "}
              <strong className="text-emerald-800">{fmt(estimatedCost)}</strong>
            </p>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSubmit} disabled={!guestName.trim() || !startDate || !endDate || mealsPerDay === 0}>
            Add Guest
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
