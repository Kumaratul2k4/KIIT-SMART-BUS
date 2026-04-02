import { useState, useEffect } from "react";
import KIITLogo from "../components/KIITLogo";
import AnimatedBg from "../components/AnimatedBg";

export default function LandingPage({ onNext }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  const ticker = ["🚌 LIVE BUS TRACKING","📍 REAL-TIME GPS","💺 SEAT AVAILABILITY","🏫 ALL CAMPUSES","⚡ INSTANT UPDATES","🎓 KIIT UNIVERSITY"];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px 56px", position:"relative", zIndex:1, background:"var(--bg)" }}>
      <AnimatedBg/>

      {/* Top green bar */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"4px", background:"linear-gradient(90deg,#145214,#1a7a1a,#4caf50,#1a7a1a,#145214)", zIndex:100 }}/>

      <div style={{ maxWidth:680, width:"100%", textAlign:"center", animation:vis?"fadeUp 0.8s ease forwards":"none", opacity:vis?1:0 }}>

        {/* Logo */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <div style={{ position:"relative", animation:"float 4s ease-in-out infinite" }}>
            <div style={{ position:"absolute", inset:"-14px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,125,50,0.15) 0%, transparent 70%)", animation:"pulse-glow 2.5s infinite" }}/>
            <KIITLogo size={100}/>
          </div>
        </div>

        {/* University name */}
        <div style={{ fontSize:13, fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, color:"var(--text2)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:8 }}>
          KALINGA INSTITUTE OF INDUSTRIAL TECHNOLOGY
        </div>

        {/* Main headline */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(36px,8vw,72px)", fontWeight:800, lineHeight:1.0, color:"var(--text)" }}>
            KIIT
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(36px,8vw,72px)", fontWeight:800, lineHeight:1.0, color:"var(--accent)" }}>
            SmartBus
          </div>
        </div>

        <p style={{ fontSize:"clamp(14px,2.5vw,17px)", color:"var(--text2)", maxWidth:460, margin:"20px auto 36px", lineHeight:1.75, fontWeight:400 }}>
          Real-time campus bus tracking for <span style={{ color:"var(--accent)", fontWeight:600 }}>KIIT University</span>. Know where your bus is, where it's going, and whether you can board — instantly.
        </p>

        {/* Stats */}
        <div style={{ display:"flex", justifyContent:"center", gap:"clamp(20px,5vw,48px)", marginBottom:44, flexWrap:"wrap" }}>
          {[["10","Campuses"],["Live","GPS"],["3","Seat Tiers"],["24/7","Uptime"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(22px,5vw,32px)", fontWeight:800, color:"var(--accent)" }}>{n}</div>
              <div style={{ fontSize:"10px", color:"var(--text2)", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>{l}</div>
            </div>
          ))}
        </div>

        <button className="btn btn--primary" onClick={onNext} style={{ fontSize:"15px", padding:"16px 52px", borderRadius:"50px", letterSpacing:"1.5px", boxShadow:"0 6px 24px rgba(46,125,50,0.35)" }}>
          GET STARTED →
        </button>

        {/* Feature pills */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:32 }}>
          {["🗺 Live Map","📍 GPS Tracking","💺 Seat Status"].map(f => (
            <div key={f} style={{ padding:"5px 13px", borderRadius:"20px", fontSize:"12px", border:"1.5px solid var(--border)", color:"var(--text2)", background:"rgba(46,125,50,0.04)", fontFamily:"'JetBrains Mono',monospace" }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:"34px", background:"rgba(26,122,26,0.08)", borderTop:"1.5px solid rgba(26,122,26,0.15)", display:"flex", alignItems:"center", overflow:"hidden", zIndex:50 }}>
        <div style={{ display:"flex", gap:"60px", whiteSpace:"nowrap", animation:"marquee 22s linear infinite", fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"var(--accent)", letterSpacing:"1px" }}>
          {[...ticker,...ticker,...ticker].map((t,i) => <span key={i}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
