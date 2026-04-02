export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #f0f4f0;
    --bg2:     #e8efe8;
    --bg3:     #dde8dd;
    --card:    #ffffff;
    --card2:   #f5faf5;
    --border:  rgba(34,139,34,0.18);
    --accent:  #1a7a1a;
    --accent2: #145214;
    --gold:    #2e7d32;
    --text:    #1a2e1a;
    --text2:   rgba(26,46,26,0.5);
    --green:   #2e7d32;
    --yellow:  #f59f00;
    --red:     #d32f2f;
    --kiit:    #1a7a1a;
    --kiit2:   #145214;
    --shadow:  rgba(34,139,34,0.12);
  }
  html, body, #root { height: 100%; }
  body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-thumb { background: rgba(34,139,34,0.25); border-radius: 4px; }
  input, select, textarea {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 10px; color: var(--text);
    padding: 12px 16px; font-size: 14px; width: 100%; outline: none; transition: all 0.2s;
    box-shadow: 0 1px 4px var(--shadow);
  }
  input:focus, select:focus { border-color: var(--accent); background: #f5faf5; box-shadow: 0 0 0 3px rgba(34,139,34,0.1); }
  input::placeholder { color: var(--text2); }
  select option { background: #fff; color: var(--text); }
  .btn {
    padding: 13px 24px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;
    transition: all 0.25s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn--primary { background: linear-gradient(135deg, var(--accent2), var(--accent)); color: #fff; box-shadow: 0 4px 16px rgba(34,139,34,0.3); }
  .btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,139,34,0.35); }
  .btn--ghost { background: transparent; border: 1.5px solid var(--border); color: var(--text2); }
  .btn--ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(34,139,34,0.05); }
  .btn--full { width: 100%; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 11px; color: var(--text2); letter-spacing: 1.5px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
  .form-error { font-size: 12px; color: var(--red); margin-top: 2px; text-align: center; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  @keyframes pulse-glow { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
  @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes slideIn { from { transform:translateX(-100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
`;
