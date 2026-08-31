import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Input, Select, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { UserPlus } from "lucide-react";

const mealPlanBadge: Record<string, "success" | "info" | "default"> = {
  Full: "success",
  "Lunch + Dinner": "info",
  "Lunch only": "default",
};

export default function Members() {
  const { members, memberSettlements, addMember, dailyMeals, currentHouse } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<any>("member");
  const [mealPlan, setMealPlan] = useState("Full");

  const handleAdd = () => {
    if (!name || !phone) return;
    const avatar = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    addMember({
      name,
      phone,
      email,
      role,
      avatar: avatar || "MB",
      mealPlan,
    });
    setShowModal(false);
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Manage house members and their meal plans"
        action={<Btn size="sm" onClick={() => setShowModal(true)}><UserPlus size={14} />Add Member</Btn>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => {
          const settlement = memberSettlements.find(s => s.memberId === m.id);
          const balance = settlement?.balance || 0;
          const totalMeals = settlement?.meals || 0;
          const isLow = balance < currentHouse.setting.lowWalletThreshold;

          return (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={m.avatar} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.phone}</p>
                  </div>
                </div>
                <Badge variant={m.role === "manager" ? "info" : "default"}>
                  {m.role}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Meal Plan</span>
                  <Badge variant={mealPlanBadge[m.mealPlan] || "default"}>{m.mealPlan}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">This Month Meals</span>
                  <span className="font-bold text-slate-800 font-mono">{totalMeals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className={`font-bold font-mono ${isLow ? "text-red-600" : "text-emerald-600"}`}>{fmt(balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Btn size="sm" variant="secondary" className="flex-1">View</Btn>
                <Btn size="sm" variant="ghost" className="flex-1">Edit</Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weekly meal schedule preview */}
      <Card className="mt-6 p-5 overflow-hidden">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Weekly Meal Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-slate-500 font-semibold">Member</th>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <th key={d} className="py-2 px-2 text-center text-slate-500 font-semibold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={m.avatar} size="sm" />
                      <span className="font-medium text-slate-700">{m.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  {[true, true, false, true, true, true, true].map((active, i) => (
                    <td key={i} className="py-2.5 px-2 text-center">
                      <div className="flex justify-center gap-0.5">
                        {["B", "L", "D"].map((meal, mi) => {
                          const on = active && !(mi === 0 && m.mealPlan === "Lunch + Dinner");
                          return (
                            <span key={meal} className={`w-4 h-4 rounded-sm text-[8px] flex items-center justify-center font-bold
                              ${on ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-300"}`}>{meal}</span>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Member">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Nadib Hasan" value={name} onChange={setName} required />
          <Input label="Phone" placeholder="01711-123456" value={phone} onChange={setPhone} required />
          <Input label="Email" type="email" placeholder="nadib@example.com" value={email} onChange={setEmail} />
          <Select label="Role" options={["member", "manager"]} value={role} onChange={setRole} />
          <Select label="Default Meal Plan" options={["Full", "Lunch + Dinner", "Lunch only", "Custom"]} value={mealPlan} onChange={setMealPlan} />
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
            An invitation will be sent to the member. House invite code: <strong>{currentHouse.inviteCode}</strong>
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Member</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
