import { useState, useEffect } from "react";
import { Modal, Input, Btn } from "../../../components/ui";

export function NewMealRequestModal({
  open,
  onClose,
  initialDate,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  onSubmit: (req: { startDate: string; endDate: string; reason: string; meals: { breakfast: boolean; lunch: boolean; dinner: boolean } }) => void;
}) {
  const [startDate, setStartDate] = useState(initialDate || "");
  const [endDate, setEndDate] = useState(initialDate || "");
  const [reason, setReason] = useState("");
  const [breakfast, setBreakfast] = useState(true);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);

  useEffect(() => {
    if (open) {
      setStartDate(initialDate || new Date().toISOString().split("T")[0]);
      setEndDate(initialDate || new Date().toISOString().split("T")[0]);
    }
  }, [open, initialDate]);

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason || endDate < startDate || (!breakfast && !lunch && !dinner)) return;
    onSubmit({ startDate, endDate, reason, meals: { breakfast, lunch, dinner } });
    onClose();
    setStartDate("");
    setEndDate("");
    setReason("");
    setBreakfast(true);
    setLunch(true);
    setDinner(true);
  };

  return (
    <Modal open={open} onClose={onClose} title="Request Meal Stop">
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <strong>Note:</strong> Select which meal(s) you want to stop during your requested period.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
          <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
        </div>
        {endDate && startDate && endDate < startDate && (
          <p className="text-xs text-red-500">End date must be after start date.</p>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Meals to Stop <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Breakfast (B)", val: breakfast, set: setBreakfast },
              { label: "Lunch (L)", val: lunch, set: setLunch },
              { label: "Dinner (D)", val: dinner, set: setDinner },
            ].map(({ label, val, set }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!val)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                  val ? "bg-red-600 text-white border-red-600 shadow" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                {val ? "✓ Stop " : "+ Keep "}
                {label}
              </button>
            ))}
          </div>
          {!breakfast && !lunch && !dinner && (
            <p className="text-xs text-red-500 mt-1.5">Please select at least one meal to stop.</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            placeholder="e.g. Travelling home for Eid holiday..."
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSubmit} disabled={!startDate || !endDate || !reason || endDate < startDate || (!breakfast && !lunch && !dinner)}>
            Submit Request
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
