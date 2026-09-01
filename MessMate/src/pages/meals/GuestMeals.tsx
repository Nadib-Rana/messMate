import { useState } from "react";
import { PageHeader, Card, Badge, Btn, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { Users } from "lucide-react";
import { AddGuestModal } from "./components/AddGuestModal";

export default function GuestMeals() {
  const { guestMeals, members, addGuestMeal, currentHouse, mealRate, currentMember } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalGuestCost = guestMeals.reduce((a, g) => a + g.cost, 0);

  return (
    <div>
      <PageHeader
        title="Guest Meals"
        subtitle="Track meals for visiting guests — cost added to host's account"
        action={<Btn size="sm" onClick={() => setShowModal(true)}>+ Add Guest</Btn>}
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-indigo-50 border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium">Guest Meal Rule</p>
          <p className="text-sm font-bold text-indigo-900 mt-0.5">{currentHouse.setting.guestMealRule}</p>
          <p className="text-xs text-indigo-600 mt-1">Guest meals are added to the host member's meal cost</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 font-medium">This Month</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
            {guestMeals.length} guests
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{fmt(totalGuestCost)} total guest meal cost</p>
        </Card>
      </div>

      {guestMeals.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No guest meals recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Add a guest to track their meal costs</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {guestMeals.map(g => (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                    {g.guestName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{g.guestName}</p>
                    <p className="text-xs text-slate-500">
                      Guest of <strong className="text-slate-700">{g.hostName}</strong>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">{g.startDate} → {g.endDate}</span>
                      <div className="flex gap-1">
                        {(["B", "L", "D"] as const).map((m, i) => {
                          const active = i === 0 ? g.meals.breakfast : i === 1 ? g.meals.lunch : g.meals.dinner;
                          return (
                            <span
                              key={m}
                              className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center
                                ${active ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-300"}`}
                            >
                              {m}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={g.status === "active" ? "warning" : "neutral"}>{g.status}</Badge>
                  <p className="text-sm font-bold text-slate-800 mt-2 font-mono">{fmt(g.cost)}</p>
                  <p className="text-xs text-slate-400">{g.totalMeals} meals</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddGuestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        members={members}
        currentMember={currentMember}
        mealRate={mealRate}
        onAddGuest={addGuestMeal}
      />
    </div>
  );
}
