import { useState } from "react";

export default function Disclaimer({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#06080f", minHeight:"100vh", color:"#e4ede8", maxWidth:440, margin:"0 auto", display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 22px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Syne:wght@800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>💧</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#63d39e,#a8f0c8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flo·zēk</div>
        <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>Water Intelligence Platform</div>
      </div>

      <div style={{ padding:20, background:"rgba(255,255,255,0.03)", borderRadius:20, border:"1px solid rgba(99,211,158,0.12)", marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#63d39e", fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>⚖️ Important Disclaimer</div>
        <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.85, marginBottom:10 }}>
          Flo·zēk is an <strong style={{color:"#e4ede8"}}>independent research and information platform</strong>. We are not doctors, licensed chemists, scientists, or medical professionals.
        </div>
        <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.85, marginBottom:10 }}>
          All information is gathered from publicly available scientific literature, municipal water reports, and WHO guidelines, for <strong style={{color:"#e4ede8"}}>general educational purposes only</strong>.
        </div>
        <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.85, marginBottom:10 }}>
          <strong style={{color:"#e4ede8"}}>Nothing in this app constitutes medical advice.</strong> Always consult a qualified healthcare professional regarding any health concerns.
        </div>
        <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.85 }}>
          Individual water needs vary based on personal health conditions, age, weight, and medical history.
        </div>
      </div>

      <div style={{ padding:16, background:"rgba(99,211,158,0.05)", borderRadius:16, border:"1px solid rgba(99,211,158,0.1)", marginBottom:20 }}>
        <div style={{ fontSize:12, color:"#63d39e", fontWeight:700, marginBottom:8 }}>🤖 About WALTER</div>
        <div style={{ fontSize:12, color:"rgba(200,230,215,0.65)", lineHeight:1.75 }}>
          WALTER (Water Analysis & Life Track Enhancement Recommendations) is an AI research assistant. Walter's insights are based on publicly available water science data and are meant to <strong style={{color:"#e4ede8"}}>inform and educate</strong> — not diagnose or treat any condition.
        </div>
      </div>

      <button onClick={()=>setChecked(!checked)} style={{ display:"flex", alignItems:"flex-start", gap:12, background:"none", border:"none", cursor:"pointer", marginBottom:20, padding:0, textAlign:"left" }}>
        <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${checked?"#63d39e":"rgba(200,230,215,0.2)"}`, background:checked?"rgba(99,211,158,0.15)":"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1, transition:"all 0.2s" }}>
          {checked && <span style={{ color:"#63d39e", fontSize:14, fontWeight:700 }}>✓</span>}
        </div>
        <span style={{ fontSize:13, color:"rgba(200,230,215,0.7)", lineHeight:1.6 }}>
          I understand that Flo·zēk provides educational water research only and is not a substitute for professional medical advice.
        </span>
      </button>

      <button onClick={()=>{ if(checked) onAccept(); }} style={{ width:"100%", padding:"16px", background:checked?"linear-gradient(135deg,#63d39e,#2da870)":"rgba(255,255,255,0.05)", border:checked?"none":"1px solid rgba(255,255,255,0.08)", borderRadius:14, fontSize:15, fontWeight:700, color:checked?"#040d1a":"rgba(200,230,215,0.25)", cursor:checked?"pointer":"not-allowed", transition:"all 0.3s", boxShadow:checked?"0 8px 28px rgba(99,211,158,0.25)":"none" }}>
        {checked ? "Enter Flo·zēk 💧" : "Please accept to continue"}
      </button>

      <div style={{ textAlign:"center", marginTop:16, fontSize:10, color:"rgba(200,230,215,0.2)", lineHeight:1.6 }}>
        By entering you agree to our terms of use.<br/>Flo·zēk © 2026 · Seek what flows through you.
      </div>
    </div>
  );
        }
