import { useState, useEffect, useRef } from "react";
import KIITLogo from "../components/KIITLogo";
import { CAMPUSES, STATUS_CONFIG } from "../data/constants";
import { getBus, setBusActive, updateBusStatus, pushDriverLocation } from "../utils/db";

export default function DriverDashboard({ user, onLogout }) {
  const [myBus, setMyBus]       = useState(null);
  const [status, setStatus]     = useState("Empty");
  const [tracking, setTracking] = useState(false);
  const [approved, setApproved] = useState(false);
  const [msg, setMsg]           = useState("");
  const watchRef                = useRef(null);
  const gpsIntervalRef          = useRef(null);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  // Load bus data and poll for approval every 4s
  useEffect(() => {
    const load = async () => {
      const bus = await getBus(user.vehicle);
      if (bus) { setMyBus(bus); setStatus(bus.status); setApproved(bus.approved === true); }
    };
    load();
    const iv = setInterval(load, 4000);
    return () => clearInterval(iv);
  }, []);

  // Start/stop GPS sharing
  const toggleGPS = async () => {
    const next = !tracking;
    setTracking(next);
    await setBusActive(user.vehicle, next);

    if (next) {
      flash("📍 GPS active — students can see you!");
      // Push location immediately then every 5s
      const push = () => {
        navigator.geolocation.getCurrentPosition(
          pos => pushDriverLocation(user.vehicle, pos.coords.latitude, pos.coords.longitude),
          () => {}
        );
      };
      push();
      gpsIntervalRef.current = setInterval(push, 5000);

      // Also watch position continuously
      watchRef.current = navigator.geolocation.watchPosition(
        pos => pushDriverLocation(user.vehicle, pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000 }
      );
    } else {
      flash("GPS sharing stopped");
      if (gpsIntervalRef.current) { clearInterval(gpsIntervalRef.current); gpsIntervalRef.current = null; }
      if (watchRef.current) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    }
  };

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, []);

  const handleStatusUpdate = async () => {
    await updateBusStatus(user.vehicle, status);
    flash("✓ Seat status updated!");
  };

  // ── Pending Approval Screen ─────────────────────────────────────────────────
  if (!approved) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <header style={{ background:"var(--card)", borderBottom:"2px solid var(--border)", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <KIITLogo size={34}/>
          <div>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>KIIT <span style={{ color:"#00e676" }}>SmartBus</span></div>
            <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace" }}>DRIVER PORTAL</div>
          </div>
        </div>
        <button className="btn btn--ghost" onClick={onLogout} style={{ fontSize:12, padding:"6px 14px" }}>Logout</button>
      </header>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", gap:20 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,179,0,0.1)", border:"2px solid rgba(255,179,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, animation:"pulse-glow 2s infinite" }}>⏳</div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:26, fontWeight:700, color:"var(--yellow)", letterSpacing:1 }}>Awaiting Admin Approval</div>
        <p style={{ color:"var(--text2)", fontSize:14, maxWidth:380, lineHeight:1.7 }}>Your account is registered. An admin needs to approve it before you can access the driver dashboard.</p>
        <div style={{ background:"rgba(255,179,0,0.06)", border:"1px solid rgba(255,179,0,0.2)", borderRadius:12, padding:"14px 20px", display:"flex", flexDirection:"column", gap:8, width:"100%", maxWidth:340 }}>
          {[["Name",user.name,"var(--text)"],["Vehicle",user.vehicle,"var(--yellow)"],["Type",user.vehicleType,"var(--text)"],["Status","Pending ⏳","var(--yellow)"]].map(([l,v,col])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
              <span style={{ color:"var(--text2)" }}>{l}</span><span style={{ color:col, fontFamily:l==="Vehicle"?"'JetBrains Mono',monospace":"inherit" }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:11, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace" }}>Auto-checking every 4 seconds…</p>
      </div>
    </div>
  );

  // ── Approved Dashboard ──────────────────────────────────────────────────────
  const assignedDest = CAMPUSES.find(c => c.id === myBus?.destination);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <header style={{ background:"var(--card)", borderBottom:"2px solid var(--border)", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <KIITLogo size={34}/>
          <div>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>KIIT <span style={{ color:"#00e676" }}>SmartBus</span></div>
            <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace" }}>DRIVER PORTAL</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:11, color:"var(--green)", background:"rgba(0,230,118,0.08)", border:"1px solid rgba(0,230,118,0.2)", padding:"3px 10px", borderRadius:20, fontFamily:"'JetBrains Mono',monospace" }}>✓ Approved</div>
          <span style={{ fontSize:13, color:"var(--text2)" }}>👤 <span style={{ color:"#00e676" }}>{user.name?.split(" ")[0]}</span></span>
          <button className="btn btn--ghost" onClick={onLogout} style={{ fontSize:12, padding:"6px 14px" }}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px", width:"100%", display:"flex", flexDirection:"column", gap:16 }}>
        {/* Identity card */}
        <div style={{ background:"var(--card)", border:"1px solid rgba(0,230,118,0.2)", borderRadius:16, padding:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:14, background:"rgba(0,230,118,0.1)", border:"1px solid rgba(0,230,118,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
            {user.vehicleType==="Van"?"🚐":user.vehicleType==="Cart"?"🛺":"🚌"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:18, fontWeight:700 }}>{user.name}</div>
            <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>{user.vehicleType} • {user.vehicle}</div>
          </div>
          <button onClick={toggleGPS} style={{ padding:"9px 14px", borderRadius:9, border:`1px solid ${tracking?"var(--green)":"var(--border)"}`, background:tracking?"rgba(0,230,118,0.08)":"transparent", color:tracking?"var(--green)":"var(--text2)", fontSize:12, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
            {tracking ? "📍 Live" : "📍 Start GPS"}
          </button>
        </div>

        {msg && <div style={{ background:"rgba(0,230,118,0.1)", border:"1px solid rgba(0,230,118,0.25)", padding:"10px 16px", borderRadius:10, fontSize:13, color:"var(--green)", fontFamily:"'JetBrains Mono',monospace", textAlign:"center" }}>{msg}</div>}

        {/* Assigned destination (read-only) */}
        <div style={{ background:"var(--card)", border:"1px solid rgba(0,212,255,0.15)", borderRadius:16, padding:18 }}>
          <div style={{ fontSize:10, color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:12 }}>Assigned Destination <span style={{ color:"rgba(0,212,255,0.4)", fontSize:9 }}>(set by admin)</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏫</div>
            <div>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:18, fontWeight:700, color:"var(--accent)" }}>{assignedDest?.name || "Not assigned yet"}</div>
              {!assignedDest && <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>Waiting for admin to assign your route</div>}
            </div>
          </div>
        </div>

        {/* Seat availability */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:18 }}>
          <div style={{ fontSize:10, color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:14 }}>Update Seat Availability</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
              <button key={s} onClick={() => setStatus(s)} style={{ padding:"14px 6px", borderRadius:10, border:`1px solid ${status===s?cfg.color:"var(--border)"}`, background:status===s?cfg.bg:"var(--bg2)", color:status===s?cfg.color:"var(--text2)", fontSize:11, cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", transition:"all 0.2s", textAlign:"center" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{cfg.icon}</div>{s}
              </button>
            ))}
          </div>
          <button className="btn btn--full" onClick={handleStatusUpdate} style={{ background:"linear-gradient(135deg,#00a855,#00e676)", color:"#000", fontFamily:"'Rajdhani',sans-serif", fontSize:15, letterSpacing:1.5, padding:"12px" }}>
            UPDATE SEAT STATUS →
          </button>
        </div>

        {/* Summary */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
          {[["Destination",assignedDest?.name?.split(" ").slice(0,2).join(" ")||"—","#00d4ff"],["Seats",status,STATUS_CONFIG[status]?.color],["GPS",tracking?"Active":"Off",tracking?"#00e676":"#555"]].map(([l,v,col],i) => (
            <div key={l} style={{ textAlign:"center", padding:"10px 0", borderRight:i<2?"1px solid var(--border)":"none" }}>
              <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", marginBottom:5 }}>{l}</div>
              <div style={{ fontSize:12, fontWeight:600, color:col }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
