import { useState } from "react";
import { etaColor } from "../utils/eta";

export function LocationBanner({ onGranted, onDenied }) {
  const [asking, setAsking] = useState(false);
  const request = () => {
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setAsking(false); onGranted({ lat:pos.coords.latitude, lng:pos.coords.longitude }); },
      ()   => { setAsking(false); onDenied(); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };
  return (
    <div style={{ background:"var(--card)", border:"1.5px solid rgba(26,122,26,0.3)", borderRadius:12, padding:"16px", display:"flex", flexDirection:"column", gap:12, boxShadow:"0 2px 10px var(--shadow)" }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ fontSize:26, flexShrink:0 }}>📍</div>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:"var(--accent)", marginBottom:3 }}>Enable Location for ETA</div>
          <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>Allow location access to calculate live bus arrival times.</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={request} disabled={asking}
          style={{ flex:1, padding:"9px 0", borderRadius:9, border:"none", background:"linear-gradient(135deg,var(--accent2),var(--accent))", color:"#fff", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", opacity:asking?0.7:1 }}>
          {asking ? "Requesting…" : "Allow Location"}
        </button>
        <button onClick={onDenied}
          style={{ padding:"9px 14px", borderRadius:9, border:"1.5px solid var(--border)", background:"transparent", color:"var(--text2)", fontSize:12, cursor:"pointer" }}>
          Skip
        </button>
      </div>
    </div>
  );
}

export function ETABadge({ etaSeconds, etaLabel, distanceKm }) {
  const col = etaColor(etaSeconds);
  const urgent = etaSeconds <= 120;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8, background:`${col}10`, border:`1.5px solid ${col}40`, marginTop:8 }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:col, flexShrink:0, ...(urgent?{animation:"pulse-glow 0.8s infinite"}:{}) }}/>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:col, fontFamily:"'Space Grotesk',sans-serif" }}>{etaLabel}</div>
        <div style={{ fontSize:10, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace" }}>
          {distanceKm < 1 ? `${Math.round(distanceKm*1000)} m away` : `${distanceKm.toFixed(2)} km away`}
        </div>
      </div>
      <div style={{ marginLeft:"auto", fontSize:9, color:"var(--text2)", fontFamily:"'JetBrains Mono',monospace" }}>ETA</div>
    </div>
  );
}
