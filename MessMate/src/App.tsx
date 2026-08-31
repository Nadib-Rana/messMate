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
import { UserRole } from "./data/mock";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>("manager");
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  function renderPage() {
    switch (page) {
      case "dashboard": return role === "manager" ? <Dashboard /> : <MemberDashboard />;
      case "meals.daily": return <DailyMeals />;
      case "meals.summary": return <MealSummary />;
      case "meals.requests": return <MealRequests />;
      case "meals.guests": return <GuestMeals />;
      case "market.duty": return <MarketDuty />;
      case "market.expenses": return <MarketExpenses />;
      case "finance.wallets": return <Wallets />;
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
        onLogout={() => setLoggedIn(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          role={role}
          onRoleChange={setRole}
          currentPage={page}
          onNavigate={setPage}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
