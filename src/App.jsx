import { useState } from "react";
import {
  WATER_DB, CITIES, GLOSSARY, UMBRELLA_COMPANIES,
  FILTER_RECOMMENDATIONS, HOW_TO_READ_DATA, CIVIC_CONTACTS,
  WALTER_QA_PROMPTS
} from "./data";

const calcLSI = w => {
  const A = w.tds < 50 ? 0.07 : w.tds < 150 ? 0.14 : w.tds < 300 ? 0.19 : w.tds < 500 ? 0.22 : 0.26;
  const C = w.calcium < 25 ? 1.0 : w.calcium < 50 ? 1.3 : w.calcium < 100 ? 1.6 : w.calcium < 200 ? 1.9 : 2.2;
  const D = w.bicarbonate < 25 ? 1.1 : w.bicarbonate < 50 ? 1.4 : w.bicarbonate < 100 ? 1.7 : w.bicarbonate < 200 ? 2.0 : 2.3;
  return parseFloat((w.pH - ((9.3 + A + 1.0) - (C + D))).toFixed(2));
};

const getLSIStatus = lsi => {
  if (lsi < -0.5) return { label:"Aggressive",        color:"#dc2626", emoji:"🔴", bg:"rgba(220,38,38,0.08)"  };
  if (lsi < -0.2) return { label:"Mildly Aggressive", color:"#ea580c", emoji:"🟠", bg:"rgba(234,88,12,0.08)"  };
  if (lsi <= 0.2) return  { label:"Balanced",          color:"#16a34a", emoji:"🟢", bg:"rgba(22,163,74,0.08)"  };
  if (lsi <= 0.5) return  { label:"Mildly Scaling",    color:"#ca8a04", emoji:"🟡", bg:"rgba(202,138,4,0.08)"  };
  return                  { label:"High Scaling",      color:"#7c3aed", emoji:"🟣", bg:"rgba(124,58,237,0.08)" };
};

const getScore = w => {
  let s = 50;
  const lsi = calcLSI(w);
  if (lsi >= -0.2 && lsi <= 0.3) s += 15; else if (lsi < -0.5) s -= 20; else if (lsi < -0.2) s -= 8;
  if (w.magnesium >= 50) s += 18; else if (w.magnesium >= 20) s += 13; else if (w.magnesium >= 8) s += 6; else if (w.magnesium < 2) s -= 10;
  if (w.calcium >= 150) s += 15; else if (w.calcium >= 60) s += 10; else if (w.calcium >= 20) s += 5; else if (w.calcium < 5) s -= 8;
  if (w.pH >= 7.0 && w.pH <= 8.5) s += 8; else if (w.pH < 6.5) s -= 12;
  if (!w.plastic) s += 4;
  if (w.sodium > 150) s -= 5;
  return Math.min(Math.max(s, 5), 100);
};

const getGrade = score => {
  if (score >= 85) return { grade:"A+", color:"#15803d" };
  if (score >= 78) return { grade:"A",  color:"#16a34a" };
  if (score >= 70) return { grade:"B+", color:"#0369a1" };
  if (score >= 62) return { grade:"B",  color:"#0284c7" };
  if (score >= 50) return { grade:"C",  color:"#ea580c" };
  return                  { grade:"D",  color:"#dc2626" };
};

const getCityRisk = city => {
  const pfasRisk = city.pfas > 200 ? "CRISIS" : city.pfas > 70 ? "HIGH" : city.pfas > 4 ? "ELEVATED" : "SAFE";
  const leadRisk = city.lead > 15 ? "CRISIS" : city.lead > 3.8 ? "ELEVATED" : "SAFE";
  const nitrateRisk = city.nitrate > 10 ? "CRISIS" : city.nitrate > 3 ? "ELEVATED" : "SAFE";
  const overallRisk = [pfasRisk, leadRisk, nitrateRisk].includes("CRISIS") ? "CRISIS"
    : [pfasRisk, leadRisk, nitrateRisk].includes("HIGH") ? "HIGH"
    : [pfasRisk, leadRisk, nitrateRisk].includes("ELEVATED") ? "ELEVATED" : "SAFE";
  return { pfasRisk, leadRisk, nitrateRisk, overallRisk };
};

const riskColor = r => r === "CRISIS" ? "#dc2626" : r === "HIGH" ? "#ea580c" : r === "ELEVATED" ? "#ca8a04" : "#16a34a";
const riskBg = r => r === "CRISIS" ? "rgba(220,38,38,0.08)" : r === "HIGH" ? "rgba(234,88,12,0.08)" : r === "ELEVATED" ? "rgba(202,138,4,0.08)" : "rgba(22,163,74,0.08)";

