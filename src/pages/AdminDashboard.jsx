import { useState, useEffect } from "react";
import KIITLogo from "../components/KIITLogo";
import { CAMPUSES, STATUS_CONFIG } from "../data/constants";
import { listenBuses, getAllUsers, approveDriver, rejectDriver, removeDriver, assignDestination, listenAllGPS } from "../utils/db";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"var(--card)", border:"1.5px solid rgba(211,47,47,0.25)", borderRadius:16, padding:28, maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, color:"var(--text)", marginBottom:8 }}>Are you sure?</div>
        <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6, marginBottom:24 }}>{message}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid var(--border)", background:"transparent", color:"var(--text2)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#b71c1c,#d32f2f)", color:"#fff", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer" }}>Yes, Confirm</button>
        </div>
      </div>
    </div>
  );
}

// Find nearest campus name to a GPS coordinate
function getNearestCampus(lat, lng) {
  if (!lat || !lng) return null;
  let nearest = null, minDist = Infinity;
  CAMPUSES.forEach(c => {
    const d = Math.sqrt((c.lat-lat)**2 + (c.lng-lng)**2);
    if (d < minDist) { minDist = d; nearest = c; }
  });
  // Only show "at campus" if within ~300m (~0.003 degrees)
  return minDist < 0.003 ? nearest : null;
}

