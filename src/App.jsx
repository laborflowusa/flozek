import { useState } from "react";
import {
  WATER_DB, CITIES, GLOSSARY, UMBRELLA_COMPANIES,
  FILTER_RECOMMENDATIONS, CIVIC_CONTACTS, WALTER_QA_PROMPTS
} from "./data";
import { searchByZip } from "./zips";

const STRIPE_URL = "https://buy.stripe.com/fZu14f2XBf9LaHl0UKao800";

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
  const pfasRisk    = city.pfas > 200 ? "CRISIS" : city.pfas > 70 ? "HIGH" : city.pfas > 4 ? "ELEVATED" : "SAFE";
  const leadRisk    = city.lead > 15  ? "CRISIS" : city.lead > 3.8 ? "ELEVATED" : "SAFE";
  const nitrateRisk = city.nitrate > 10 ? "CRISIS" : city.nitrate > 3 ? "ELEVATED" : "SAFE";
  const overallRisk = [pfasRisk,leadRisk,nitrateRisk].includes("CRISIS") ? "CRISIS"
    : [pfasRisk,leadRisk,nitrateRisk].includes("HIGH") ? "HIGH"
    : [pfasRisk,leadRisk,nitrateRisk].includes("ELEVATED") ? "ELEVATED" : "SAFE";
  return { pfasRisk, leadRisk, nitrateRisk, overallRisk };
};

const riskColor = r => r==="CRISIS"?"#dc2626":r==="HIGH"?"#ea580c":r==="ELEVATED"?"#ca8a04":"#16a34a";
const riskBg    = r => r==="CRISIS"?"rgba(220,38,38,0.08)":r==="HIGH"?"rgba(234,88,12,0.08)":r==="ELEVATED"?"rgba(202,138,4,0.08)":"rgba(22,163,74,0.08)";
const goStripe  = () => window.open(STRIPE_URL, "_blank");