const BG = "linear-gradient(160deg,#e8f4fd 0%,#f0faf8 50%,#e0f2fe 100%)";
const CARD = "rgba(255,255,255,0.75)";
const BORDER = "rgba(3,105,161,0.12)";
const TEXT = "#0c2340";
const SUBTEXT = "#4a7fa5";
const BLUR = "●●●";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${BG};min-height:100vh;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(3,105,161,0.2);border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes barFill{from{width:0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .card{transition:transform 0.18s ease,box-shadow 0.18s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(3,105,161,0.12);}
  .card:active{transform:scale(0.97);}
  .btn{transition:all 0.18s ease;cursor:pointer;}
  .btn:hover{opacity:0.85;}
  .btn:active{transform:scale(0.96);}
  .blur{filter:blur(5px);user-select:none;pointer-events:none;}
  .pulse{animation:pulse 2s ease infinite;}
  input{outline:none;}
  input:focus{border-color:rgba(3,105,161,0.4)!important;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(3,105,161,0.1);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#0369a1;cursor:pointer;}
`;

export default function Flozek() {
  const [tab, setTab] = useState("home");
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTier, setBrandTier] = useState("all");
  const [brandSort, setBrandSort] = useState("score");
  const [selBrand, setSelBrand] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityRegion, setCityRegion] = useState("all");
  const [selCity, setSelCity] = useState(null);
  const [calcVals, setCalcVals] = useState({ pH:7.2, tds:150, calcium:40, bicarbonate:70 });
  const [showResult, setShowResult] = useState(false);
  const [lsiResult, setLsiResult] = useState(null);
  const [selSymptoms, setSelSymptoms] = useState([]);
  const [symptomRes, setSymptomRes] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [learnTab, setLearnTab] = useState("academy");
  const [eduIdx, setEduIdx] = useState(0);
  const [glossaryIdx, setGlossaryIdx] = useState(0);
  const [learnSub, setLearnSub] = useState("science");
  const [walterQ, setWalterQ] = useState("");
  const [walterLoading, setWalterLoading] = useState(false);
  const [walterAnswer, setWalterAnswer] = useState("");
  const [showCivic, setShowCivic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const app = { fontFamily:"'DM Sans',sans-serif", background:BG, minHeight:"100vh", color:TEXT, maxWidth:440, margin:"0 auto", position:"relative", paddingBottom:80 };

  const askWalter = async (question) => {
    if (!question.trim()) return;
    setWalterLoading(true);
    setWalterAnswer("");
    try {
      const cityContext = CITIES.slice(0, 20).map(c => `${c.name}: PFAS ${c.pfas}ppt Lead ${c.lead}ppb Violations ${c.violations}`).join(", ");
      const brandContext = WATER_DB.slice(0, 10).map(b => `${b.name}: pH ${b.pH} Ca ${b.calcium} Mg ${b.magnesium}`).join(", ");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are WALTER — Water Analysis and Life Track Enhancement Recommendations — the AI assistant inside Flo·zēk, a water intelligence platform. You are knowledgeable, direct, and passionate about water quality and public health. You speak in first person as Walter. Keep answers under 150 words. Be specific and actionable. Reference real data when relevant. City data: ${cityContext}. Brand data: ${brandContext}. Key facts: EPA PFAS limit 4ppt, Lead action level 15ppb, Nitrate MCL 10ppm. Best filter for PFAS and lead is reverse osmosis. Brita does NOT remove PFAS or lead.`,
          messages: [{ role: "user", content: question }]
        })
      });
      const data = await response.json();
      setWalterAnswer(data.content?.[0]?.text || "Walter is thinking — try again in a moment.");
    } catch {
      setWalterAnswer("Walter is temporarily offline. Please try again.");
    }
    setWalterLoading(false);
  };

  const UpgradeModal = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(12,35,64,0.85)", backdropFilter:"blur(8px)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowUpgrade(false)}>
      <div style={{ background:"white", borderRadius:"28px 28px 0 0", width:"100%", maxWidth:440, padding:"28px 24px 40px", animation:"fadeUp 0.3s ease both" }} onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔱</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#0c2340", marginBottom:6 }}>Unlock Flo·zēk Pro</div>
          <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.6 }}>Your city has flagged contaminants. See the full numbers Walter is hiding below.</div>
        </div>
        <div style={{ padding:14, background:"rgba(220,38,38,0.05)", borderRadius:16, border:"1px solid rgba(220,38,38,0.15)", marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#dc2626", fontWeight:700, marginBottom:8 }}>⚠️ Walter has detected concerns in your area</div>
          <div style={{ display:"flex", justifyContent:"space-around" }}>
            {[["PFAS","●●● ppt","☢️"],["Lead","●●● ppb","🔴"],["Violations","●●●","⚠️"]].map(([label,val,icon],i)=>(
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:20 }}>{icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#dc2626", filter:"blur(4px)" }}>{val}</div>
                <div style={{ fontSize:9, color:SUBTEXT }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          {[
            "✅ Full PFAS, Lead, and Nitrate numbers for every city",
            "✅ 55 brands fully analyzed with pros, cons, and grades",
            "✅ Walter AI — ask any water question and get real answers",
            "✅ Filter recommendations by your specific contaminants",
            "✅ Civic action toolkit — who to contact in your community",
            "✅ How to read your water data explained simply",
          ].map((item,i)=>(
            <div key={i} style={{ fontSize:12, color:TEXT, padding:"6px 0", borderBottom:"1px solid rgba(3,105,161,0.06)" }}>{item}</div>
          ))}
        </div>
        <button className="btn" onClick={()=>{ setIsPro(true); setShowUpgrade(false); }} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:16, fontWeight:700, color:"white", marginBottom:10, boxShadow:"0 8px 28px rgba(3,105,161,0.3)" }}>
          Unlock Pro — $1.99 / month
        </button>
        <button className="btn" onClick={()=>setShowUpgrade(false)} style={{ width:"100%", padding:"12px", background:"none", border:"1px solid rgba(3,105,161,0.15)", borderRadius:14, fontSize:13, color:SUBTEXT }}>
          Maybe Later
        </button>
        <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:"rgba(3,105,161,0.35)" }}>Cancel anytime · Secure payment · Funds clean water access globally</div>
      </div>
    </div>
  );

  const NavBar = () => (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:440, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", borderTop:`1px solid ${BORDER}`, display:"flex", zIndex:100, paddingBottom:8, boxShadow:"0 -4px 20px rgba(3,105,161,0.08)" }}>
      {[["🏠","Home","home"],["🔬","Test","test"],["💧","Brands","brands"],["🌆","Cities","cities"],["📚","Learn","learn"]].map(([icon,label,id])=>(
        <button key={id} className="btn" onClick={()=>{ setTab(id); setSelBrand(null); setSelCity(null); setShowResult(false); }} style={{ flex:1, background:"none", border:"none", padding:"12px 4px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:19, filter:tab===id?"none":"grayscale(0.5) opacity(0.4)" }}>{icon}</span>
          <span style={{ fontSize:9, color:tab===id?"#0369a1":"rgba(3,105,161,0.35)", fontWeight:tab===id?700:400, letterSpacing:0.5 }}>{label}</span>
          {tab===id && <div style={{ width:16, height:2, background:"#0369a1", borderRadius:1 }} />}
        </button>
      ))}
    </div>
  );

  const ProBadge = () => (
    <div style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:"linear-gradient(135deg,#0369a1,#0284c7)", borderRadius:20 }}>
      <span style={{ fontSize:9, color:"white", fontWeight:700, letterSpacing:0.5 }}>PRO</span>
    </div>
  );

  // HOME TAB
  if (tab === "home") return (
    <div style={app}>
      <style>{CSS}</style>
      {showUpgrade && <UpgradeModal />}
      <div style={{ padding:"52px 22px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flo·zēk</div>
            <div style={{ fontSize:12, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>Water Intelligence</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {isPro ? <ProBadge /> : (
              <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"6px 12px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:20, fontSize:10, fontWeight:700, color:"white" }}>Get Pro</button>
            )}
            <div style={{ fontSize:36, animation:"float 3s ease infinite" }}>💧</div>
          </div>
        </div>
        <div style={{ padding:18, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, marginBottom:16, boxShadow:"0 4px 16px rgba(3,105,161,0.08)" }}>
          <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Meet Walter</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0369a1", marginBottom:3 }}>WALTER</div>
              <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6 }}>Water Analysis and Life Track Enhancement Recommendations. Your personal water intelligence assistant.</div>
            </div>
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(3,105,161,0.05)", borderRadius:12, fontSize:12, color:SUBTEXT, lineHeight:1.6, fontStyle:"italic", borderLeft:"3px solid #0369a1" }}>
            Dasani scores a D. Aquafina scores a D. Benton Harbor Michigan has 55 ppb lead. Your body deserves better and I am going to show you exactly what to drink instead.
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"🔬", title:"Test My Water",  sub:"LSI Calculator",        id:"test",   color:"#0369a1" },
            { icon:"💧", title:"Browse Brands",  sub:"55 brands analyzed",    id:"brands", color:"#0284c7" },
            { icon:"🌆", title:"City Water",     sub:"120+ cities scored",    id:"cities", color:"#7c3aed" },
            { icon:"📚", title:"Water Academy",  sub:"Science + Walter AI",   id:"learn",  color:"#0369a1" },
          ].map((item,i)=>(
            <button key={i} className="card" onClick={()=>setTab(item.id)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:14, textAlign:"left", animation:`fadeUp 0.4s ease ${i*0.07}s both`, boxShadow:"0 2px 8px rgba(3,105,161,0.06)" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.title}</div>
              <div style={{ fontSize:10, color:SUBTEXT, marginTop:2 }}>{item.sub}</div>
            </button>
          ))}
        </div>
        {!isPro && (
          <button className="card" onClick={()=>setShowUpgrade(true)} style={{ width:"100%", padding:16, background:"linear-gradient(135deg,rgba(220,38,38,0.06),rgba(234,88,12,0.04))", border:"1px solid rgba(220,38,38,0.15)", borderRadius:16, textAlign:"left", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"#dc2626", fontWeight:700, marginBottom:4 }}>⚠️ Walter has flagged cities near you</div>
                <div style={{ fontSize:11, color:SUBTEXT }}>PFAS: ●●● ppt · Lead: ●●● ppb · Tap to unlock</div>
              </div>
              <div style={{ fontSize:22 }}>🔒</div>
            </div>
          </button>
        )}
        <div style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:12, boxShadow:"0 2px 8px rgba(3,105,161,0.06)" }}>
          <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Coverage</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {["Tri-State","NYC Metro","New Jersey","Connecticut","Lehigh Valley","Pennsylvania","Florida","Ohio","North Carolina","South Carolina","Midwest","West Coast","South","Northeast"].map((tag,i)=>(
              <span key={i} style={{ padding:"3px 9px", background:"rgba(3,105,161,0.08)", border:"1px solid rgba(3,105,161,0.15)", borderRadius:20, fontSize:9, color:"#0369a1" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ padding:16, background:"linear-gradient(135deg,rgba(3,105,161,0.06),rgba(14,165,233,0.04))", borderRadius:16, border:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:11, color:"#7c3aed", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Our Mission</div>
          <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.7 }}>A portion of every Flo·zēk Pro subscription supports clean water access in underserved communities globally.</div>
          <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ marginTop:10, padding:"8px 16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:20, fontSize:12, fontWeight:700, color:"white" }}>
            Upgrade to Pro — $1.99/mo
          </button>
        </div>
      </div>
      <NavBar />
    </div>
  );

  // TEST TAB
  if (tab === "test") {
    const SYMPTOMS = [
      { id:1,  label:"Muscle cramps",       mineral:"Magnesium",    icon:"⚡" },
      { id:2,  label:"Poor sleep",          mineral:"Magnesium",    icon:"🌙" },
      { id:3,  label:"Chronic fatigue",     mineral:"Magnesium",    icon:"😴" },
      { id:4,  label:"Frequent headaches",  mineral:"Magnesium",    icon:"🧠" },
      { id:5,  label:"Brittle nails",       mineral:"Calcium",      icon:"💅" },
      { id:6,  label:"Anxiety",             mineral:"Magnesium",    icon:"😰" },
      { id:7,  label:"Irregular heartbeat", mineral:"Magnesium",    icon:"❤️" },
      { id:8,  label:"Brain fog",           mineral:"Electrolytes", icon:"🌫️" },
      { id:9,  label:"Joint pain",          mineral:"Calcium",      icon:"🦴" },
      { id:10, label:"Constipation",        mineral:"Magnesium",    icon:"🔄" },
      { id:11, label:"High blood pressure", mineral:"Magnesium",    icon:"🩺" },
      { id:12, label:"Tooth sensitivity",   mineral:"Calcium",      icon:"🦷" },
    ];
    const previewLSI = calcLSI(calcVals);
    const previewStatus = getLSIStatus(previewLSI);
    if (showResult) {
      const status = getLSIStatus(lsiResult);
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <button className="btn" onClick={()=>setShowResult(false)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12 }}>Back</button>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:TEXT }}>Walter's Analysis</div>
              <div style={{ width:60 }} />
            </div>
            <div style={{ padding:24, background:status.bg, borderRadius:22, border:`1px solid ${status.color}30`, textAlign:"center", marginBottom:16, animation:"scaleIn 0.4s ease both" }}>
              <div style={{ fontSize:48 }}>{status.emoji}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:58, fontWeight:800, color:status.color, lineHeight:1, margin:"8px 0" }}>{lsiResult>0?"+":""}{lsiResult}</div>
              <div style={{ fontSize:18, fontWeight:700, color:status.color, marginBottom:10 }}>{status.label}</div>
              <div style={{ fontSize:13, color:TEXT, lineHeight:1.7 }}>
                {lsiResult < -0.5 && "Walter says: This water is highly aggressive. It is actively pulling minerals from your body with every glass you drink."}
                {lsiResult >= -0.5 && lsiResult < -0.2 && "Walter says: Mildly undersaturated. Limited mineral contribution and mild depletion risk at normal intake."}
                {lsiResult >= -0.2 && lsiResult <= 0.2 && "Walter says: Perfect balance. This water works with your body rather than against it. Well done."}
                {lsiResult > 0.2 && "Walter says: High mineral content. Excellent for supplementation. Consider rotating with lower TDS water."}
              </div>
            </div>
            {lsiResult < -0.2 && (
              <div style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#0369a1", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Walter Recommends</div>
                {["Add mineral drops — magnesium and calcium","Switch to a natural spring water brand","Use a remineralizing filter post-RO","Check the Brands tab for better options"].map((tip,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                    <span style={{ color:"#0369a1" }}>✓</span>
                    <span style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)" }}>
              <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:6 }}>Ask Walter a Follow-Up</div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="What filter should I buy..." style={{ flex:1, padding:"10px 12px", background:"white", border:`1px solid ${BORDER}`, borderRadius:10, fontSize:12, color:TEXT }} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)} />
                <button className="btn" onClick={()=>askWalter(walterQ)} style={{ padding:"10px 14px", background:"#0369a1", border:"none", borderRadius:10, color:"white", fontSize:12 }}>Ask</button>
              </div>
              {walterLoading && <div className="pulse" style={{ fontSize:12, color:SUBTEXT, marginTop:8 }}>Walter is analyzing...</div>}
              {walterAnswer && <div style={{ fontSize:12, color:TEXT, lineHeight:1.7, marginTop:10, padding:12, background:"white", borderRadius:10, border:`1px solid ${BORDER}` }}>{walterAnswer}</div>}
            </div>
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Testing</div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:16 }}>LSI Calculator + Symptom Checker</div>
          <div style={{ padding:16, background:previewStatus.bg, borderRadius:16, border:`1px solid ${previewStatus.color}25`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, color:SUBTEXT, letterSpacing:1, marginBottom:4 }}>LIVE LSI</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:previewStatus.color, lineHeight:1 }}>{previewLSI>0?"+":""}{previewLSI}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:28 }}>{previewStatus.emoji}</div>
              <div style={{ fontSize:13, color:previewStatus.color, fontWeight:600, marginTop:4 }}>{previewStatus.label}</div>
            </div>
          </div>
          {[
            { key:"pH",          label:"pH Level",                   min:5,   max:10,  step:0.1, unit:"" },
            { key:"tds",         label:"TDS Total Dissolved Solids", min:0,   max:1000,step:5,   unit:"mg/L" },
            { key:"calcium",     label:"Calcium Hardness",           min:0,   max:500, step:5,   unit:"mg/L" },
            { key:"bicarbonate", label:"Bicarbonate Alkalinity",     min:0,   max:500, step:5,   unit:"mg/L" },
          ].map(p=>(
            <div key={p.key} style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{p.label}</span>
                <span style={{ fontSize:18, fontWeight:700, color:"#0369a1" }}>{calcVals[p.key]}<span style={{ fontSize:11, color:SUBTEXT }}> {p.unit}</span></span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step} value={calcVals[p.key]}
                onChange={e=>setCalcVals(prev=>({...prev,[p.key]:parseFloat(e.target.value)}))}
                style={{ background:`linear-gradient(to right,#0369a1 ${((calcVals[p.key]-p.min)/(p.max-p.min))*100}%,rgba(3,105,161,0.1) 0%)` }} />
            </div>
          ))}
          <button className="btn" onClick={()=>{ setLsiResult(previewLSI); setShowResult(true); }} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:15, fontWeight:700, color:"white", marginBottom:14, boxShadow:"0 8px 28px rgba(3,105,161,0.25)" }}>
            Ask Walter to Analyze
          </button>
          <div style={{ padding:16, background:CARD, borderRadius:16, border:"1px solid rgba(234,88,12,0.2)", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showSymptoms?12:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#ea580c" }}>Symptom Checker</div>
              <button className="btn" onClick={()=>setShowSymptoms(!showSymptoms)} style={{ background:"rgba(234,88,12,0.08)", border:"1px solid rgba(234,88,12,0.2)", color:"#ea580c", padding:"5px 10px", borderRadius:10, fontSize:11 }}>
                {showSymptoms?"Hide":"Open"}
              </button>
            </div>
            {showSymptoms && (
              <div style={{ animation:"fadeUp 0.3s ease both" }}>
                <div style={{ fontSize:12, color:SUBTEXT, marginBottom:10 }}>Select symptoms you experience:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {SYMPTOMS.map(s=>{
                    const sel = selSymptoms.includes(s.id);
                    return (
                      <button key={s.id} className="card" onClick={()=>setSelSymptoms(prev=>sel?prev.filter(id=>id!==s.id):[...prev,s.id])} style={{ padding:"10px", background:sel?"rgba(234,88,12,0.08)":CARD, border:`1px solid ${sel?"rgba(234,88,12,0.3)":BORDER}`, borderRadius:11, textAlign:"left" }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                        <div style={{ fontSize:11, fontWeight:600, color:sel?"#ea580c":TEXT }}>{s.label}</div>
                      </button>
                    );
                  })}
                </div>
                {selSymptoms.length > 0 && (
                  <button className="btn" onClick={()=>{
                    const mins = {};
                    selSymptoms.forEach(id=>{ const s=SYMPTOMS.find(s=>s.id===id); if(s) mins[s.mineral]=(mins[s.mineral]||0)+1; });
                    const top = Object.entries(mins).sort((a,b)=>b[1]-a[1])[0];
                    setSymptomRes({ mineral:top[0], count:selSymptoms.length });
                  }} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#ea580c,#c2410c)", border:"none", borderRadius:12, fontSize:14, fontWeight:700, color:"white" }}>
                    Ask Walter — Analyze {selSymptoms.length} Symptom{selSymptoms.length>1?"s":""}
                  </button>
                )}
                {symptomRes && (
                  <div style={{ marginTop:12, padding:14, background:"rgba(234,88,12,0.06)", borderRadius:12, border:"1px solid rgba(234,88,12,0.15)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#ea580c", marginBottom:6 }}>Walter's Verdict</div>
                    <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>
                      Based on {symptomRes.count} symptoms Walter suspects a <strong style={{ color:"#ea580c" }}>{symptomRes.mineral} deficiency</strong> commonly linked to aggressive or low-mineral water consumption. Test your LSI score above to confirm.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // BRANDS TAB
  if (tab === "brands") {
    const filtered = WATER_DB
      .filter(w => brandTier === "all" || w.tier === brandTier)
      .filter(w => w.name.toLowerCase().includes(brandSearch.toLowerCase()))
      .map(w => ({ ...w, score:getScore(w), lsi:calcLSI(w) }))
      .sort((a,b) => brandSort==="score" ? b.score-a.score : brandSort==="price" ? a.price-b.price : brandSort==="calcium" ? b.calcium-a.calcium : b.magnesium-a.magnesium);
    if (selBrand) {
      const w = { ...selBrand, score:getScore(selBrand), lsi:calcLSI(selBrand) };
      const grade = getGrade(w.score);
      const status = getLSIStatus(w.lsi);
      const umbrella = UMBRELLA_COMPANIES[w.name] || "Independent";
      const brandIdx = WATER_DB.findIndex(b=>b.id===w.id);
      const isLocked = !isPro && brandIdx >= 10;
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelBrand(null)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>← All Brands</button>
            {isLocked ? (
              <div style={{ textAlign:"center", padding:40 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:TEXT, marginBottom:8 }}>{w.name}</div>
                <div style={{ fontSize:13, color:SUBTEXT, marginBottom:20 }}>Full brand analysis including grade, minerals, pros, cons, and Walter verdict is a Pro feature.</div>
                <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"14px 28px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:14, fontWeight:700, color:"white" }}>Unlock with Pro</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign:"center", marginBottom:20, animation:"scaleIn 0.35s ease both" }}>
                  <div style={{ fontSize:48, marginBottom:6 }}>{w.logo}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:TEXT }}>{w.name}</div>
                  <div style={{ fontSize:11, color:SUBTEXT, marginTop:2 }}>{w.type} · {w.origin}</div>
                  <div style={{ fontSize:10, color:"rgba(3,105,161,0.5)", marginTop:2 }}>🏢 {umbrella}</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:14 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:grade.color }}>{grade.grade}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>WALTER GRADE</div>
                    </div>
                    <div style={{ width:1, background:BORDER }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:"#0369a1" }}>{w.score}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>HEALTH SCORE</div>
                    </div>
                    <div style={{ width:1, background:BORDER }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{w.lsi>0?"+":""}{w.lsi}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>LSI SCORE</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
                  <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Mineral Profile</div>
                  {[
                    { label:"Calcium",     val:w.calcium,     max:500,  unit:"mg/L", color:"#ca8a04" },
                    { label:"Magnesium",   val:w.magnesium,   max:130,  unit:"mg/L", color:"#16a34a" },
                    { label:"Bicarbonate", val:w.bicarbonate, max:1820, unit:"mg/L", color:"#0284c7" },
                    { label:"Sodium",      val:w.sodium,      max:410,  unit:"mg/L", color:"#ea580c" },
                    { label:"TDS",         val:w.tds,         max:2527, unit:"mg/L", color:"#7c3aed" },
                  ].map((m,i)=>(
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.val} {m.unit}</span>
                      </div>
                      <div style={{ height:5, background:"rgba(3,105,161,0.08)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min((m.val/m.max)*100,100)}%`, background:m.color, borderRadius:3, animation:"barFill 0.8s ease both" }} />
                      </div>
                    </div>
                  ))}
                </div>
                {w.pros && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                    <div style={{ padding:12, background:"rgba(22,163,74,0.05)", borderRadius:14, border:"1px solid rgba(22,163,74,0.15)" }}>
                      <div style={{ fontSize:10, color:"#16a34a", fontWeight:700, marginBottom:8, letterSpacing:1 }}>✅ PROS</div>
                      {w.pros.slice(0,3).map((p,i)=><div key={i} style={{ fontSize:10, color:TEXT, marginBottom:5, lineHeight:1.5 }}>• {p}</div>)}
                    </div>
                    <div style={{ padding:12, background:"rgba(220,38,38,0.05)", borderRadius:14, border:"1px solid rgba(220,38,38,0.12)" }}>
                      <div style={{ fontSize:10, color:"#dc2626", fontWeight:700, marginBottom:8, letterSpacing:1 }}>❌ CONS</div>
                      {w.cons.slice(0,3).map((c,i)=><div key={i} style={{ fontSize:10, color:TEXT, marginBottom:5, lineHeight:1.5 }}>• {c}</div>)}
                    </div>
                  </div>
                )}
                <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                    <div>
                      <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                      <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>{w.verdict}</div>
                      {w.bestFor && <div style={{ fontSize:11, color:"#16a34a", marginTop:6 }}>✅ Best for: {w.bestFor}</div>}
                      {w.filterNote && <div style={{ fontSize:11, color:SUBTEXT, marginTop:4, fontStyle:"italic" }}>🔧 {w.filterNote}</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[
                    { label:"pH",     val:w.pH,                  color:"#7c3aed" },
                    { label:"Price",  val:`$${w.price}/L`,        color:"#ca8a04" },
                    { label:"Plastic",val:w.plastic?"Yes":"No",   color:w.plastic?"#dc2626":"#16a34a" },
                  ].map((s,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, textAlign:"center", border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:18, fontWeight:700, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:10, color:SUBTEXT, marginTop:3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Brand Intelligence</div>
            {!isPro && <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"5px 10px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:20, fontSize:10, color:"#dc2626" }}>🔒 45 locked</button>}
          </div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:14 }}>55 brands · umbrella companies · pros and cons</div>
          <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="Search brands..." style={{ width:"100%", padding:"12px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT, marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[["all","All"],["premium","Premium"],["midtier","Mid"],["specialty","Special"],["budget","Budget"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandTier(v)} style={{ padding:"6px 12px", background:brandTier===v?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${brandTier===v?"rgba(3,105,161,0.4)":BORDER}`, borderRadius:20, fontSize:11, color:brandTier===v?"#0369a1":SUBTEXT }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[["score","Score"],["price","Price"],["calcium","Calcium"],["magnesium","Magnesium"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandSort(v)} style={{ padding:"5px 10px", background:brandSort===v?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${brandSort===v?"rgba(3,105,161,0.3)":BORDER}`, borderRadius:16, fontSize:10, color:brandSort===v?"#0369a1":SUBTEXT }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((w,i)=>{
              const grade = getGrade(w.score);
              const status = getLSIStatus(w.lsi);
              const isLocked = !isPro && i >= 10;
              return (
                <button key={w.id} className="card" onClick={()=>isLocked?setShowUpgrade(true):setSelBrand(w)} style={{ background:CARD, border:`1px solid ${isLocked?"rgba(3,105,161,0.06)":BORDER}`, borderRadius:16, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.04,0.3)}s both`, display:"flex", alignItems:"center", gap:12, opacity:isLocked?0.7:1 }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{isLocked?"🔒":w.logo}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:TEXT }}>{w.name}</span>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:isLocked?"rgba(3,105,161,0.2)":grade.color }}>{isLocked?"?":grade.grade}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:SUBTEXT }}>Unlock with Pro to see full analysis</span>
                      ) : (
                        <>
                          <span style={{ fontSize:10, color:status.color }}>{status.emoji} LSI {w.lsi>0?"+":""}{w.lsi}</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>Ca {w.calcium} Mg {w.magnesium}</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>${w.price}/L</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // CITIES TAB
  if (tab === "cities") {
    const REGIONS = [
      { id:"all",       label:"All"          },
      { id:"tristate",  label:"Tri-State"    },
      { id:"ny",        label:"NY State"     },
      { id:"nj",        label:"New Jersey"   },
      { id:"ct",        label:"Connecticut"  },
      { id:"lehigh",    label:"Lehigh Valley"},
      { id:"pa",        label:"Pennsylvania" },
      { id:"fl",        label:"Florida"      },
      { id:"oh",        label:"Ohio"         },
      { id:"nc",        label:"N Carolina"   },
      { id:"sc",        label:"S Carolina"   },
      { id:"south",     label:"South"        },
      { id:"west",      label:"West"         },
      { id:"midwest",   label:"Midwest"      },
      { id:"northeast", label:"Northeast"    },
    ];
    const filteredCities = CITIES
      .filter(c => cityRegion === "all" || c.region === cityRegion)
      .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));
    if (selCity) {
      const lsi = calcLSI(selCity);
      const status = getLSIStatus(lsi);
      const risk = getCityRisk(selCity);
      const cityIdx = CITIES.findIndex(c=>c.name===selCity.name);
      const isLocked = !isPro && cityIdx >= 15;
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelCity(null)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>← All Cities</button>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:44, marginBottom:6 }}>🌆</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:TEXT }}>{selCity.name}</div>
              <div style={{ fontSize:12, color:SUBTEXT, marginTop:4 }}>Tap Water Analysis · {selCity.state}</div>
              <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:16 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{lsi>0?"+":""}{lsi}</div>
                  <div style={{ fontSize:10, color:SUBTEXT }}>LSI SCORE</div>
                </div>
                <div style={{ width:1, background:BORDER }} />
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:riskColor(risk.overallRisk) }}>{risk.overallRisk}</div>
                  <div style={{ fontSize:10, color:SUBTEXT }}>OVERALL RISK</div>
                </div>
              </div>
            </div>
            <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
              <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Contamination Report</div>
              {[
                { label:"PFAS Forever Chemicals", val:selCity.pfas, unit:"ppt", risk:risk.pfasRisk, limit:"EPA limit 4 ppt", locked:isLocked },
                { label:"Lead",                   val:selCity.lead, unit:"ppb", risk:risk.leadRisk,  limit:"Action level 15 ppb", locked:isLocked },
                { label:"Nitrate",                val:selCity.nitrate, unit:"ppm", risk:risk.nitrateRisk, limit:"EPA max 10 ppm", locked:isLocked },
                { label:"5-Year Violations",      val:selCity.violations, unit:"", risk:selCity.violations>7?"HIGH":selCity.violations>3?"ELEVATED":"SAFE", limit:"0 is ideal", locked:false },
              ].map((m,i)=>(
                <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      {m.locked ? (
                        <button onClick={()=>setShowUpgrade(true)} style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"3px 8px", fontSize:11, color:"#dc2626", cursor:"pointer" }}>🔒 Unlock</button>
                      ) : (
                        <>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:riskColor(m.risk) }}>{m.val} {m.unit}</span>
                          <span style={{ padding:"2px 6px", background:riskBg(m.risk), borderRadius:8, fontSize:9, color:riskColor(m.risk), fontWeight:700 }}>{m.risk}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!m.locked && <div style={{ fontSize:10, color:"rgba(3,105,161,0.4)", marginTop:2 }}>{m.limit}</div>}
                </div>
              ))}
            </div>
            <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
              <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Water Chemistry</div>
              {[
                { label:"pH Level",    val:selCity.pH,          unit:"",     color:"#7c3aed" },
                { label:"TDS",         val:selCity.tds,         unit:"mg/L", color:"#0369a1" },
                { label:"Calcium",     val:selCity.calcium,     unit:"mg/L", color:"#ca8a04" },
                { label:"Bicarbonate", val:selCity.bicarbonate, unit:"mg/L", color:"#0284c7" },
              ].map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                  <span style={{ fontSize:15, fontWeight:700, color:m.color }}>{m.val} {m.unit}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                <div>
                  <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>
                    {risk.overallRisk === "CRISIS"
                      ? `${selCity.name} has CRISIS-level contamination. Walter strongly recommends reverse osmosis filtration immediately. Do not rely on tap water for infants or pregnant women.`
                      : risk.overallRisk === "HIGH" || risk.overallRisk === "ELEVATED"
                      ? `${selCity.name} has elevated contaminant levels. Walter recommends an NSF 53 certified filter at minimum. Reverse osmosis preferred for full protection.`
                      : `${selCity.name} tap water is within regulatory limits LSI ${lsi}. A standard carbon filter handles chlorine and taste. You can drink with reasonable confidence.`}
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT, marginTop:6, fontStyle:"italic" }}>Source: {selCity.source}</div>
                  <div style={{ fontSize:11, color:"#ea580c", marginTop:4 }}>Key concerns: {selCity.contaminants}</div>
                </div>
              </div>
            </div>
            {isPro && (
              <button className="btn" onClick={()=>setShowCivic(!showCivic)} style={{ width:"100%", padding:"12px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, fontSize:13, fontWeight:600, color:"#0369a1", marginBottom:10 }}>
                {showCivic?"Hide":"Show"} Civic Action Toolkit 📢
              </button>
            )}
            {showCivic && isPro && (
              <div style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, marginBottom:14, animation:"fadeUp 0.3s ease both" }}>
                <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, letterSpacing:2, marginBottom:12 }}>WHO TO CONTACT</div>
                {CIVIC_CONTACTS.howTo.slice(0,3).map((item,i)=>(
                  <div key={i} style={{ marginBottom:12, padding:10, background:"rgba(3,105,161,0.04)", borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:TEXT, marginBottom:4 }}>{item.action}</div>
                    <div style={{ fontSize:11, color:SUBTEXT, lineHeight:1.6 }}>{item.description}</div>
                  </div>
                ))}
                {CIVIC_CONTACTS.federal.slice(0,2).map((item,i)=>(
                  <div key={i} style={{ marginBottom:8, padding:10, background:"rgba(3,105,161,0.04)", borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                    {item.phone && <div style={{ fontSize:11, color:"#0369a1", marginTop:2 }}>{item.phone}</div>}
                    <div style={{ fontSize:11, color:SUBTEXT }}>{item.website}</div>
                  </div>
                ))}
              </div>
            )}
            {!isPro && (
              <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ width:"100%", padding:"12px", background:"rgba(3,105,161,0.06)", border:`1px solid ${BORDER}`, borderRadius:14, fontSize:12, color:"#0369a1" }}>
                🔒 Unlock Civic Action Toolkit with Pro
              </button>
            )}
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#7c3aed,#0369a1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>City Water Intel</div>
            {!isPro && <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"5px 10px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:20, fontSize:10, color:"#dc2626" }}>🔒 Full data</button>}
          </div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:14 }}>{CITIES.length} cities · PFAS · Lead · Nitrate · Violations</div>
          <input value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="Search your city..." style={{ width:"100%", padding:"12px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT, marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {REGIONS.map(r=>(
              <button key={r.id} className="btn" onClick={()=>setCityRegion(r.id)} style={{ padding:"5px 10px", background:cityRegion===r.id?"rgba(124,58,237,0.1)":CARD, border:`1px solid ${cityRegion===r.id?"rgba(124,58,237,0.4)":BORDER}`, borderRadius:20, fontSize:10, color:cityRegion===r.id?"#7c3aed":SUBTEXT }}>{r.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filteredCities.map((c,i)=>{
              const lsi = calcLSI(c);
              const status = getLSIStatus(lsi);
              const risk = getCityRisk(c);
              const isLocked = !isPro && i >= 15;
              return (
                <button key={i} className="card" onClick={()=>isLocked?setShowUpgrade(true):setSelCity(c)} style={{ background:CARD, border:`1px solid ${risk.overallRisk==="CRISIS"?"rgba(220,38,38,0.3)":risk.overallRisk==="HIGH"?"rgba(234,88,12,0.2)":BORDER}`, borderRadius:14, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.03,0.3)}s both`, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:24 }}>{risk.overallRisk==="CRISIS"?"🚨":risk.overallRisk==="HIGH"?"⚠️":"🌆"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{c.name}</span>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:"#dc2626" }}>🔒 Pro</span>
                      ) : (
                        <span style={{ fontSize:11, fontWeight:700, color:riskColor(risk.overallRisk) }}>{risk.overallRisk}</span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:SUBTEXT }}>PFAS: ●●● · Lead: ●●● · Unlock with Pro</span>
                      ) : (
                        <>
                          <span style={{ fontSize:10, color:riskColor(risk.pfasRisk) }}>PFAS {c.pfas}ppt</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:riskColor(risk.leadRisk) }}>Pb {c.lead}ppb</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>LSI {lsi>0?"+":""}{lsi}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // LEARN TAB
  const LESSONS = [
    { title:"What is LSI",         icon:"🔬", time:"3 min", content:"The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936. It measures whether water is corrosive, balanced, or scale-forming. Water with a negative LSI actively dissolves minerals it contacts including calcium in your teeth and bones. Most purified bottled waters score between -1.0 and -2.0, meaning they are aggressively stripping minerals. The ideal LSI range is -0.2 to +0.2. At this level water is in equilibrium with your body and neither deposits nor removes minerals." },
    { title:"The Mineral Gap",     icon:"⚡", time:"4 min", content:"Up to 50% of Americans are deficient in magnesium. The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely. Dasani, Aquafina, and Smartwater contain zero magnesium and zero calcium. Gerolsteiner contains 348 mg/L calcium and 108 mg/L magnesium meeting WHO standards in a single liter. The minerals you get from water are more bioavailable than those from food or supplements because they are already in ionic form ready for direct cellular absorption." },
    { title:"PFAS — Forever Chemicals", icon:"☢️", time:"4 min", content:"PFAS — per and polyfluoroalkyl substances — are man-made chemicals that do not break down in the environment or your body. They have been used since the 1940s in non-stick cookware, firefighting foam, food packaging, and waterproof clothing. The EPA health advisory is 4 parts per trillion. Horsham Township Pennsylvania has 1100 ppt — 275 times the limit. Fayetteville North Carolina has 700 ppt from Chemours GenX discharge. The only effective home removal methods are reverse osmosis filtration and activated carbon block. Standard Brita pitchers do NOT remove PFAS." },
    { title:"Lead in Water",       icon:"🔴", time:"4 min", content:"There is no safe level of lead exposure for children. Lead causes irreversible neurological damage, learning disabilities, and behavioral problems. The primary source in drinking water is lead service lines and interior plumbing installed before 1986. Benton Harbor Michigan has 55 ppb lead — nearly 4 times the EPA action level of 15 ppb. Newark New Jersey had a lead crisis from 2016 to 2021. An important and critical warning: boiling water does NOT remove lead. It concentrates it. The only solution is filtration using NSF 53 certified filters or reverse osmosis." },
    { title:"Hard vs Soft Water",  icon:"💎", time:"3 min", content:"Hard water contains high concentrations of calcium and magnesium. Soft water contains very little. Epidemiological studies have consistently shown that populations drinking hard water have lower rates of cardiovascular disease than those drinking soft water. The landmark WHO report on drinking water quality concluded that water hardness is inversely associated with heart disease mortality. Las Vegas tap water is very hard at 550 TDS. Seattle tap water is very soft at 45 TDS. The sweet spot is 150-400 TDS from natural mineral sources." },
    { title:"Reading Water Labels", icon:"📋", time:"4 min", content:"Every bottled water label tells a story. Look for source which can be spring, purified tap, or artesian. Check mineral content including calcium, magnesium, sodium, and bicarbonate in mg/L. Check TDS which is the sum of all minerals. Check pH which should ideally be 7.0-8.5. Red flags include purified or distilled without remineralization, zero or near-zero TDS, pH below 6.5. Green flags include natural spring or artesian source, calcium above 50 mg/L, magnesium above 20 mg/L, bicarbonate above 100 mg/L." },
  ];

  if (tab === "learn") {
    const lesson = LESSONS[eduIdx];
    const gItem = GLOSSARY[glossaryIdx];
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#ca8a04,#ea580c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Academy</div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:16 }}>Science · Glossary · Walter AI · Filters · Civic Action</div>
          <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
            {[["academy","Science"],["glossary","Glossary"],["walter","Ask Walter"],["filters","Filters"],["civic","Take Action"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setLearnSub(id)} style={{ padding:"8px 12px", background:learnSub===id?"rgba(202,138,4,0.1)":CARD, border:`1px solid ${learnSub===id?"rgba(202,138,4,0.4)":BORDER}`, borderRadius:12, fontSize:11, fontWeight:learnSub===id?700:400, color:learnSub===id?"#ca8a04":SUBTEXT }}>{label}</button>
            ))}
          </div>

          {learnSub === "academy" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {LESSONS.map((l,i)=>(
                  <button key={i} className="btn" onClick={()=>setEduIdx(i)} style={{ padding:"6px 10px", background:eduIdx===i?"rgba(202,138,4,0.1)":CARD, border:`1px solid ${eduIdx===i?"rgba(202,138,4,0.3)":BORDER}`, borderRadius:20, fontSize:10, color:eduIdx===i?"#ca8a04":SUBTEXT }}>{l.icon} {l.title}</button>
                ))}
              </div>
              <div style={{ padding:20, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:32, marginBottom:6 }}>{lesson.icon}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:TEXT }}>{lesson.title}</div>
                  </div>
                  <span style={{ padding:"4px 10px", background:"rgba(3,105,161,0.06)", borderRadius:20, fontSize:10, color:SUBTEXT }}>{lesson.time}</span>
                </div>
                <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.85 }}>{lesson.content}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setEduIdx(Math.max(0,eduIdx-1))} disabled={eduIdx===0} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:eduIdx===0?BORDER:SUBTEXT }}>Previous</button>
                <span style={{ fontSize:11, color:SUBTEXT, alignSelf:"center" }}>{eduIdx+1} of {LESSONS.length}</span>
                <button className="btn" onClick={()=>setEduIdx(Math.min(LESSONS.length-1,eduIdx+1))} disabled={eduIdx===LESSONS.length-1} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:eduIdx===LESSONS.length-1?BORDER:SUBTEXT }}>Next</button>
              </div>
            </div>
          )}

          {learnSub === "glossary" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {GLOSSARY.map((g,i)=>(
                  <button key={i} className="btn" onClick={()=>setGlossaryIdx(i)} style={{ padding:"6px 10px", background:glossaryIdx===i?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${glossaryIdx===i?"rgba(3,105,161,0.35)":BORDER}`, borderRadius:20, fontSize:10, color:glossaryIdx===i?"#0369a1":SUBTEXT }}>{g.icon} {g.term}</button>
                ))}
              </div>
              <div style={{ padding:20, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(3,105,161,0.08)", border:"1px solid rgba(3,105,161,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{gItem.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#0369a1" }}>{gItem.term}</div>
                    <div style={{ fontSize:11, color:SUBTEXT, marginTop:2 }}>{gItem.full}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.85, marginBottom:14 }}>{gItem.def}</div>
                <div style={{ padding:12, background:"rgba(3,105,161,0.05)", borderRadius:12, borderLeft:"3px solid #0369a1" }}>
                  <div style={{ fontSize:10, color:SUBTEXT, letterSpacing:1, marginBottom:4 }}>EXAMPLE</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6, fontStyle:"italic" }}>{gItem.example}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.max(0,glossaryIdx-1))} disabled={glossaryIdx===0} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:glossaryIdx===0?BORDER:SUBTEXT }}>Previous</button>
                <span style={{ fontSize:11, color:SUBTEXT, alignSelf:"center" }}>{glossaryIdx+1} of {GLOSSARY.length}</span>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.min(GLOSSARY.length-1,glossaryIdx+1))} disabled={glossaryIdx===GLOSSARY.length-1} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:glossaryIdx===GLOSSARY.length-1?BORDER:SUBTEXT }}>Next</button>
              </div>
            </div>
          )}

          {learnSub === "walter" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ padding:16, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0369a1" }}>Ask Walter Anything</div>
                    <div style={{ fontSize:11, color:SUBTEXT }}>Powered by Claude AI</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="Is my city water safe for my baby..." style={{ flex:1, padding:"12px 14px", background:"white", border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT }} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)} />
                  <button className="btn" onClick={()=>askWalter(walterQ)} style={{ padding:"12px 16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700 }}>Ask</button>
                </div>
                {walterLoading && <div className="pulse" style={{ fontSize:13, color:SUBTEXT, textAlign:"center", padding:12 }}>🤖 Walter is analyzing your question...</div>}
                {walterAnswer && (
                  <div style={{ padding:14, background:"white", borderRadius:12, border:`1px solid ${BORDER}` }}>
                    <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:6 }}>WALTER SAYS</div>
                    <div style={{ fontSize:13, color:TEXT, lineHeight:1.75 }}>{walterAnswer}</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize:11, color:SUBTEXT, marginBottom:10 }}>Suggested questions:</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {WALTER_QA_PROMPTS.slice(0,8).map((q,i)=>(
                  <button key={i} className="card" onClick={()=>{ setWalterQ(q); askWalter(q); }} style={{ padding:"10px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, textAlign:"left", fontSize:12, color:TEXT }}>
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {learnSub === "filters" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              {Object.values(FILTER_RECOMMENDATIONS).map((rec,i)=>(
                <div key={i} style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${rec.urgency==="CRITICAL"?"rgba(220,38,38,0.2)":rec.urgency==="HIGH"?"rgba(234,88,12,0.15)":BORDER}`, marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontSize:16 }}>{rec.icon}</div>
                    <span style={{ padding:"3px 8px", background:rec.urgency==="CRITICAL"?"rgba(220,38,38,0.1)":rec.urgency==="HIGH"?"rgba(234,88,12,0.1)":"rgba(3,105,161,0.08)", borderRadius:20, fontSize:9, fontWeight:700, color:rec.urgency==="CRITICAL"?"#dc2626":rec.urgency==="HIGH"?"#ea580c":"#0369a1" }}>{rec.urgency}</span>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:TEXT, marginBottom:6 }}>{rec.problem}</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6, marginBottom:10 }}>{rec.description}</div>
                  {rec.solutions.map((sol,j)=>(
                    <div key={j} style={{ padding:10, background:sol.type==="Does NOT work"?"rgba(220,38,38,0.04)":"rgba(22,163,74,0.04)", borderRadius:10, marginBottom:6, border:`1px solid ${sol.type==="Does NOT work"?"rgba(220,38,38,0.1)":"rgba(22,163,74,0.1)"}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:sol.type==="Does NOT work"?"#dc2626":"#16a34a" }}>{sol.type==="Does NOT work"?"❌":"✅"} {sol.type}</span>
                        <span style={{ fontSize:10, color:SUBTEXT }}>{sol.cost}</span>
                      </div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginBottom:4 }}>{sol.effectiveness}</div>
                      <div style={{ fontSize:10, color:TEXT, fontStyle:"italic" }}>{sol.note}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {learnSub === "civic" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              {!isPro && (
                <div style={{ padding:16, background:"rgba(220,38,38,0.05)", borderRadius:16, border:"1px solid rgba(220,38,38,0.15)", marginBottom:16, textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>🔒</div>
                  <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:6 }}>Civic Action Toolkit</div>
                  <div style={{ fontSize:12, color:SUBTEXT, marginBottom:12 }}>Learn who to contact, how to file complaints, and how to organize your community around water quality issues.</div>
                  <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"12px 24px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:12, fontSize:13, fontWeight:700, color:"white" }}>Unlock with Pro</button>
                </div>
              )}
              {isPro && (
                <>
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10 }}>HOW TO TAKE ACTION</div>
                  {CIVIC_CONTACTS.howTo.map((item,i)=>(
                    <div key={i} style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#0369a1", marginBottom:6 }}>📢 {item.action}</div>
                      <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>{item.description}</div>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10, marginTop:16 }}>FEDERAL CONTACTS</div>
                  {CIVIC_CONTACTS.federal.map((item,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                      {item.phone && <div style={{ fontSize:12, color:"#0369a1", marginTop:3 }}>{item.phone}</div>}
                      <div style={{ fontSize:11, color:SUBTEXT }}>{item.website}</div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginTop:3, fontStyle:"italic" }}>{item.note}</div>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10, marginTop:16 }}>ADVOCACY ORGANIZATIONS</div>
                  {CIVIC_CONTACTS.advocacy.map((item,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#0369a1" }}>{item.website}</div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginTop:3, fontStyle:"italic" }}>{item.note}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <NavBar />
      </div>
    );
  }

  return null;
}  if (score >= 78) return { grade:"A",  color:"#16a34a" };
  if (score >= 70) return { grade:"B+", color:"#0369a1" };
  if (score >= 62) return { grade:"B",  color:"#0284c7" };
  if (score >= 50) return { grade:"C",  color:"#ea580c" };
  return                  { grade:"D",  color:"#dc2626" };
};

const getCityRisk = city => {
  const pfasRisk = city.pfas > 200 ? "CRISIS" : city.pfas > 70 ? "HIGH" : city.pfas > 4 ? "ELEVATED" : "SAFE";
  const leadRisk = city.lead > 15 ? "CRISIS" : city.lead > 3.8 ? "ELEVATED" : "SAFE";
  const nitrateRisk = city.nitrate > 10 ? "CRISIS" : city.nitrate > 3 ? "ELEVATED" : "SAFE";
  const overallRisk = [pfasRisk, leadRisk, nitrateRisk].includes("CRISIS") ? "CRISIS"
    : [pfasRisk, leadRisk, nitrateRisk].includes("HIGH") ? "HIGH"
    : [pfasRisk, leadRisk, nitrateRisk].includes("ELEVATED") ? "ELEVATED" : "SAFE";
  return { pfasRisk, leadRisk, nitrateRisk, overallRisk };
};

const riskColor = r => r === "CRISIS" ? "#dc2626" : r === "HIGH" ? "#ea580c" : r === "ELEVATED" ? "#ca8a04" : "#16a34a";
const riskBg = r => r === "CRISIS" ? "rgba(220,38,38,0.08)" : r === "HIGH" ? "rgba(234,88,12,0.08)" : r === "ELEVATED" ? "rgba(202,138,4,0.08)" : "rgba(22,163,74,0.08)";

const BG = "linear-gradient(160deg,#e8f4fd 0%,#f0faf8 50%,#e0f2fe 100%)";
const CARD = "rgba(255,255,255,0.75)";
const BORDER = "rgba(3,105,161,0.12)";
const TEXT = "#0c2340";
const SUBTEXT = "#4a7fa5";
const BLUR = "●●●";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${BG};min-height:100vh;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(3,105,161,0.2);border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes barFill{from{width:0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .card{transition:transform 0.18s ease,box-shadow 0.18s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(3,105,161,0.12);}
  .card:active{transform:scale(0.97);}
  .btn{transition:all 0.18s ease;cursor:pointer;}
  .btn:hover{opacity:0.85;}
  .btn:active{transform:scale(0.96);}
  .blur{filter:blur(5px);user-select:none;pointer-events:none;}
  .pulse{animation:pulse 2s ease infinite;}
  input{outline:none;}
  input:focus{border-color:rgba(3,105,161,0.4)!important;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(3,105,161,0.1);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#0369a1;cursor:pointer;}
`;

export default function Flozek() {
  const [tab, setTab] = useState("home");
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTier, setBrandTier] = useState("all");
  const [brandSort, setBrandSort] = useState("score");
  const [selBrand, setSelBrand] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityRegion, setCityRegion] = useState("all");
  const [selCity, setSelCity] = useState(null);
  const [calcVals, setCalcVals] = useState({ pH:7.2, tds:150, calcium:40, bicarbonate:70 });
  const [showResult, setShowResult] = useState(false);
  const [lsiResult, setLsiResult] = useState(null);
  const [selSymptoms, setSelSymptoms] = useState([]);
  const [symptomRes, setSymptomRes] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [learnTab, setLearnTab] = useState("academy");
  const [eduIdx, setEduIdx] = useState(0);
  const [glossaryIdx, setGlossaryIdx] = useState(0);
  const [learnSub, setLearnSub] = useState("science");
  const [walterQ, setWalterQ] = useState("");
  const [walterLoading, setWalterLoading] = useState(false);
  const [walterAnswer, setWalterAnswer] = useState("");
  const [showCivic, setShowCivic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const app = { fontFamily:"'DM Sans',sans-serif", background:BG, minHeight:"100vh", color:TEXT, maxWidth:440, margin:"0 auto", position:"relative", paddingBottom:80 };

  const askWalter = async (question) => {
    if (!question.trim()) return;
    setWalterLoading(true);
    setWalterAnswer("");
    try {
      const cityContext = CITIES.slice(0, 20).map(c => `${c.name}: PFAS ${c.pfas}ppt Lead ${c.lead}ppb Violations ${c.violations}`).join(", ");
      const brandContext = WATER_DB.slice(0, 10).map(b => `${b.name}: pH ${b.pH} Ca ${b.calcium} Mg ${b.magnesium}`).join(", ");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are WALTER — Water Analysis and Life Track Enhancement Recommendations — the AI assistant inside Flo·zēk, a water intelligence platform. You are knowledgeable, direct, and passionate about water quality and public health. You speak in first person as Walter. Keep answers under 150 words. Be specific and actionable. Reference real data when relevant. City data: ${cityContext}. Brand data: ${brandContext}. Key facts: EPA PFAS limit 4ppt, Lead action level 15ppb, Nitrate MCL 10ppm. Best filter for PFAS and lead is reverse osmosis. Brita does NOT remove PFAS or lead.`,
          messages: [{ role: "user", content: question }]
        })
      });
      const data = await response.json();
      setWalterAnswer(data.content?.[0]?.text || "Walter is thinking — try again in a moment.");
    } catch {
      setWalterAnswer("Walter is temporarily offline. Please try again.");
    }
    setWalterLoading(false);
  };

  const UpgradeModal = () => (
    <div style={{ position:"fixed", inset:0, background:"rgba(12,35,64,0.85)", backdropFilter:"blur(8px)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setShowUpgrade(false)}>
      <div style={{ background:"white", borderRadius:"28px 28px 0 0", width:"100%", maxWidth:440, padding:"28px 24px 40px", animation:"fadeUp 0.3s ease both" }} onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔱</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#0c2340", marginBottom:6 }}>Unlock Flo·zēk Pro</div>
          <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.6 }}>Your city has flagged contaminants. See the full numbers Walter is hiding below.</div>
        </div>
        <div style={{ padding:14, background:"rgba(220,38,38,0.05)", borderRadius:16, border:"1px solid rgba(220,38,38,0.15)", marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#dc2626", fontWeight:700, marginBottom:8 }}>⚠️ Walter has detected concerns in your area</div>
          <div style={{ display:"flex", justifyContent:"space-around" }}>
            {[["PFAS","●●● ppt","☢️"],["Lead","●●● ppb","🔴"],["Violations","●●●","⚠️"]].map(([label,val,icon],i)=>(
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:20 }}>{icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#dc2626", filter:"blur(4px)" }}>{val}</div>
                <div style={{ fontSize:9, color:SUBTEXT }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          {[
            "✅ Full PFAS, Lead, and Nitrate numbers for every city",
            "✅ 55 brands fully analyzed with pros, cons, and grades",
            "✅ Walter AI — ask any water question and get real answers",
            "✅ Filter recommendations by your specific contaminants",
            "✅ Civic action toolkit — who to contact in your community",
            "✅ How to read your water data explained simply",
          ].map((item,i)=>(
            <div key={i} style={{ fontSize:12, color:TEXT, padding:"6px 0", borderBottom:"1px solid rgba(3,105,161,0.06)" }}>{item}</div>
          ))}
        </div>
        <button className="btn" onClick={()=>{ setIsPro(true); setShowUpgrade(false); }} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:16, fontWeight:700, color:"white", marginBottom:10, boxShadow:"0 8px 28px rgba(3,105,161,0.3)" }}>
          Unlock Pro — $1.99 / month
        </button>
        <button className="btn" onClick={()=>setShowUpgrade(false)} style={{ width:"100%", padding:"12px", background:"none", border:"1px solid rgba(3,105,161,0.15)", borderRadius:14, fontSize:13, color:SUBTEXT }}>
          Maybe Later
        </button>
        <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:"rgba(3,105,161,0.35)" }}>Cancel anytime · Secure payment · Funds clean water access globally</div>
      </div>
    </div>
  );

  const NavBar = () => (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:440, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", borderTop:`1px solid ${BORDER}`, display:"flex", zIndex:100, paddingBottom:8, boxShadow:"0 -4px 20px rgba(3,105,161,0.08)" }}>
      {[["🏠","Home","home"],["🔬","Test","test"],["💧","Brands","brands"],["🌆","Cities","cities"],["📚","Learn","learn"]].map(([icon,label,id])=>(
        <button key={id} className="btn" onClick={()=>{ setTab(id); setSelBrand(null); setSelCity(null); setShowResult(false); }} style={{ flex:1, background:"none", border:"none", padding:"12px 4px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:19, filter:tab===id?"none":"grayscale(0.5) opacity(0.4)" }}>{icon}</span>
          <span style={{ fontSize:9, color:tab===id?"#0369a1":"rgba(3,105,161,0.35)", fontWeight:tab===id?700:400, letterSpacing:0.5 }}>{label}</span>
          {tab===id && <div style={{ width:16, height:2, background:"#0369a1", borderRadius:1 }} />}
        </button>
      ))}
    </div>
  );

  const ProBadge = () => (
    <div style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", background:"linear-gradient(135deg,#0369a1,#0284c7)", borderRadius:20 }}>
      <span style={{ fontSize:9, color:"white", fontWeight:700, letterSpacing:0.5 }}>PRO</span>
    </div>
  );

  // HOME TAB
  if (tab === "home") return (
    <div style={app}>
      <style>{CSS}</style>
      {showUpgrade && <UpgradeModal />}
      <div style={{ padding:"52px 22px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flo·zēk</div>
            <div style={{ fontSize:12, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>Water Intelligence</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {isPro ? <ProBadge /> : (
              <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"6px 12px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:20, fontSize:10, fontWeight:700, color:"white" }}>Get Pro</button>
            )}
            <div style={{ fontSize:36, animation:"float 3s ease infinite" }}>💧</div>
          </div>
        </div>
        <div style={{ padding:18, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, marginBottom:16, boxShadow:"0 4px 16px rgba(3,105,161,0.08)" }}>
          <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Meet Walter</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0369a1", marginBottom:3 }}>WALTER</div>
              <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6 }}>Water Analysis and Life Track Enhancement Recommendations. Your personal water intelligence assistant.</div>
            </div>
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(3,105,161,0.05)", borderRadius:12, fontSize:12, color:SUBTEXT, lineHeight:1.6, fontStyle:"italic", borderLeft:"3px solid #0369a1" }}>
            Dasani scores a D. Aquafina scores a D. Benton Harbor Michigan has 55 ppb lead. Your body deserves better and I am going to show you exactly what to drink instead.
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"🔬", title:"Test My Water",  sub:"LSI Calculator",        id:"test",   color:"#0369a1" },
            { icon:"💧", title:"Browse Brands",  sub:"55 brands analyzed",    id:"brands", color:"#0284c7" },
            { icon:"🌆", title:"City Water",     sub:"120+ cities scored",    id:"cities", color:"#7c3aed" },
            { icon:"📚", title:"Water Academy",  sub:"Science + Walter AI",   id:"learn",  color:"#0369a1" },
          ].map((item,i)=>(
            <button key={i} className="card" onClick={()=>setTab(item.id)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:14, textAlign:"left", animation:`fadeUp 0.4s ease ${i*0.07}s both`, boxShadow:"0 2px 8px rgba(3,105,161,0.06)" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.title}</div>
              <div style={{ fontSize:10, color:SUBTEXT, marginTop:2 }}>{item.sub}</div>
            </button>
          ))}
        </div>
        {!isPro && (
          <button className="card" onClick={()=>setShowUpgrade(true)} style={{ width:"100%", padding:16, background:"linear-gradient(135deg,rgba(220,38,38,0.06),rgba(234,88,12,0.04))", border:"1px solid rgba(220,38,38,0.15)", borderRadius:16, textAlign:"left", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, color:"#dc2626", fontWeight:700, marginBottom:4 }}>⚠️ Walter has flagged cities near you</div>
                <div style={{ fontSize:11, color:SUBTEXT }}>PFAS: ●●● ppt · Lead: ●●● ppb · Tap to unlock</div>
              </div>
              <div style={{ fontSize:22 }}>🔒</div>
            </div>
          </button>
        )}
        <div style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:12, boxShadow:"0 2px 8px rgba(3,105,161,0.06)" }}>
          <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Coverage</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {["Tri-State","NYC Metro","New Jersey","Connecticut","Lehigh Valley","Pennsylvania","Florida","Ohio","North Carolina","South Carolina","Midwest","West Coast","South","Northeast"].map((tag,i)=>(
              <span key={i} style={{ padding:"3px 9px", background:"rgba(3,105,161,0.08)", border:"1px solid rgba(3,105,161,0.15)", borderRadius:20, fontSize:9, color:"#0369a1" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ padding:16, background:"linear-gradient(135deg,rgba(3,105,161,0.06),rgba(14,165,233,0.04))", borderRadius:16, border:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:11, color:"#7c3aed", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Our Mission</div>
          <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.7 }}>A portion of every Flo·zēk Pro subscription supports clean water access in underserved communities globally.</div>
          <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ marginTop:10, padding:"8px 16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:20, fontSize:12, fontWeight:700, color:"white" }}>
            Upgrade to Pro — $1.99/mo
          </button>
        </div>
      </div>
      <NavBar />
    </div>
  );

  // TEST TAB
  if (tab === "test") {
    const SYMPTOMS = [
      { id:1,  label:"Muscle cramps",       mineral:"Magnesium",    icon:"⚡" },
      { id:2,  label:"Poor sleep",          mineral:"Magnesium",    icon:"🌙" },
      { id:3,  label:"Chronic fatigue",     mineral:"Magnesium",    icon:"😴" },
      { id:4,  label:"Frequent headaches",  mineral:"Magnesium",    icon:"🧠" },
      { id:5,  label:"Brittle nails",       mineral:"Calcium",      icon:"💅" },
      { id:6,  label:"Anxiety",             mineral:"Magnesium",    icon:"😰" },
      { id:7,  label:"Irregular heartbeat", mineral:"Magnesium",    icon:"❤️" },
      { id:8,  label:"Brain fog",           mineral:"Electrolytes", icon:"🌫️" },
      { id:9,  label:"Joint pain",          mineral:"Calcium",      icon:"🦴" },
      { id:10, label:"Constipation",        mineral:"Magnesium",    icon:"🔄" },
      { id:11, label:"High blood pressure", mineral:"Magnesium",    icon:"🩺" },
      { id:12, label:"Tooth sensitivity",   mineral:"Calcium",      icon:"🦷" },
    ];
    const previewLSI = calcLSI(calcVals);
    const previewStatus = getLSIStatus(previewLSI);
    if (showResult) {
      const status = getLSIStatus(lsiResult);
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <button className="btn" onClick={()=>setShowResult(false)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12 }}>Back</button>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:TEXT }}>Walter's Analysis</div>
              <div style={{ width:60 }} />
            </div>
            <div style={{ padding:24, background:status.bg, borderRadius:22, border:`1px solid ${status.color}30`, textAlign:"center", marginBottom:16, animation:"scaleIn 0.4s ease both" }}>
              <div style={{ fontSize:48 }}>{status.emoji}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:58, fontWeight:800, color:status.color, lineHeight:1, margin:"8px 0" }}>{lsiResult>0?"+":""}{lsiResult}</div>
              <div style={{ fontSize:18, fontWeight:700, color:status.color, marginBottom:10 }}>{status.label}</div>
              <div style={{ fontSize:13, color:TEXT, lineHeight:1.7 }}>
                {lsiResult < -0.5 && "Walter says: This water is highly aggressive. It is actively pulling minerals from your body with every glass you drink."}
                {lsiResult >= -0.5 && lsiResult < -0.2 && "Walter says: Mildly undersaturated. Limited mineral contribution and mild depletion risk at normal intake."}
                {lsiResult >= -0.2 && lsiResult <= 0.2 && "Walter says: Perfect balance. This water works with your body rather than against it. Well done."}
                {lsiResult > 0.2 && "Walter says: High mineral content. Excellent for supplementation. Consider rotating with lower TDS water."}
              </div>
            </div>
            {lsiResult < -0.2 && (
              <div style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#0369a1", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Walter Recommends</div>
                {["Add mineral drops — magnesium and calcium","Switch to a natural spring water brand","Use a remineralizing filter post-RO","Check the Brands tab for better options"].map((tip,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                    <span style={{ color:"#0369a1" }}>✓</span>
                    <span style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)" }}>
              <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:6 }}>Ask Walter a Follow-Up</div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="What filter should I buy..." style={{ flex:1, padding:"10px 12px", background:"white", border:`1px solid ${BORDER}`, borderRadius:10, fontSize:12, color:TEXT }} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)} />
                <button className="btn" onClick={()=>askWalter(walterQ)} style={{ padding:"10px 14px", background:"#0369a1", border:"none", borderRadius:10, color:"white", fontSize:12 }}>Ask</button>
              </div>
              {walterLoading && <div className="pulse" style={{ fontSize:12, color:SUBTEXT, marginTop:8 }}>Walter is analyzing...</div>}
              {walterAnswer && <div style={{ fontSize:12, color:TEXT, lineHeight:1.7, marginTop:10, padding:12, background:"white", borderRadius:10, border:`1px solid ${BORDER}` }}>{walterAnswer}</div>}
            </div>
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Testing</div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:16 }}>LSI Calculator + Symptom Checker</div>
          <div style={{ padding:16, background:previewStatus.bg, borderRadius:16, border:`1px solid ${previewStatus.color}25`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, color:SUBTEXT, letterSpacing:1, marginBottom:4 }}>LIVE LSI</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:previewStatus.color, lineHeight:1 }}>{previewLSI>0?"+":""}{previewLSI}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:28 }}>{previewStatus.emoji}</div>
              <div style={{ fontSize:13, color:previewStatus.color, fontWeight:600, marginTop:4 }}>{previewStatus.label}</div>
            </div>
          </div>
          {[
            { key:"pH",          label:"pH Level",                   min:5,   max:10,  step:0.1, unit:"" },
            { key:"tds",         label:"TDS Total Dissolved Solids", min:0,   max:1000,step:5,   unit:"mg/L" },
            { key:"calcium",     label:"Calcium Hardness",           min:0,   max:500, step:5,   unit:"mg/L" },
            { key:"bicarbonate", label:"Bicarbonate Alkalinity",     min:0,   max:500, step:5,   unit:"mg/L" },
          ].map(p=>(
            <div key={p.key} style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{p.label}</span>
                <span style={{ fontSize:18, fontWeight:700, color:"#0369a1" }}>{calcVals[p.key]}<span style={{ fontSize:11, color:SUBTEXT }}> {p.unit}</span></span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step} value={calcVals[p.key]}
                onChange={e=>setCalcVals(prev=>({...prev,[p.key]:parseFloat(e.target.value)}))}
                style={{ background:`linear-gradient(to right,#0369a1 ${((calcVals[p.key]-p.min)/(p.max-p.min))*100}%,rgba(3,105,161,0.1) 0%)` }} />
            </div>
          ))}
          <button className="btn" onClick={()=>{ setLsiResult(previewLSI); setShowResult(true); }} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:15, fontWeight:700, color:"white", marginBottom:14, boxShadow:"0 8px 28px rgba(3,105,161,0.25)" }}>
            Ask Walter to Analyze
          </button>
          <div style={{ padding:16, background:CARD, borderRadius:16, border:"1px solid rgba(234,88,12,0.2)", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showSymptoms?12:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#ea580c" }}>Symptom Checker</div>
              <button className="btn" onClick={()=>setShowSymptoms(!showSymptoms)} style={{ background:"rgba(234,88,12,0.08)", border:"1px solid rgba(234,88,12,0.2)", color:"#ea580c", padding:"5px 10px", borderRadius:10, fontSize:11 }}>
                {showSymptoms?"Hide":"Open"}
              </button>
            </div>
            {showSymptoms && (
              <div style={{ animation:"fadeUp 0.3s ease both" }}>
                <div style={{ fontSize:12, color:SUBTEXT, marginBottom:10 }}>Select symptoms you experience:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {SYMPTOMS.map(s=>{
                    const sel = selSymptoms.includes(s.id);
                    return (
                      <button key={s.id} className="card" onClick={()=>setSelSymptoms(prev=>sel?prev.filter(id=>id!==s.id):[...prev,s.id])} style={{ padding:"10px", background:sel?"rgba(234,88,12,0.08)":CARD, border:`1px solid ${sel?"rgba(234,88,12,0.3)":BORDER}`, borderRadius:11, textAlign:"left" }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                        <div style={{ fontSize:11, fontWeight:600, color:sel?"#ea580c":TEXT }}>{s.label}</div>
                      </button>
                    );
                  })}
                </div>
                {selSymptoms.length > 0 && (
                  <button className="btn" onClick={()=>{
                    const mins = {};
                    selSymptoms.forEach(id=>{ const s=SYMPTOMS.find(s=>s.id===id); if(s) mins[s.mineral]=(mins[s.mineral]||0)+1; });
                    const top = Object.entries(mins).sort((a,b)=>b[1]-a[1])[0];
                    setSymptomRes({ mineral:top[0], count:selSymptoms.length });
                  }} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#ea580c,#c2410c)", border:"none", borderRadius:12, fontSize:14, fontWeight:700, color:"white" }}>
                    Ask Walter — Analyze {selSymptoms.length} Symptom{selSymptoms.length>1?"s":""}
                  </button>
                )}
                {symptomRes && (
                  <div style={{ marginTop:12, padding:14, background:"rgba(234,88,12,0.06)", borderRadius:12, border:"1px solid rgba(234,88,12,0.15)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#ea580c", marginBottom:6 }}>Walter's Verdict</div>
                    <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>
                      Based on {symptomRes.count} symptoms Walter suspects a <strong style={{ color:"#ea580c" }}>{symptomRes.mineral} deficiency</strong> commonly linked to aggressive or low-mineral water consumption. Test your LSI score above to confirm.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // BRANDS TAB
  if (tab === "brands") {
    const filtered = WATER_DB
      .filter(w => brandTier === "all" || w.tier === brandTier)
      .filter(w => w.name.toLowerCase().includes(brandSearch.toLowerCase()))
      .map(w => ({ ...w, score:getScore(w), lsi:calcLSI(w) }))
      .sort((a,b) => brandSort==="score" ? b.score-a.score : brandSort==="price" ? a.price-b.price : brandSort==="calcium" ? b.calcium-a.calcium : b.magnesium-a.magnesium);
    if (selBrand) {
      const w = { ...selBrand, score:getScore(selBrand), lsi:calcLSI(selBrand) };
      const grade = getGrade(w.score);
      const status = getLSIStatus(w.lsi);
      const umbrella = UMBRELLA_COMPANIES[w.name] || "Independent";
      const brandIdx = WATER_DB.findIndex(b=>b.id===w.id);
      const isLocked = !isPro && brandIdx >= 10;
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelBrand(null)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>← All Brands</button>
            {isLocked ? (
              <div style={{ textAlign:"center", padding:40 }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:TEXT, marginBottom:8 }}>{w.name}</div>
                <div style={{ fontSize:13, color:SUBTEXT, marginBottom:20 }}>Full brand analysis including grade, minerals, pros, cons, and Walter verdict is a Pro feature.</div>
                <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"14px 28px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:14, fontSize:14, fontWeight:700, color:"white" }}>Unlock with Pro</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign:"center", marginBottom:20, animation:"scaleIn 0.35s ease both" }}>
                  <div style={{ fontSize:48, marginBottom:6 }}>{w.logo}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:TEXT }}>{w.name}</div>
                  <div style={{ fontSize:11, color:SUBTEXT, marginTop:2 }}>{w.type} · {w.origin}</div>
                  <div style={{ fontSize:10, color:"rgba(3,105,161,0.5)", marginTop:2 }}>🏢 {umbrella}</div>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:14 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:grade.color }}>{grade.grade}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>WALTER GRADE</div>
                    </div>
                    <div style={{ width:1, background:BORDER }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:"#0369a1" }}>{w.score}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>HEALTH SCORE</div>
                    </div>
                    <div style={{ width:1, background:BORDER }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{w.lsi>0?"+":""}{w.lsi}</div>
                      <div style={{ fontSize:10, color:SUBTEXT }}>LSI SCORE</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
                  <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Mineral Profile</div>
                  {[
                    { label:"Calcium",     val:w.calcium,     max:500,  unit:"mg/L", color:"#ca8a04" },
                    { label:"Magnesium",   val:w.magnesium,   max:130,  unit:"mg/L", color:"#16a34a" },
                    { label:"Bicarbonate", val:w.bicarbonate, max:1820, unit:"mg/L", color:"#0284c7" },
                    { label:"Sodium",      val:w.sodium,      max:410,  unit:"mg/L", color:"#ea580c" },
                    { label:"TDS",         val:w.tds,         max:2527, unit:"mg/L", color:"#7c3aed" },
                  ].map((m,i)=>(
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.val} {m.unit}</span>
                      </div>
                      <div style={{ height:5, background:"rgba(3,105,161,0.08)", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min((m.val/m.max)*100,100)}%`, background:m.color, borderRadius:3, animation:"barFill 0.8s ease both" }} />
                      </div>
                    </div>
                  ))}
                </div>
                {w.pros && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                    <div style={{ padding:12, background:"rgba(22,163,74,0.05)", borderRadius:14, border:"1px solid rgba(22,163,74,0.15)" }}>
                      <div style={{ fontSize:10, color:"#16a34a", fontWeight:700, marginBottom:8, letterSpacing:1 }}>✅ PROS</div>
                      {w.pros.slice(0,3).map((p,i)=><div key={i} style={{ fontSize:10, color:TEXT, marginBottom:5, lineHeight:1.5 }}>• {p}</div>)}
                    </div>
                    <div style={{ padding:12, background:"rgba(220,38,38,0.05)", borderRadius:14, border:"1px solid rgba(220,38,38,0.12)" }}>
                      <div style={{ fontSize:10, color:"#dc2626", fontWeight:700, marginBottom:8, letterSpacing:1 }}>❌ CONS</div>
                      {w.cons.slice(0,3).map((c,i)=><div key={i} style={{ fontSize:10, color:TEXT, marginBottom:5, lineHeight:1.5 }}>• {c}</div>)}
                    </div>
                  </div>
                )}
                <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                    <div>
                      <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                      <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>{w.verdict}</div>
                      {w.bestFor && <div style={{ fontSize:11, color:"#16a34a", marginTop:6 }}>✅ Best for: {w.bestFor}</div>}
                      {w.filterNote && <div style={{ fontSize:11, color:SUBTEXT, marginTop:4, fontStyle:"italic" }}>🔧 {w.filterNote}</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[
                    { label:"pH",     val:w.pH,                  color:"#7c3aed" },
                    { label:"Price",  val:`$${w.price}/L`,        color:"#ca8a04" },
                    { label:"Plastic",val:w.plastic?"Yes":"No",   color:w.plastic?"#dc2626":"#16a34a" },
                  ].map((s,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, textAlign:"center", border:`1px solid ${BORDER}` }}>
                      <div style={{ fontSize:18, fontWeight:700, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:10, color:SUBTEXT, marginTop:3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#0369a1,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Brand Intelligence</div>
            {!isPro && <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"5px 10px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:20, fontSize:10, color:"#dc2626" }}>🔒 45 locked</button>}
          </div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:14 }}>55 brands · umbrella companies · pros and cons</div>
          <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="Search brands..." style={{ width:"100%", padding:"12px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT, marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[["all","All"],["premium","Premium"],["midtier","Mid"],["specialty","Special"],["budget","Budget"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandTier(v)} style={{ padding:"6px 12px", background:brandTier===v?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${brandTier===v?"rgba(3,105,161,0.4)":BORDER}`, borderRadius:20, fontSize:11, color:brandTier===v?"#0369a1":SUBTEXT }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[["score","Score"],["price","Price"],["calcium","Calcium"],["magnesium","Magnesium"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandSort(v)} style={{ padding:"5px 10px", background:brandSort===v?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${brandSort===v?"rgba(3,105,161,0.3)":BORDER}`, borderRadius:16, fontSize:10, color:brandSort===v?"#0369a1":SUBTEXT }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((w,i)=>{
              const grade = getGrade(w.score);
              const status = getLSIStatus(w.lsi);
              const isLocked = !isPro && i >= 10;
              return (
                <button key={w.id} className="card" onClick={()=>isLocked?setShowUpgrade(true):setSelBrand(w)} style={{ background:CARD, border:`1px solid ${isLocked?"rgba(3,105,161,0.06)":BORDER}`, borderRadius:16, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.04,0.3)}s both`, display:"flex", alignItems:"center", gap:12, opacity:isLocked?0.7:1 }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{isLocked?"🔒":w.logo}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:TEXT }}>{w.name}</span>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:isLocked?"rgba(3,105,161,0.2)":grade.color }}>{isLocked?"?":grade.grade}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:SUBTEXT }}>Unlock with Pro to see full analysis</span>
                      ) : (
                        <>
                          <span style={{ fontSize:10, color:status.color }}>{status.emoji} LSI {w.lsi>0?"+":""}{w.lsi}</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>Ca {w.calcium} Mg {w.magnesium}</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>${w.price}/L</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // CITIES TAB
  if (tab === "cities") {
    const REGIONS = [
      { id:"all",       label:"All"          },
      { id:"tristate",  label:"Tri-State"    },
      { id:"ny",        label:"NY State"     },
      { id:"nj",        label:"New Jersey"   },
      { id:"ct",        label:"Connecticut"  },
      { id:"lehigh",    label:"Lehigh Valley"},
      { id:"pa",        label:"Pennsylvania" },
      { id:"fl",        label:"Florida"      },
      { id:"oh",        label:"Ohio"         },
      { id:"nc",        label:"N Carolina"   },
      { id:"sc",        label:"S Carolina"   },
      { id:"south",     label:"South"        },
      { id:"west",      label:"West"         },
      { id:"midwest",   label:"Midwest"      },
      { id:"northeast", label:"Northeast"    },
    ];
    const filteredCities = CITIES
      .filter(c => cityRegion === "all" || c.region === cityRegion)
      .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));
    if (selCity) {
      const lsi = calcLSI(selCity);
      const status = getLSIStatus(lsi);
      const risk = getCityRisk(selCity);
      const cityIdx = CITIES.findIndex(c=>c.name===selCity.name);
      const isLocked = !isPro && cityIdx >= 15;
      return (
        <div style={app}><style>{CSS}</style>
          {showUpgrade && <UpgradeModal />}
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelCity(null)} style={{ background:CARD, border:`1px solid ${BORDER}`, color:SUBTEXT, padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>← All Cities</button>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:44, marginBottom:6 }}>🌆</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:TEXT }}>{selCity.name}</div>
              <div style={{ fontSize:12, color:SUBTEXT, marginTop:4 }}>Tap Water Analysis · {selCity.state}</div>
              <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:16 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{lsi>0?"+":""}{lsi}</div>
                  <div style={{ fontSize:10, color:SUBTEXT }}>LSI SCORE</div>
                </div>
                <div style={{ width:1, background:BORDER }} />
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:riskColor(risk.overallRisk) }}>{risk.overallRisk}</div>
                  <div style={{ fontSize:10, color:SUBTEXT }}>OVERALL RISK</div>
                </div>
              </div>
            </div>
            <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
              <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Contamination Report</div>
              {[
                { label:"PFAS Forever Chemicals", val:selCity.pfas, unit:"ppt", risk:risk.pfasRisk, limit:"EPA limit 4 ppt", locked:isLocked },
                { label:"Lead",                   val:selCity.lead, unit:"ppb", risk:risk.leadRisk,  limit:"Action level 15 ppb", locked:isLocked },
                { label:"Nitrate",                val:selCity.nitrate, unit:"ppm", risk:risk.nitrateRisk, limit:"EPA max 10 ppm", locked:isLocked },
                { label:"5-Year Violations",      val:selCity.violations, unit:"", risk:selCity.violations>7?"HIGH":selCity.violations>3?"ELEVATED":"SAFE", limit:"0 is ideal", locked:false },
              ].map((m,i)=>(
                <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      {m.locked ? (
                        <button onClick={()=>setShowUpgrade(true)} style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"3px 8px", fontSize:11, color:"#dc2626", cursor:"pointer" }}>🔒 Unlock</button>
                      ) : (
                        <>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:riskColor(m.risk) }}>{m.val} {m.unit}</span>
                          <span style={{ padding:"2px 6px", background:riskBg(m.risk), borderRadius:8, fontSize:9, color:riskColor(m.risk), fontWeight:700 }}>{m.risk}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!m.locked && <div style={{ fontSize:10, color:"rgba(3,105,161,0.4)", marginTop:2 }}>{m.limit}</div>}
                </div>
              ))}
            </div>
            <div style={{ padding:16, background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, marginBottom:14 }}>
              <div style={{ fontSize:11, color:SUBTEXT, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Water Chemistry</div>
              {[
                { label:"pH Level",    val:selCity.pH,          unit:"",     color:"#7c3aed" },
                { label:"TDS",         val:selCity.tds,         unit:"mg/L", color:"#0369a1" },
                { label:"Calcium",     val:selCity.calcium,     unit:"mg/L", color:"#ca8a04" },
                { label:"Bicarbonate", val:selCity.bicarbonate, unit:"mg/L", color:"#0284c7" },
              ].map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <span style={{ fontSize:12, color:SUBTEXT }}>{m.label}</span>
                  <span style={{ fontSize:15, fontWeight:700, color:m.color }}>{m.val} {m.unit}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                <div>
                  <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>
                    {risk.overallRisk === "CRISIS"
                      ? `${selCity.name} has CRISIS-level contamination. Walter strongly recommends reverse osmosis filtration immediately. Do not rely on tap water for infants or pregnant women.`
                      : risk.overallRisk === "HIGH" || risk.overallRisk === "ELEVATED"
                      ? `${selCity.name} has elevated contaminant levels. Walter recommends an NSF 53 certified filter at minimum. Reverse osmosis preferred for full protection.`
                      : `${selCity.name} tap water is within regulatory limits LSI ${lsi}. A standard carbon filter handles chlorine and taste. You can drink with reasonable confidence.`}
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT, marginTop:6, fontStyle:"italic" }}>Source: {selCity.source}</div>
                  <div style={{ fontSize:11, color:"#ea580c", marginTop:4 }}>Key concerns: {selCity.contaminants}</div>
                </div>
              </div>
            </div>
            {isPro && (
              <button className="btn" onClick={()=>setShowCivic(!showCivic)} style={{ width:"100%", padding:"12px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, fontSize:13, fontWeight:600, color:"#0369a1", marginBottom:10 }}>
                {showCivic?"Hide":"Show"} Civic Action Toolkit 📢
              </button>
            )}
            {showCivic && isPro && (
              <div style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, marginBottom:14, animation:"fadeUp 0.3s ease both" }}>
                <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, letterSpacing:2, marginBottom:12 }}>WHO TO CONTACT</div>
                {CIVIC_CONTACTS.howTo.slice(0,3).map((item,i)=>(
                  <div key={i} style={{ marginBottom:12, padding:10, background:"rgba(3,105,161,0.04)", borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:TEXT, marginBottom:4 }}>{item.action}</div>
                    <div style={{ fontSize:11, color:SUBTEXT, lineHeight:1.6 }}>{item.description}</div>
                  </div>
                ))}
                {CIVIC_CONTACTS.federal.slice(0,2).map((item,i)=>(
                  <div key={i} style={{ marginBottom:8, padding:10, background:"rgba(3,105,161,0.04)", borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                    {item.phone && <div style={{ fontSize:11, color:"#0369a1", marginTop:2 }}>{item.phone}</div>}
                    <div style={{ fontSize:11, color:SUBTEXT }}>{item.website}</div>
                  </div>
                ))}
              </div>
            )}
            {!isPro && (
              <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ width:"100%", padding:"12px", background:"rgba(3,105,161,0.06)", border:`1px solid ${BORDER}`, borderRadius:14, fontSize:12, color:"#0369a1" }}>
                🔒 Unlock Civic Action Toolkit with Pro
              </button>
            )}
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#7c3aed,#0369a1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>City Water Intel</div>
            {!isPro && <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"5px 10px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:20, fontSize:10, color:"#dc2626" }}>🔒 Full data</button>}
          </div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:14 }}>{CITIES.length} cities · PFAS · Lead · Nitrate · Violations</div>
          <input value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="Search your city..." style={{ width:"100%", padding:"12px 16px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT, marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {REGIONS.map(r=>(
              <button key={r.id} className="btn" onClick={()=>setCityRegion(r.id)} style={{ padding:"5px 10px", background:cityRegion===r.id?"rgba(124,58,237,0.1)":CARD, border:`1px solid ${cityRegion===r.id?"rgba(124,58,237,0.4)":BORDER}`, borderRadius:20, fontSize:10, color:cityRegion===r.id?"#7c3aed":SUBTEXT }}>{r.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filteredCities.map((c,i)=>{
              const lsi = calcLSI(c);
              const status = getLSIStatus(lsi);
              const risk = getCityRisk(c);
              const isLocked = !isPro && i >= 15;
              return (
                <button key={i} className="card" onClick={()=>isLocked?setShowUpgrade(true):setSelCity(c)} style={{ background:CARD, border:`1px solid ${risk.overallRisk==="CRISIS"?"rgba(220,38,38,0.3)":risk.overallRisk==="HIGH"?"rgba(234,88,12,0.2)":BORDER}`, borderRadius:14, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.03,0.3)}s both`, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:24 }}>{risk.overallRisk==="CRISIS"?"🚨":risk.overallRisk==="HIGH"?"⚠️":"🌆"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:TEXT }}>{c.name}</span>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:"#dc2626" }}>🔒 Pro</span>
                      ) : (
                        <span style={{ fontSize:11, fontWeight:700, color:riskColor(risk.overallRisk) }}>{risk.overallRisk}</span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {isLocked ? (
                        <span style={{ fontSize:10, color:SUBTEXT }}>PFAS: ●●● · Lead: ●●● · Unlock with Pro</span>
                      ) : (
                        <>
                          <span style={{ fontSize:10, color:riskColor(risk.pfasRisk) }}>PFAS {c.pfas}ppt</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:riskColor(risk.leadRisk) }}>Pb {c.lead}ppb</span>
                          <span style={{ fontSize:9, color:SUBTEXT }}>·</span>
                          <span style={{ fontSize:10, color:SUBTEXT }}>LSI {lsi>0?"+":""}{lsi}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:SUBTEXT }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // LEARN TAB
  const LESSONS = [
    { title:"What is LSI",         icon:"🔬", time:"3 min", content:"The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936. It measures whether water is corrosive, balanced, or scale-forming. Water with a negative LSI actively dissolves minerals it contacts including calcium in your teeth and bones. Most purified bottled waters score between -1.0 and -2.0, meaning they are aggressively stripping minerals. The ideal LSI range is -0.2 to +0.2. At this level water is in equilibrium with your body and neither deposits nor removes minerals." },
    { title:"The Mineral Gap",     icon:"⚡", time:"4 min", content:"Up to 50% of Americans are deficient in magnesium. The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely. Dasani, Aquafina, and Smartwater contain zero magnesium and zero calcium. Gerolsteiner contains 348 mg/L calcium and 108 mg/L magnesium meeting WHO standards in a single liter. The minerals you get from water are more bioavailable than those from food or supplements because they are already in ionic form ready for direct cellular absorption." },
    { title:"PFAS — Forever Chemicals", icon:"☢️", time:"4 min", content:"PFAS — per and polyfluoroalkyl substances — are man-made chemicals that do not break down in the environment or your body. They have been used since the 1940s in non-stick cookware, firefighting foam, food packaging, and waterproof clothing. The EPA health advisory is 4 parts per trillion. Horsham Township Pennsylvania has 1100 ppt — 275 times the limit. Fayetteville North Carolina has 700 ppt from Chemours GenX discharge. The only effective home removal methods are reverse osmosis filtration and activated carbon block. Standard Brita pitchers do NOT remove PFAS." },
    { title:"Lead in Water",       icon:"🔴", time:"4 min", content:"There is no safe level of lead exposure for children. Lead causes irreversible neurological damage, learning disabilities, and behavioral problems. The primary source in drinking water is lead service lines and interior plumbing installed before 1986. Benton Harbor Michigan has 55 ppb lead — nearly 4 times the EPA action level of 15 ppb. Newark New Jersey had a lead crisis from 2016 to 2021. An important and critical warning: boiling water does NOT remove lead. It concentrates it. The only solution is filtration using NSF 53 certified filters or reverse osmosis." },
    { title:"Hard vs Soft Water",  icon:"💎", time:"3 min", content:"Hard water contains high concentrations of calcium and magnesium. Soft water contains very little. Epidemiological studies have consistently shown that populations drinking hard water have lower rates of cardiovascular disease than those drinking soft water. The landmark WHO report on drinking water quality concluded that water hardness is inversely associated with heart disease mortality. Las Vegas tap water is very hard at 550 TDS. Seattle tap water is very soft at 45 TDS. The sweet spot is 150-400 TDS from natural mineral sources." },
    { title:"Reading Water Labels", icon:"📋", time:"4 min", content:"Every bottled water label tells a story. Look for source which can be spring, purified tap, or artesian. Check mineral content including calcium, magnesium, sodium, and bicarbonate in mg/L. Check TDS which is the sum of all minerals. Check pH which should ideally be 7.0-8.5. Red flags include purified or distilled without remineralization, zero or near-zero TDS, pH below 6.5. Green flags include natural spring or artesian source, calcium above 50 mg/L, magnesium above 20 mg/L, bicarbonate above 100 mg/L." },
  ];

  if (tab === "learn") {
    const lesson = LESSONS[eduIdx];
    const gItem = GLOSSARY[glossaryIdx];
    return (
      <div style={app}><style>{CSS}</style>
        {showUpgrade && <UpgradeModal />}
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#ca8a04,#ea580c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Academy</div>
          <div style={{ fontSize:13, color:SUBTEXT, marginBottom:16 }}>Science · Glossary · Walter AI · Filters · Civic Action</div>
          <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
            {[["academy","Science"],["glossary","Glossary"],["walter","Ask Walter"],["filters","Filters"],["civic","Take Action"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setLearnSub(id)} style={{ padding:"8px 12px", background:learnSub===id?"rgba(202,138,4,0.1)":CARD, border:`1px solid ${learnSub===id?"rgba(202,138,4,0.4)":BORDER}`, borderRadius:12, fontSize:11, fontWeight:learnSub===id?700:400, color:learnSub===id?"#ca8a04":SUBTEXT }}>{label}</button>
            ))}
          </div>

          {learnSub === "academy" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {LESSONS.map((l,i)=>(
                  <button key={i} className="btn" onClick={()=>setEduIdx(i)} style={{ padding:"6px 10px", background:eduIdx===i?"rgba(202,138,4,0.1)":CARD, border:`1px solid ${eduIdx===i?"rgba(202,138,4,0.3)":BORDER}`, borderRadius:20, fontSize:10, color:eduIdx===i?"#ca8a04":SUBTEXT }}>{l.icon} {l.title}</button>
                ))}
              </div>
              <div style={{ padding:20, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:32, marginBottom:6 }}>{lesson.icon}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:TEXT }}>{lesson.title}</div>
                  </div>
                  <span style={{ padding:"4px 10px", background:"rgba(3,105,161,0.06)", borderRadius:20, fontSize:10, color:SUBTEXT }}>{lesson.time}</span>
                </div>
                <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.85 }}>{lesson.content}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setEduIdx(Math.max(0,eduIdx-1))} disabled={eduIdx===0} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:eduIdx===0?BORDER:SUBTEXT }}>Previous</button>
                <span style={{ fontSize:11, color:SUBTEXT, alignSelf:"center" }}>{eduIdx+1} of {LESSONS.length}</span>
                <button className="btn" onClick={()=>setEduIdx(Math.min(LESSONS.length-1,eduIdx+1))} disabled={eduIdx===LESSONS.length-1} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:eduIdx===LESSONS.length-1?BORDER:SUBTEXT }}>Next</button>
              </div>
            </div>
          )}

          {learnSub === "glossary" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {GLOSSARY.map((g,i)=>(
                  <button key={i} className="btn" onClick={()=>setGlossaryIdx(i)} style={{ padding:"6px 10px", background:glossaryIdx===i?"rgba(3,105,161,0.1)":CARD, border:`1px solid ${glossaryIdx===i?"rgba(3,105,161,0.35)":BORDER}`, borderRadius:20, fontSize:10, color:glossaryIdx===i?"#0369a1":SUBTEXT }}>{g.icon} {g.term}</button>
                ))}
              </div>
              <div style={{ padding:20, background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(3,105,161,0.08)", border:"1px solid rgba(3,105,161,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{gItem.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#0369a1" }}>{gItem.term}</div>
                    <div style={{ fontSize:11, color:SUBTEXT, marginTop:2 }}>{gItem.full}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:SUBTEXT, lineHeight:1.85, marginBottom:14 }}>{gItem.def}</div>
                <div style={{ padding:12, background:"rgba(3,105,161,0.05)", borderRadius:12, borderLeft:"3px solid #0369a1" }}>
                  <div style={{ fontSize:10, color:SUBTEXT, letterSpacing:1, marginBottom:4 }}>EXAMPLE</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6, fontStyle:"italic" }}>{gItem.example}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.max(0,glossaryIdx-1))} disabled={glossaryIdx===0} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:glossaryIdx===0?BORDER:SUBTEXT }}>Previous</button>
                <span style={{ fontSize:11, color:SUBTEXT, alignSelf:"center" }}>{glossaryIdx+1} of {GLOSSARY.length}</span>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.min(GLOSSARY.length-1,glossaryIdx+1))} disabled={glossaryIdx===GLOSSARY.length-1} style={{ padding:"10px 18px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:12, color:glossaryIdx===GLOSSARY.length-1?BORDER:SUBTEXT }}>Next</button>
              </div>
            </div>
          )}

          {learnSub === "walter" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ padding:16, background:"rgba(3,105,161,0.05)", borderRadius:16, border:"1px solid rgba(3,105,161,0.12)", marginBottom:14 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#0369a1,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0369a1" }}>Ask Walter Anything</div>
                    <div style={{ fontSize:11, color:SUBTEXT }}>Powered by Claude AI</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="Is my city water safe for my baby..." style={{ flex:1, padding:"12px 14px", background:"white", border:`1px solid ${BORDER}`, borderRadius:12, fontSize:13, color:TEXT }} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)} />
                  <button className="btn" onClick={()=>askWalter(walterQ)} style={{ padding:"12px 16px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:12, color:"white", fontSize:13, fontWeight:700 }}>Ask</button>
                </div>
                {walterLoading && <div className="pulse" style={{ fontSize:13, color:SUBTEXT, textAlign:"center", padding:12 }}>🤖 Walter is analyzing your question...</div>}
                {walterAnswer && (
                  <div style={{ padding:14, background:"white", borderRadius:12, border:`1px solid ${BORDER}` }}>
                    <div style={{ fontSize:11, color:"#0369a1", fontWeight:700, marginBottom:6 }}>WALTER SAYS</div>
                    <div style={{ fontSize:13, color:TEXT, lineHeight:1.75 }}>{walterAnswer}</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize:11, color:SUBTEXT, marginBottom:10 }}>Suggested questions:</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {WALTER_QA_PROMPTS.slice(0,8).map((q,i)=>(
                  <button key={i} className="card" onClick={()=>{ setWalterQ(q); askWalter(q); }} style={{ padding:"10px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, textAlign:"left", fontSize:12, color:TEXT }}>
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {learnSub === "filters" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              {Object.values(FILTER_RECOMMENDATIONS).map((rec,i)=>(
                <div key={i} style={{ padding:16, background:CARD, borderRadius:16, border:`1px solid ${rec.urgency==="CRITICAL"?"rgba(220,38,38,0.2)":rec.urgency==="HIGH"?"rgba(234,88,12,0.15)":BORDER}`, marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontSize:16 }}>{rec.icon}</div>
                    <span style={{ padding:"3px 8px", background:rec.urgency==="CRITICAL"?"rgba(220,38,38,0.1)":rec.urgency==="HIGH"?"rgba(234,88,12,0.1)":"rgba(3,105,161,0.08)", borderRadius:20, fontSize:9, fontWeight:700, color:rec.urgency==="CRITICAL"?"#dc2626":rec.urgency==="HIGH"?"#ea580c":"#0369a1" }}>{rec.urgency}</span>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:TEXT, marginBottom:6 }}>{rec.problem}</div>
                  <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.6, marginBottom:10 }}>{rec.description}</div>
                  {rec.solutions.map((sol,j)=>(
                    <div key={j} style={{ padding:10, background:sol.type==="Does NOT work"?"rgba(220,38,38,0.04)":"rgba(22,163,74,0.04)", borderRadius:10, marginBottom:6, border:`1px solid ${sol.type==="Does NOT work"?"rgba(220,38,38,0.1)":"rgba(22,163,74,0.1)"}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:sol.type==="Does NOT work"?"#dc2626":"#16a34a" }}>{sol.type==="Does NOT work"?"❌":"✅"} {sol.type}</span>
                        <span style={{ fontSize:10, color:SUBTEXT }}>{sol.cost}</span>
                      </div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginBottom:4 }}>{sol.effectiveness}</div>
                      <div style={{ fontSize:10, color:TEXT, fontStyle:"italic" }}>{sol.note}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {learnSub === "civic" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              {!isPro && (
                <div style={{ padding:16, background:"rgba(220,38,38,0.05)", borderRadius:16, border:"1px solid rgba(220,38,38,0.15)", marginBottom:16, textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>🔒</div>
                  <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:6 }}>Civic Action Toolkit</div>
                  <div style={{ fontSize:12, color:SUBTEXT, marginBottom:12 }}>Learn who to contact, how to file complaints, and how to organize your community around water quality issues.</div>
                  <button className="btn" onClick={()=>setShowUpgrade(true)} style={{ padding:"12px 24px", background:"linear-gradient(135deg,#0369a1,#0284c7)", border:"none", borderRadius:12, fontSize:13, fontWeight:700, color:"white" }}>Unlock with Pro</button>
                </div>
              )}
              {isPro && (
                <>
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10 }}>HOW TO TAKE ACTION</div>
                  {CIVIC_CONTACTS.howTo.map((item,i)=>(
                    <div key={i} style={{ padding:14, background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#0369a1", marginBottom:6 }}>📢 {item.action}</div>
                      <div style={{ fontSize:12, color:SUBTEXT, lineHeight:1.7 }}>{item.description}</div>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10, marginTop:16 }}>FEDERAL CONTACTS</div>
                  {CIVIC_CONTACTS.federal.map((item,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                      {item.phone && <div style={{ fontSize:12, color:"#0369a1", marginTop:3 }}>{item.phone}</div>}
                      <div style={{ fontSize:11, color:SUBTEXT }}>{item.website}</div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginTop:3, fontStyle:"italic" }}>{item.note}</div>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:SUBTEXT, fontWeight:700, letterSpacing:2, marginBottom:10, marginTop:16 }}>ADVOCACY ORGANIZATIONS</div>
                  {CIVIC_CONTACTS.advocacy.map((item,i)=>(
                    <div key={i} style={{ padding:12, background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:TEXT }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#0369a1" }}>{item.website}</div>
                      <div style={{ fontSize:11, color:SUBTEXT, marginTop:3, fontStyle:"italic" }}>{item.note}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <NavBar />
      </div>
    );
  }

  return null;
}  { name:"Las Vegas, NV",       state:"NV", pH:8.0, tds:550, calcium:125,bicarbonate:180, region:"west" },
  { name:"Minneapolis, MN",     state:"MN", pH:7.6, tds:200, calcium:52, bicarbonate:88,  region:"midwest" },
  { name:"New Orleans, LA",     state:"LA", pH:7.8, tds:175, calcium:42, bicarbonate:80,  region:"south" },
  { name:"Buffalo, NY",         state:"NY", pH:7.5, tds:165, calcium:42, bicarbonate:78,  region:"ny" },
  { name:"Rochester, NY",       state:"NY", pH:7.4, tds:145, calcium:38, bicarbonate:68,  region:"ny" },
  { name:"Syracuse, NY",        state:"NY", pH:7.3, tds:130, calcium:34, bicarbonate:62,  region:"ny" },
  { name:"Albany, NY",          state:"NY", pH:7.2, tds:85,  calcium:20, bicarbonate:38,  region:"ny" },
  { name:"Yonkers, NY",         state:"NY", pH:7.2, tds:55,  calcium:15, bicarbonate:32,  region:"tristate" },
  { name:"Long Island Nassau",  state:"NY", pH:7.4, tds:175, calcium:44, bicarbonate:80,  region:"tristate" },
  { name:"Long Island Suffolk", state:"NY", pH:7.3, tds:155, calcium:38, bicarbonate:70,  region:"tristate" },
  { name:"Westchester, NY",     state:"NY", pH:7.2, tds:60,  calcium:16, bicarbonate:34,  region:"tristate" },
  { name:"Poughkeepsie, NY",    state:"NY", pH:7.3, tds:95,  calcium:24, bicarbonate:45,  region:"ny" },
  { name:"Newburgh, NY",        state:"NY", pH:7.1, tds:80,  calcium:20, bicarbonate:38,  region:"ny" },
  { name:"Newark, NJ",          state:"NJ", pH:7.1, tds:55,  calcium:13, bicarbonate:28,  region:"tristate" },
  { name:"Jersey City, NJ",     state:"NJ", pH:7.2, tds:60,  calcium:15, bicarbonate:30,  region:"tristate" },
  { name:"Trenton, NJ",         state:"NJ", pH:7.4, tds:220, calcium:55, bicarbonate:95,  region:"nj" },
  { name:"Camden, NJ",          state:"NJ", pH:7.2, tds:135, calcium:32, bicarbonate:58,  region:"nj" },
  { name:"Paterson, NJ",        state:"NJ", pH:7.1, tds:65,  calcium:16, bicarbonate:30,  region:"tristate" },
  { name:"Elizabeth, NJ",       state:"NJ", pH:7.2, tds:97,  calcium:24, bicarbonate:45,  region:"tristate" },
  { name:"East Orange, NJ",     state:"NJ", pH:7.8, tds:485, calcium:110,bicarbonate:165, region:"tristate" },
  { name:"Edison, NJ",          state:"NJ", pH:7.5, tds:185, calcium:46, bicarbonate:84,  region:"nj" },
  { name:"Woodbridge, NJ",      state:"NJ", pH:7.4, tds:170, calcium:42, bicarbonate:78,  region:"nj" },
  { name:"Toms River, NJ",      state:"NJ", pH:7.3, tds:115, calcium:28, bicarbonate:52,  region:"nj" },
  { name:"Hackensack, NJ",      state:"NJ", pH:7.2, tds:75,  calcium:18, bicarbonate:35,  region:"tristate" },
  { name:"Princeton, NJ",       state:"NJ", pH:7.3, tds:130, calcium:32, bicarbonate:58,  region:"nj" },
  { name:"Bridgeport, CT",      state:"CT", pH:7.2, tds:110, calcium:27, bicarbonate:50,  region:"ct" },
  { name:"New Haven, CT",       state:"CT", pH:7.1, tds:95,  calcium:24, bicarbonate:44,  region:"ct" },
  { name:"Hartford, CT",        state:"CT", pH:7.0, tds:75,  calcium:18, bicarbonate:32,  region:"ct" },
  { name:"Stamford, CT",        state:"CT", pH:7.1, tds:51,  calcium:13, bicarbonate:26,  region:"ct" },
  { name:"Waterbury, CT",       state:"CT", pH:7.2, tds:105, calcium:26, bicarbonate:48,  region:"ct" },
  { name:"Norwalk, CT",         state:"CT", pH:7.1, tds:88,  calcium:22, bicarbonate:40,  region:"ct" },
  { name:"Danbury, CT",         state:"CT", pH:7.0, tds:70,  calcium:17, bicarbonate:30,  region:"ct" },
  { name:"Greenwich, CT",       state:"CT", pH:7.1, tds:60,  calcium:15, bicarbonate:28,  region:"ct" },
  { name:"Allentown, PA",       state:"PA", pH:7.6, tds:222, calcium:56, bicarbonate:105, region:"lehigh" },
  { name:"Bethlehem, PA",       state:"PA", pH:7.2, tds:17,  calcium:4,  bicarbonate:14,  region:"lehigh" },
  { name:"Easton, PA",          state:"PA", pH:7.1, tds:46,  calcium:11, bicarbonate:24,  region:"lehigh" },
  { name:"Reading, PA",         state:"PA", pH:7.4, tds:130, calcium:32, bicarbonate:60,  region:"pa" },
  { name:"Lancaster, PA",       state:"PA", pH:7.5, tds:163, calcium:41, bicarbonate:75,  region:"pa" },
  { name:"Harrisburg, PA",      state:"PA", pH:7.4, tds:137, calcium:34, bicarbonate:62,  region:"pa" },
  { name:"Scranton, PA",        state:"PA", pH:7.3, tds:115, calcium:28, bicarbonate:52,  region:"pa" },
  { name:"Pittsburgh, PA",      state:"PA", pH:7.4, tds:130, calcium:32, bicarbonate:58,  region:"pa" },
  { name:"York, PA",            state:"PA", pH:7.3, tds:89,  calcium:22, bicarbonate:42,  region:"pa" },
  { name:"Wilkes-Barre, PA",    state:"PA", pH:7.3, tds:108, calcium:27, bicarbonate:50,  region:"pa" },
  { name:"Kutztown, PA",        state:"PA", pH:7.4, tds:145, calcium:36, bicarbonate:66,  region:"lehigh" },
  { name:"Tampa, FL",           state:"FL", pH:7.8, tds:285, calcium:68, bicarbonate:120, region:"fl" },
  { name:"Orlando, FL",         state:"FL", pH:7.6, tds:245, calcium:58, bicarbonate:105, region:"fl" },
  { name:"Jacksonville, FL",    state:"FL", pH:7.5, tds:190, calcium:46, bicarbonate:88,  region:"fl" },
  { name:"Fort Lauderdale, FL", state:"FL", pH:7.9, tds:310, calcium:74, bicarbonate:130, region:"fl" },
  { name:"Tallahassee, FL",     state:"FL", pH:7.2, tds:125, calcium:30, bicarbonate:58,  region:"fl" },
  { name:"Gainesville, FL",     state:"FL", pH:7.4, tds:168, calcium:42, bicarbonate:78,  region:"fl" },
  { name:"Sarasota, FL",        state:"FL", pH:7.7, tds:260, calcium:62, bicarbonate:112, region:"fl" },
  { name:"Cape Coral, FL",      state:"FL", pH:7.8, tds:290, calcium:70, bicarbonate:125, region:"fl" },
  { name:"St Petersburg, FL",   state:"FL", pH:7.6, tds:240, calcium:56, bicarbonate:100, region:"fl" },
  { name:"Pensacola, FL",       state:"FL", pH:7.3, tds:145, calcium:36, bicarbonate:68,  region:"fl" },
  { name:"Columbus, OH",        state:"OH", pH:7.5, tds:235, calcium:58, bicarbonate:102, region:"oh" },
  { name:"Cleveland, OH",       state:"OH", pH:7.4, tds:195, calcium:48, bicarbonate:88,  region:"oh" },
  { name:"Cincinnati, OH",      state:"OH", pH:7.6, tds:260, calcium:64, bicarbonate:112, region:"oh" },
  { name:"Toledo, OH",          state:"OH", pH:7.5, tds:220, calcium:54, bicarbonate:98,  region:"oh" },
  { name:"Akron, OH",           state:"OH", pH:7.3, tds:175, calcium:42, bicarbonate:80,  region:"oh" },
  { name:"Dayton, OH",          state:"OH", pH:7.4, tds:205, calcium:50, bicarbonate:92,  region:"oh" },
  { name:"Youngstown, OH",      state:"OH", pH:7.2, tds:155, calcium:38, bicarbonate:72,  region:"oh" },
  { name:"Canton, OH",          state:"OH", pH:7.4, tds:190, calcium:46, bicarbonate:85,  region:"oh" },
  { name:"Charlotte, NC",       state:"NC", pH:7.2, tds:125, calcium:30, bicarbonate:56,  region:"nc" },
  { name:"Raleigh, NC",         state:"NC", pH:7.1, tds:95,  calcium:22, bicarbonate:42,  region:"nc" },
  { name:"Greensboro, NC",      state:"NC", pH:7.2, tds:110, calcium:27, bicarbonate:50,  region:"nc" },
  { name:"Durham, NC",          state:"NC", pH:7.1, tds:100, calcium:24, bicarbonate:45,  region:"nc" },
  { name:"Winston-Salem, NC",   state:"NC", pH:7.3, tds:135, calcium:33, bicarbonate:62,  region:"nc" },
  { name:"Fayetteville, NC",    state:"NC", pH:7.2, tds:118, calcium:28, bicarbonate:52,  region:"nc" },
  { name:"Wilmington, NC",      state:"NC", pH:7.4, tds:155, calcium:38, bicarbonate:70,  region:"nc" },
  { name:"Asheville, NC",       state:"NC", pH:6.9, tds:65,  calcium:16, bicarbonate:28,  region:"nc" },
  { name:"Columbia, SC",        state:"SC", pH:7.2, tds:115, calcium:27, bicarbonate:52,  region:"sc" },
  { name:"Charleston, SC",      state:"SC", pH:7.5, tds:185, calcium:44, bicarbonate:82,  region:"sc" },
  { name:"Greenville, SC",      state:"SC", pH:7.1, tds:88,  calcium:20, bicarbonate:40,  region:"sc" },
  { name:"Rock Hill, SC",       state:"SC", pH:7.3, tds:130, calcium:32, bicarbonate:58,  region:"sc" },
  { name:"Spartanburg, SC",     state:"SC", pH:7.2, tds:110, calcium:26, bicarbonate:50,  region:"sc" },
  { name:"Myrtle Beach, SC",    state:"SC", pH:7.5, tds:195, calcium:47, bicarbonate:88,  region:"sc" },
  { name:"Hilton Head, SC",     state:"SC", pH:7.4, tds:170, calcium:40, bicarbonate:76,  region:"sc" },
  { name:"Summerville, SC",     state:"SC", pH:7.3, tds:140, calcium:34, bicarbonate:64,  region:"sc" },
];

const GLOSSARY = [
  { term:"LSI",          full:"Langelier Saturation Index",        icon:"🔬", color:"#00d4ff", def:"A scientific formula that measures whether water is corrosive, balanced, or scale-forming. Negative LSI water pulls calcium and magnesium from your body with every sip. The ideal range is -0.2 to +0.2.",                                                                                          example:"Dasani LSI -1.8 very aggressive. Evian LSI +0.1 balanced." },
  { term:"TDS",          full:"Total Dissolved Solids",            icon:"💧", color:"#63d39e", def:"The total concentration of dissolved minerals salts and metals in water measured in mg/L. Higher TDS from natural minerals is generally positive for health.",                                                                                                                                     example:"NYC tap 50 mg/L very low. Gerolsteiner 2527 mg/L very high mineral-rich." },
  { term:"pH",           full:"Potential of Hydrogen",             icon:"⚗️",color:"#a78bfa", def:"A scale from 0-14 measuring how acidic or alkaline water is. 7.0 is neutral. Below 7 is acidic. Above 7 is alkaline. Ideal drinking water pH is 7.0-8.5.",                                                                                                                                    example:"Aquafina pH 6.0 acidic. Evian pH 7.2 ideal. Icelandic Glacial pH 8.4 alkaline." },
  { term:"Calcium",      full:"Calcium Hardness",                  icon:"🦴", color:"#fbbf24", def:"Essential mineral for bone density muscle contraction nerve transmission and heart rhythm. WHO recommends 50-100 mg/L minimum in drinking water.",                                                                                                                                              example:"Contrex 486 mg/L exceptional. Aquafina 0 mg/L none at all." },
  { term:"Magnesium",    full:"Magnesium Content",                 icon:"⚡", color:"#34d399", def:"The master mineral involved in 300 plus enzymatic reactions. Regulates sleep stress muscle function blood sugar and heart rhythm. Up to 50% of Americans are deficient.",                                                                                                                       example:"Apollinaris 130 mg/L highest available. Smartwater 0 mg/L none." },
  { term:"Bicarbonate",  full:"Bicarbonate Alkalinity",            icon:"🌊", color:"#60a5fa", def:"Acts as a natural buffer that neutralizes acidity in water and in your body. Higher bicarbonate content protects tooth enamel and is a key component in LSI calculation.",                                                                                                                      example:"Gerolsteiner 1816 mg/L. Dasani 0 mg/L." },
  { term:"Sodium",       full:"Sodium Content",                    icon:"🧂", color:"#f97316", def:"Naturally present in all water in small amounts. High sodium water above 200 mg/L can be a concern for people managing blood pressure.",                                                                                                                                                       example:"Apollinaris 410 mg/L very high. Mountain Valley 3 mg/L excellent." },
  { term:"Hardness",     full:"Water Hardness",                    icon:"💎", color:"#c084fc", def:"A measure of calcium and magnesium content in water. Soft water 0-75 ppm is low in beneficial minerals. Hard water 150 plus ppm contains more minerals.",                                                                                                                                     example:"Bethlehem PA very soft 17 ppm. Allentown PA moderately hard 222 ppm." },
  { term:"Aggressive",   full:"Aggressive or Corrosive Water",     icon:"⚠️", color:"#ef4444", def:"Water with a negative LSI that actively dissolves minerals it contacts including the calcium in your teeth and bones. Purified waters like Dasani are highly aggressive.",                                                                                                                     example:"Any water with LSI below -0.5 is classified as aggressive by Walter." },
  { term:"Artesian",     full:"Artesian Spring Water",             icon:"🏔️",color:"#84cc16", def:"Water drawn from a confined underground aquifer where natural pressure pushes water to the surface without pumping. Often mineral-rich from geological layers.",                                                                                                                                example:"Fiji Water comes from an artesian aquifer in the Fijian volcanic highlands." },
  { term:"WHO Standard", full:"World Health Organization Guideline",icon:"🌍", color:"#059669", def:"The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely.",                                                                                                                                    example:"Only 12 of the 40 brands Walter tracks meet WHO mineral minimums." },
];

const calcLSI = w => {
  const A = w.tds < 50 ? 0.07 : w.tds < 150 ? 0.14 : w.tds < 300 ? 0.19 : w.tds < 500 ? 0.22 : 0.26;
  const C = w.calcium < 25 ? 1.0 : w.calcium < 50 ? 1.3 : w.calcium < 100 ? 1.6 : w.calcium < 200 ? 1.9 : 2.2;
  const D = w.bicarbonate < 25 ? 1.1 : w.bicarbonate < 50 ? 1.4 : w.bicarbonate < 100 ? 1.7 : w.bicarbonate < 200 ? 2.0 : 2.3;
  return parseFloat((w.pH - ((9.3 + A + 1.0) - (C + D))).toFixed(2));
};

const getLSIStatus = lsi => {
  if (lsi < -0.5) return { label:"Aggressive",        color:"#ef4444", emoji:"🔴", bg:"rgba(239,68,68,0.1)"   };
  if (lsi < -0.2) return { label:"Mildly Aggressive", color:"#f97316", emoji:"🟠", bg:"rgba(249,115,22,0.1)"  };
  if (lsi <= 0.2) return  { label:"Balanced",          color:"#22c55e", emoji:"🟢", bg:"rgba(34,197,94,0.1)"   };
  if (lsi <= 0.5) return  { label:"Mildly Scaling",    color:"#eab308", emoji:"🟡", bg:"rgba(234,179,8,0.1)"   };
  return                  { label:"High Scaling",      color:"#8b5cf6", emoji:"🟣", bg:"rgba(139,92,246,0.1)"  };
};

const getScore = w => {
  let s = 50;
  const lsi = calcLSI(w);
  if (lsi >= -0.2 && lsi <= 0.3) s += 15; else if (lsi < -0.5) s -= 20; else if (lsi < -0.2) s -= 8;
  if (w.magnesium >= 50) s += 18; else if (w.magnesium >= 20) s += 13; else if (w.magnesium >= 8) s += 6; else if (w.magnesium < 2) s -= 10;
  if (w.calcium >= 150) s += 15; else if (w.calcium >= 60) s += 10; else if (w.calcium >= 20) s += 5; else if (w.calcium < 5) s -= 8;
  if (w.pH >= 7.0 && w.pH <= 8.5) s += 8; else if (w.pH < 6.5) s -= 12;
  if (!w.plastic) s += 4;
  if (w.sodium > 150) s -= 5;
  return Math.min(Math.max(s, 5), 100);
};

const getGrade = score => {
  if (score >= 85) return { grade:"A+", color:"#22c55e" };
  if (score >= 78) return { grade:"A",  color:"#4ade80" };
  if (score >= 70) return { grade:"B+", color:"#86efac" };
  if (score >= 62) return { grade:"B",  color:"#eab308" };
  if (score >= 50) return { grade:"C",  color:"#f97316" };
  return                  { grade:"D",  color:"#ef4444" };
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#06080f;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(99,211,158,0.2);border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes barFill{from{width:0}}
  .card{transition:transform 0.18s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);}
  .card:active{transform:scale(0.97);}
  .btn{transition:all 0.18s ease;cursor:pointer;}
  .btn:hover{opacity:0.85;}
  .btn:active{transform:scale(0.96);}
  input{outline:none;}
  input:focus{border-color:rgba(99,211,158,0.5)!important;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#00d4ff;cursor:pointer;}
`;

export default function Flozek() {
  const [tab, setTab] = useState("home");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTier, setBrandTier] = useState("all");
  const [brandSort, setBrandSort] = useState("score");
  const [selBrand, setSelBrand] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityRegion, setCityRegion] = useState("all");
  const [selCity, setSelCity] = useState(null);
  const [calcVals, setCalcVals] = useState({ pH:7.2, tds:150, calcium:40, bicarbonate:70 });
  const [showResult, setShowResult] = useState(false);
  const [lsiResult, setLsiResult] = useState(null);
  const [selSymptoms, setSelSymptoms] = useState([]);
  const [symptomRes, setSymptomRes] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [learnTab, setLearnTab] = useState("academy");
  const [eduIdx, setEduIdx] = useState(0);
  const [glossaryIdx, setGlossaryIdx] = useState(0);

  const app = { fontFamily:"'DM Sans',sans-serif", background:"#06080f", minHeight:"100vh", color:"#e4ede8", maxWidth:440, margin:"0 auto", position:"relative", paddingBottom:80 };

  const NavBar = () => (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:440, background:"rgba(6,8,15,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(99,211,158,0.08)", display:"flex", zIndex:100, paddingBottom:8 }}>
      {[["🏠","Home","home"],["🔬","Test","test"],["💧","Brands","brands"],["🌆","Cities","cities"],["📚","Learn","learn"]].map(([icon,label,id])=>(
        <button key={id} className="btn" onClick={()=>{ setTab(id); setSelBrand(null); setShowResult(false); }} style={{ flex:1, background:"none", border:"none", padding:"12px 4px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:19, filter:tab===id?"none":"grayscale(0.7) opacity(0.4)" }}>{icon}</span>
          <span style={{ fontSize:9, color:tab===id?"#63d39e":"rgba(200,230,215,0.3)", fontWeight:tab===id?700:400, letterSpacing:0.5 }}>{label}</span>
          {tab===id && <div style={{ width:16, height:2, background:"#63d39e", borderRadius:1 }} />}
        </button>
      ))}
    </div>
  );

  if (tab === "home") return (
    <div style={app}>
      <style>{CSS}</style>
      <div style={{ padding:"52px 22px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, background:"linear-gradient(135deg,#63d39e,#a8f0c8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flozek</div>
            <div style={{ fontSize:12, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>Water Intelligence</div>
          </div>
          <div style={{ fontSize:40, animation:"float 3s ease infinite" }}>💧</div>
        </div>
        <div style={{ padding:18, background:"linear-gradient(135deg,rgba(99,211,158,0.08),rgba(0,212,255,0.04))", borderRadius:20, border:"1px solid rgba(99,211,158,0.12)", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Meet Walter</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#63d39e,#00d4ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#63d39e", marginBottom:3 }}>WALTER</div>
              <div style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.6 }}>Water Analysis and Life Track Enhancement Recommendations. Your personal water intelligence assistant.</div>
            </div>
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(0,0,0,0.2)", borderRadius:12, fontSize:12, color:"rgba(200,230,215,0.55)", lineHeight:1.6, fontStyle:"italic" }}>
            Dasani scores a D. Aquafina scores a D. Your body deserves better and I am going to show you exactly what to drink instead.
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"🔬", title:"Test My Water",  sub:"LSI Calculator",       id:"test",   color:"#00d4ff" },
            { icon:"💧", title:"Browse Brands",  sub:"40 brands analyzed",   id:"brands", color:"#63d39e" },
            { icon:"🌆", title:"City Water",     sub:"96 cities scored",     id:"cities", color:"#a78bfa" },
            { icon:"📚", title:"Water Academy",  sub:"Science plus Glossary", id:"learn",  color:"#fbbf24" },
          ].map((item,i)=>(
            <button key={i} className="card" onClick={()=>setTab(item.id)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:14, textAlign:"left", animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.title}</div>
              <div style={{ fontSize:10, color:"rgba(200,230,215,0.38)", marginTop:2 }}>{item.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ padding:14, background:"rgba(255,255,255,0.02)", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", marginBottom:12 }}>
          <div style={{ fontSize:11, color:"rgba(200,230,215,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Coverage</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {["Tri-State","NYC Metro","New Jersey","Connecticut","Lehigh Valley","Pennsylvania","Florida","Ohio","North Carolina","South Carolina","Plus More"].map((tag,i)=>(
              <span key={i} style={{ padding:"3px 9px", background:"rgba(99,211,158,0.07)", border:"1px solid rgba(99,211,158,0.15)", borderRadius:20, fontSize:9, color:"#63d39e" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ padding:16, background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(99,211,158,0.04))", borderRadius:16, border:"1px solid rgba(124,58,237,0.12)" }}>
          <div style={{ fontSize:11, color:"#a78bfa", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Our Mission</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.6)", lineHeight:1.7 }}>A portion of every Flozek Pro subscription supports clean water access in underserved communities globally.</div>
          <div style={{ marginTop:10, fontSize:13, color:"#63d39e", fontWeight:600 }}>Upgrade to Pro 1.99 per month</div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  if (tab === "test") {
    const SYMPTOMS = [
      { id:1,  label:"Muscle cramps",       mineral:"Magnesium",    icon:"⚡" },
      { id:2,  label:"Poor sleep",          mineral:"Magnesium",    icon:"🌙" },
      { id:3,  label:"Chronic fatigue",     mineral:"Magnesium",    icon:"😴" },
      { id:4,  label:"Frequent headaches",  mineral:"Magnesium",    icon:"🧠" },
      { id:5,  label:"Brittle nails",       mineral:"Calcium",      icon:"💅" },
      { id:6,  label:"Anxiety",             mineral:"Magnesium",    icon:"😰" },
      { id:7,  label:"Irregular heartbeat", mineral:"Magnesium",    icon:"❤️" },
      { id:8,  label:"Brain fog",           mineral:"Electrolytes", icon:"🌫️" },
      { id:9,  label:"Joint pain",          mineral:"Calcium",      icon:"🦴" },
      { id:10, label:"Constipation",        mineral:"Magnesium",    icon:"🔄" },
      { id:11, label:"High blood pressure", mineral:"Magnesium",    icon:"🩺" },
      { id:12, label:"Tooth sensitivity",   mineral:"Calcium",      icon:"🦷" },
    ];
    const previewLSI = calcLSI(calcVals);
    const previewStatus = getLSIStatus(previewLSI);
    if (showResult) {
      const status = getLSIStatus(lsiResult);
      return (
        <div style={app}><style>{CSS}</style>
          <div style={{ padding:"52px 22px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <button className="btn" onClick={()=>setShowResult(false)} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"rgba(200,230,215,0.6)", padding:"8px 14px", borderRadius:20, fontSize:12 }}>Back</button>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#e4ede8" }}>Walters Analysis</div>
              <div style={{ width:60 }} />
            </div>
            <div style={{ padding:24, background:status.bg, borderRadius:22, border:`1px solid ${status.color}30`, textAlign:"center", marginBottom:16, animation:"scaleIn 0.4s ease both" }}>
              <div style={{ fontSize:48 }}>{status.emoji}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:58, fontWeight:800, color:status.color, lineHeight:1, margin:"8px 0" }}>{lsiResult>0?"+":""}{lsiResult}</div>
              <div style={{ fontSize:18, fontWeight:700, color:status.color, marginBottom:10 }}>{status.label}</div>
              <div style={{ fontSize:13, color:"rgba(200,230,215,0.7)", lineHeight:1.7 }}>
                {lsiResult < -0.5 && "Walter says: This water is highly aggressive. It is actively pulling minerals from your body with every glass you drink."}
                {lsiResult >= -0.5 && lsiResult < -0.2 && "Walter says: Mildly undersaturated water. Limited mineral contribution and mild depletion risk at normal intake."}
                {lsiResult >= -0.2 && lsiResult <= 0.2 && "Walter says: Perfect balance. This water works with your body rather than against it. Well done."}
                {lsiResult > 0.2 && "Walter says: High mineral content. Excellent for supplementation. Consider rotating with lower-TDS water."}
              </div>
            </div>
            {lsiResult < -0.2 && (
              <div style={{ padding:16, background:"rgba(99,211,158,0.05)", borderRadius:16, border:"1px solid rgba(99,211,158,0.12)", marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#63d39e", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Walter Recommends</div>
                {["Add mineral drops magnesium and calcium","Switch to a natural spring water brand","Use a remineralizing filter post-RO","Check the Brands tab for better options"].map((tip,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                    <span style={{ color:"#63d39e" }}>✓</span>
                    <span style={{ fontSize:12, color:"rgba(200,230,215,0.65)", lineHeight:1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#00d4ff,#63d39e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Testing</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:16 }}>LSI Calculator and Symptom Checker</div>
          <div style={{ padding:16, background:previewStatus.bg, borderRadius:16, border:`1px solid ${previewStatus.color}25`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)", letterSpacing:1, marginBottom:4 }}>LIVE LSI</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:previewStatus.color, lineHeight:1 }}>{previewLSI>0?"+":""}{previewLSI}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:28 }}>{previewStatus.emoji}</div>
              <div style={{ fontSize:13, color:previewStatus.color, fontWeight:600, marginTop:4 }}>{previewStatus.label}</div>
            </div>
          </div>
          {[
            { key:"pH",          label:"pH Level",               min:5,   max:10,  step:0.1, unit:"" },
            { key:"tds",         label:"TDS Total Dissolved Solids", min:0, max:1000,step:5,  unit:"mg/L" },
            { key:"calcium",     label:"Calcium Hardness",        min:0,   max:500, step:5,   unit:"mg/L" },
            { key:"bicarbonate", label:"Bicarbonate Alkalinity",  min:0,   max:500, step:5,   unit:"mg/L" },
          ].map(p=>(
            <div key={p.key} style={{ padding:14, background:"rgba(255,255,255,0.025)", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"rgba(220,240,228,0.85)" }}>{p.label}</span>
                <span style={{ fontSize:18, fontWeight:700, color:"#00d4ff" }}>{calcVals[p.key]}<span style={{ fontSize:11, color:"rgba(200,230,215,0.4)" }}> {p.unit}</span></span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step} value={calcVals[p.key]}
                onChange={e=>setCalcVals(prev=>({...prev,[p.key]:parseFloat(e.target.value)}))}
                style={{ background:`linear-gradient(to right,#00d4ff ${((calcVals[p.key]-p.min)/(p.max-p.min))*100}%,rgba(255,255,255,0.1) 0%)` }} />
            </div>
          ))}
          <button className="btn" onClick={()=>{ setLsiResult(previewLSI); setShowResult(true); }} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#00d4ff,#0099cc)", border:"none", borderRadius:14, fontSize:15, fontWeight:700, color:"#040d1a", marginBottom:14, boxShadow:"0 8px 28px rgba(0,212,255,0.2)" }}>
            Ask Walter to Analyze
          </button>
          <div style={{ padding:16, background:"rgba(255,107,53,0.06)", borderRadius:16, border:"1px solid rgba(255,107,53,0.15)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showSymptoms?12:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#ff6b35" }}>Symptom Checker</div>
              <button className="btn" onClick={()=>setShowSymptoms(!showSymptoms)} style={{ background:"rgba(255,107,53,0.15)", border:"1px solid rgba(255,107,53,0.3)", color:"#ff6b35", padding:"5px 10px", borderRadius:10, fontSize:11 }}>
                {showSymptoms?"Hide":"Open"}
              </button>
            </div>
            {showSymptoms && (
              <div style={{ animation:"fadeUp 0.3s ease both" }}>
                <div style={{ fontSize:12, color:"rgba(200,230,215,0.5)", marginBottom:10 }}>Select symptoms you experience:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {SYMPTOMS.map(s=>{
                    const sel = selSymptoms.includes(s.id);
                    return (
                      <button key={s.id} className="card" onClick={()=>setSelSymptoms(prev=>sel?prev.filter(id=>id!==s.id):[...prev,s.id])} style={{ padding:"10px", background:sel?"rgba(255,107,53,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${sel?"rgba(255,107,53,0.3)":"rgba(255,255,255,0.06)"}`, borderRadius:11, textAlign:"left" }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                        <div style={{ fontSize:11, fontWeight:600, color:sel?"#ff6b35":"rgba(220,240,228,0.7)" }}>{s.label}</div>
                      </button>
                    );
                  })}
                </div>
                {selSymptoms.length > 0 && (
                  <button className="btn" onClick={()=>{
                    const mins = {};
                    selSymptoms.forEach(id=>{ const s=SYMPTOMS.find(s=>s.id===id); if(s) mins[s.mineral]=(mins[s.mineral]||0)+1; });
                    const top = Object.entries(mins).sort((a,b)=>b[1]-a[1])[0];
                    setSymptomRes({ mineral:top[0], count:selSymptoms.length });
                  }} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#ff6b35,#cc4400)", border:"none", borderRadius:12, fontSize:14, fontWeight:700, color:"white" }}>
                    Ask Walter Analyze {selSymptoms.length} Symptom{selSymptoms.length>1?"s":""}
                  </button>
                )}
                {symptomRes && (
                  <div style={{ marginTop:12, padding:14, background:"rgba(255,107,53,0.08)", borderRadius:12, border:"1px solid rgba(255,107,53,0.15)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#ff6b35", marginBottom:6 }}>Walters Verdict</div>
                    <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.7 }}>
                      Based on {symptomRes.count} symptoms, Walter suspects a <strong style={{ color:"#ff6b35" }}>{symptomRes.mineral} deficiency</strong> commonly linked to aggressive or low-mineral water consumption. Test your LSI score above to confirm.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  if (tab === "brands") {
    const filtered = WATER_DB
      .filter(w => brandTier === "all" || w.tier === brandTier)
      .filter(w => w.name.toLowerCase().includes(brandSearch.toLowerCase()))
      .map(w => ({ ...w, score:getScore(w), lsi:calcLSI(w) }))
      .sort((a,b) => brandSort==="score" ? b.score-a.score : brandSort==="price" ? a.price-b.price : brandSort==="calcium" ? b.calcium-a.calcium : b.magnesium-a.magnesium);
    if (selBrand) {
      const w = { ...selBrand, score:getScore(selBrand), lsi:calcLSI(selBrand) };
      const grade = getGrade(w.score);
      const status = getLSIStatus(w.lsi);
      return (
        <div style={app}><style>{CSS}</style>
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelBrand(null)} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"rgba(200,230,215,0.6)", padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>All Brands</button>
            <div style={{ textAlign:"center", marginBottom:20, animation:"scaleIn 0.35s ease both" }}>
              <div style={{ fontSize:56, marginBottom:6 }}>{w.logo}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#e4ede8" }}>{w.name}</div>
              <div style={{ fontSize:12, color:"rgba(200,230,215,0.4)", marginTop:4 }}>{w.type} from {w.origin}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:14 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:grade.color }}>{grade.grade}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>WALTER GRADE</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.08)" }} />
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:"#00d4ff" }}>{w.score}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>HEALTH SCORE</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.08)" }} />
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{w.lsi>0?"+":""}{w.lsi}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>LSI SCORE</div>
                </div>
              </div>
            </div>
            <div style={{ padding:16, background:"rgba(255,255,255,0.03)", borderRadius:18, border:"1px solid rgba(255,255,255,0.07)", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Mineral Profile</div>
              {[
                { label:"Calcium",     val:w.calcium,     max:500,  unit:"mg/L", color:"#fbbf24" },
                { label:"Magnesium",   val:w.magnesium,   max:130,  unit:"mg/L", color:"#34d399" },
                { label:"Bicarbonate", val:w.bicarbonate, max:1820, unit:"mg/L", color:"#60a5fa" },
                { label:"Sodium",      val:w.sodium,      max:410,  unit:"mg/L", color:"#f97316" },
                { label:"TDS",         val:w.tds,         max:2527, unit:"mg/L", color:"#a78bfa" },
              ].map((m,i)=>(
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"rgba(200,230,215,0.6)" }}>{m.label}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.val} {m.unit}</span>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((m.val/m.max)*100,100)}%`, background:m.color, borderRadius:3, animation:"barFill 0.8s ease both" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"rgba(99,211,158,0.05)", borderRadius:16, border:"1px solid rgba(99,211,158,0.12)", marginBottom:14 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#63d39e,#00d4ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                <div>
                  <div style={{ fontSize:11, color:"#63d39e", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                  <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.7 }}>{w.verdict}</div>
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { label:"pH",     val:w.pH,             color:"#a78bfa" },
                { label:"Price",  val:`$${w.price}/L`,  color:"#fbbf24" },
                { label:"Plastic",val:w.plastic?"Yes":"No", color:w.plastic?"#ef4444":"#22c55e" },
              ].map((s,i)=>(
                <div key={i} style={{ padding:12, background:"rgba(255,255,255,0.025)", borderRadius:12, textAlign:"center", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:18, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.35)", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#63d39e,#a8f0c8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Brand Intelligence</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:14 }}>40 brands Walter graded</div>
          <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="Search brands..." style={{ width:"100%", padding:"12px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:13, color:"#e4ede8", marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[["all","All"],["premium","Premium"],["midtier","Mid"],["specialty","Special"],["budget","Budget"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandTier(v)} style={{ padding:"6px 12px", background:brandTier===v?"rgba(99,211,158,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${brandTier===v?"rgba(99,211,158,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:20, fontSize:11, color:brandTier===v?"#63d39e":"rgba(200,230,215,0.5)" }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[["score","Score"],["price","Price"],["calcium","Calcium"],["magnesium","Magnesium"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandSort(v)} style={{ padding:"5px 10px", background:brandSort===v?"rgba(0,212,255,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${brandSort===v?"rgba(0,212,255,0.3)":"rgba(255,255,255,0.06)"}`, borderRadius:16, fontSize:10, color:brandSort===v?"#00d4ff":"rgba(200,230,215,0.4)" }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((w,i)=>{
              const grade = getGrade(w.score);
              const status = getLSIStatus(w.lsi);
              return (
                <button key={w.id} className="card" onClick={()=>setSelBrand(w)} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.04,0.3)}s both`, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{w.logo}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:"#e4ede8" }}>{w.name}</span>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:grade.color }}>{grade.grade}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, color:status.color }}>{status.emoji} LSI {w.lsi>0?"+":""}{w.lsi}</span>
                      <span style={{ fontSize:9, color:"rgba(200,230,215,0.25)" }}>·</span>
                      <span style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>Ca {w.calcium} Mg {w.magnesium}</span>
                      <span style={{ fontSize:9, color:"rgba(200,230,215,0.25)" }}>·</span>
                      <span style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>${w.price}/L</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(200,230,215,0.25)" }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  if (tab === "cities") {
    const REGIONS = [
      { id:"all",       label:"All Cities"    },
      { id:"tristate",  label:"Tri-State"     },
      { id:"ny",        label:"NY State"      },
      { id:"nj",        label:"New Jersey"    },
      { id:"ct",        label:"Connecticut"   },
      { id:"lehigh",    label:"Lehigh Valley" },
      { id:"pa",        label:"Pennsylvania"  },
      { id:"fl",        label:"Florida"       },
      { id:"oh",        label:"Ohio"          },
      { id:"nc",        label:"N Carolina"    },
      { id:"sc",        label:"S Carolina"    },
      { id:"south",     label:"South"         },
      { id:"west",      label:"West"          },
      { id:"midwest",   label:"Midwest"       },
      { id:"northeast", label:"Northeast"     },
    ];
    const filteredCities = CITIES
      .filter(c => cityRegion === "all" || c.region === cityRegion)
      .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));
    if (selCity) {
      const lsi = calcLSI(selCity);
      const status = getLSIStatus(lsi);
      return (
        <div style={app}><style>{CSS}</style>
          <div style={{ padding:"52px 22px 0" }}>
            <button className="btn" onClick={()=>setSelCity(null)} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"rgba(200,230,215,0.6)", padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:18 }}>All Cities</button>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:44, marginBottom:6 }}>🌆</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#e4ede8" }}>{selCity.name}</div>
              <div style={{ fontSize:12, color:"rgba(200,230,215,0.4)", marginTop:4 }}>Tap Water Analysis</div>
              <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:16 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{lsi>0?"+":""}{lsi}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)" }}>LSI SCORE</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.08)" }} />
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:status.color }}>{status.emoji}</div>
                  <div style={{ fontSize:13, color:status.color, fontWeight:600, marginTop:4 }}>{status.label}</div>
                </div>
              </div>
            </div>
            <div style={{ padding:16, background:"rgba(255,255,255,0.03)", borderRadius:18, border:"1px solid rgba(255,255,255,0.07)", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Water Chemistry</div>
              {[
                { label:"pH Level",    val:selCity.pH,          unit:"",     color:"#a78bfa" },
                { label:"TDS",         val:selCity.tds,         unit:"mg/L", color:"#00d4ff" },
                { label:"Calcium",     val:selCity.calcium,     unit:"mg/L", color:"#fbbf24" },
                { label:"Bicarbonate", val:selCity.bicarbonate, unit:"mg/L", color:"#60a5fa" },
              ].map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:13, color:"rgba(200,230,215,0.55)" }}>{m.label}</span>
                  <span style={{ fontSize:16, fontWeight:700, color:m.color }}>{m.val} {m.unit}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"rgba(99,211,158,0.05)", borderRadius:16, border:"1px solid rgba(99,211,158,0.12)" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#63d39e,#00d4ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🤖</div>
                <div>
                  <div style={{ fontSize:11, color:"#63d39e", fontWeight:700, marginBottom:4 }}>WALTER SAYS</div>
                  <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.7 }}>
                    {lsi < -0.2
                      ? `${selCity.name} tap water is aggressive LSI ${lsi}. Consider filtering and remineralizing or supplement with a high-mineral bottled water.`
                      : lsi <= 0.2
                      ? `${selCity.name} tap water is well balanced LSI ${lsi}. One of the better municipal supplies. You can drink confidently with a standard filter.`
                      : `${selCity.name} tap water is mineral-rich LSI ${lsi}. High TDS may cause scaling. A quality carbon filter is recommended.`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NavBar />
        </div>
      );
    }
    return (
      <div style={app}><style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a78bfa,#63d39e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>City Water Intel</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:14 }}>{CITIES.length} cities analyzed by Walter</div>
          <input value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="Search your city..." style={{ width:"100%", padding:"12px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:13, color:"#e4ede8", marginBottom:12 }} />
          <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
            {REGIONS.map(r=>(
              <button key={r.id} className="btn" onClick={()=>setCityRegion(r.id)} style={{ padding:"6px 11px", background:cityRegion===r.id?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${cityRegion===r.id?"rgba(167,139,250,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:20, fontSize:10, color:cityRegion===r.id?"#a78bfa":"rgba(200,230,215,0.5)" }}>{r.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filteredCities.map((c,i)=>{
              const lsi = calcLSI(c);
              const status = getLSIStatus(lsi);
              return (
                <button key={i} className="card" onClick={()=>setSelCity(c)} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 14px", textAlign:"left", animation:`fadeUp 0.3s ease ${Math.min(i*0.03,0.3)}s both`, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:24 }}>🌆</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#e4ede8" }}>{c.name}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:status.color }}>{lsi>0?"+":""}{lsi}</span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <span style={{ fontSize:10, color:status.color }}>{status.emoji} {status.label}</span>
                      <span style={{ fontSize:9, color:"rgba(200,230,215,0.25)" }}>·</span>
                      <span style={{ fontSize:10, color:"rgba(200,230,215,0.35)" }}>pH {c.pH} Ca {c.calcium} mg/L</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(200,230,215,0.25)" }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  const LESSONS = [
    { title:"What is LSI",          icon:"🔬", color:"#00d4ff", time:"3 min", content:"The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936. It measures whether water is corrosive, balanced, or scale-forming. Water with a negative LSI actively dissolves minerals it contacts including calcium in your teeth and bones. Most purified bottled waters score between -1.0 and -2.0, meaning they are aggressively stripping minerals. The ideal LSI range is -0.2 to +0.2. At this level water is in equilibrium with your body and neither deposits nor removes minerals." },
    { title:"The Mineral Gap",       icon:"⚡", color:"#63d39e", time:"4 min", content:"Up to 50% of Americans are deficient in magnesium. The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely. Dasani, Aquafina, and Smartwater contain zero magnesium and zero calcium. Gerolsteiner contains 348 mg/L calcium and 108 mg/L magnesium meeting WHO standards in a single liter. The minerals you get from water are more bioavailable than those from food or supplements because they are already in ionic form ready for direct cellular absorption." },
    { title:"Hard vs Soft Water",    icon:"💎", color:"#a78bfa", time:"3 min", content:"Hard water contains high concentrations of calcium and magnesium. Soft water contains very little. Epidemiological studies have consistently shown that populations drinking hard water have lower rates of cardiovascular disease than those drinking soft water. The landmark WHO report on drinking water quality concluded that water hardness is inversely associated with heart disease mortality. Las Vegas tap water is very hard at 550 TDS. Seattle tap water is very soft at 45 TDS. The sweet spot is 150-400 TDS from natural mineral sources." },
    { title:"pH and Your Body",      icon:"⚗️",color:"#fbbf24", time:"3 min", content:"Your blood maintains a precise pH of 7.35-7.45. Drinking highly acidic water below pH 6.5 adds an acid load your kidneys must neutralize. Aquafina at pH 6.0 and LaCroix at pH 4.7 are both acidic. Natural alkaline spring waters like Evian pH 7.2 and Mountain Valley pH 7.8 align with your body chemistry. Artificially alkaline waters like Essentia use ionization to raise pH without adding minerals. The alkalinity is not backed by the bicarbonate buffer that makes natural alkaline water beneficial." },
    { title:"Reading Water Labels",  icon:"📋", color:"#34d399", time:"4 min", content:"Every bottled water label tells a story. Look for source which can be spring, purified tap, or artesian. Check mineral content including calcium, magnesium, sodium, and bicarbonate in mg/L. Check TDS which is the sum of all minerals. Check pH which should ideally be 7.0-8.5. Red flags include purified or distilled without remineralization, zero or near-zero TDS, pH below 6.5. Green flags include natural spring or artesian source, calcium above 50 mg/L, magnesium above 20 mg/L, bicarbonate above 100 mg/L." },
    { title:"Municipal vs Bottled",  icon:"🏙️",color:"#f97316", time:"4 min", content:"US municipal tap water is among the most regulated in the world under the Safe Drinking Water Act. The EPA sets maximum contaminant levels for over 90 substances. However tap water is optimized for safety not mineral content. NYC tap water scores an LSI of approximately -0.6 which is mildly aggressive. The real differentiator is mineral optimization not safety. Filtering tap water with a carbon filter removes chlorine and taste issues. Adding mineral drops post-filter can bring tap water close to premium spring water quality at a fraction of the cost." },
  ];

  if (tab === "learn") {
    const lesson = LESSONS[eduIdx];
    const gItem = GLOSSARY[glossaryIdx];
    return (
      <div style={app}><style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#fbbf24,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Academy</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:16 }}>Science Glossary Definitions</div>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {[["academy","Science"],["glossary","Glossary"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setLearnTab(id)} style={{ flex:1, padding:"10px", background:learnTab===id?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${learnTab===id?"rgba(251,191,36,0.35)":"rgba(255,255,255,0.08)"}`, borderRadius:12, fontSize:12, fontWeight:learnTab===id?700:400, color:learnTab===id?"#fbbf24":"rgba(200,230,215,0.5)" }}>{label}</button>
            ))}
          </div>
          {learnTab === "academy" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {LESSONS.map((l,i)=>(
                  <button key={i} className="btn" onClick={()=>setEduIdx(i)} style={{ padding:"6px 10px", background:eduIdx===i?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${eduIdx===i?"rgba(251,191,36,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:20, fontSize:10, color:eduIdx===i?"#fbbf24":"rgba(200,230,215,0.45)" }}>{l.icon} {l.title}</button>
                ))}
              </div>
              <div style={{ padding:20, background:"rgba(255,255,255,0.03)", borderRadius:20, border:"1px solid rgba(255,255,255,0.07)", animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:32, marginBottom:6 }}>{lesson.icon}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#e4ede8" }}>{lesson.title}</div>
                  </div>
                  <span style={{ padding:"4px 10px", background:"rgba(255,255,255,0.06)", borderRadius:20, fontSize:10, color:"rgba(200,230,215,0.4)" }}>{lesson.time}</span>
                </div>
                <div style={{ fontSize:13, color:"rgba(200,230,215,0.65)", lineHeight:1.85 }}>{lesson.content}</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setEduIdx(Math.max(0,eduIdx-1))} disabled={eduIdx===0} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:eduIdx===0?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)" }}>Previous</button>
                <span style={{ fontSize:11, color:"rgba(200,230,215,0.3)", alignSelf:"center" }}>{eduIdx+1} of {LESSONS.length}</span>
                <button className="btn" onClick={()=>setEduIdx(Math.min(LESSONS.length-1,eduIdx+1))} disabled={eduIdx===LESSONS.length-1} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:eduIdx===LESSONS.length-1?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)" }}>Next</button>
              </div>
            </div>
          )}
          {learnTab === "glossary" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {GLOSSARY.map((g,i)=>(
                  <button key={i} className="btn" onClick={()=>setGlossaryIdx(i)} style={{ padding:"6px 10px", background:glossaryIdx===i?"rgba(99,211,158,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${glossaryIdx===i?"rgba(99,211,158,0.35)":"rgba(255,255,255,0.08)"}`, borderRadius:20, fontSize:10, color:glossaryIdx===i?"#63d39e":"rgba(200,230,215,0.45)" }}>{g.icon} {g.term}</button>
                ))}
              </div>
              <div style={{ padding:20, background:"rgba(255,255,255,0.03)", borderRadius:20, border:"1px solid rgba(255,255,255,0.07)", animation:"scaleIn 0.3s ease both" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`${gItem.color}18`, border:`1px solid ${gItem.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{gItem.icon}</div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:gItem.color }}>{gItem.term}</div>
                    <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", marginTop:2 }}>{gItem.full}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:"rgba(200,230,215,0.7)", lineHeight:1.85, marginBottom:14 }}>{gItem.def}</div>
                <div style={{ padding:12, background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`3px solid ${gItem.color}` }}>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.35)", letterSpacing:1, marginBottom:4 }}>EXAMPLE</div>
                  <div style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.6, fontStyle:"italic" }}>{gItem.example}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.max(0,glossaryIdx-1))} disabled={glossaryIdx===0} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:glossaryIdx===0?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)" }}>Previous</button>
                <span style={{ fontSize:11, color:"rgba(200,230,215,0.3)", alignSelf:"center" }}>{glossaryIdx+1} of {GLOSSARY.length}</span>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.min(GLOSSARY.length-1,glossaryIdx+1))} disabled={glossaryIdx===GLOSSARY.length-1} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:glossaryIdx===GLOSSARY.length-1?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)" }}>Next</button>
              </div>
            </div>
          )}
        </div>
        <NavBar />
      </div>
    );
  }

  return null;
}
