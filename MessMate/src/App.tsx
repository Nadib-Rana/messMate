import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import DailyMeals from "./pages/meals/DailyMeals";
import MealSummary from "./pages/meals/MealSummary";
import MealRequests from "./pages/meals/MealRequests";
import GuestMeals from "./pages/meals/GuestMeals";
import MarketDuty from "./pages/market/MarketDuty";
import MarketExpenses from "./pages/market/MarketExpenses";
import Wallets from "./pages/finance/Wallets";
import Expenses from "./pages/finance/Expenses";
import Bills from "./pages/finance/Bills";
import Fines from "./pages/finance/Fines";
import Settlement from "./pages/Settlement";
import Notifications from "./pages/Notifications";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Sidebar, { Page } from "./components/Sidebar";
import Header from "./components/Header";
import { ProfileModal } from "./components/ProfileModal";
import { UserRole } from "./types";
import { useApp } from "./context/AppContext";

export default function App() {
  const { currentUser, setCurrentUser, currentMember, members } = useApp();
  const [loggedIn, setLoggedIn] = useState(() => {
    return !!localStorage.getItem("messmate_jwt_token") || !!localStorage.getItem("messmate_user");
  });
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("messmate_user");
      if (saved) {
        const u = JSON.parse(saved);
        const isMgr = u.role === "ADMIN" || u.role === "MANAGER" || u.email === "nadib@messmate.com";
        return isMgr ? "manager" : "member";
      }
    } catch {}
    return "manager";
  });
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogin = (user?: any) => {
    setLoggedIn(true);
    if (user) {
      setCurrentUser(user);
      const isMgr = user.role === "ADMIN" || user.role === "MANAGER" || user.email === "nadib@messmate.com";
      setRole(isMgr ? "manager" : "member");
    } else {
      const saved = localStorage.getItem("messmate_user");
      if (saved) {
        try {
          const u = JSON.parse(saved);
          const isMgr = u.role === "ADMIN" || u.role === "MANAGER" || u.email === "nadib@messmate.com";
          setRole(isMgr ? "manager" : "member");
        } catch {}
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("messmate_jwt_token");
    localStorage.removeItem("messmate_refresh_token");
    localStorage.removeItem("messmate_user");
    setCurrentUser(null);
    setLoggedIn(false);
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  function renderPage() {
    switch (page) {
      case "dashboard": return role === "manager" ? <Dashboard /> : <MemberDashboard />;
      case "meals.daily": return <DailyMeals />;
      case "meals.summary": return <MealSummary />;
      case "meals.requests": return <MealRequests />;
      case "meals.guests": return <GuestMeals />;
      case "market.duty": return <MarketDuty />;
      case "market.expenses": return <MarketExpenses />;
      case "finance.wallets": return <Wallets role={role} />;
      case "finance.expenses": return <Expenses />;
      case "finance.bills": return <Bills />;
      case "finance.fines": return <Fines />;
      case "settlement": return <Settlement />;
      case "notifications": return <Notifications />;
      case "members": return <Members />;
      case "reports": return <Reports />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          role={role}
          onRoleChange={setRole}
          currentPage={page}
          onNavigate={setPage}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