const BG     = "linear-gradient(160deg,#e8f4fd 0%,#f0faf8 50%,#e0f2fe 100%)";
const CARD   = "rgba(255,255,255,0.75)";
const BORDER = "rgba(3,105,161,0.12)";
const TEXT   = "#0c2340";
const SUBTEXT= "#4a7fa5";

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
  .pulse{animation:pulse 2s ease infinite;}
  input{outline:none;}
  input:focus{border-color:rgba(3,105,161,0.4)!important;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(3,105,161,0.1);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#0369a1;cursor:pointer;}
`;

export default function Flozek() {
  const [tab, setTab]                 = useState("home");
  const [isPro, setIsPro]             = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [zipInput, setZipInput]       = useState("");
  const [zipResult, setZipResult]     = useState(null);
  const [zipNotFound, setZipNotFound] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTier, setBrandTier]     = useState("all");
  const [brandSort, setBrandSort]     = useState("score");
  const [selBrand, setSelBrand]       = useState(null);
  const [citySearch, setCitySearch]   = useState("");
  const [cityRegion, setCityRegion]   = useState("all");
  const [selCity, setSelCity]         = useState(null);
  const [calcVals, setCalcVals]       = useState({ pH:7.2, tds:150, calcium:40, bicarbonate:70 });
  const [showResult, setShowResult]   = useState(false);
  const [lsiResult, setLsiResult]     = useState(null);
  const [selSymptoms, setSelSymptoms] = useState([]);
  const [symptomRes, setSymptomRes]   = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [learnSub, setLearnSub]       = useState("academy");
  const [eduIdx, setEduIdx]           = useState(0);
  const [glossaryIdx, setGlossaryIdx] = useState(0);
  const [walterQ, setWalterQ]         = useState("");
  const [walterLoading, setWalterLoading] = useState(false);
  const [walterAnswer, setWalterAnswer]   = useState("");
  const [showCivic, setShowCivic]     = useState(false);

  const app = { fontFamily:"'DM Sans',sans-serif", background:BG, minHeight:"100vh", color:TEXT, maxWidth:440, margin:"0 auto", position:"relative", paddingBottom:80 };

  const doZipSearch = () => {
    const cityName = searchByZip(zipInput.trim());
    if (cityName) {
      const found = CITIES.find(c => c.name === cityName);
      if (found) { setZipResult(found); setZipNotFound(false); }
      else setZipNotFound(true);
    } else setZipNotFound(true);
  };

  const askWalter = async question => {
    if (!question.trim()) return;
    setWalterLoading(true);
    setWalterAnswer("");
    try {
      const cityCtx  = CITIES.slice(0,20).map(c=>`${c.name}: PFAS ${c.pfas}ppt Lead ${c.lead}ppb`).join(", ");
      const brandCtx = WATER_DB.slice(0,10).map(b=>`${b.name}: pH ${b.pH} Ca ${b.calcium} Mg ${b.magnesium}`).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are WALTER — Water Analysis and Life Track Enhancement Recommendations — the AI assistant inside Flo·zēk. You are knowledgeable, direct, and passionate about water quality and public health. Speak in first person as Walter. Keep answers under 150 words. Be specific and actionable. City data: ${cityCtx}. Brand data: ${brandCtx}. Key facts: EPA PFAS limit 4ppt, Lead action level 15ppb, Nitrate MCL 10ppm. Best filter for PFAS and lead is reverse osmosis. Brita does NOT remove PFAS or lead.`,
          messages:[{role:"user",content:question}]
        })
      });
      const data = await res.json();
      setWalterAnswer(data.content?.[0]?.text || "Walter is thinking — try again in a moment.");
    } catch { setWalterAnswer("Walter is temporarily offline. Please try again."); }
    setWalterLoading(false);
  };

  const UpgradeModal = () => (
    <div style={{position:"fixed",inset:0,background:"rgba(12,35,64,0.85)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowUpgrade(false)}>
      <div style={{background:"white",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:440,padding:"28px 24px 40px",animation:"fadeUp 0.3s ease both"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>🔱</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"#0c2340",marginBottom:6}}>Unlock Flo·zēk Flow</div>
          <div style={{fontSize:13,color:SUBTEXT,lineHeight:1.6}}>Your city has flagged contaminants. See the full numbers Walter is hiding below.</div>
        </div>
        <div style={{padding:14,background:"rgba(220,38,38,0.05)",borderRadius:16,border:"1px solid rgba(220,38,38,0.15)",marginBottom:16}}>
          <div style={{fontSize:12,color:"#dc2626",fontWeight:700,marginBottom:8}}>⚠️ Walter has detected concerns in your area</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[["PFAS","●●● ppt","☢️"],["Lead","●●● ppb","🔴"],["Violations","●●●","⚠️"]].map(([label,val,icon],i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:20}}>{icon}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#dc2626",filter:"blur(4px)"}}>{val}</div>
                <div style={{fontSize:9,color:SUBTEXT}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          {["✅ Full PFAS Lead and Nitrate numbers for every city","✅ 55 brands fully analyzed with pros cons and grades","✅ Walter AI — ask any water question and get real answers","✅ Filter recommendations by your specific contaminants","✅ Civic action toolkit — who to contact in your community","✅ How to read your water data explained simply"].map((item,i)=>(
            <div key={i} style={{fontSize:12,color:TEXT,padding:"6px 0",borderBottom:"1px solid rgba(3,105,161,0.06)"}}>{item}</div>
          ))}
        </div>
        <button className="btn" onClick={goStripe} style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:14,fontSize:16,fontWeight:700,color:"white",marginBottom:10,boxShadow:"0 8px 28px rgba(3,105,161,0.3)"}}>
          Unlock Flow — $1.99 / month
        </button>
        <button className="btn" onClick={()=>setShowUpgrade(false)} style={{width:"100%",padding:"12px",background:"none",border:"1px solid rgba(3,105,161,0.15)",borderRadius:14,fontSize:13,color:SUBTEXT}}>
          Maybe Later
        </button>
        <div style={{textAlign:"center",marginTop:12,fontSize:10,color:"rgba(3,105,161,0.35)"}}>Cancel anytime · Secure payment · Funds clean water access globally</div>
      </div>
    </div>
  );

  const NavBar = () => (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:440,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",borderTop:`1px solid ${BORDER}`,display:"flex",zIndex:100,paddingBottom:8,boxShadow:"0 -4px 20px rgba(3,105,161,0.08)"}}>
      {[["🏠","Home","home"],["🔬","Test","test"],["💧","Brands","brands"],["🌆","Cities","cities"],["📚","Learn","learn"]].map(([icon,label,id])=>(
        <button key={id} className="btn" onClick={()=>{setTab(id);setSelBrand(null);setSelCity(null);setShowResult(false);}} style={{flex:1,background:"none",border:"none",padding:"12px 4px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <span style={{fontSize:19,filter:tab===id?"none":"grayscale(0.5) opacity(0.4)"}}>{icon}</span>
          <span style={{fontSize:9,color:tab===id?"#0369a1":"rgba(3,105,161,0.35)",fontWeight:tab===id?700:400,letterSpacing:0.5}}>{label}</span>
          {tab===id&&<div style={{width:16,height:2,background:"#0369a1",borderRadius:1}}/>}
        </button>
      ))}
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (tab==="home") return (
    <div style={app}>
      <style>{CSS}</style>
      {showUpgrade&&<UpgradeModal/>}
      <div style={{padding:"52px 22px 0"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,background:"linear-gradient(135deg,#0369a1,#0ea5e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Flo·zēk</div>
            <div style={{fontSize:12,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Water Intelligence</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {isPro
              ? <div style={{padding:"4px 10px",background:"linear-gradient(135deg,#0369a1,#0284c7)",borderRadius:20,fontSize:9,color:"white",fontWeight:700}}>FLOW PRO</div>
              : <button className="btn" onClick={goStripe} style={{padding:"6px 12px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:20,fontSize:10,fontWeight:700,color:"white"}}>Get Flow</button>
            }
            <div style={{fontSize:36,animation:"float 3s ease infinite"}}>💧</div>
          </div>
        </div>

        {/* ZIP SEARCH */}
        <div style={{padding:16,background:CARD,borderRadius:20,border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 4px 16px rgba(3,105,161,0.08)"}}>
          <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>🔍 Search Your Water</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input
              value={zipInput}
              onChange={e=>{setZipInput(e.target.value.replace(/\D/,""));setZipNotFound(false);setZipResult(null);}}
              onKeyDown={e=>e.key==="Enter"&&doZipSearch()}
              placeholder="Enter zip code..."
              maxLength={5}
              style={{flex:1,padding:"12px 16px",background:"rgba(3,105,161,0.04)",border:`1px solid ${BORDER}`,borderRadius:12,fontSize:15,color:TEXT,fontWeight:600,letterSpacing:2}}
            />
            <button className="btn" onClick={doZipSearch} style={{padding:"12px 18px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:12,fontSize:13,fontWeight:700,color:"white"}}>
              Search
            </button>
          </div>
          {zipNotFound&&(
            <div style={{padding:10,background:"rgba(234,88,12,0.08)",borderRadius:10,fontSize:12,color:"#ea580c"}}>
              Zip not found. Try searching by city name in the Cities tab.
            </div>
          )}
          {zipResult&&(()=>{
            const risk=getCityRisk(zipResult);
            const lsi=calcLSI(zipResult);
            return (
              <div style={{padding:14,background:riskBg(risk.overallRisk),borderRadius:14,border:`1px solid ${riskColor(risk.overallRisk)}30`,animation:"scaleIn 0.3s ease both"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:TEXT}}>{zipResult.name}</div>
                    <div style={{fontSize:10,color:SUBTEXT,marginTop:2}}>{zipResult.source}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:riskColor(risk.overallRisk)}}>{risk.overallRisk}</div>
                    <div style={{fontSize:9,color:SUBTEXT}}>RISK LEVEL</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {[
                    {label:"PFAS",val:isPro?`${zipResult.pfas} ppt`:"●●● ppt",risk:risk.pfasRisk,locked:!isPro},
                    {label:"Lead",val:isPro?`${zipResult.lead} ppb`:"●●● ppb",risk:risk.leadRisk,locked:!isPro},
                    {label:"LSI", val:`${lsi>0?"+":""}${lsi}`,              risk:"SAFE",          locked:false},
                  ].map((item,i)=>(
                    <div key={i} style={{flex:1,padding:"8px 4px",background:"rgba(255,255,255,0.65)",borderRadius:10,textAlign:"center"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:riskColor(item.risk),filter:item.locked?"blur(5px)":"none"}}>{item.val}</div>
                      <div style={{fontSize:9,color:SUBTEXT,marginTop:2}}>{item.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:11,color:riskColor(risk.overallRisk),marginBottom:10,fontWeight:600}}>
                  {risk.overallRisk==="CRISIS"&&"🚨 CRISIS level contamination detected in your area"}
                  {risk.overallRisk==="HIGH"&&"⚠️ High contamination levels detected in your area"}
                  {risk.overallRisk==="ELEVATED"&&"⚡ Elevated contaminants detected — filter recommended"}
                  {risk.overallRisk==="SAFE"&&"✅ Within regulatory limits — standard filter sufficient"}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn" onClick={()=>{setTab("cities");setSelCity(zipResult);}} style={{flex:1,padding:"10px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:10,fontSize:12,fontWeight:700,color:"white"}}>
                    Full Report
                  </button>
                  {!isPro&&(
                    <button className="btn" onClick={goStripe} style={{flex:1,padding:"10px",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:10,fontSize:12,fontWeight:700,color:"#dc2626"}}>
                      🔒 Unlock Numbers
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
          {!zipResult&&!zipNotFound&&(
            <div style={{fontSize:11,color:SUBTEXT,textAlign:"center",padding:"4px 0"}}>
              Results appear in under 2 seconds · No account required
            </div>
          )}
        </div>

        {/* WALTER INTRO */}
        <div style={{padding:18,background:CARD,borderRadius:20,border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 4px 16px rgba(3,105,161,0.08)"}}>
          <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Meet Walter</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#0369a1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🤖</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#0369a1",marginBottom:3}}>WALTER</div>
              <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.6}}>Water Analysis and Life Track Enhancement Recommendations. Your personal water intelligence assistant.</div>
            </div>
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(3,105,161,0.05)",borderRadius:12,fontSize:12,color:SUBTEXT,lineHeight:1.6,fontStyle:"italic",borderLeft:"3px solid #0369a1"}}>
            Dasani scores a D. Aquafina scores a D. Benton Harbor Michigan has 55 ppb lead. Your body deserves better and I am going to show you exactly what to drink instead.
          </div>
        </div>

        {/* QUICK NAV */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {icon:"🔬",title:"Test My Water",  sub:"LSI Calculator",     id:"test",   color:"#0369a1"},
            {icon:"💧",title:"Browse Brands",  sub:"55 brands analyzed", id:"brands", color:"#0284c7"},
            {icon:"🌆",title:"City Water",     sub:"120+ cities scored", id:"cities", color:"#7c3aed"},
            {icon:"📚",title:"Water Academy",  sub:"Science + Walter AI",id:"learn",  color:"#0369a1"},
          ].map((item,i)=>(
            <button key={i} className="card" onClick={()=>setTab(item.id)} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:14,textAlign:"left",animation:`fadeUp 0.4s ease ${i*0.07}s both`,boxShadow:"0 2px 8px rgba(3,105,161,0.06)"}}>
              <div style={{fontSize:26,marginBottom:8}}>{item.icon}</div>
              <div style={{fontSize:13,fontWeight:600,color:item.color}}>{item.title}</div>
              <div style={{fontSize:10,color:SUBTEXT,marginTop:2}}>{item.sub}</div>
            </button>
          ))}
        </div>

        {/* PAYWALL TEASER */}
        {!isPro&&(
          <button className="card" onClick={goStripe} style={{width:"100%",padding:16,background:"linear-gradient(135deg,rgba(220,38,38,0.06),rgba(234,88,12,0.04))",border:"1px solid rgba(220,38,38,0.15)",borderRadius:16,textAlign:"left",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,color:"#dc2626",fontWeight:700,marginBottom:4}}>⚠️ Walter has flagged cities near you</div>
                <div style={{fontSize:11,color:SUBTEXT}}>PFAS: ●●● ppt · Lead: ●●● ppb · Tap to unlock</div>
              </div>
              <div style={{fontSize:22}}>🔒</div>
            </div>
          </button>
        )}

        {/* COVERAGE */}
        <div style={{padding:14,background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,marginBottom:12}}>
          <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Coverage</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {["Tri-State","NYC Metro","New Jersey","Connecticut","Lehigh Valley","Pennsylvania","Florida","Ohio","North Carolina","South Carolina","Midwest","West Coast","South","Northeast"].map((tag,i)=>(
              <span key={i} style={{padding:"3px 9px",background:"rgba(3,105,161,0.08)",border:"1px solid rgba(3,105,161,0.15)",borderRadius:20,fontSize:9,color:"#0369a1"}}>{tag}</span>
            ))}
          </div>
        </div>

        {/* MISSION */}
        <div style={{padding:16,background:"linear-gradient(135deg,rgba(3,105,161,0.06),rgba(14,165,233,0.04))",borderRadius:16,border:`1px solid ${BORDER}`}}>
          <div style={{fontSize:11,color:"#7c3aed",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Our Mission</div>
          <div style={{fontSize:13,color:SUBTEXT,lineHeight:1.7}}>A portion of every Flo·zēk Flow subscription supports clean water access in underserved communities globally.</div>
          <button className="btn" onClick={goStripe} style={{marginTop:10,padding:"8px 16px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:20,fontSize:12,fontWeight:700,color:"white"}}>
            Upgrade to Flow — $1.99/mo
          </button>
        </div>

      </div>
      <NavBar/>
    </div>
  );

  // ── TEST ──────────────────────────────────────────────────────────────────
  if (tab==="test") {
    const SYMPTOMS=[
      {id:1, label:"Muscle cramps",      mineral:"Magnesium",   icon:"⚡"},
      {id:2, label:"Poor sleep",         mineral:"Magnesium",   icon:"🌙"},
      {id:3, label:"Chronic fatigue",    mineral:"Magnesium",   icon:"😴"},
      {id:4, label:"Frequent headaches", mineral:"Magnesium",   icon:"🧠"},
      {id:5, label:"Brittle nails",      mineral:"Calcium",     icon:"💅"},
      {id:6, label:"Anxiety",            mineral:"Magnesium",   icon:"😰"},
      {id:7, label:"Irregular heartbeat",mineral:"Magnesium",   icon:"❤️"},
      {id:8, label:"Brain fog",          mineral:"Electrolytes",icon:"🌫️"},
      {id:9, label:"Joint pain",         mineral:"Calcium",     icon:"🦴"},
      {id:10,label:"Constipation",       mineral:"Magnesium",   icon:"🔄"},
      {id:11,label:"High blood pressure",mineral:"Magnesium",   icon:"🩺"},
      {id:12,label:"Tooth sensitivity",  mineral:"Calcium",     icon:"🦷"},
    ];
    const previewLSI=calcLSI(calcVals);
    const previewStatus=getLSIStatus(previewLSI);

    if (showResult) {
      const status=getLSIStatus(lsiResult);
      return (
        <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
          <div style={{padding:"52px 22px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <button className="btn" onClick={()=>setShowResult(false)} style={{background:CARD,border:`1px solid ${BORDER}`,color:SUBTEXT,padding:"8px 14px",borderRadius:20,fontSize:12}}>Back</button>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:TEXT}}>Walter's Analysis</div>
              <div style={{width:60}}/>
            </div>
            <div style={{padding:24,background:status.bg,borderRadius:22,border:`1px solid ${status.color}30`,textAlign:"center",marginBottom:16,animation:"scaleIn 0.4s ease both"}}>
              <div style={{fontSize:48}}>{status.emoji}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:58,fontWeight:800,color:status.color,lineHeight:1,margin:"8px 0"}}>{lsiResult>0?"+":""}{lsiResult}</div>
              <div style={{fontSize:18,fontWeight:700,color:status.color,marginBottom:10}}>{status.label}</div>
              <div style={{fontSize:13,color:TEXT,lineHeight:1.7}}>
                {lsiResult<-0.5&&"Walter says: This water is highly aggressive. It is actively pulling minerals from your body with every glass you drink."}
                {lsiResult>=-0.5&&lsiResult<-0.2&&"Walter says: Mildly undersaturated. Limited mineral contribution and mild depletion risk at normal intake."}
                {lsiResult>=-0.2&&lsiResult<=0.2&&"Walter says: Perfect balance. This water works with your body rather than against it. Well done."}
                {lsiResult>0.2&&"Walter says: High mineral content. Excellent for supplementation. Consider rotating with lower TDS water."}
              </div>
            </div>
            {lsiResult<-0.2&&(
              <div style={{padding:16,background:CARD,borderRadius:16,border:`1px solid ${BORDER}`,marginBottom:14}}>
                <div style={{fontSize:11,color:"#0369a1",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Walter Recommends</div>
                {["Add mineral drops — magnesium and calcium","Switch to a natural spring water brand","Use a remineralizing filter post-RO","Check the Brands tab for better options"].map((tip,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
                    <span style={{color:"#0369a1"}}>✓</span>
                    <span style={{fontSize:12,color:SUBTEXT,lineHeight:1.6}}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{padding:14,background:"rgba(3,105,161,0.05)",borderRadius:16,border:"1px solid rgba(3,105,161,0.12)"}}>
              <div style={{fontSize:11,color:"#0369a1",fontWeight:700,marginBottom:6}}>Ask Walter a Follow-Up</div>
              <div style={{display:"flex",gap:8}}>
                <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="What filter should I buy..." style={{flex:1,padding:"10px 12px",background:"white",border:`1px solid ${BORDER}`,borderRadius:10,fontSize:12,color:TEXT}} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)}/>
                <button className="btn" onClick={()=>askWalter(walterQ)} style={{padding:"10px 14px",background:"#0369a1",border:"none",borderRadius:10,color:"white",fontSize:12}}>Ask</button>
              </div>
              {walterLoading&&<div className="pulse" style={{fontSize:12,color:SUBTEXT,marginTop:8}}>Walter is analyzing...</div>}
              {walterAnswer&&<div style={{fontSize:12,color:TEXT,lineHeight:1.7,marginTop:10,padding:12,background:"white",borderRadius:10,border:`1px solid ${BORDER}`}}>{walterAnswer}</div>}
            </div>
          </div>
          <NavBar/>
        </div>
      );
    }

    return (
      <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
        <div style={{padding:"52px 22px 0"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(135deg,#0369a1,#0ea5e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>Water Testing</div>
          <div style={{fontSize:13,color:SUBTEXT,marginBottom:16}}>LSI Calculator + Symptom Checker</div>
          <div style={{padding:16,background:previewStatus.bg,borderRadius:16,border:`1px solid ${previewStatus.color}25`,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:SUBTEXT,letterSpacing:1,marginBottom:4}}>LIVE LSI</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,color:previewStatus.color,lineHeight:1}}>{previewLSI>0?"+":""}{previewLSI}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:28}}>{previewStatus.emoji}</div>
              <div style={{fontSize:13,color:previewStatus.color,fontWeight:600,marginTop:4}}>{previewStatus.label}</div>
            </div>
          </div>
          {[
            {key:"pH",         label:"pH Level",                  min:5,  max:10,  step:0.1,unit:""},
            {key:"tds",        label:"TDS Total Dissolved Solids",min:0,  max:1000,step:5,  unit:"mg/L"},
            {key:"calcium",    label:"Calcium Hardness",          min:0,  max:500, step:5,  unit:"mg/L"},
            {key:"bicarbonate",label:"Bicarbonate Alkalinity",    min:0,  max:500, step:5,  unit:"mg/L"},
          ].map(p=>(
            <div key={p.key} style={{padding:14,background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600,color:TEXT}}>{p.label}</span>
                <span style={{fontSize:18,fontWeight:700,color:"#0369a1"}}>{calcVals[p.key]}<span style={{fontSize:11,color:SUBTEXT}}> {p.unit}</span></span>
              </div>
              <input type="range" min={p.min} max={p.max} step={p.step} value={calcVals[p.key]}
                onChange={e=>setCalcVals(prev=>({...prev,[p.key]:parseFloat(e.target.value)}))}
                style={{background:`linear-gradient(to right,#0369a1 ${((calcVals[p.key]-p.min)/(p.max-p.min))*100}%,rgba(3,105,161,0.1) 0%)`}}/>
            </div>
          ))}
          <button className="btn" onClick={()=>{setLsiResult(previewLSI);setShowResult(true);}} style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:14,fontSize:15,fontWeight:700,color:"white",marginBottom:14,boxShadow:"0 8px 28px rgba(3,105,161,0.25)"}}>
            Ask Walter to Analyze
          </button>
          <div style={{padding:16,background:CARD,borderRadius:16,border:"1px solid rgba(234,88,12,0.2)",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showSymptoms?12:0}}>
              <div style={{fontSize:13,fontWeight:700,color:"#ea580c"}}>Symptom Checker</div>
              <button className="btn" onClick={()=>setShowSymptoms(!showSymptoms)} style={{background:"rgba(234,88,12,0.08)",border:"1px solid rgba(234,88,12,0.2)",color:"#ea580c",padding:"5px 10px",borderRadius:10,fontSize:11}}>
                {showSymptoms?"Hide":"Open"}
              </button>
            </div>
            {showSymptoms&&(
              <div style={{animation:"fadeUp 0.3s ease both"}}>
                <div style={{fontSize:12,color:SUBTEXT,marginBottom:10}}>Select symptoms you experience:</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {SYMPTOMS.map(s=>{
                    const sel=selSymptoms.includes(s.id);
                    return (
                      <button key={s.id} className="card" onClick={()=>setSelSymptoms(prev=>sel?prev.filter(id=>id!==s.id):[...prev,s.id])} style={{padding:"10px",background:sel?"rgba(234,88,12,0.08)":CARD,border:`1px solid ${sel?"rgba(234,88,12,0.3)":BORDER}`,borderRadius:11,textAlign:"left"}}>
                        <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
                        <div style={{fontSize:11,fontWeight:600,color:sel?"#ea580c":TEXT}}>{s.label}</div>
                      </button>
                    );
                  })}
                </div>
                {selSymptoms.length>0&&(
                  <button className="btn" onClick={()=>{
                    const mins={};
                    selSymptoms.forEach(id=>{const s=SYMPTOMS.find(s=>s.id===id);if(s)mins[s.mineral]=(mins[s.mineral]||0)+1;});
                    const top=Object.entries(mins).sort((a,b)=>b[1]-a[1])[0];
                    setSymptomRes({mineral:top[0],count:selSymptoms.length});
                  }} style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#ea580c,#c2410c)",border:"none",borderRadius:12,fontSize:14,fontWeight:700,color:"white"}}>
                    Ask Walter — Analyze {selSymptoms.length} Symptom{selSymptoms.length>1?"s":""}
                  </button>
                )}
                {symptomRes&&(
                  <div style={{marginTop:12,padding:14,background:"rgba(234,88,12,0.06)",borderRadius:12,border:"1px solid rgba(234,88,12,0.15)"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#ea580c",marginBottom:6}}>Walter's Verdict</div>
                    <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.7}}>
                      Based on {symptomRes.count} symptoms Walter suspects a <strong style={{color:"#ea580c"}}>{symptomRes.mineral} deficiency</strong> commonly linked to aggressive or low-mineral water consumption. Test your LSI score above to confirm.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <NavBar/>
      </div>
    );
  }

  // ── BRANDS ────────────────────────────────────────────────────────────────
  if (tab==="brands") {
    const filtered=WATER_DB
      .filter(w=>brandTier==="all"||w.tier===brandTier)
      .filter(w=>w.name.toLowerCase().includes(brandSearch.toLowerCase()))
      .map(w=>({...w,score:getScore(w),lsi:calcLSI(w)}))
      .sort((a,b)=>brandSort==="score"?b.score-a.score:brandSort==="price"?a.price-b.price:brandSort==="calcium"?b.calcium-a.calcium:b.magnesium-a.magnesium);

    if (selBrand) {
      const w={...selBrand,score:getScore(selBrand),lsi:calcLSI(selBrand)};
      const grade=getGrade(w.score);
      const status=getLSIStatus(w.lsi);
      const umbrella=UMBRELLA_COMPANIES[w.name]||"Independent";
      const brandIdx=WATER_DB.findIndex(b=>b.id===w.id);
      const isLocked=!isPro&&brandIdx>=10;
      return (
        <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
          <div style={{padding:"52px 22px 0"}}>
            <button className="btn" onClick={()=>setSelBrand(null)} style={{background:CARD,border:`1px solid ${BORDER}`,color:SUBTEXT,padding:"8px 14px",borderRadius:20,fontSize:12,marginBottom:18}}>← All Brands</button>
            {isLocked?(
              <div style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:16}}>🔒</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:TEXT,marginBottom:8}}>{w.name}</div>
                <div style={{fontSize:13,color:SUBTEXT,marginBottom:20}}>Full brand analysis including grade, minerals, pros, cons, and Walter verdict is a Flow Pro feature.</div>
                <button className="btn" onClick={goStripe} style={{padding:"14px 28px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:14,fontSize:14,fontWeight:700,color:"white"}}>Unlock with Flow — $1.99/mo</button>
              </div>
            ):(
              <>
                <div style={{textAlign:"center",marginBottom:20,animation:"scaleIn 0.35s ease both"}}>
                  <div style={{fontSize:48,marginBottom:6}}>{w.logo}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:TEXT}}>{w.name}</div>
                  <div style={{fontSize:11,color:SUBTEXT,marginTop:2}}>{w.type} · {w.origin}</div>
                  <div style={{fontSize:10,color:"rgba(3,105,161,0.5)",marginTop:2}}>🏢 {umbrella}</div>
                  <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14}}>
                    {[{val:grade.grade,color:grade.color,label:"WALTER GRADE"},{val:w.score,color:"#0369a1",label:"HEALTH SCORE"},{val:`${w.lsi>0?"+":""}${w.lsi}`,color:getLSIStatus(w.lsi).color,label:"LSI SCORE"}].map((s,i)=>(
                      <div key={i} style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:10,color:SUBTEXT}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{padding:16,background:CARD,borderRadius:18,border:`1px solid ${BORDER}`,marginBottom:14}}>
                  <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Mineral Profile</div>
                  {[
                    {label:"Calcium",    val:w.calcium,    max:500, unit:"mg/L",color:"#ca8a04"},
                    {label:"Magnesium",  val:w.magnesium,  max:130, unit:"mg/L",color:"#16a34a"},
                    {label:"Bicarbonate",val:w.bicarbonate,max:1820,unit:"mg/L",color:"#0284c7"},
                    {label:"Sodium",     val:w.sodium,     max:410, unit:"mg/L",color:"#ea580c"},
                    {label:"TDS",        val:w.tds,        max:2527,unit:"mg/L",color:"#7c3aed"},
                  ].map((m,i)=>(
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,color:SUBTEXT}}>{m.label}</span>
                        <span style={{fontSize:12,fontWeight:600,color:m.color}}>{m.val} {m.unit}</span>
                      </div>
                      <div style={{height:5,background:"rgba(3,105,161,0.08)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min((m.val/m.max)*100,100)}%`,background:m.color,borderRadius:3,animation:"barFill 0.8s ease both"}}/>
                      </div>
                    </div>
                  ))}
                </div>
                {w.pros&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                    <div style={{padding:12,background:"rgba(22,163,74,0.05)",borderRadius:14,border:"1px solid rgba(22,163,74,0.15)"}}>
                      <div style={{fontSize:10,color:"#16a34a",fontWeight:700,marginBottom:8,letterSpacing:1}}>✅ PROS</div>
                      {w.pros.slice(0,3).map((p,i)=><div key={i} style={{fontSize:10,color:TEXT,marginBottom:5,lineHeight:1.5}}>• {p}</div>)}
                    </div>
                    <div style={{padding:12,background:"rgba(220,38,38,0.05)",borderRadius:14,border:"1px solid rgba(220,38,38,0.12)"}}>
                      <div style={{fontSize:10,color:"#dc2626",fontWeight:700,marginBottom:8,letterSpacing:1}}>❌ CONS</div>
                      {w.cons.slice(0,3).map((c,i)=><div key={i} style={{fontSize:10,color:TEXT,marginBottom:5,lineHeight:1.5}}>• {c}</div>)}
                    </div>
                  </div>
                )}
                <div style={{padding:14,background:"rgba(3,105,161,0.05)",borderRadius:16,border:"1px solid rgba(3,105,161,0.12)",marginBottom:14}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0369a1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
                    <div>
                      <div style={{fontSize:11,color:"#0369a1",fontWeight:700,marginBottom:4}}>WALTER SAYS</div>
                      <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.7}}>{w.verdict}</div>
                      {w.bestFor&&<div style={{fontSize:11,color:"#16a34a",marginTop:6}}>✅ Best for: {w.bestFor}</div>}
                      {w.filterNote&&<div style={{fontSize:11,color:SUBTEXT,marginTop:4,fontStyle:"italic"}}>🔧 {w.filterNote}</div>}
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[
                    {label:"pH",    val:w.pH,                color:"#7c3aed"},
                    {label:"Price", val:`$${w.price}/L`,     color:"#ca8a04"},
                    {label:"Plastic",val:w.plastic?"Yes":"No",color:w.plastic?"#dc2626":"#16a34a"},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:12,background:CARD,borderRadius:12,textAlign:"center",border:`1px solid ${BORDER}`}}>
                      <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:10,color:SUBTEXT,marginTop:3}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <NavBar/>
        </div>
      );
    }

    return (
      <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
        <div style={{padding:"52px 22px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(135deg,#0369a1,#0ea5e9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Brand Intelligence</div>
            {!isPro&&<button className="btn" onClick={goStripe} style={{padding:"5px 10px",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:20,fontSize:10,color:"#dc2626"}}>🔒 45 locked</button>}
          </div>
          <div style={{fontSize:13,color:SUBTEXT,marginBottom:14}}>55 brands · umbrella companies · pros and cons</div>
          <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="Search brands..." style={{width:"100%",padding:"12px 16px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:13,color:TEXT,marginBottom:12}}/>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {[["all","All"],["premium","Premium"],["midtier","Mid"],["specialty","Special"],["budget","Budget"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandTier(v)} style={{padding:"6px 12px",background:brandTier===v?"rgba(3,105,161,0.1)":CARD,border:`1px solid ${brandTier===v?"rgba(3,105,161,0.4)":BORDER}`,borderRadius:20,fontSize:11,color:brandTier===v?"#0369a1":SUBTEXT}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["score","Score"],["price","Price"],["calcium","Calcium"],["magnesium","Magnesium"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setBrandSort(v)} style={{padding:"5px 10px",background:brandSort===v?"rgba(3,105,161,0.1)":CARD,border:`1px solid ${brandSort===v?"rgba(3,105,161,0.3)":BORDER}`,borderRadius:16,fontSize:10,color:brandSort===v?"#0369a1":SUBTEXT}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map((w,i)=>{
              const grade=getGrade(w.score);
              const status=getLSIStatus(w.lsi);
              const isLocked=!isPro&&i>=10;
              return (
                <button key={w.id} className="card" onClick={()=>isLocked?goStripe():setSelBrand(w)} style={{background:CARD,border:`1px solid ${isLocked?"rgba(3,105,161,0.06)":BORDER}`,borderRadius:16,padding:"12px 14px",textAlign:"left",animation:`fadeUp 0.3s ease ${Math.min(i*0.04,0.3)}s both`,display:"flex",alignItems:"center",gap:12,opacity:isLocked?0.7:1}}>
                  <div style={{fontSize:28,flexShrink:0}}>{isLocked?"🔒":w.logo}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:600,color:TEXT}}>{w.name}</span>
                      <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:isLocked?"rgba(3,105,161,0.2)":grade.color}}>{isLocked?"?":grade.grade}</span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      {isLocked?(
                        <span style={{fontSize:10,color:SUBTEXT}}>Unlock with Flow — $1.99/mo</span>
                      ):(
                        <>
                          <span style={{fontSize:10,color:status.color}}>{status.emoji} LSI {w.lsi>0?"+":""}{w.lsi}</span>
                          <span style={{fontSize:9,color:SUBTEXT}}>·</span>
                          <span style={{fontSize:10,color:SUBTEXT}}>Ca {w.calcium} Mg {w.magnesium}</span>
                          <span style={{fontSize:9,color:SUBTEXT}}>·</span>
                          <span style={{fontSize:10,color:SUBTEXT}}>${w.price}/L</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{fontSize:11,color:SUBTEXT}}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar/>
      </div>
    );
  }

  // ── CITIES ────────────────────────────────────────────────────────────────
  if (tab==="cities") {
    const REGIONS=[
      {id:"all",       label:"All"},
      {id:"tristate",  label:"Tri-State"},
      {id:"ny",        label:"NY State"},
      {id:"nj",        label:"New Jersey"},
      {id:"ct",        label:"Connecticut"},
      {id:"lehigh",    label:"Lehigh Valley"},
      {id:"pa",        label:"Pennsylvania"},
      {id:"fl",        label:"Florida"},
      {id:"oh",        label:"Ohio"},
      {id:"nc",        label:"N Carolina"},
      {id:"sc",        label:"S Carolina"},
      {id:"south",     label:"South"},
      {id:"west",      label:"West"},
      {id:"midwest",   label:"Midwest"},
      {id:"northeast", label:"Northeast"},
    ];
    const filteredCities=CITIES
      .filter(c=>cityRegion==="all"||c.region===cityRegion)
      .filter(c=>c.name.toLowerCase().includes(citySearch.toLowerCase()));

    if (selCity) {
      const lsi=calcLSI(selCity);
      const status=getLSIStatus(lsi);
      const risk=getCityRisk(selCity);
      const cityIdx=CITIES.findIndex(c=>c.name===selCity.name);
      const isLocked=!isPro&&cityIdx>=15;
      return (
        <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
          <div style={{padding:"52px 22px 0"}}>
            <button className="btn" onClick={()=>setSelCity(null)} style={{background:CARD,border:`1px solid ${BORDER}`,color:SUBTEXT,padding:"8px 14px",borderRadius:20,fontSize:12,marginBottom:18}}>← All Cities</button>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:44,marginBottom:6}}>🌆</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:TEXT}}>{selCity.name}</div>
              <div style={{fontSize:12,color:SUBTEXT,marginTop:4}}>Tap Water Analysis · {selCity.state}</div>
              <div style={{marginTop:14,display:"flex",justifyContent:"center",gap:16}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:800,color:status.color}}>{lsi>0?"+":""}{lsi}</div>
                  <div style={{fontSize:10,color:SUBTEXT}}>LSI SCORE</div>
                </div>
                <div style={{width:1,background:BORDER}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:riskColor(risk.overallRisk)}}>{risk.overallRisk}</div>
                  <div style={{fontSize:10,color:SUBTEXT}}>OVERALL RISK</div>
                </div>
              </div>
            </div>
            <div style={{padding:16,background:CARD,borderRadius:18,border:`1px solid ${BORDER}`,marginBottom:14}}>
              <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Contamination Report</div>
              {[
                {label:"PFAS Forever Chemicals",val:selCity.pfas,    unit:"ppt",risk:risk.pfasRisk,   limit:"EPA limit 4 ppt",   locked:isLocked},
                {label:"Lead",                  val:selCity.lead,    unit:"ppb",risk:risk.leadRisk,   limit:"Action level 15 ppb",locked:isLocked},
                {label:"Nitrate",               val:selCity.nitrate, unit:"ppm",risk:risk.nitrateRisk,limit:"EPA max 10 ppm",    locked:isLocked},
                {label:"5-Year Violations",     val:selCity.violations,unit:"", risk:selCity.violations>7?"HIGH":selCity.violations>3?"ELEVATED":"SAFE",limit:"0 is ideal",locked:false},
              ].map((m,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:SUBTEXT}}>{m.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {m.locked?(
                        <button onClick={goStripe} style={{background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:8,padding:"3px 8px",fontSize:11,color:"#dc2626",cursor:"pointer"}}>🔒 Unlock $1.99/mo</button>
                      ):(
                        <>
                          <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:riskColor(m.risk)}}>{m.val} {m.unit}</span>
                          <span style={{padding:"2px 6px",background:riskBg(m.risk),borderRadius:8,fontSize:9,color:riskColor(m.risk),fontWeight:700}}>{m.risk}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!m.locked&&<div style={{fontSize:10,color:"rgba(3,105,161,0.4)",marginTop:2}}>{m.limit}</div>}
                </div>
              ))}
            </div>
            <div style={{padding:16,background:CARD,borderRadius:18,border:`1px solid ${BORDER}`,marginBottom:14}}>
              <div style={{fontSize:11,color:SUBTEXT,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Water Chemistry</div>
              {[
                {label:"pH Level",   val:selCity.pH,         unit:"",    color:"#7c3aed"},
                {label:"TDS",        val:selCity.tds,        unit:"mg/L",color:"#0369a1"},
                {label:"Calcium",    val:selCity.calcium,    unit:"mg/L",color:"#ca8a04"},
                {label:"Bicarbonate",val:selCity.bicarbonate,unit:"mg/L",color:"#0284c7"},
              ].map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BORDER}`}}>
                  <span style={{fontSize:12,color:SUBTEXT}}>{m.label}</span>
                  <span style={{fontSize:15,fontWeight:700,color:m.color}}>{m.val} {m.unit}</span>
                </div>
              ))}
            </div>
            <div style={{padding:14,background:"rgba(3,105,161,0.05)",borderRadius:16,border:"1px solid rgba(3,105,161,0.12)",marginBottom:14}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0369a1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
                <div>
                  <div style={{fontSize:11,color:"#0369a1",fontWeight:700,marginBottom:4}}>WALTER SAYS</div>
                  <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.7}}>
                    {risk.overallRisk==="CRISIS"
                      ?`${selCity.name} has CRISIS-level contamination. Walter strongly recommends reverse osmosis filtration immediately. Do not rely on tap water for infants or pregnant women.`
                      :risk.overallRisk==="HIGH"||risk.overallRisk==="ELEVATED"
                      ?`${selCity.name} has elevated contaminant levels. Walter recommends an NSF 53 certified filter at minimum. Reverse osmosis preferred for full protection.`
                      :`${selCity.name} tap water is within regulatory limits LSI ${lsi}. A standard carbon filter handles chlorine and taste. You can drink with reasonable confidence.`}
                  </div>
                  <div style={{fontSize:11,color:SUBTEXT,marginTop:6,fontStyle:"italic"}}>Source: {selCity.source}</div>
                  <div style={{fontSize:11,color:"#ea580c",marginTop:4}}>Key concerns: {selCity.contaminants}</div>
                </div>
              </div>
            </div>
            {isPro&&(
              <button className="btn" onClick={()=>setShowCivic(!showCivic)} style={{width:"100%",padding:"12px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,fontSize:13,fontWeight:600,color:"#0369a1",marginBottom:10}}>
                {showCivic?"Hide":"Show"} Civic Action Toolkit 📢
              </button>
            )}
            {showCivic&&isPro&&(
              <div style={{padding:16,background:CARD,borderRadius:16,border:`1px solid ${BORDER}`,marginBottom:14,animation:"fadeUp 0.3s ease both"}}>
                <div style={{fontSize:11,color:"#0369a1",fontWeight:700,letterSpacing:2,marginBottom:12}}>WHO TO CONTACT</div>
                {CIVIC_CONTACTS.howTo.slice(0,3).map((item,i)=>(
                  <div key={i} style={{marginBottom:12,padding:10,background:"rgba(3,105,161,0.04)",borderRadius:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:TEXT,marginBottom:4}}>{item.action}</div>
                    <div style={{fontSize:11,color:SUBTEXT,lineHeight:1.6}}>{item.description}</div>
                  </div>
                ))}
                {CIVIC_CONTACTS.federal.slice(0,2).map((item,i)=>(
                  <div key={i} style={{marginBottom:8,padding:10,background:"rgba(3,105,161,0.04)",borderRadius:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:TEXT}}>{item.name}</div>
                    {item.phone&&<div style={{fontSize:11,color:"#0369a1",marginTop:2}}>{item.phone}</div>}
                    <div style={{fontSize:11,color:SUBTEXT}}>{item.website}</div>
                  </div>
                ))}
              </div>
            )}
            {!isPro&&(
              <button className="btn" onClick={goStripe} style={{width:"100%",padding:"12px",background:"rgba(3,105,161,0.06)",border:`1px solid ${BORDER}`,borderRadius:14,fontSize:12,color:"#0369a1"}}>
                🔒 Unlock Civic Action Toolkit — $1.99/mo
              </button>
            )}
          </div>
          <NavBar/>
        </div>
      );
    }

    return (
      <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
        <div style={{padding:"52px 22px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(135deg,#7c3aed,#0369a1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>City Water Intel</div>
            {!isPro&&<button className="btn" onClick={goStripe} style={{padding:"5px 10px",background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:20,fontSize:10,color:"#dc2626"}}>🔒 Full data</button>}
          </div>
          <div style={{fontSize:13,color:SUBTEXT,marginBottom:14}}>{CITIES.length} cities · PFAS · Lead · Nitrate · Violations</div>
          <input value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="Search your city..." style={{width:"100%",padding:"12px 16px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:13,color:TEXT,marginBottom:12}}/>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {REGIONS.map(r=>(
              <button key={r.id} className="btn" onClick={()=>setCityRegion(r.id)} style={{padding:"5px 10px",background:cityRegion===r.id?"rgba(124,58,237,0.1)":CARD,border:`1px solid ${cityRegion===r.id?"rgba(124,58,237,0.4)":BORDER}`,borderRadius:20,fontSize:10,color:cityRegion===r.id?"#7c3aed":SUBTEXT}}>{r.label}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filteredCities.map((c,i)=>{
              const lsi=calcLSI(c);
              const risk=getCityRisk(c);
              const isLocked=!isPro&&i>=15;
              return (
                <button key={i} className="card" onClick={()=>isLocked?goStripe():setSelCity(c)} style={{background:CARD,border:`1px solid ${risk.overallRisk==="CRISIS"?"rgba(220,38,38,0.3)":risk.overallRisk==="HIGH"?"rgba(234,88,12,0.2)":BORDER}`,borderRadius:14,padding:"12px 14px",textAlign:"left",animation:`fadeUp 0.3s ease ${Math.min(i*0.03,0.3)}s both`,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:24}}>{risk.overallRisk==="CRISIS"?"🚨":risk.overallRisk==="HIGH"?"⚠️":"🌆"}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600,color:TEXT}}>{c.name}</span>
                      {isLocked?(
                        <span style={{fontSize:10,color:"#dc2626"}}>🔒 $1.99/mo</span>
                      ):(
                        <span style={{fontSize:11,fontWeight:700,color:riskColor(risk.overallRisk)}}>{risk.overallRisk}</span>
                      )}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      {isLocked?(
                        <span style={{fontSize:10,color:SUBTEXT}}>PFAS: ●●● · Lead: ●●● · Unlock with Flow</span>
                      ):(
                        <>
                          <span style={{fontSize:10,color:riskColor(risk.pfasRisk)}}>PFAS {c.pfas}ppt</span>
                          <span style={{fontSize:9,color:SUBTEXT}}>·</span>
                          <span style={{fontSize:10,color:riskColor(risk.leadRisk)}}>Pb {c.lead}ppb</span>
                          <span style={{fontSize:9,color:SUBTEXT}}>·</span>
                          <span style={{fontSize:10,color:SUBTEXT}}>LSI {lsi>0?"+":""}{lsi}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{fontSize:11,color:SUBTEXT}}>›</div>
                </button>
              );
            })}
          </div>
        </div>
        <NavBar/>
      </div>
    );
  }

  // ── LEARN ─────────────────────────────────────────────────────────────────
  const LESSONS=[
    {title:"What is LSI",           icon:"🔬",time:"3 min",content:"The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936. It measures whether water is corrosive, balanced, or scale-forming. Water with a negative LSI actively dissolves minerals it contacts including calcium in your teeth and bones. Most purified bottled waters score between -1.0 and -2.0, meaning they are aggressively stripping minerals. The ideal LSI range is -0.2 to +0.2. At this level water is in equilibrium with your body and neither deposits nor removes minerals."},
    {title:"The Mineral Gap",        icon:"⚡",time:"4 min",content:"Up to 50% of Americans are deficient in magnesium. The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely. Dasani, Aquafina, and Smartwater contain zero magnesium and zero calcium. Gerolsteiner contains 348 mg/L calcium and 108 mg/L magnesium meeting WHO standards in a single liter. The minerals you get from water are more bioavailable than those from food or supplements because they are already in ionic form ready for direct cellular absorption."},
    {title:"PFAS Forever Chemicals", icon:"☢️",time:"4 min",content:"PFAS are man-made chemicals that do not break down in the environment or your body. They have been used since the 1940s in non-stick cookware, firefighting foam, food packaging, and waterproof clothing. The EPA health advisory is 4 parts per trillion. Horsham Township Pennsylvania has 1100 ppt — 275 times the limit. Fayetteville North Carolina has 700 ppt from Chemours GenX discharge. The only effective home removal methods are reverse osmosis filtration and activated carbon block. Standard Brita pitchers do NOT remove PFAS."},
    {title:"Lead in Water",          icon:"🔴",time:"4 min",content:"There is no safe level of lead exposure for children. Lead causes irreversible neurological damage, learning disabilities, and behavioral problems. The primary source in drinking water is lead service lines and interior plumbing installed before 1986. Benton Harbor Michigan has 55 ppb lead — nearly 4 times the EPA action level of 15 ppb. Newark New Jersey had a lead crisis from 2016 to 2021. Critical warning: boiling water does NOT remove lead. It concentrates it. The only solution is filtration using NSF 53 certified filters or reverse osmosis."},
    {title:"Hard vs Soft Water",     icon:"💎",time:"3 min",content:"Hard water contains high concentrations of calcium and magnesium. Soft water contains very little. Epidemiological studies have consistently shown that populations drinking hard water have lower rates of cardiovascular disease than those drinking soft water. The landmark WHO report on drinking water quality concluded that water hardness is inversely associated with heart disease mortality. Las Vegas tap water is very hard at 550 TDS. Seattle tap water is very soft at 45 TDS. The sweet spot is 150-400 TDS from natural mineral sources."},
    {title:"Reading Water Labels",   icon:"📋",time:"4 min",content:"Every bottled water label tells a story. Look for source which can be spring, purified tap, or artesian. Check mineral content including calcium, magnesium, sodium, and bicarbonate in mg/L. Check TDS which is the sum of all minerals. Check pH which should ideally be 7.0-8.5. Red flags include purified or distilled without remineralization, zero or near-zero TDS, pH below 6.5. Green flags include natural spring or artesian source, calcium above 50 mg/L, magnesium above 20 mg/L, bicarbonate above 100 mg/L."},
  ];

  if (tab==="learn") {
    const lesson=LESSONS[eduIdx];
    const gItem=GLOSSARY[glossaryIdx];
    return (
      <div style={app}><style>{CSS}</style>{showUpgrade&&<UpgradeModal/>}
        <div style={{padding:"52px 22px 0"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(135deg,#ca8a04,#ea580c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>Water Academy</div>
          <div style={{fontSize:13,color:SUBTEXT,marginBottom:16}}>Science · Glossary · Walter AI · Filters · Civic Action</div>
          <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
            {[["academy","Science"],["glossary","Glossary"],["walter","Ask Walter"],["filters","Filters"],["civic","Take Action"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setLearnSub(id)} style={{padding:"8px 12px",background:learnSub===id?"rgba(202,138,4,0.1)":CARD,border:`1px solid ${learnSub===id?"rgba(202,138,4,0.4)":BORDER}`,borderRadius:12,fontSize:11,fontWeight:learnSub===id?700:400,color:learnSub===id?"#ca8a04":SUBTEXT}}>{label}</button>
            ))}
          </div>

          {learnSub==="academy"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                {LESSONS.map((l,i)=>(
                  <button key={i} className="btn" onClick={()=>setEduIdx(i)} style={{padding:"6px 10px",background:eduIdx===i?"rgba(202,138,4,0.1)":CARD,border:`1px solid ${eduIdx===i?"rgba(202,138,4,0.3)":BORDER}`,borderRadius:20,fontSize:10,color:eduIdx===i?"#ca8a04":SUBTEXT}}>{l.icon} {l.title}</button>
                ))}
              </div>
              <div style={{padding:20,background:CARD,borderRadius:20,border:`1px solid ${BORDER}`,animation:"scaleIn 0.3s ease both"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:32,marginBottom:6}}>{lesson.icon}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:TEXT}}>{lesson.title}</div>
                  </div>
                  <span style={{padding:"4px 10px",background:"rgba(3,105,161,0.06)",borderRadius:20,fontSize:10,color:SUBTEXT}}>{lesson.time}</span>
                </div>
                <div style={{fontSize:13,color:SUBTEXT,lineHeight:1.85}}>{lesson.content}</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                <button className="btn" onClick={()=>setEduIdx(Math.max(0,eduIdx-1))} disabled={eduIdx===0} style={{padding:"10px 18px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:12,color:eduIdx===0?BORDER:SUBTEXT}}>Previous</button>
                <span style={{fontSize:11,color:SUBTEXT,alignSelf:"center"}}>{eduIdx+1} of {LESSONS.length}</span>
                <button className="btn" onClick={()=>setEduIdx(Math.min(LESSONS.length-1,eduIdx+1))} disabled={eduIdx===LESSONS.length-1} style={{padding:"10px 18px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:12,color:eduIdx===LESSONS.length-1?BORDER:SUBTEXT}}>Next</button>
              </div>
            </div>
          )}

          {learnSub==="glossary"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                {GLOSSARY.map((g,i)=>(
                  <button key={i} className="btn" onClick={()=>setGlossaryIdx(i)} style={{padding:"6px 10px",background:glossaryIdx===i?"rgba(3,105,161,0.1)":CARD,border:`1px solid ${glossaryIdx===i?"rgba(3,105,161,0.35)":BORDER}`,borderRadius:20,fontSize:10,color:glossaryIdx===i?"#0369a1":SUBTEXT}}>{g.icon} {g.term}</button>
                ))}
              </div>
              <div style={{padding:20,background:CARD,borderRadius:20,border:`1px solid ${BORDER}`,animation:"scaleIn 0.3s ease both"}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                  <div style={{width:52,height:52,borderRadius:14,background:"rgba(3,105,161,0.08)",border:"1px solid rgba(3,105,161,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{gItem.icon}</div>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#0369a1"}}>{gItem.term}</div>
                    <div style={{fontSize:11,color:SUBTEXT,marginTop:2}}>{gItem.full}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:SUBTEXT,lineHeight:1.85,marginBottom:14}}>{gItem.def}</div>
                <div style={{padding:12,background:"rgba(3,105,161,0.05)",borderRadius:12,borderLeft:"3px solid #0369a1"}}>
                  <div style={{fontSize:10,color:SUBTEXT,letterSpacing:1,marginBottom:4}}>EXAMPLE</div>
                  <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.6,fontStyle:"italic"}}>{gItem.example}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.max(0,glossaryIdx-1))} disabled={glossaryIdx===0} style={{padding:"10px 18px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:12,color:glossaryIdx===0?BORDER:SUBTEXT}}>Previous</button>
                <span style={{fontSize:11,color:SUBTEXT,alignSelf:"center"}}>{glossaryIdx+1} of {GLOSSARY.length}</span>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.min(GLOSSARY.length-1,glossaryIdx+1))} disabled={glossaryIdx===GLOSSARY.length-1} style={{padding:"10px 18px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,fontSize:12,color:glossaryIdx===GLOSSARY.length-1?BORDER:SUBTEXT}}>Next</button>
              </div>
            </div>
          )}

          {learnSub==="walter"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{padding:16,background:"rgba(3,105,161,0.05)",borderRadius:16,border:"1px solid rgba(3,105,161,0.12)",marginBottom:14}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#0369a1,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#0369a1"}}>Ask Walter Anything</div>
                    <div style={{fontSize:11,color:SUBTEXT}}>Powered by Claude AI</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <input value={walterQ} onChange={e=>setWalterQ(e.target.value)} placeholder="Is my city water safe for my baby..." style={{flex:1,padding:"12px 14px",background:"white",border:`1px solid ${BORDER}`,borderRadius:12,fontSize:13,color:TEXT}} onKeyDown={e=>e.key==="Enter"&&askWalter(walterQ)}/>
                  <button className="btn" onClick={()=>askWalter(walterQ)} style={{padding:"12px 16px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:12,color:"white",fontSize:13,fontWeight:700}}>Ask</button>
                </div>
                {walterLoading&&<div className="pulse" style={{fontSize:13,color:SUBTEXT,textAlign:"center",padding:12}}>🤖 Walter is analyzing your question...</div>}
                {walterAnswer&&(
                  <div style={{padding:14,background:"white",borderRadius:12,border:`1px solid ${BORDER}`}}>
                    <div style={{fontSize:11,color:"#0369a1",fontWeight:700,marginBottom:6}}>WALTER SAYS</div>
                    <div style={{fontSize:13,color:TEXT,lineHeight:1.75}}>{walterAnswer}</div>
                  </div>
                )}
              </div>
              <div style={{fontSize:11,color:SUBTEXT,marginBottom:10}}>Suggested questions:</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {WALTER_QA_PROMPTS.slice(0,8).map((q,i)=>(
                  <button key={i} className="card" onClick={()=>{setWalterQ(q);askWalter(q);}} style={{padding:"10px 14px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,textAlign:"left",fontSize:12,color:TEXT}}>
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {learnSub==="filters"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              {Object.values(FILTER_RECOMMENDATIONS).map((rec,i)=>(
                <div key={i} style={{padding:16,background:CARD,borderRadius:16,border:`1px solid ${rec.urgency==="CRITICAL"?"rgba(220,38,38,0.2)":rec.urgency==="HIGH"?"rgba(234,88,12,0.15)":BORDER}`,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:16}}>{rec.icon}</div>
                    <span style={{padding:"3px 8px",background:rec.urgency==="CRITICAL"?"rgba(220,38,38,0.1)":rec.urgency==="HIGH"?"rgba(234,88,12,0.1)":"rgba(3,105,161,0.08)",borderRadius:20,fontSize:9,fontWeight:700,color:rec.urgency==="CRITICAL"?"#dc2626":rec.urgency==="HIGH"?"#ea580c":"#0369a1"}}>{rec.urgency}</span>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:TEXT,marginBottom:6}}>{rec.problem}</div>
                  <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.6,marginBottom:10}}>{rec.description}</div>
                  {rec.solutions.map((sol,j)=>(
                    <div key={j} style={{padding:10,background:sol.type==="Does NOT work"?"rgba(220,38,38,0.04)":"rgba(22,163,74,0.04)",borderRadius:10,marginBottom:6,border:`1px solid ${sol.type==="Does NOT work"?"rgba(220,38,38,0.1)":"rgba(22,163,74,0.1)"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:sol.type==="Does NOT work"?"#dc2626":"#16a34a"}}>{sol.type==="Does NOT work"?"❌":"✅"} {sol.type}</span>
                        <span style={{fontSize:10,color:SUBTEXT}}>{sol.cost}</span>
                      </div>
                      <div style={{fontSize:11,color:SUBTEXT,marginBottom:4}}>{sol.effectiveness}</div>
                      <div style={{fontSize:10,color:TEXT,fontStyle:"italic"}}>{sol.note}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {learnSub==="civic"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              {!isPro&&(
                <div style={{padding:16,background:"rgba(220,38,38,0.05)",borderRadius:16,border:"1px solid rgba(220,38,38,0.15)",marginBottom:16,textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:8}}>🔒</div>
                  <div style={{fontSize:13,fontWeight:700,color:TEXT,marginBottom:6}}>Civic Action Toolkit</div>
                  <div style={{fontSize:12,color:SUBTEXT,marginBottom:12}}>Learn who to contact, how to file complaints, and how to organize your community around water quality issues.</div>
                  <button className="btn" onClick={goStripe} style={{padding:"12px 24px",background:"linear-gradient(135deg,#0369a1,#0284c7)",border:"none",borderRadius:12,fontSize:13,fontWeight:700,color:"white"}}>Unlock with Flow — $1.99/mo</button>
                </div>
              )}
              {isPro&&(
                <>
                  <div style={{fontSize:11,color:SUBTEXT,fontWeight:700,letterSpacing:2,marginBottom:10}}>HOW TO TAKE ACTION</div>
                  {CIVIC_CONTACTS.howTo.map((item,i)=>(
                    <div key={i} style={{padding:14,background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,marginBottom:10}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#0369a1",marginBottom:6}}>📢 {item.action}</div>
                      <div style={{fontSize:12,color:SUBTEXT,lineHeight:1.7}}>{item.description}</div>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:SUBTEXT,fontWeight:700,letterSpacing:2,marginBottom:10,marginTop:16}}>FEDERAL CONTACTS</div>
                  {CIVIC_CONTACTS.federal.map((item,i)=>(
                    <div key={i} style={{padding:12,background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:TEXT}}>{item.name}</div>
                      {item.phone&&<div style={{fontSize:12,color:"#0369a1",marginTop:3}}>{item.phone}</div>}
                      <div style={{fontSize:11,color:SUBTEXT}}>{item.website}</div>
                      <div style={{fontSize:11,color:SUBTEXT,marginTop:3,fontStyle:"italic"}}>{item.note}</div>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:SUBTEXT,fontWeight:700,letterSpacing:2,marginBottom:10,marginTop:16}}>ADVOCACY ORGANIZATIONS</div>
                  {CIVIC_CONTACTS.advocacy.map((item,i)=>(
                    <div key={i} style={{padding:12,background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:TEXT}}>{item.name}</div>
                      <div style={{fontSize:11,color:"#0369a1"}}>{item.website}</div>
                      <div style={{fontSize:11,color:SUBTEXT,marginTop:3,fontStyle:"italic"}}>{item.note}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

        </div>
        <NavBar/>
      </div>
    );
  }

  return null;
}
