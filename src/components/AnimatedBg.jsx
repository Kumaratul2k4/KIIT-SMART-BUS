export default function AnimatedBg() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      {/* Subtle grid */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }}>
        <defs>
          <pattern id="bgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a7a1a" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGrid)"/>
      </svg>
      {/* Soft green glow orbs */}
      <div style={{ position:"absolute", top:"-15%", left:"-10%", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,125,50,0.08) 0%, transparent 70%)" }}/>
      <div style={{ position:"absolute", bottom:"-15%", right:"-10%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(26,122,26,0.07) 0%, transparent 70%)" }}/>
      {/* Floating dots */}
      {[...Array(10)].map((_,i) => (
        <div key={i} style={{
          position:"absolute", borderRadius:"50%",
          width:`${4+(i%3)*2}px`, height:`${4+(i%3)*2}px`,
          background: i%3===0?"#2e7d32":i%3===1?"#1a7a1a":"#4caf50",
          left:`${(i*10.3)%100}%`, top:`${(i*11.7)%100}%`,
          opacity:0.2,
          animation:`float ${5+(i%4)}s ease-in-out infinite`,
          animationDelay:`${i*0.5}s`,
        }}/>
      ))}
    </div>
  );
}
