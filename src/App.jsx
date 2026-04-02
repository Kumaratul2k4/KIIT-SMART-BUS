import { useState, useEffect } from "react";
import { GLOBAL_STYLES } from "./styles/globalStyles";
import LandingPage      from "./pages/LandingPage";
import RoleSelectPage   from "./pages/RoleSelectPage";
import AuthPage         from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import DriverDashboard  from "./pages/DriverDashboard";
import AdminDashboard   from "./pages/AdminDashboard";
import { onAuthChange, logoutUser, getBus } from "./utils/db";

export default function App() {
  const [page, setPage]   = useState("loading"); // loading | landing | roleSelect | auth | dashboard
  const [role, setRole]   = useState(null);
  const [user, setUser]   = useState(null);

  // Listen to Firebase auth state on mount
  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (fbUser) {
        // If driver, check approval status to pass into dashboard
        if (fbUser.role === "driver" && fbUser.vehicle) {
          const bus = await getBus(fbUser.vehicle);
          fbUser = { ...fbUser, _approved: bus?.approved === true };
        }
        setUser(fbUser);
        setRole(fbUser.role);
        setPage("dashboard");
      } else {
        setUser(null);
        setRole(null);
        setPage("landing");
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setRole(null);
    setPage("landing");
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setRole(u.role);
    setPage("dashboard");
  };

  // Loading screen while Firebase checks auth state
  if (page === "loading") return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:48, animation:"float 2s ease-in-out infinite" }}>🚌</div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:18, color:"var(--accent)", letterSpacing:"2px" }}>LOADING...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {page === "landing"    && <LandingPage onNext={() => setPage("roleSelect")}/>}

      {page === "roleSelect" && (
        <RoleSelectPage
          onSelect={r => { setRole(r); setPage("auth"); }}
          onBack={() => setPage("landing")}
        />
      )}

      {page === "auth" && (
        <AuthPage
          role={role}
          onSuccess={handleAuthSuccess}
          onBack={() => setPage("roleSelect")}
        />
      )}

      {page === "dashboard" && user && role === "student" && (
        <StudentDashboard user={user} onLogout={handleLogout}/>
      )}

      {page === "dashboard" && user && role === "driver" && (
        <DriverDashboard user={user} onLogout={handleLogout}/>
      )}

      {page === "dashboard" && user && role === "admin" && (
        <AdminDashboard user={user} onLogout={handleLogout}/>
      )}
    </>
  );
}
