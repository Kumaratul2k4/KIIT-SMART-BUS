import { useState, useEffect } from "react";
import KIITLogo from "../components/KIITLogo";
import AnimatedBg from "../components/AnimatedBg";

export default function RoleSelectPage({ onSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  const roles = [
    { id:"student", icon:"🎓", title:"Student",  desc:"Track buses live, check seat availability and plan your commute.", color:"#1a7a1a", bg:"rgba(26,122,26,0.06)", border:"rgba(26,122,26,0.35)" },
    { id:"driver",  icon:"🚌", title:"Driver",   desc:"Share your live GPS, update seat availability for your route.", color:"#2e7d32", bg:"rgba(46,125,50,0.06)", border:"rgba(46,125,50,0.35)" },
    { id:"admin",   icon:"🛡️", title:"Admin",    desc:"Monitor the fleet, approve drivers and manage operations.", color:"#145214", bg:"rgba(20,82,20,0.06)", border:"rgba(20,82,20,0.35)" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", position:"relative", zIndex:1, background:"var(--bg)" }}>
      <AnimatedBg/>
      <div style={{ position:"fixed", top:0, left:0, right:0, height:"4px", background:"linear-gradient(90deg,#145214,#1a7a1a,#4caf50,#1a7a1a,#145214)" }}/>

      <div style={{ maxWidth:760, width:"100%", animation:vis?"fadeUp 0.6s ease forwards":"none" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}><KIITLogo size={60}/></div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(26px,6vw,44px)", fontWeight:800, color:"var(--text)" }}>Who are you?</div>
          <p style={{ color:"var(--text2)", fontSize:14, marginTop:8 }}>Select your role to continue</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {roles.map((r,i) => (
            <div key={r.id} onClick={() => onSelect(r.id)} onMouseEnter={() => setHovered(r.id)} onMouseLeave={() => setHovered(null)}
              style={{ background:hovered===r.id?r.bg:"var(--card)", border:`2px solid ${hovered===r.id?r.border:"var(--border)"}`, borderRadius:18, padding:"28px 20px", cursor:"pointer", transition:"all 0.25s", transform:hovered===r.id?"translateY(-4px)":"none", boxShadow:hovered===r.id?`0 12px 32px ${r.color}18`:"0 2px 8px var(--shadow)", animation:`fadeUp 0.6s ease ${i*0.1+0.1}s both`, textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:14 }}>{r.icon}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:hovered===r.id?r.color:"var(--text)", marginBottom:10 }}>{r.title}</div>
              <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{r.desc}</p>
              <div style={{ marginTop:20, padding:"9px 16px", borderRadius:9, background:hovered===r.id?r.color:"rgba(26,122,26,0.06)", color:hovered===r.id?"#fff":"var(--text2)", border:`1.5px solid ${hovered===r.id?r.color:"var(--border)"}`, fontSize:13, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", transition:"all 0.25s" }}>
                CONTINUE →
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:30 }}>
          <button className="btn btn--ghost" onClick={onBack} style={{ fontSize:13, padding:"8px 20px" }}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}
