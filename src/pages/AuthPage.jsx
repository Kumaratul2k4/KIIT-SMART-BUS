import { useState, useEffect } from "react";
import AnimatedBg from "../components/AnimatedBg";
import KIITLogo from "../components/KIITLogo";
import { registerUser, loginUser } from "../utils/db";

const RC = {
  student: {
    color:"#1a7a1a", icon:"🎓", label:"Student",
    fields:[
      { key:"name",     label:"Full Name",  type:"text",     ph:"Enter your full name" },
      { key:"email",    label:"Email ID",   type:"email",    ph:"your@kiit.ac.in" },
      { key:"password", label:"Password",   type:"password", ph:"Create a password" },
    ],
  },
  driver: {
    color:"#2e7d32", icon:"🚌", label:"Driver",
    fields:[
      { key:"name",        label:"Full Name",      type:"text",     ph:"Enter your full name" },
      { key:"email",       label:"Email ID",       type:"email",    ph:"driver@kiit.ac.in" },
      { key:"vehicle",     label:"Vehicle Number", type:"text",     ph:"e.g. OD-05-AB-1234" },
      { key:"vehicleType", label:"Vehicle Type",   type:"select",   opts:["Bus","Van","Cart"] },
      { key:"password",    label:"Password",       type:"password", ph:"Create a password" },
    ],
  },
  admin: {
    color:"#145214", icon:"🛡️", label:"Admin",
    fields:[], // admin only has login, no register
  },
};

function PwdField({ fieldKey, placeholder, value, onChange, onEnter, showPwd, togglePwd }) {
  return (
    <div style={{ position:"relative" }}>
      <input
        type={showPwd[fieldKey] ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        style={{ paddingRight:44 }}
      />
      <button type="button" onClick={() => togglePwd(fieldKey)}
        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:18, color:"var(--text2)", padding:0 }}>
        {showPwd[fieldKey] ? "👁" : "🙈"}
      </button>
    </div>
  );
}

export default function AuthPage({ role, onSuccess, onBack }) {
  const [mode, setMode]       = useState(role === "admin" ? "login" : "choose");
  const [form, setForm]       = useState({});
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({});
  const [vis, setVis]         = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  const rc        = RC[role];
  const set       = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const togglePwd = (k)    => setShowPwd(p => ({ ...p, [k]: !p[k] }));
  const accentBtn = { background:`linear-gradient(135deg,${rc.color}dd,${rc.color})`, color:"#fff", border:"none" };

  const handleRegister = async () => {
    setError("");
    for (const f of rc.fields) { if (!form[f.key]) { setError(`Please fill in: ${f.label}`); return; } }
    setLoading(true);
    try {
      const user = await registerUser({ ...form, role });
      onSuccess(user);
    } catch (e) {
      setError(e.message.includes("email-already-in-use") ? "Email already registered. Please login." : e.message);
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.login_pwd) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const user = await loginUser(form.email, form.login_pwd);
      if (user.role !== role) { setError("Wrong role selected for this account"); setLoading(false); return; }
      onSuccess(user);
    } catch (e) {
      setError("Invalid email or password");
    } finally { setLoading(false); }
  };

  const resetForm = () => { setForm({}); setError(""); setShowPwd({}); };

  // Admin goes straight to login — no choose/register screen
  const showChoose = mode === "choose" && role !== "admin";

  if (showChoose) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1, background:"var(--bg)" }}>
      <AnimatedBg/>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center", animation:vis?"fadeUp 0.6s ease forwards":"none" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><KIITLogo size={64}/></div>
        <div style={{ fontSize:28, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, color:rc.color, marginBottom:6 }}>{rc.label} Portal</div>
        <p style={{ color:"var(--text2)", fontSize:13, marginBottom:36 }}>KIIT SmartBus — {rc.label} Access</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <button className="btn btn--full" style={accentBtn} onClick={() => setMode("login")}>Login to Existing Account</button>
          <button className="btn btn--ghost btn--full" style={{ borderColor:`${rc.color}44`, color:rc.color }} onClick={() => setMode("register")}>Create New Account</button>
        </div>
        <button className="btn btn--ghost" onClick={onBack} style={{ marginTop:24, fontSize:13, padding:"8px 18px" }}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1, overflowY:"auto", background:"var(--bg)" }}>
      <AnimatedBg/>
      <div style={{ maxWidth:440, width:"100%", animation:vis?"fadeUp 0.5s ease forwards":"none", margin:"20px auto" }}>
        <div style={{ background:"var(--card)", border:`1.5px solid ${rc.color}33`, borderRadius:20, padding:"clamp(24px,5vw,36px)", boxShadow:`0 8px 40px var(--shadow), 0 0 0 1px ${rc.color}11` }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><KIITLogo size={56}/></div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:rc.color }}>
              {mode === "login" ? `${rc.label} Login` : `${rc.label} Registration`}
            </div>
            <p style={{ color:"var(--text2)", fontSize:12, marginTop:4 }}>KIIT SmartBus Portal</p>
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
            {mode === "register" ? rc.fields.map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                {f.type === "select"
                  ? <select value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)}>
                      <option value="">Select {f.label}</option>
                      {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  : f.type === "password"
                    ? <PwdField fieldKey={f.key} placeholder={f.ph} value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)} onEnter={handleRegister} showPwd={showPwd} togglePwd={togglePwd}/>
                    : <input type={f.type} placeholder={f.ph} value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)}/>
                }
              </div>
            )) : (
              <>
                <div className="form-group">
                  <label className="form-label">Email ID</label>
                  <input type="email" placeholder="your@kiit.ac.in" value={form.email||""} onChange={e=>set("email",e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <PwdField fieldKey="login_pwd" placeholder="Enter password" value={form.login_pwd||""} onChange={e=>set("login_pwd",e.target.value)} onEnter={handleLogin} showPwd={showPwd} togglePwd={togglePwd}/>
                </div>
              </>
            )}
          </div>

          {error && <div className="form-error" style={{ marginBottom:14 }}>{error}</div>}

          <button className="btn btn--full" disabled={loading} onClick={mode==="login"?handleLogin:handleRegister}
            style={{ ...accentBtn, fontSize:15, letterSpacing:0.5, opacity:loading?0.7:1, padding:"13px" }}>
            {loading ? "Please wait..." : mode==="login" ? "LOGIN →" : "CREATE ACCOUNT →"}
          </button>

          {/* Only show toggle for non-admin */}
          {role !== "admin" && (
            <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--text2)" }}>
              {mode==="login"
                ? <span>No account? <button onClick={()=>{setMode("register");resetForm();}} style={{ background:"none",border:"none",color:rc.color,cursor:"pointer",fontWeight:600,fontSize:13 }}>Register here</button></span>
                : <span>Have account? <button onClick={()=>{setMode("login");resetForm();}} style={{ background:"none",border:"none",color:rc.color,cursor:"pointer",fontWeight:600,fontSize:13 }}>Login</button></span>
              }
            </div>
          )}
        </div>
        <div style={{ textAlign:"center", marginTop:20 }}>
          <button className="btn btn--ghost" onClick={() => role==="admin" ? onBack() : setMode("choose")} style={{ fontSize:13, padding:"8px 18px" }}>← Back</button>
        </div>
      </div>
    </div>
  );
}
