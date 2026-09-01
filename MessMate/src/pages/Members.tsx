import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, fmt } from "../components/ui";
import { useApp } from "../context/AppContext";
import { UserPlus, Edit3 } from "lucide-react";
import { Member } from "../types";
import { AddMemberModal } from "./components/AddMemberModal";
import { EditMemberModal } from "./components/EditMemberModal";
import { MemberWeeklyOverview } from "./components/MemberWeeklyOverview";

const mealPlanBadge: Record<string, "success" | "info" | "default" | "warning" | "danger"> = {
  Full: "success", "Lunch + Dinner": "info", "Lunch only": "default", "Breakfast + Dinner": "warning", Off: "danger",
};

export default function Members() {
  const { members, memberSettlements, addMember, updateMember, currentHouse, currentMember } = useApp();
  const isManager = currentMember?.role === "manager";

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const handleSaveEdit = (memberId: string, data: { mealPlan: string; role: string; status: string }) => {
    updateMember(memberId, data);
  };

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Manage house members and their meal plans"
        action={
          isManager ? (
            <Btn size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus size={14} /> Add Member
            </Btn>
          ) : null
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => {
          const settlement = memberSettlements.find(s => s.memberId === m.id);
          const balance = settlement?.balance || 0;
          const totalMeals = settlement?.meals || 0;
          const isLow = balance < currentHouse.setting.lowWalletThreshold;
          const isMe = m.id === currentMember?.id;

          return (
            <Card key={m.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={m.avatar} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {m.name}
                        {isMe && <span className="ml-1.5 text-xs text-indigo-500 font-semibold">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-400">{m.phone}</p>
                    </div>
                  </div>
                  <Badge variant={m.role === "manager" ? "info" : "default"}>{m.role}</Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-500 font-medium">Meal Plan</span>
                    <Badge variant={mealPlanBadge[m.mealPlan] || "default"}>{m.mealPlan || "Full"}</Badge>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-slate-500">This Month Meals</span>
                    <span className="font-bold text-slate-800 font-mono">{typeof totalMeals === "number" ? totalMeals.toFixed(1) : totalMeals}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-slate-500">Wallet Balance</span>
                    <span className={`font-bold font-mono ${isLow ? "text-red-600" : "text-emerald-600"}`}>{fmt(balance)}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={m.status === "active" ? "success" : "neutral"}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {isManager && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <Btn size="sm" variant="secondary" className="flex-1" onClick={() => setEditingMember(m)}>
                    <Edit3 size={13} /> Edit Meal Plan
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <MemberWeeklyOverview members={members} />

      <AddMemberModal open={showAddModal} onClose={() => setShowAddModal(false)} currentHouse={currentHouse} onAdd={addMember} />
      <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleSaveEdit} />
    </div>
  );
}
