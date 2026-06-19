import { Routes, Route, Navigate, Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { FinancialProvider } from "./context/FinancialContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import Analytics from "./pages/Analytics";
import EligibilityAndReports from "./pages/EligibilityAndReports";
import Profile from "./pages/Profile";
import { 
  LayoutDashboard, 
  Sliders, 
  PieChart, 
  FileCheck, 
  User, 
  LogOut, 
  Activity 
} from "lucide-react";

// Protected Layout with Sidebar Navigation
function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    setUserName(localStorage.getItem("userName") || "User");
    setUserEmail(email);
  }, [email]);

  if (!email) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userContact");
    
    // Dispatch custom event to notify FinancialContext
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { path: "/dashboard/simulator", label: "Financial Simulator", icon: Sliders },
    { path: "/dashboard/analytics", label: "Analytics & Budget", icon: PieChart },
    { path: "/dashboard/eligibility", label: "Eligibility & Reports", icon: FileCheck },
    { path: "/dashboard/profile", label: "Profile Settings", icon: User },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Activity size={20} />
          </div>
          <span className="logo-text">AURA</span>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                item.path === "/dashboard" 
                  ? location.pathname === "/dashboard" 
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`menu-item ${isActive ? "active" : ""}`}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-user">
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userEmail}</span>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout} 
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-wrapper">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <FinancialProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="eligibility" element={<EligibilityAndReports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FinancialProvider>
    </ErrorBoundary>
  );
}

export default App;