import { useState } from "react";
import { PageHeader, Card, Badge, Btn, Modal, Input, Select } from "../components/ui";
import { useApp } from "../context/AppContext";
import { Bell, Wallet, Utensils, ShoppingBasket, CreditCard, Gavel, Megaphone } from "lucide-react";

const typeIcon: Record<string, React.ReactNode> = {
  low_wallet: <Wallet size={15} />,
  meal_stop: <Utensils size={15} />,
  expense: <ShoppingBasket size={15} />,
  settlement: <CreditCard size={15} />,
  duty: <ShoppingBasket size={15} />,
  fine: <Gavel size={15} />,
  announcement: <Megaphone size={15} />,
};

const priorityVariant: Record<string, "warning" | "danger" | "info" | "default"> = {
  warning: "warning",
  important: "danger",
  normal: "default",
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, addAnnouncement } = useApp();
  const [showAnnounce, setShowAnnounce] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<any>("normal");

  const unread = notifications.filter(n => !n.read).length;

  const handleSend = () => {
    if (!title || !message) return;
    addAnnouncement(title, message, priority);
    setShowAnnounce(false);
    setTitle("");
    setMessage("");
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        action={
          <div className="flex gap-2">
            {unread > 0 && <Btn size="sm" variant="secondary" onClick={markAllNotificationsRead}>Mark all read</Btn>}
            <Btn size="sm" onClick={() => setShowAnnounce(true)}><Megaphone size={14} />Announce</Btn>
          </div>
        }
      />

      <div className="space-y-2">
        {notifications.map(n => (
          <Card key={n.id} className={`px-5 py-4 ${!n.read ? "border-indigo-100 bg-indigo-50/30" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                n.priority === "warning" ? "bg-amber-100 text-amber-600" :
                n.priority === "important" ? "bg-red-100 text-red-600" :
                "bg-slate-100 text-slate-500"
              }`}>
                {typeIcon[n.type] || <Bell size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                  <Badge variant={priorityVariant[n.priority] || "default"}>{n.priority}</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => markNotificationRead(n.id)}
                >
                  Mark read
                </Btn>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showAnnounce} onClose={() => setShowAnnounce(false)} title="Send Announcement">
        <div className="space-y-4">
          <Input label="Title" placeholder="Please pay your wallet by..." value={title} onChange={setTitle} required />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Message <span className="text-red-500">*</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
              placeholder="Write your announcement here..."
              required
            />
          </div>
          <Select label="Priority" options={["normal", "warning", "important"]} value={priority} onChange={setPriority} />
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            All selected members will receive an in-app notification immediately.
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" onClick={() => setShowAnnounce(false)}>Cancel</Btn>
            <Btn onClick={handleSend}>Send Announcement</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
