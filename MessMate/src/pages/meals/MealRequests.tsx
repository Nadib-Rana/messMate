import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn, Modal, Input } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

export default function MealRequests() {
  const { mealRequests, submitMealRequest, approveMealRequest, rejectMealRequest } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason) return;
    submitMealRequest({ startDate, endDate, reason });
    setShowModal(false);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <div>
      <PageHeader
        title="Meal Stop Requests"
        subtitle="Members can request meal suspension for a date range"
        action={<Btn size="sm" onClick={() => setShowModal(true)}>+ New Request</Btn>}
      />

      <div className="space-y-3">
        {mealRequests.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start gap-4">
              <Avatar initials={r.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{r.memberName}</p>
                  <Badge variant={statusVariant[r.status]}>
                    {r.status === "pending" && <Clock size={10} />}
                    {r.status === "approved" && <CheckCircle size={10} />}
                    {r.status === "rejected" && <XCircle size={10} />}
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Submitted {r.submittedAt}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">From</span>
                    <p className="font-semibold text-slate-800">{r.startDate}</p>
                  </div>
                  <div className="text-slate-300">→</div>
                  <div>
                    <span className="text-xs text-slate-400">To</span>
                    <p className="font-semibold text-slate-800">{r.endDate}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{r.reason}</p>
              </div>
              {r.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <Btn size="sm" variant="success" onClick={() => approveMealRequest(r.id)}>Approve</Btn>
                  <Btn size="sm" variant="danger" onClick={() => rejectMealRequest(r.id)}>Reject</Btn>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request Meal Stop">
        <div className="space-y-4">
          <Input label="Start Date" type="date" value={startDate} onChange={setStartDate} required />
          <Input label="End Date" type="date" value={endDate} onChange={setEndDate} required />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Explain why you're stopping meals..."
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Submit Request</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