export default function AdminDashboard({ user, onLogout }) {
  const [buses, setBuses]         = useState([]);
  const [allUsers, setAllUsers]   = useState([]);
  const [activePane, setActivePane] = useState("approval");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]     = useState({});
  const [confirm, setConfirm]     = useState(null);
  const [gpsData, setGpsData]     = useState({});

  useEffect(() => { const u = listenBuses(setBuses); return () => u(); }, []);
  useEffect(() => { const u = listenAllGPS(setGpsData); return () => u(); }, []);
  useEffect(() => {
    const load = async () => { setAllUsers(await getAllUsers()); };
    load(); const iv = setInterval(load, 10000); return () => clearInterval(iv);
  }, []);

  const pending   = buses.filter(d => !d.approved);
  const approved  = buses.filter(d => d.approved);
  const onlineNow = approved.filter(d => d.active).length;
  const students  = allUsers.filter(u => u.role === "student").length;
  const byDest    = CAMPUSES.map(c => ({ ...c, count: approved.filter(b=>b.destination===c.id&&b.active).length })).filter(c=>c.count>0);

  const setLoad = (id, val) => setLoading(l => ({ ...l, [id]: val }));

  const handleApprove = async (vehicleId) => {
    setLoad(vehicleId+"_approve", true);
    await approveDriver(vehicleId);
    setLoad(vehicleId+"_approve", false);
  };

  const handleReject = (d) => setConfirm({
    type:"reject", vehicleId:d.id, driverId:d.driverId, name:d.driverName,
    message:`Reject "${d.driverName}" (${d.id})? Their account will be removed and they can re-register with the same email.`,
  });

  const handleRemove = (d) => setConfirm({
    type:"remove", vehicleId:d.id, driverId:d.driverId, name:d.driverName,
    message:`Permanently delete "${d.driverName}" (${d.id})? They will be removed from the system completely.`,
  });

  const handleConfirm = async () => {
    if (!confirm) return;
    const { type, vehicleId, driverId } = confirm;
    setLoad(vehicleId+"_action", true); setConfirm(null);
    if (type === "reject") await rejectDriver(vehicleId, driverId);
    if (type === "remove") await removeDriver(vehicleId, driverId);
    setLoad(vehicleId+"_action", false);
  };

  const handleAssign = (vehicleId, destId) => assignDestination(vehicleId, destId);

  const navItems = [
    { id:"approval", icon:"🔔", label:"Driver Approval", badge: pending.length },
    { id:"drivers",  icon:"🚌", label:"Driver Details",  badge: 0 },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={handleConfirm} onCancel={() => setConfirm(null)}/>}

      {/* Header */}
      <header style={{ background:"var(--card)", borderBottom:"2px solid var(--border)", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:62, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px var(--shadow)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <KIITLogo size={38}/>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>KIIT <span style={{ color:"var(--kiit)" }}>SmartBus</span></div>
            <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" }}>ADMIN PANEL</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {pending.length > 0 && <div style={{ fontSize:11, color:"var(--yellow)", background:"rgba(245,159,0,0.1)", border:"1px solid rgba(245,159,0,0.3)", padding:"3px 10px", borderRadius:20, fontFamily:"'JetBrains Mono',monospace" }}>{pending.length} pending</div>}
          <span style={{ fontSize:13, color:"var(--text2)" }}>🛡 <span style={{ color:"var(--kiit)", fontWeight:600 }}>{user.name}</span></span>
          <button className="btn btn--ghost" onClick={onLogout} style={{ fontSize:12, padding:"6px 14px" }}>Logout</button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0, position:"relative" }}>

        {/* ── ANIMATED SIDEBAR ── */}
        <div style={{
          width: sidebarOpen ? 230 : 0,
          minWidth: 0,
          background:"var(--card)",
          borderRight:"2px solid var(--border)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",
          flexShrink:0,
          boxShadow: sidebarOpen ? "3px 0 16px var(--shadow)" : "none",
          position:"relative", zIndex:10,
        }}>
          <div style={{ padding:"20px 0 12px", opacity: sidebarOpen ? 1 : 0, transition:"opacity 0.2s", whiteSpace:"nowrap", overflow:"hidden" }}>
            <div style={{ fontSize:9, color:"var(--text2)", letterSpacing:"2px", fontFamily:"'JetBrains Mono',monospace", padding:"0 18px 12px" }}>NAVIGATION</div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActivePane(item.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 18px", background:activePane===item.id?"rgba(26,122,26,0.08)":"transparent", border:"none", borderLeft:`3px solid ${activePane===item.id?"var(--accent)":"transparent"}`, cursor:"pointer", transition:"all 0.2s", textAlign:"left", width:"100%" }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14, color:activePane===item.id?"var(--accent)":"var(--text2)", flex:1 }}>{item.label}</span>
                {item.badge > 0 && <span style={{ background:"var(--yellow)", color:"#000", fontSize:10, fontWeight:700, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center" }}>{item.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle button — floating arrow */}
        <button onClick={() => setSidebarOpen(o => !o)}
          style={{ position:"absolute", left: sidebarOpen ? 218 : 0, top:"50%", transform:"translateY(-50%)", zIndex:20, width:22, height:44, borderRadius: sidebarOpen ? "0 10px 10px 0" : "0 10px 10px 0", border:"2px solid var(--border)", borderLeft: sidebarOpen ? "2px solid var(--border)" : "none", background:"var(--card)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--accent)", transition:"left 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow:"2px 0 8px var(--shadow)" }}>
          {sidebarOpen ? "‹" : "›"}
        </button>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:20 }}>

          {/* Stats */}
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19, fontWeight:700, color:"var(--text)", marginBottom:14 }}>Fleet Overview</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
              {[["Total Drivers",buses.length,"var(--accent)"],["Total Students",students,"#2e7d32"],["Online Drivers",onlineNow,"var(--yellow)"],["Pending",pending.length,"var(--red)"]].map(([l,v,col])=>(
                <div key={l} style={{ background:"var(--card)", border:"1.5px solid var(--border)", borderRadius:14, padding:"16px 12px", textAlign:"center", boxShadow:"0 2px 8px var(--shadow)" }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:34, fontWeight:700, color:col }}>{v}</div>
                  <div style={{ fontSize:11, color:"var(--text2)", marginTop:3, lineHeight:1.4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Routes */}
          <div style={{ background:"var(--card)", border:"1.5px solid var(--border)", borderRadius:14, padding:18, boxShadow:"0 2px 8px var(--shadow)" }}>
            <div style={{ fontSize:11, color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:12 }}>Active Routes</div>
            {byDest.length === 0 ? <div style={{ color:"var(--text2)", fontSize:13 }}>No buses currently active</div>
              : byDest.map(c => (
                <div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:13 }}>{c.name}</span>
                  <span style={{ fontSize:12, color:"var(--accent)", fontFamily:"'JetBrains Mono',monospace" }}>{c.count} active</span>
                </div>
              ))}
          </div>

          {/* ── APPROVAL PANE ── */}
          {activePane === "approval" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:"var(--text)" }}>
                Driver Approval
                {pending.length > 0 && <span style={{ fontSize:12, color:"var(--yellow)", background:"rgba(245,159,0,0.1)", padding:"2px 10px", borderRadius:20, marginLeft:8 }}>{pending.length} pending</span>}
              </div>
              {pending.length === 0 && <div style={{ color:"var(--text2)", fontSize:13, padding:"20px 0", textAlign:"center" }}><div style={{ fontSize:28, marginBottom:8 }}>✅</div>No pending approvals</div>}
              {pending.map(d => (
                <div key={d.id} style={{ background:"var(--card)", border:"1.5px solid rgba(245,159,0,0.25)", borderRadius:14, padding:18, boxShadow:"0 2px 8px var(--shadow)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(245,159,0,0.08)", border:"1.5px solid rgba(245,159,0,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                        {d.vehicleType==="Van"?"🚐":d.vehicleType==="Cart"?"🛺":"🚌"}
                      </div>
                      <div>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700 }}>{d.driverName}</div>
                        <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>{d.driverEmail}</div>
                        <div style={{ display:"flex", gap:6, marginTop:5, flexWrap:"wrap" }}>
                          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"rgba(26,122,26,0.08)", color:"var(--accent)", fontFamily:"'JetBrains Mono',monospace" }}>{d.id}</span>
                          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"rgba(0,0,0,0.04)", color:"var(--text2)" }}>{d.vehicleType}</span>
                          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"rgba(245,159,0,0.08)", color:"var(--yellow)" }}>⏳ Pending</span>
                        </div>
                      </div>
                    </div>
                    {/* Only APPROVE and REJECT */}
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => handleApprove(d.id)} disabled={loading[d.id+"_approve"]}
                        style={{ padding:"10px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#1b5e20,#2e7d32)", color:"#fff", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", opacity:loading[d.id+"_approve"]?0.7:1 }}>
                        {loading[d.id+"_approve"] ? "…" : "✓ APPROVE"}
                      </button>
                      <button onClick={() => handleReject(d)} disabled={loading[d.id+"_action"]}
                        style={{ padding:"10px 16px", borderRadius:9, border:"1.5px solid rgba(211,47,47,0.3)", background:"rgba(211,47,47,0.06)", color:"var(--red)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        ✕ REJECT
                      </button>
                    </div>
                  </div>
                  {/* Assign destination */}
                  <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                    <div style={{ fontSize:10, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", marginBottom:8 }}>ASSIGN DESTINATION</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {CAMPUSES.map(c => (
                        <button key={c.id} onClick={() => handleAssign(d.id, c.id)}
                          style={{ padding:"5px 11px", borderRadius:8, border:`1.5px solid ${d.destination===c.id?"var(--accent)":"var(--border)"}`, background:d.destination===c.id?"rgba(26,122,26,0.1)":"transparent", color:d.destination===c.id?"var(--accent)":"var(--text2)", fontSize:12, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, transition:"all 0.15s" }}>
                          {c.name.split(" ")[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── DRIVER DETAILS PANE ── */}
          {activePane === "drivers" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:"var(--text)" }}>
                Approved Drivers <span style={{ fontSize:13, color:"var(--text2)", fontWeight:400, marginLeft:6 }}>{approved.length} registered</span>
              </div>
              {approved.length === 0 && <div style={{ color:"var(--text2)", fontSize:13, padding:"20px 0", textAlign:"center" }}><div style={{ fontSize:28, marginBottom:8 }}>🚌</div>No approved drivers yet</div>}
              {approved.map(d => {
                const assignedDest = CAMPUSES.find(c => c.id === d.destination);
                const gps = gpsData[d.id];
                const nearCampus = gps ? getNearestCampus(gps.lat, gps.lng) : null;
                return (
                  <div key={d.id} style={{ background:"var(--card)", border:`1.5px solid ${d.active?"rgba(46,125,50,0.3)":"var(--border)"}`, borderRadius:14, padding:18, boxShadow:"0 2px 8px var(--shadow)" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                      <div style={{ width:46, height:46, borderRadius:12, background:d.active?"rgba(46,125,50,0.1)":"rgba(0,0,0,0.04)", border:`1.5px solid ${d.active?"rgba(46,125,50,0.3)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                        {d.vehicleType==="Van"?"🚐":d.vehicleType==="Cart"?"🛺":"🚌"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700 }}>{d.driverName}</span>
                          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:d.active?"rgba(46,125,50,0.1)":"rgba(0,0,0,0.05)", color:d.active?"var(--green)":"#999", fontFamily:"'JetBrains Mono',monospace" }}>
                            {d.active ? "● ONLINE" : "○ OFFLINE"}
                          </span>
                        </div>
                        <div style={{ fontSize:12, color:"var(--text2)", marginBottom:10 }}>{d.driverEmail}</div>

                        {/* ── CURRENT LOCATION indicator ── */}
                        {d.active && (
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, padding:"6px 10px", background:"rgba(46,125,50,0.06)", border:"1px solid rgba(46,125,50,0.2)", borderRadius:8 }}>
                            <span style={{ fontSize:14 }}>📍</span>
                            <span style={{ fontSize:12, color:"var(--green)", fontWeight:600 }}>
                              {nearCampus
                                ? `Reached ${nearCampus.name}`
                                : gps
                                  ? `En route → ${assignedDest?.name || "—"}`
                                  : "Location not yet shared"
                              }
                            </span>
                          </div>
                        )}

                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8 }}>
                          {[["Vehicle No.", d.id, "var(--accent)", true],["Type", d.vehicleType, "var(--text)", false],["Seat Status", d.status, STATUS_CONFIG[d.status]?.color, false],["Destination", assignedDest?.name||"—", "var(--kiit)", false]].map(([label,val,col,mono])=>(
                            <div key={label} style={{ background:"var(--bg2)", borderRadius:8, padding:"8px 10px", border:"1px solid var(--border)" }}>
                              <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px", marginBottom:3 }}>{label}</div>
                              <div style={{ fontSize:13, fontWeight:600, color:col, fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Reassign + Delete */}
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                      <div style={{ fontSize:10, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", marginBottom:8 }}>REASSIGN DESTINATION</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                        {CAMPUSES.map(c => (
                          <button key={c.id} onClick={() => handleAssign(d.id, c.id)}
                            style={{ padding:"5px 11px", borderRadius:8, border:`1.5px solid ${d.destination===c.id?"var(--accent)":"var(--border)"}`, background:d.destination===c.id?"rgba(26,122,26,0.1)":"transparent", color:d.destination===c.id?"var(--accent)":"var(--text2)", fontSize:12, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, transition:"all 0.15s" }}>
                            {c.name.split(" ")[1]}
                          </button>
                        ))}
                      </div>
                      {/* Only DELETE button for approved drivers */}
                      <button onClick={() => handleRemove(d)} disabled={loading[d.id+"_action"]}
                        style={{ padding:"9px 18px", borderRadius:9, border:"1.5px solid rgba(211,47,47,0.3)", background:"rgba(211,47,47,0.06)", color:"var(--red)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        🗑 DELETE DRIVER
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
