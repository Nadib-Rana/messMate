import { useState } from "react";
import { Modal, Input, Btn } from "../../../components/ui";
import { AlertTriangle, Calendar } from "lucide-react";

export function EmergencyAllMealsOffModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const handleConfirm = () => {
    if (!selectedDate) return;
    onConfirm(selectedDate);
    onClose();
  };

  const setToday = () => setSelectedDate(todayStr);
  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  };

  return (
    <Modal open={open} onClose={onClose} title="🚨 Emergency Day Off — All Meals Cancelled">
      <div className="space-y-4">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Cook Absence / Groceries Emergency</p>
            <p className="leading-relaxed">
              This action will instantly set all meal slots (Breakfast, Lunch, and Dinner) to <strong>OFF</strong> for <strong>ALL members</strong> on the selected date.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Select Date for Emergency Cancellation</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input type="date" value={selectedDate} onChange={v => setSelectedDate(v)} />
            </div>
            <button
              type="button"
              onClick={setToday}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                selectedDate === todayStr ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={setTomorrow}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 text-slate-600">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar size={13} className="text-indigo-600" />
            Target Date: <strong>{selectedDate}</strong>
          </p>
          <p className="text-slate-500">All meals for all active house members will be turned off and persisted to the database.</p>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" onClick={handleConfirm}>
            Confirm & Turn OFF All Meals
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
