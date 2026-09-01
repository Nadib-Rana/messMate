import { useState, useEffect } from "react";
import { Modal, Btn } from "../../components/ui";
import { Member } from "../../types";

export function EditMemberModal({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (memberId: string, data: { mealPlan: string; role: string; status: string }) => void;
}) {
  const [mealPlan, setMealPlan] = useState("Full");
  const [role, setRole] = useState<any>("member");
  const [status, setStatus] = useState<any>("active");

  useEffect(() => {
    if (member) {
      setMealPlan(member.mealPlan || "Full");
      setRole(member.role || "member");
      setStatus(member.status || "active");
    }
  }, [member]);

  if (!member) return null;

  const handleSave = () => {
    onSave(member.id, { mealPlan, role, status });
    onClose();
  };

  return (
    <Modal open={!!member} onClose={onClose} title={`Edit ${member.name}'s Meal Plan`}>
      <div className="space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
          Change <strong>{member.name}</strong>'s default meal plan and role dynamically.
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meal Plan Preference</label>
          <select
            value={mealPlan}
            onChange={e => setMealPlan(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="Full">Full (Breakfast + Lunch + Dinner)</option>
            <option value="Lunch + Dinner">Lunch + Dinner (No Breakfast)</option>
            <option value="Lunch only">Lunch Only (No Breakfast, No Dinner)</option>
            <option value="Breakfast + Dinner">Breakfast + Dinner (No Lunch)</option>
            <option value="Off">Meal Stopped / Off</option>
            <option value="Custom">Custom Schedule</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave}>Save Changes</Btn>
        </div>
      </div>
    </Modal>
  );
}
