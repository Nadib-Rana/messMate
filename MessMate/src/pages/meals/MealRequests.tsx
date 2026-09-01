import { useState } from "react";
import { PageHeader, Card, Badge, Avatar, Btn } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { CheckCircle, XCircle, Clock, Plus, AlertCircle } from "lucide-react";
import { NewMealRequestModal } from "./components/NewMealRequestModal";

const statusVariant: Record<string, "success" | "danger" | "warning"> = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
};

export default function MealRequests() {
  const {
    mealRequests,
    submitMealRequest,
    approveMealRequest,
    rejectMealRequest,
    currentMember,
  } = useApp();

  const isManager = currentMember?.role === "manager";
  const [showModal, setShowModal] = useState(false);

  const pendingCount = mealRequests.filter(r => r.status === "pending").length;
  const myRequests = isManager
    ? mealRequests
    : mealRequests.filter(r => r.memberId === currentMember?.id);

  return (
    <div>
      <PageHeader
        title="Meal Stop Requests"
        subtitle={isManager
          ? "Review and approve member meal suspension requests"
          : "Request to pause specific meals for a date range"}
        action={
          !isManager ? (
            <Btn size="sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> New Request
            </Btn>
          ) : pendingCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{pendingCount} pending approval</span>
            </div>
          ) : null
        }
      />

      {myRequests.length === 0 && (
        <Card className="p-12 text-center">
          <Clock size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No meal stop requests yet</p>
          {!isManager && (
            <p className="text-xs text-slate-400 mt-1">
              Use "New Request" to pause your meals while travelling or away
            </p>
          )}
        </Card>
      )}

      <div className="space-y-3">
        {myRequests.map(r => {
          const stopMeals = r.meals || { breakfast: true, lunch: true, dinner: true };
          return (
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
                      <span className="ml-1">{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted {r.submittedAt}</p>

                  <div className="mt-3 flex items-center gap-4 text-sm flex-wrap">
                    <div>
                      <span className="text-xs text-slate-400">From</span>
                      <p className="font-semibold text-slate-800">{r.startDate}</p>
                    </div>
                    <div className="text-slate-300">→</div>
                    <div>
                      <span className="text-xs text-slate-400">To</span>
                      <p className="font-semibold text-slate-800">{r.endDate}</p>
                    </div>

                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">Meals Stopped:</span>
                      {(["Breakfast", "Lunch", "Dinner"] as const).map(m => {
                        const isStopped = stopMeals[m.toLowerCase() as keyof typeof stopMeals];
                        return (
                          <span
                            key={m}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isStopped
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            {m[0]} ({m})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <strong className="text-slate-700">Reason:</strong> {r.reason}
                  </p>
                </div>

                {isManager && r.status === "pending" && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Btn size="sm" variant="success" onClick={() => approveMealRequest(r.id)}>
                      <CheckCircle size={12} /> Approve
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => rejectMealRequest(r.id)}>
                      <XCircle size={12} /> Reject
                    </Btn>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <NewMealRequestModal open={showModal} onClose={() => setShowModal(false)} onSubmit={submitMealRequest} />
    </div>
  );
}
