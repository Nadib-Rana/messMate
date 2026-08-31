import { useState } from "react";
import { PageHeader, Card, Badge, Btn, Modal, Input, Select, fmt } from "../../components/ui";
import { useApp } from "../../context/AppContext";

export default function GuestMeals() {
  const { guestMeals, members, addGuestMeal, currentHouse } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [hostId, setHostId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakfast, setBreakfast] = useState(false);
  const [lunch, setLunch] = useState(true);
  const [dinner, setDinner] = useState(true);

  const handleSubmit = () => {
    if (!guestName || !startDate || !endDate) return;
    addGuestMeal({
      guestName,
      hostId: hostId || members[0].id,
      startDate,
      endDate,
      meals: { breakfast, lunch, dinner },
    });
    setShowModal(false);
    setGuestName("");
  };

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
          <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-display)" }}>{guestMeals.length} guests</p>
          <p className="text-xs text-slate-400 mt-0.5">{fmt(totalGuestCost)} total guest meal cost</p>
        </Card>
      </div>

      <div className="space-y-3">
        {guestMeals.map(g => (
          <Card key={g.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                  {g.guestName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{g.guestName}</p>
                  <p className="text-xs text-slate-500">Guest of <strong className="text-slate-700">{g.hostName}</strong></p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">{g.startDate} → {g.endDate}</span>
                    <div className="flex gap-1">
                      {["B", "L", "D"].map((m, i) => {
                        const active = i === 0 ? g.meals.breakfast : i === 1 ? g.meals.lunch : g.meals.dinner;
                        return (
                          <span key={m} className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center
                            ${active ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-300"}`}>{m}</span>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Guest Meal">
        <div className="space-y-4">
          <Input label="Guest Name" placeholder="Farhan Hossain" value={guestName} onChange={setGuestName} required />
          <Select
            label="Host Member"
            options={members.map(m => m.name)}
            value={members.find(m => m.id === hostId)?.name}
            onChange={name => {
              const m = members.find(x => x.name === name);
              if (m) setHostId(m.id);
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
            <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Meal Selection</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={breakfast} onChange={e => setBreakfast(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                Breakfast (0.5)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={lunch} onChange={e => setLunch(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                Lunch (1.0)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={dinner} onChange={e => setDinner(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                Dinner (1.0)
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Add Guest</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
