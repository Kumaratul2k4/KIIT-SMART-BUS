import { useState, useEffect, useRef } from "react";
import KIITLogo from "../components/KIITLogo";
import CampusMap from "../components/CampusMap";
import { LocationBanner, ETABadge } from "../components/ETAComponents";
import { CAMPUSES, STATUS_CONFIG } from "../data/constants";
import { calcETA, etaColor } from "../utils/eta";
import { listenBuses, listenAllGPS } from "../utils/db";

export default function StudentDashboard({ user, onLogout }) {
  const [buses, setBuses]           = useState([]);
  const [gpsData, setGpsData]       = useState({});
  const [sel, setSel]               = useState(null);
  const [destFilter, setDestFilter] = useState(""); // "" = show all, campus id = filter
  const [studentLoc, setStudentLoc] = useState(null);
  const [locStatus, setLocStatus]   = useState("prompt");
  const [etaMap, setEtaMap]         = useState({});
  const watchRef    = useRef(null);
  const gpsUnsubRef = useRef(null);

  useEffect(() => {
    const unsub = listenBuses(setBuses);
    return () => unsub();
  }, []);

  useEffect(() => {
    gpsUnsubRef.current = listenAllGPS(setGpsData);
    return () => { if (gpsUnsubRef.current) gpsUnsubRef.current(); };
  }, []);

  useEffect(() => {
    if (sel) {
      const updated = buses.find(b => b.id === sel.id);
      if (updated) setSel(updated);
    }
  }, [buses]);

  useEffect(() => {
    if (!studentLoc) return;
    const recalc = () => {
      const map = {};
      buses.filter(b => b.active && b.approved).forEach(b => {
        const gps = gpsData[b.id];
        map[b.id] = calcETA(gps?.lat ?? b.lat, gps?.lng ?? b.lng, studentLoc.lat, studentLoc.lng);
      });
      setEtaMap(map);
    };
    recalc();
    const iv = setInterval(recalc, 5000);
    return () => clearInterval(iv);
  }, [studentLoc, buses, gpsData]);

  const handleLocationGranted = (loc) => {
    setStudentLoc(loc);
    setLocStatus("granted");
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        pos => setStudentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
  };

  useEffect(() => {
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const approvedBuses = buses.filter(b => b.approved);
  const activeBuses   = approvedBuses.filter(b => b.active);

  // All approved buses shown initially, filtered by destination when chosen
  const displayBuses = destFilter
    ? approvedBuses.filter(b => b.destination === destFilter)
    : approvedBuses;

  // Buses shown on map — all active when no filter, or filtered active
  const mapBuses = destFilter
    ? buses.filter(b => b.active && b.approved && b.destination === destFilter)
    : buses;

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--bg)" }}>
      {/* Header */}
      <header style={{ background:"var(--card)", borderBottom:"2px solid var(--border)", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:62, position:"sticky", top:0, zIndex:100, flexShrink:0, boxShadow:"0 2px 12px var(--shadow)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <KIITLogo size={38}/>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>KIIT <span style={{ color:"var(--accent)" }}>SmartBus</span></div>
            <div style={{ fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" }}>STUDENT VIEW</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {locStatus === "granted" && (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--green)", background:"rgba(46,125,50,0.08)", border:"1px solid rgba(46,125,50,0.25)", padding:"4px 10px", borderRadius:20 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse-glow 1.5s infinite" }}/>
              Location ON
            </div>
          )}
          {locStatus === "denied" && (
            <button onClick={() => setLocStatus("prompt")} style={{ fontSize:11, color:"var(--text2)", background:"transparent", border:"1px solid var(--border)", padding:"4px 10px", borderRadius:20, cursor:"pointer" }}>
              📍 Enable ETA
            </button>
          )}
          <span style={{ fontSize:13, color:"var(--text2)" }}>Hey, <span style={{ color:"var(--accent)", fontWeight:600 }}>{user.name?.split(" ")[0]}</span></span>
          <button className="btn btn--ghost" onClick={onLogout} style={{ fontSize:12, padding:"6px 14px" }}>Logout</button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>
        {/* Map */}
        <div style={{ flex:1, position:"relative", overflow:"hidden", borderRight:"2px solid var(--border)" }}>
          <CampusMap buses={mapBuses} gpsData={gpsData} studentLoc={studentLoc} onBusClick={setSel} selectedBusId={sel?.id}/>
          <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:8, pointerEvents:"none", zIndex:500 }}>
            <div style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", border:"1px solid var(--border)", borderRadius:8, padding:"5px 11px", fontSize:11, color:"var(--accent)", fontFamily:"'JetBrains Mono',monospace", boxShadow:"0 2px 8px var(--shadow)" }}>
              🟢 {activeBuses.length} Live
            </div>
            <div style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", border:"1px solid var(--border)", borderRadius:8, padding:"5px 11px", fontSize:11, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", boxShadow:"0 2px 8px var(--shadow)" }}>
              📍 KIIT Bhubaneswar
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width:310, minWidth:280, background:"var(--bg2)", overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>

          {/* Location banner */}
          {locStatus === "prompt" && <LocationBanner onGranted={handleLocationGranted} onDenied={() => setLocStatus("denied")}/>}

          {/* Nearest bus strip */}
          {locStatus === "granted" && activeBuses.length > 0 && (() => {
            const nearest = [...activeBuses].sort((a,b) => (etaMap[a.id]?.etaSeconds||99999)-(etaMap[b.id]?.etaSeconds||99999))[0];
            const eta = etaMap[nearest?.id];
            return nearest && eta ? (
              <div style={{ background:"var(--card)", border:"1.5px solid rgba(46,125,50,0.3)", borderRadius:12, padding:"12px 14px", boxShadow:"0 2px 10px var(--shadow)" }}>
                <div style={{ fontSize:10, color:"var(--accent)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", marginBottom:6 }}>NEAREST BUS TO YOU</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"var(--accent)", fontWeight:700 }}>{nearest.id}</span>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:etaColor(eta.etaSeconds) }}>{eta.etaLabel}</span>
                </div>
              </div>
            ) : null;
          })()}

          {/* ── DESTINATION DROPDOWN ── */}
          <div style={{ background:"var(--card)", border:"1.5px solid var(--border)", borderRadius:12, padding:14, boxShadow:"0 2px 8px var(--shadow)" }}>
            <label style={{ fontSize:11, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase", display:"block", marginBottom:8 }}>
              Choose Destination
            </label>
            <select
              value={destFilter}
              onChange={e => { setDestFilter(e.target.value); setSel(null); }}
              style={{ width:"100%", padding:"10px 14px", borderRadius:9, border:"1.5px solid var(--border)", background:"var(--bg2)", color:"var(--text)", fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            >
              <option value="">🚌 Show all buses</option>
              {CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {destFilter && (
              <button onClick={() => { setDestFilter(""); setSel(null); }}
                style={{ marginTop:8, fontSize:11, color:"var(--red)", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                ✕ Clear filter
              </button>
            )}
          </div>

          {/* Selected bus detail */}
          {sel && (() => {
            const eta = etaMap[sel.id];
            return (
              <div style={{ background:"var(--card)", border:"1.5px solid rgba(46,125,50,0.35)", borderRadius:12, padding:14, position:"relative", boxShadow:"0 2px 10px var(--shadow)" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--accent2),var(--accent))", borderRadius:"12px 12px 0 0" }}/>
                <div style={{ fontSize:10, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", marginBottom:5 }}>SELECTED BUS</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:"var(--accent)", fontWeight:700 }}>{sel.id}</div>
                  {eta && <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:etaColor(eta.etaSeconds) }}>{eta.etaLabel}</div>}
                </div>
                <div style={{ fontSize:13, color:"var(--text2)", marginTop:3 }}>→ {CAMPUSES.find(c=>c.id===sel.destination)?.name}</div>
                {eta && <ETABadge {...eta}/>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                  <span style={{ fontSize:11, padding:"3px 9px", borderRadius:20, color:STATUS_CONFIG[sel.status]?.color, background:`${STATUS_CONFIG[sel.status]?.color}18`, border:`1px solid ${STATUS_CONFIG[sel.status]?.color}44`, fontFamily:"'JetBrains Mono',monospace" }}>{STATUS_CONFIG[sel.status]?.icon} {sel.status}</span>
                  <span style={{ fontSize:10, color:"var(--text2)", fontFamily:"monospace" }}>{Math.floor((Date.now()-sel.lastUpdate)/1000)}s ago</span>
                </div>
              </div>
            );
          })()}

          {/* Bus list */}
          {displayBuses.map(b => {
            const dest  = CAMPUSES.find(c => c.id === b.destination);
            const sc    = STATUS_CONFIG[b.status] || STATUS_CONFIG["Empty"];
            const isSel = sel?.id === b.id;
            const eta   = etaMap[b.id];
            return (
              <div key={b.id} onClick={() => b.active && setSel(b)}
                style={{ background: isSel ? "var(--card2)" : "var(--card)", border:`1.5px solid ${isSel?"rgba(46,125,50,0.5)":"var(--border)"}`, borderRadius:12, padding:13, cursor:b.active?"pointer":"default", opacity:b.active?1:0.45, transition:"all 0.2s", position:"relative", boxShadow: isSel?"0 4px 16px var(--shadow)":"0 1px 4px var(--shadow)" }}>
                {isSel && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--accent2),var(--accent))", borderRadius:"12px 12px 0 0" }}/>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:"var(--accent)", background:"rgba(26,122,26,0.08)", border:"1px solid rgba(26,122,26,0.2)", padding:"2px 8px", borderRadius:6 }}>{b.id}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {b.active && eta && <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, color:etaColor(eta.etaSeconds) }}>{eta.etaLabel}</span>}
                    {b.active ? <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", display:"inline-block" }}/> : <span style={{ fontSize:9, color:"#aaa", fontFamily:"monospace" }}>OFFLINE</span>}
                  </div>
                </div>
                <div style={{ fontSize:13, color:"var(--text)", marginBottom:6, fontWeight:500 }}>→ {dest?.name}</div>
                {b.active && eta ? (
                  <div style={{ fontSize:11, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace", marginBottom:7 }}>
                    📏 {eta.distanceKm < 1 ? `${Math.round(eta.distanceKm*1000)} m` : `${eta.distanceKm.toFixed(2)} km`} from you
                  </div>
                ) : b.active && locStatus !== "granted" ? (
                  <div style={{ fontSize:11, color:"rgba(26,122,26,0.5)", fontFamily:"'JetBrains Mono',monospace", marginBottom:7 }}>Enable location for ETA</div>
                ) : null}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, padding:"3px 9px", borderRadius:20, color:sc.color, background:`${sc.color}15`, border:`1px solid ${sc.color}44`, fontFamily:"'JetBrains Mono',monospace" }}>{sc.icon} {b.status}</span>
                  {b.active && <span style={{ fontSize:10, color:"var(--text2)", fontFamily:"monospace" }}>{Math.floor((Date.now()-b.lastUpdate)/1000)}s ago</span>}
                </div>
              </div>
            );
          })}

          {displayBuses.length === 0 && (
            <div style={{ color:"var(--text2)", textAlign:"center", padding:"40px 16px", fontSize:13, lineHeight:1.8 }}>
              {approvedBuses.length === 0
                ? <><div style={{ fontSize:32, marginBottom:10 }}>🚌</div><div style={{ color:"var(--text)", fontSize:14, fontWeight:600, marginBottom:6 }}>No buses yet</div><div>No approved drivers yet.</div></>
                : <><div style={{ fontSize:28, marginBottom:8 }}>🔍</div>No buses heading to {CAMPUSES.find(c=>c.id===destFilter)?.name || "this campus"} right now</>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
