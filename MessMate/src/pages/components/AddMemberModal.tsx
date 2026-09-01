import { useState } from "react";
import { Modal, Input, Select, Btn } from "../../components/ui";

export function AddMemberModal({
  open,
  onClose,
  currentHouse,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  currentHouse: any;
  onAdd: (m: any) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<any>("member");
  const [mealPlan, setMealPlan] = useState("Full");

  const handleAdd = () => {
    if (!name || !phone) return;
    const avatar = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    onAdd({ name, phone, email, role, avatar: avatar || "MB", mealPlan });
    onClose();
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Member">
      <div className="space-y-4">
        <Input label="Full Name" placeholder="Nadib Hasan" value={name} onChange={setName} required />
        <Input label="Phone" placeholder="01711-123456" value={phone} onChange={setPhone} required />
        <Input label="Email" type="email" placeholder="nadib@example.com" value={email} onChange={setEmail} />
        <Select label="Role" options={["member", "manager"]} value={role} onChange={setRole} />
        <Select label="Default Meal Plan" options={["Full", "Lunch + Dinner", "Lunch only", "Breakfast + Dinner", "Off", "Custom"]} value={mealPlan} onChange={setMealPlan} />
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
          An invitation will be sent to the member. House invite code: <strong>{currentHouse.inviteCode}</strong>
        </div>
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleAdd}>Add Member</Btn>
        </div>
      </div>
    </Modal>
  );
}
