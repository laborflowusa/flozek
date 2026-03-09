import { useState, useEffect } from "react";

const WATER_DB = [
  { id:1,  name:"Gerolsteiner",      tier:"premium",  logo:"🇩🇪", color:"#ef4444", pH:5.9, calcium:348, magnesium:108, sodium:118, tds:2527, bicarbonate:1816, price:1.90, plastic:false, type:"Natural Sparkling", origin:"Volcanic Eifel, Germany",        verdict:"Most mineral-dense water on earth. Extraordinary Mg & Ca. Clinically superior for deficiency correction." },
  { id:2,  name:"San Pellegrino",    tier:"premium",  logo:"🇮🇹", color:"#f59e0b", pH:7.7, calcium:174, magnesium:56,  sodium:36,  tds:1109, bicarbonate:243,  price:2.30, plastic:false, type:"Natural Sparkling", origin:"Bergamo Alps, Italy",             verdict:"Gold standard sparkling mineral water. Outstanding Ca & Mg. High sulfate aids digestion." },
  { id:3,  name:"Perrier",           tier:"premium",  logo:"🫧",  color:"#10b981", pH:5.5, calcium:155, magnesium:3,   sodium:9,   tds:475,  bicarbonate:390,  price:2.10, plastic:false, type:"Natural Sparkling", origin:"Vergèze, France",                 verdict:"Highest calcium of any mainstream sparkling. Low Mg is a gap. Excellent boost, not sole water." },
  { id:4,  name:"Evian",             tier:"premium",  logo:"🏔️", color:"#3b82f6", pH:7.2, calcium:80,  magnesium:26,  sodium:6,   tds:309,  bicarbonate:357,  price:2.50, plastic:true,  type:"Natural Still",     origin:"French Alps, France",            verdict:"One of the most mineral-balanced waters in the world. Excellent Mg. The benchmark for still mineral water." },
  { id:5,  name:"Contrex",           tier:"premium",  logo:"💪",  color:"#f9a8d4", pH:7.4, calcium:486, magnesium:84,  sodium:9,   tds:2078, bicarbonate:403,  price:1.80, plastic:true,  type:"Natural Still",     origin:"Contrexéville, France",          verdict:"Highest calcium of any still water — 486 mg/L. Exceptional for bone health deficiency correction." },
  { id:6,  name:"Apollinaris",       tier:"premium",  logo:"👑",  color:"#c084fc", pH:5.9, calcium:89,  magnesium:130, sodium:410, tds:2500, bicarbonate:1820, price:2.10, plastic:false, type:"Natural Sparkling", origin:"Bad Neuenahr, Germany",           verdict:"Highest magnesium in database — 130 mg/L. Very high sodium. Use in rotation for Mg supplementation." },
  { id:7,  name:"Badoit",            tier:"premium",  logo:"🇫🇷", color:"#93c5fd", pH:6.0, calcium:190, magnesium:85,  sodium:150, tds:1200, bicarbonate:1300, price:2.40, plastic:false, type:"Natural Sparkling", origin:"Saint-Galmier, France",           verdict:"Outstanding Ca & Mg balance. High sodium is a consideration. Among the best mineral waters globally." },
  { id:8,  name:"Hildon",            tier:"premium",  logo:"🏰",  color:"#84cc16", pH:7.4, calcium:98,  magnesium:5,   sodium:11,  tds:312,  bicarbonate:288,  price:2.20, plastic:false, type:"Natural Still",     origin:"Hampshire, England",             verdict:"High calcium, naturally balanced. Preferred water of the British royal household." },
  { id:9,  name:"Mountain Valley",   tier:"premium",  logo:"⛰️", color:"#a3e635", pH:7.8, calcium:68,  magnesium:22,  sodium:3,   tds:220,  bicarbonate:272,  price:2.60, plastic:false, type:"Natural Still",     origin:"Ouachita Mountains, AR",         verdict:"One of America's finest spring waters. Served at the US Senate. Excellent Ca & Mg balance." },
  { id:10, name:"Acqua Panna",       tier:"premium",  logo:"🌿",  color:"#fbbf24", pH:8.0, calcium:34,  magnesium:7,   sodium:6,   tds:122,  bicarbonate:107,  price:2.10, plastic:false, type:"Natural Still",     origin:"Tuscany, Italy",                 verdict:"Beautifully balanced naturally alkaline Tuscan water. Perfect food pairing." },
  { id:11, name:"Fiji",              tier:"premium",  logo:"🏝️", color:"#06b6d4", pH:7.7, calcium:18,  magnesium:15,  sodium:18,  tds:222,  bicarbonate:152,  price:2.20, plastic:true,  type:"Artesian Still",    origin:"Viti Levu, Fiji Islands",        verdict:"Silica-rich artesian with good pH. Modest minerals despite premium marketing." },
  { id:12, name:"Voss",              tier:"premium",  logo:"🇳🇴", color:"#e2e8f0", pH:6.0, calcium:5,   magnesium:1,   sodium:6,   tds:22,   bicarbonate:17,   price:3.50, plastic:false, type:"Natural Still",     origin:"Iveland, Norway",                verdict:"Beautiful bottle, virtually zero mineral content. Most overpriced mineral-poor water available." },
  { id:13, name:"Icelandic Glacial", tier:"premium",  logo:"🧊",  color:"#bae6fd", pH:8.4, calcium:3,   magnesium:1,   sodium:7,   tds:62,   bicarbonate:87,   price:2.80, plastic:false, type:"Natural Still",     origin:"Ölfus Spring, Iceland",          verdict:"Naturally alkaline volcanic. Very low minerals despite premium positioning. Carbon neutral." },
  { id:14, name:"Topo Chico",        tier:"premium",  logo:"🫙",  color:"#f472b6", pH:5.7, calcium:47,  magnesium:9,   sodium:52,  tds:556,  bicarbonate:320,  price:1.50, plastic:false, type:"Natural Sparkling", origin:"Monterrey, Mexico",               verdict:"Cult-favorite Mexican mineral water. Good Ca, moderate TDS. Higher sodium than ideal." },
  { id:15, name:"Waiākea",           tier:"premium",  logo:"🌺",  color:"#f97316", pH:8.2, calcium:21,  magnesium:7,   sodium:11,  tds:118,  bicarbonate:125,  price:2.40, plastic:true,  type:"Volcanic Still",    origin:"Mauna Loa, Hawaii",              verdict:"Naturally alkaline Hawaiian volcanic. Moderate minerals, genuine eco-credentials." },
  { id:16, name:"Poland Spring",     tier:"midtier",  logo:"🌲",  color:"#22c55e", pH:7.2, calcium:7,   magnesium:1,   sodium:3,   tds:38,   bicarbonate:35,   price:0.90, plastic:true,  type:"Natural Still",     origin:"Maine, USA",                     verdict:"Genuine US spring at accessible price. Low minerals but balanced pH. Safe daily choice." },
  { id:17, name:"Deer Park",         tier:"midtier",  logo:"🦌",  color:"#86efac", pH:7.0, calcium:22,  magnesium:5,   sodium:7,   tds:93,   bicarbonate:71,   price:0.85, plastic:true,  type:"Natural Still",     origin:"Mid-Atlantic US Springs",        verdict:"Moderate mineral spring water from Mid-Atlantic. Better minerals than Poland Spring." },
  { id:18, name:"Arrowhead",         tier:"midtier",  logo:"🏹",  color:"#34d399", pH:7.7, calcium:26,  magnesium:9,   sodium:5,   tds:162,  bicarbonate:120,  price:0.85, plastic:true,  type:"Natural Still",     origin:"Mountain Springs, CA/CO",        verdict:"Western US mountain spring with decent mineral content. Good pH. Reliable West Coast choice." },
  { id:19, name:"Zephyrhills",       tier:"midtier",  logo:"🌴",  color:"#2dd4bf", pH:7.8, calcium:55,  magnesium:4,   sodium:6,   tds:196,  bicarbonate:188,  price:0.85, plastic:true,  type:"Natural Still",     origin:"Florida Springs",                verdict:"Florida spring with above-average calcium. Great for Southeast consumers." },
  { id:20, name:"Smartwater",        tier:"midtier",  logo:"⚡",  color:"#a855f7", pH:7.0, calcium:15,  magnesium:0,   sodium:10,  tds:55,   bicarbonate:0,    price:1.40, plastic:true,  type:"Vapor Distilled",   origin:"Municipal tap, vapor distilled", verdict:"Vapor distilled tap with electrolytes added. Zero Mg is significant gap. Marketing exceeds substance." },
  { id:21, name:"Essentia",          tier:"midtier",  logo:"⚗️", color:"#8b5cf6", pH:9.5, calcium:0,   magnesium:0,   sodium:7,   tds:35,   bicarbonate:0,    price:1.80, plastic:true,  type:"Ionized Alkaline",  origin:"Municipal tap, ionized",         verdict:"High pH via ionization, NOT natural minerals. Zero Ca & Mg undermines all alkaline health claims." },
  { id:22, name:"Eternal",           tier:"midtier",  logo:"♾️", color:"#6ee7b7", pH:8.1, calcium:22,  magnesium:8,   sodium:6,   tds:100,  bicarbonate:95,   price:1.30, plastic:true,  type:"Natural Still",     origin:"Natural Springs, USA/Canada",    verdict:"Naturally alkaline spring with modest minerals. Better than artificially alkaline brands." },
  { id:23, name:"Core Hydration",    tier:"midtier",  logo:"🔵",  color:"#38bdf8", pH:7.4, calcium:0,   magnesium:0,   sodium:0,   tds:10,   bicarbonate:0,    price:1.50, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Ultra-purified near-zero TDS with pH adjusted. Despite claims, mineral content is essentially zero." },
  { id:24, name:"Liquid Death",      tier:"specialty",logo:"💀",  color:"#475569", pH:7.0, calcium:14,  magnesium:5,   sodium:10,  tds:100,  bicarbonate:74,   price:1.80, plastic:false, type:"Natural Still",     origin:"Austrian Alps, Austria",         verdict:"Austrian alpine water in aluminum cans. Decent minerals for price. Sustainable packaging positive." },
  { id:25, name:"Flow Alkaline",     tier:"specialty",logo:"🌊",  color:"#67e8f9", pH:8.1, calcium:38,  magnesium:13,  sodium:6,   tds:148,  bicarbonate:128,  price:2.20, plastic:false, type:"Artesian Alkaline", origin:"Canadian Artesian Spring",       verdict:"Naturally alkaline Canadian artesian with real minerals behind the pH. Eco-friendly packaging." },
  { id:26, name:"Just Water",        tier:"specialty",logo:"🌍",  color:"#4ade80", pH:8.0, calcium:24,  magnesium:8,   sodium:5,   tds:98,   bicarbonate:90,   price:1.90, plastic:false, type:"Natural Still",     origin:"Glens Falls, NY Spring",         verdict:"Naturally alkaline NY spring in plant-based packaging. Decent minerals, strong eco credentials." },
  { id:27, name:"LaCroix",           tier:"specialty",logo:"🌈",  color:"#fb7185", pH:4.7, calcium:0,   magnesium:0,   sodium:2,   tds:10,   bicarbonate:0,    price:0.85, plastic:false, type:"Sparkling Purified", origin:"Municipal tap + CO2",            verdict:"Popular purified sparkling. Acidic pH from carbonation. Zero minerals. Occasional variety only." },
  { id:28, name:"Pure Life",         tier:"budget",   logo:"💧",  color:"#3b82f6", pH:7.2, calcium:18,  magnesium:5,   sodium:8,   tds:95,   bicarbonate:45,   price:0.60, plastic:true,  type:"Purified+Remineralized",origin:"Municipal tap, remineralized",  verdict:"Purified tap with minerals added back. Balanced LSI. Best budget remineralized option." },
  { id:29, name:"Dasani",            tier:"budget",   logo:"🏭",  color:"#94a3b8", pH:5.6, calcium:0,   magnesium:0,   sodium:6,   tds:20,   bicarbonate:0,    price:0.80, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Filtered municipal with acidic pH and near-zero minerals. One of the poorest health choices available." },
  { id:30, name:"Aquafina",          tier:"budget",   logo:"🏭",  color:"#94a3b8", pH:6.0, calcium:0,   magnesium:0,   sodium:0,   tds:10,   bicarbonate:0,    price:0.75, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Lowest TDS in database. Near-maximally aggressive. Removes contaminants AND all beneficial minerals." },
  { id:31, name:"Great Value",       tier:"budget",   logo:"🛒",  color:"#fde047", pH:6.5, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.25, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Walmart store brand. Lowest cost accessible. Better pH than Dasani. Zero minerals but clean water." },
  { id:32, name:"Kirkland",          tier:"budget",   logo:"🏪",  color:"#ef4444", pH:6.8, calcium:0,   magnesium:0,   sodium:3,   tds:15,   bicarbonate:0,    price:0.20, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Costco bulk. Best value per gallon. Better pH than most purified waters. Zero minerals." },
  { id:33, name:"Crystal Geyser",    tier:"budget",   logo:"🗻",  color:"#22d3ee", pH:6.9, calcium:14,  magnesium:5,   sodium:4,   tds:74,   bicarbonate:57,   price:0.50, plastic:true,  type:"Natural Still",     origin:"Mount Shasta, CA Springs",       verdict:"Genuine spring from Mt. Shasta at budget price. Best mineral-containing option at the budget tier." },
  { id:34, name:"Dollar Tree",       tier:"budget",   logo:"🌳",  color:"#86efac", pH:6.7, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.17, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Lowest cost in database at $0.17/L. Critically important clean water access for underserved communities." },
  { id:35, name:"Kirkland Sparkling",tier:"budget",   logo:"🫧",  color:"#67e8f9", pH:5.8, calcium:35,  magnesium:8,   sodium:8,   tds:130,  bicarbonate:105,  price:0.35, plastic:false, type:"Natural Sparkling", origin:"Natural Spring + CO2",           verdict:"Costco sparkling with real spring minerals. Best value sparkling water with actual mineral content." },
  { id:36, name:"Aldi Store Brand",  tier:"budget",   logo:"🏷️", color:"#a3e635", pH:7.0, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.19, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Aldi house brand. Neutral pH is one of best in budget purified category. Excellent community value." },
  { id:37, name:"Member's Mark",     tier:"budget",   logo:"🏬",  color:"#f97316", pH:6.7, calcium:0,   magnesium:0,   sodium:4,   tds:14,   bicarbonate:0,    price:0.22, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Sam's Club store brand. Ultra-low cost clean water. Widely available, very affordable for families." },
  { id:38, name:"Niagara",           tier:"budget",   logo:"🌊",  color:"#67e8f9", pH:6.9, calcium:0,   magnesium:0,   sodium:5,   tds:18,   bicarbonate:0,    price:0.28, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"One of largest US bottlers. Reasonable pH for a purified product. Budget accessible." },
  { id:39, name:"Target Good&Gather",tier:"budget",   logo:"🎯",  color:"#ef4444", pH:7.0, calcium:0,   magnesium:0,   sodium:4,   tds:12,   bicarbonate:0,    price:0.22, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Target house brand. Clean neutral pH. Zero minerals. One of cleaner-profile budget purified waters." },
  { id:40, name:"Proud Source",      tier:"specialty",logo:"🏔️", color:"#f97316", pH:7.8, calcium:35,  magnesium:12,  sodium:7,   tds:148,  bicarbonate:140,  price:2.10, plastic:false, type:"Artesian Still",    origin:"Snake River Plain Aquifer, ID",  verdict:"Idaho artesian in aluminum can. Good mineral profile, naturally alkaline. Strong health & eco profile." },
];

const CITIES = [
  { name:"New York, NY",      pH:7.2, tds:140, calcium:35,  bicarbonate:65  },
  { name:"Los Angeles, CA",   pH:7.8, tds:280, calcium:68,  bicarbonate:120 },
  { name:"Chicago, IL",       pH:7.4, tds:165, calcium:45,  bicarbonate:75  },
  { name:"Houston, TX",       pH:7.9, tds:310, calcium:75,  bicarbonate:130 },
  { name:"Phoenix, AZ",       pH:7.6, tds:420, calcium:95,  bicarbonate:155 },
  { name:"Philadelphia, PA",  pH:7.1, tds:120, calcium:28,  bicarbonate:55  },
  { name:"San Antonio, TX",   pH:7.7, tds:380, calcium:85,  bicarbonate:145 },
  { name:"San Diego, CA",     pH:7.5, tds:490, calcium:110, bicarbonate:165 },
  { name:"Dallas, TX",        pH:7.8, tds:290, calcium:70,  bicarbonate:125 },
  { name:"Miami, FL",         pH:7.3, tds:200, calcium:52,  bicarbonate:85  },
  { name:"Atlanta, GA",       pH:6.9, tds:65,  calcium:18,  bicarbonate:28  },
  { name:"Seattle, WA",       pH:7.0, tds:45,  calcium:12,  bicarbonate:22  },
  { name:"Denver, CO",        pH:7.6, tds:175, calcium:42,  bicarbonate:78  },
  { name:"Boston, MA",        pH:7.1, tds:90,  calcium:22,  bicarbonate:40  },
  { name:"Detroit, MI",       pH:7.4, tds:155, calcium:38,  bicarbonate:70  },
  { name:"Nashville, TN",     pH:7.5, tds:210, calcium:55,  bicarbonate:92  },
  { name:"Portland, OR",      pH:7.1, tds:50,  calcium:14,  bicarbonate:25  },
  { name:"Las Vegas, NV",     pH:8.0, tds:550, calcium:125, bicarbonate:180 },
  { name:"Minneapolis, MN",   pH:7.6, tds:200, calcium:52,  bicarbonate:88  },
  { name:"New Orleans, LA",   pH:7.8, tds:175, calcium:42,  bicarbonate:80  },
];

const calcLSI = ({ pH, tds, calcium, bicarbonate }) => {
  const A = tds < 50 ? 0.07 : tds < 150 ? 0.14 : tds < 300 ? 0.19 : tds < 500 ? 0.22 : 0.26;
  const B = 1.0;
  const C = calcium < 25 ? 1.0 : calcium < 50 ? 1.3 : calcium < 100 ? 1.6 : calcium < 200 ? 1.9 : 2.2;
  const D = bicarbonate < 25 ? 1.1 : bicarbonate < 50 ? 1.4 : bicarbonate < 100 ? 1.7 : bicarbonate < 200 ? 2.0 : 2.3;
  return parseFloat((pH - ((9.3 + A + B) - (C + D))).toFixed(2));
};

const getLSIStatus = (lsi) => {
  if (lsi < -0.5) return { label:"Aggressive",        color:"#ef4444", emoji:"🔴", bg:"rgba(239,68,68,0.1)"   };
  if (lsi < -0.2) return { label:"Mildly Aggressive", color:"#f97316", emoji:"🟠", bg:"rgba(249,115,22,0.1)"  };
  if (lsi <= 0.2) return  { label:"Balanced",          color:"#22c55e", emoji:"🟢", bg:"rgba(34,197,94,0.1)"   };
  if (lsi <= 0.5) return  { label:"Mildly Scaling",    color:"#eab308", emoji:"🟡", bg:"rgba(234,179,8,0.1)"   };
  return                  { label:"High Scaling",      color:"#8b5cf6", emoji:"🟣", bg:"rgba(139,92,246,0.1)"  };
};

const getScore = (w) => {
  let s = 50;
  const lsi = calcLSI({ pH:w.pH, tds:w.tds, calcium:w.calcium, bicarbonate:w.bicarbonate });
  if (lsi >= -0.2 && lsi <= 0.3) s += 15; else if (lsi < -0.5) s -= 20; else if (lsi < -0.2) s -= 8;
  if (w.magnesium >= 50) s += 18; else if (w.magnesium >= 20) s += 13; else if (w.magnesium >= 8) s += 6; else if (w.magnesium < 2) s -= 10;
  if (w.calcium >= 150) s += 15; else if (w.calcium >= 60) s += 10; else if (w.calcium >= 20) s += 5; else if (w.calcium < 5) s -= 8;
  if (w.pH >= 7.0 && w.pH <= 8.5) s += 8; else if (w.pH < 6.5) s -= 12;
  if (!w.plastic) s += 4;
  if (w.sodium > 150) s -= 5;
  return Math.min(Math.max(s, 5), 100);
};

const getGrade = (score) => {
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
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(99,211,158,0.3)}50%{box-shadow:0 0 0 8px rgba(99,211,158,0)}}
  .card{transition:transform 0.18s ease,box-shadow 0.18s ease;cursor:pointer;}
  .card:hover{transform:translateY(-2px);}
  .card:active{transform:scale(0.97);}
  .btn{transition:all 0.18s ease;cursor:pointer;}
  .btn:hover{opacity:0.85;}
  .btn:active{transform:scale(0.96);}
  input{outline:none;}
  input:focus{border-color:rgba(99,211,158,0.5)!important;}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#00d4ff;cursor:pointer;}
`;export default function Flozek() {
  const [tab, setTab]             = useState("home");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandTier, setBrandTier] = useState("all");
  const [brandSort, setBrandSort] = useState("score");
  const [selBrand, setSelBrand]   = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [selCity, setSelCity]     = useState(null);
  const [calcVals, setCalcVals]   = useState({ pH:7.2, tds:150, calcium:40, bicarbonate:70 });
  const [showResult, setShowResult] = useState(false);
  const [lsiResult, setLsiResult] = useState(null);
  const [selSymptoms, setSelSymptoms] = useState([]);
  const [symptomRes, setSymptomRes] = useState(null);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [eduIdx, setEduIdx]       = useState(0);

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

  // HOME
  if (tab === "home") return (
    <div style={app}>
      <style>{CSS}</style>
      <div style={{ padding:"52px 22px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, background:"linear-gradient(135deg,#63d39e,#a8f0c8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Flo·zēk</div>
            <div style={{ fontSize:12, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginTop:2 }}>Water Intelligence</div>
          </div>
          <div style={{ fontSize:40, animation:"float 3s ease infinite" }}>💧</div>
        </div>

        <div style={{ padding:18, background:"linear-gradient(135deg,rgba(99,211,158,0.08),rgba(0,212,255,0.04))", borderRadius:20, border:"1px solid rgba(99,211,158,0.12)", marginBottom:16, animation:"scaleIn 0.4s ease both" }}>
          <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Meet Walter</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#63d39e,#00d4ff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#63d39e", marginBottom:3 }}>WALTER</div>
              <div style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.6 }}>Water Analysis & Life Track Enhancement Recommendations. Your personal water intelligence assistant.</div>
            </div>
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(0,0,0,0.2)", borderRadius:12, fontSize:12, color:"rgba(200,230,215,0.55)", lineHeight:1.6, fontStyle:"italic" }}>
            "Dasani scores a D. Aquafina scores a D. Your body deserves better — and I'm going to show you exactly what to drink instead."
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"🔬", title:"Test My Water",  sub:"Calculate LSI score",    id:"test",   color:"#00d4ff" },
            { icon:"💧", title:"Browse Brands",  sub:"40 brands analyzed",     id:"brands", color:"#63d39e" },
            { icon:"🌆", title:"City Water",     sub:"20 cities scored",       id:"cities", color:"#a78bfa" },
            { icon:"📚", title:"Water Academy",  sub:"Science made simple",    id:"learn",  color:"#fbbf24" },
          ].map((item,i)=>(
            <button key={i} className="card" onClick={()=>setTab(item.id)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:14, textAlign:"left", animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.title}</div>
              <div style={{ fontSize:10, color:"rgba(200,230,215,0.38)", marginTop:2 }}>{item.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ padding:16, background:"rgba(255,255,255,0.02)", borderRadius:16, border:"1px solid rgba(255,255,255,0.05)", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"rgba(200,230,215,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>LSI Health Scale</div>
          <div style={{ display:"flex", gap:5 }}>
            {[["Aggressive","#ef4444","<-0.5"],["Low Mineral","#f97316","-0.5 to -0.2"],["Ideal ✓","#22c55e","-0.2 to 0.2"],["Scaling","#eab308",">0.2"]].map(([l,c,r],i)=>(
              <div key={i} style={{ flex:1, textAlign:"center" }}>
                <div style={{ height:5, background:c, borderRadius:3, marginBottom:5, boxShadow:`0 0 6px ${c}40` }} />
                <div style={{ fontSize:8, color:"rgba(200,230,215,0.5)" }}>{l}</div>
                <div style={{ fontSize:7, color:"rgba(200,230,215,0.25)", marginTop:1 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:16, background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(99,211,158,0.04))", borderRadius:16, border:"1px solid rgba(124,58,237,0.12)" }}>
          <div style={{ fontSize:11, color:"#a78bfa", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>🌍 Our Mission</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.6)", lineHeight:1.7 }}>A portion of every Flo·zēk Pro subscription supports clean water access in underserved communities globally.</div>
          <div style={{ marginTop:10, fontSize:13, color:"#63d39e", fontWeight:600 }}>Upgrade to Pro — $1.99/mo →</div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  // TEST
  if (tab === "test") {
    const SYMPTOMS = [
      { id:1,  label:"Muscle cramps",       mineral:"Magnesium", icon:"⚡" },
      { id:2,  label:"Poor sleep",          mineral:"Magnesium", icon:"🌙" },
      { id:3,  label:"Chronic fatigue",     mineral:"Magnesium", icon:"😴" },
      { id:4,  label:"Frequent headaches",  mineral:"Magnesium", icon:"🧠" },
      { id:5,  label:"Brittle nails/hair",  mineral:"Calcium",   icon:"💅" },
      { id:6,  label:"Anxiety/Depression",  mineral:"Magnesium", icon:"😰" },
      { id:7,  label:"Irregular heartbeat", mineral:"Magnesium", icon:"❤️" },
      { id:8,  label:"Brain fog",           mineral:"Electrolytes",icon:"🌫️"},
      { id:9,  label:"Joint/bone pain",     mineral:"Calcium",   icon:"🦴" },
      { id:10, label:"Constipation",        mineral:"Magnesium", icon:"🔄" },
      { id:11, label:"High blood pressure", mineral:"Magnesium", icon:"🩺" },
      { id:12, label:"Tooth sensitivity",   mineral:"Calcium",   icon:"🦷" },
    ];
    const previewLSI = calcLSI(calcVals);
    const previewStatus = getLSIStatus(previewLSI);

    if (showResult) {
      const status = getLSIStatus(lsiResult);
      return (
        <div style={app}>
          <style>{CSS}</style>
          <div style={{ padding:"52px 22px 0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <button className="btn" onClick={()=>setShowResult(false)} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"rgba(200,230,215,0.6)", padding:"8px 14px", borderRadius:20, fontSize:12 }}>← Back</button>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#e4ede8" }}>Walter's Analysis</div>
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
                {lsiResult > 0.2 && "Walter says: High mineral content. Excellent for supplementation — consider rotating with lower-TDS water."}
              </div>
            </div>
            {lsiResult < -0.2 && (
              <div style={{ padding:16, background:"rgba(99,211,158,0.05)", borderRadius:16, border:"1px solid rgba(99,211,158,0.12)", marginBottom:14 }}>
                <div style={{ fontSize:11, color:"#63d39e", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Walter Recommends</div>
                {["Add mineral drops (magnesium, calcium)","Switch to a natural spring water brand","Use a remineralizing filter post-RO","Check the Brands tab for better options"].map((tip,i)=>(
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
      <div style={app}>
        <style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#00d4ff,#63d39e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Testing</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:16 }}>LSI Calculator · Symptom Checker</div>

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
            { key:"pH",          label:"pH Level",              min:5,   max:10,  step:0.1, unit:""     },
            { key:"tds",         label:"Total Dissolved Solids",min:0,   max:1000,step:5,   unit:"mg/L" },
            { key:"calcium",     label:"Calcium Hardness",      min:0,   max:500, step:5,   unit:"mg/L" },
            { key:"bicarbonate", label:"Total Alkalinity",      min:0,   max:500, step:5,   unit:"mg/L" },
          ].map((p,i)=>(
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
            Ask Walter to Analyze 🔬
          </button>

          <div style={{ padding:16, background:"rgba(255,107,53,0.06)", borderRadius:16, border:"1px solid rgba(255,107,53,0.15)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showSymptoms?12:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#ff6b35" }}>🩺 Symptom Checker</div>
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
                    Ask Walter — Analyze {selSymptoms.length} Symptom{selSymptoms.length>1?"s":""}
                  </button>
                )}
                {symptomRes && (
                  <div style={{ marginTop:12, padding:14, background:"rgba(255,107,53,0.08)", borderRadius:12, border:"1px solid rgba(255,107,53,0.15)" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#ff6b35", marginBottom:6 }}>Walter's Verdict</div>
                    <div style={{ fontSize:12, color:"rgba(200,230,215,0.7)", lineHeight:1.7 }}>
                      Based on {symptomRes.count} symptoms, Walter suspects a <strong style={{ color:"#ff6b35" }}>{symptomRes.mineral} deficiency</strong> — commonly linked to aggressive or low-mineral water consumption. Test your LSI to confirm.
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
  }// BRANDS
  if (tab === "brands") {
    const enriched = WATER_DB.map(w=>({ ...w, lsi:calcLSI(w), score:getScore(w) }));
    const filtered = enriched.filter(w=>{
      const q = brandSearch.toLowerCase();
      return (!q || w.name.toLowerCase().includes(q)) && (brandTier==="all" || w.tier===brandTier);
    }).sort((a,b)=>{
      if (brandSort==="score")     return b.score-a.score;
      if (brandSort==="magnesium") return b.magnesium-a.magnesium;
      if (brandSort==="calcium")   return b.calcium-a.calcium;
      if (brandSort==="price")     return a.price-b.price;
      return 0;
    });

    if (selBrand) {
      const w = selBrand;
      const lsiSt = getLSIStatus(w.lsi);
      const grade = getGrade(w.score);
      return (
        <div style={app}>
          <style>{CSS}</style>
          <div style={{ padding:"52px 20px 0" }}>
            <button className="btn" onClick={()=>setSelBrand(null)} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:"rgba(200,230,215,0.6)", padding:"8px 14px", borderRadius:20, fontSize:12, marginBottom:16 }}>← Back</button>
            <div style={{ padding:20, background:`linear-gradient(135deg,${w.color}12,${w.color}04)`, borderRadius:20, border:`1px solid ${w.color}20`, marginBottom:14, animation:"scaleIn 0.4s ease both" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>{w.type}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#e4ede8" }}>{w.name}</div>
                  <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", marginTop:2 }}>📍 {w.origin}</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:42, fontWeight:800, color:grade.color, lineHeight:1 }}>{grade.grade}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:grade.color }}>{w.score}/100</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {[["pH",w.pH,"#60a5fa"],["LSI",w.lsi>0?`+${w.lsi}`:w.lsi,lsiSt.color],["TDS",w.tds,"#a78bfa"],["$/L",`$${w.price.toFixed(2)}`,"#fbbf24"]].map(([l,v,c],i)=>(
                  <div key={i} style={{ padding:"8px 4px", background:"rgba(255,255,255,0.04)", borderRadius:9, textAlign:"center" }}>
                    <div style={{ fontSize:8, color:"rgba(200,230,215,0.3)", marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:15, background:"rgba(255,255,255,0.02)", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", marginBottom:12 }}>
              <div style={{ fontSize:10, color:"rgba(200,230,215,0.3)", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Mineral Profile (mg/L)</div>
              {[["calcium","Calcium","#60a5fa",500],["magnesium","Magnesium","#63d39e",135],["sodium","Sodium","#fbbf24",500],["bicarbonate","Bicarbonate","#a78bfa",2200]].map(([key,label,color,max],i)=>(
                <div key={key} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"rgba(220,240,228,0.7)" }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{w[key]} mg/L</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min((w[key]/max)*100,100)}%`, background:`linear-gradient(90deg,${color},${color}55)`, borderRadius:2, animation:`barFill 0.6s ease ${i*0.07}s both` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:14, background:"rgba(99,211,158,0.04)", borderRadius:14, border:"1px solid rgba(99,211,158,0.1)" }}>
              <div style={{ fontSize:10, color:"#63d39e", letterSpacing:2, textTransform:"uppercase", marginBottom:7 }}>Walter's Verdict</div>
              <div style={{ fontSize:13, color:"rgba(200,230,215,0.75)", lineHeight:1.75 }}>{w.verdict}</div>
            </div>
          </div>
          <NavBar />
        </div>
      );
    }

    return (
      <div style={app}>
        <style>{CSS}</style>
        <div style={{ padding:"52px 20px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#63d39e,#a8f0c8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Brands</div>
          <div style={{ fontSize:12, color:"rgba(200,230,215,0.38)", marginBottom:14 }}>{WATER_DB.length} brands analyzed · Premium to Dollar Store</div>
          <input value={brandSearch} onChange={e=>setBrandSearch(e.target.value)} placeholder="🔍 Search brands..." style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, color:"#e4ede8", fontSize:13, marginBottom:10 }} />
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:6, marginBottom:6 }}>
            {[["all","All"],["premium","💎 Premium"],["midtier","🔵 Mid"],["budget","💚 Budget"],["specialty","⭐ Special"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setBrandTier(id)} style={{ padding:"5px 11px", background:brandTier===id?"rgba(99,211,158,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${brandTier===id?"rgba(99,211,158,0.3)":"rgba(255,255,255,0.06)"}`, borderRadius:18, fontSize:10, fontWeight:brandTier===id?700:400, color:brandTier===id?"#63d39e":"rgba(200,230,215,0.4)", whiteSpace:"nowrap" }}>{label}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:10, marginBottom:4 }}>
            {[["score","Score"],["magnesium","Magnesium"],["calcium","Calcium"],["price","Price ↑"]].map(([id,label])=>(
              <button key={id} className="btn" onClick={()=>setBrandSort(id)} style={{ padding:"4px 9px", background:brandSort===id?"rgba(96,165,250,0.12)":"rgba(255,255,255,0.02)", border:`1px solid ${brandSort===id?"rgba(96,165,250,0.28)":"rgba(255,255,255,0.05)"}`, borderRadius:16, fontSize:9, fontWeight:brandSort===id?700:400, color:brandSort===id?"#60a5fa":"rgba(200,230,215,0.35)", whiteSpace:"nowrap" }}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize:10, color:"rgba(200,230,215,0.28)", marginBottom:10 }}>{filtered.length} results</div>
          {filtered.map((w,i)=>{
            const grade = getGrade(w.score);
            const lsiSt = getLSIStatus(w.lsi);
            return (
              <div key={w.id} className="card" onClick={()=>setSelBrand(w)} style={{ padding:13, background:"rgba(255,255,255,0.02)", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", marginBottom:8, position:"relative", overflow:"hidden", animation:`fadeUp 0.3s ease ${Math.min(i*0.03,0.4)}s both` }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${w.color}50,transparent)` }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:20 }}>{w.logo}</span>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#e4ede8" }}>{w.name}</div>
                      <div style={{ fontSize:9, color:"rgba(200,230,215,0.32)", marginTop:1 }}>{w.tier} · {w.type.split(" ").slice(0,2).join(" ")}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:grade.color }}>{grade.grade}</div>
                    <div style={{ fontSize:9, color:"rgba(200,230,215,0.3)" }}>{w.score}/100</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4, marginBottom:7 }}>
                  {[["pH",w.pH,"#60a5fa"],["Mg",w.magnesium,"#63d39e"],["Ca",w.calcium,"#a78bfa"],["LSI",w.lsi>0?`+${w.lsi}`:w.lsi,lsiSt.color],["$/L",`$${w.price.toFixed(2)}`,"#fbbf24"]].map(([l,v,c],j)=>(
                    <div key={j} style={{ padding:"4px 2px", background:"rgba(255,255,255,0.02)", borderRadius:6, textAlign:"center" }}>
                      <div style={{ fontSize:7.5, color:"rgba(200,230,215,0.28)", marginBottom:1 }}>{l}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:10, color:"rgba(200,230,215,0.4)", lineHeight:1.5 }}>{w.verdict.substring(0,70)}...</div>
              </div>
            );
          })}
        </div>
        <NavBar />
      </div>
    );
  }

  // CITIES
  if (tab === "cities") {
    const filtered = CITIES.filter(c=>c.name.toLowerCase().includes(citySearch.toLowerCase()));
    return (
      <div style={app}>
        <style>{CSS}</style>
        <div style={{ padding:"52px 22px 0" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a78bfa,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>City Water</div>
          <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:16 }}>20 US cities · Tap water scored by Walter</div>
          <input value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="🔍 Search your city..." style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, color:"#e4ede8", fontSize:13, marginBottom:14 }} />
          {selCity && (()=>{
            const lsi = calcLSI(selCity);
            const status = getLSIStatus(lsi);
            return (
              <div style={{ padding:18, background:status.bg, borderRadius:18, border:`1px solid ${status.color}25`, marginBottom:14, animation:"scaleIn 0.4s ease both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#e4ede8" }}>{selCity.name}</div>
                    <div style={{ fontSize:11, color:"rgba(200,230,215,0.4)", marginTop:2 }}>Municipal tap water · Walter's analysis</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:34, fontWeight:800, color:status.color, lineHeight:1 }}>{lsi>0?"+":""}{lsi}</div>
                    <div style={{ fontSize:11, color:status.color }}>{status.emoji} {status.label}</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:10 }}>
                  {[["pH",selCity.pH],["TDS",`${selCity.tds} mg/L`],["Calcium",`${selCity.calcium} mg/L`]].map(([l,v],i)=>(
                    <div key={i} style={{ padding:"8px", background:"rgba(255,255,255,0.05)", borderRadius:10, textAlign:"center" }}>
                      <div style={{ fontSize:9, color:"rgba(200,230,215,0.35)", marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#a78bfa" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.65 }}>
                  {status.label==="Balanced" ? "Walter says: Your city water is well balanced. Good baseline for daily hydration." : status.label.includes("Aggressive") ? "Walter says: Your tap water is aggressive. Add a remineralizing filter or supplement with mineral-rich bottled water." : "Walter says: High mineral content tap water. Generally safe — consider a softening filter if you notice buildup."}
                </div>
              </div>
            );
          })()}
          {filtered.map((city,i)=>{
            const lsi = calcLSI(city);
            const status = getLSIStatus(lsi);
            return (
              <button key={i} className="card" onClick={()=>setSelCity(city)} style={{ width:"100%", padding:"13px 15px", background:selCity?.name===city.name?status.bg:"rgba(255,255,255,0.025)", border:`1px solid ${selCity?.name===city.name?status.color+"30":"rgba(255,255,255,0.05)"}`, borderRadius:13, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, animation:`fadeUp 0.3s ease ${i*0.03}s both` }}>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"rgba(220,240,228,0.88)" }}>{city.name}</div>
                  <div style={{ fontSize:10, color:"rgba(200,230,215,0.35)", marginTop:2 }}>pH {city.pH} · TDS {city.tds} · Ca {city.calcium} mg/L</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:status.color }}>{lsi>0?"+":""}{lsi}</div>
                  <div style={{ fontSize:9, color:status.color, marginTop:1 }}>{status.emoji} {status.label}</div>
                </div>
              </button>
            );
          })}
        </div>
        <NavBar />
      </div>
    );
  }

  // LEARN
  const EDUCATION = [
    { title:"What is LSI?",         icon:"🔬", color:"#00d4ff", content:"The Langelier Saturation Index measures whether water is corrosive (negative), balanced (near zero), or scale-forming (positive). Negative LSI water actively pulls minerals from your body." },
    { title:"Aggressive Water",     icon:"⚗️", color:"#ff6b35", content:"Water with negative LSI is aggressive — like a dry sponge it pulls calcium and magnesium from your teeth, bones, and tissues with every glass over time." },
    { title:"Why Minerals Matter",  icon:"💎", color:"#7c3aed", content:"Calcium supports bones and heart. Magnesium powers 300+ enzymatic reactions. These minerals in water are your body's daily baseline supplement." },
    { title:"Distilled Water Risk", icon:"⚠️", color:"#dc2626", content:"Distilled water has zero minerals — the most aggressive water possible. Long-term consumption depletes bone density and disrupts electrolytes." },
    { title:"The WHO Standard",     icon:"🌍", color:"#059669", content:"The World Health Organization recommends minimum levels of calcium (50-100 mg/L) and magnesium (25-50 mg/L) in all drinking water for long-term health." },
    { title:"Plastic vs Glass",     icon:"🫙", color:"#d97706", content:"Aggressive water stored in plastic leaches BPA and microplastics. Glass containers are always preferred. Aluminum cans are a safer alternative." },
  ];

  return (
    <div style={app}>
      <style>{CSS}</style>
      <div style={{ padding:"52px 22px 0" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>Water Academy</div>
        <div style={{ fontSize:13, color:"rgba(200,230,215,0.45)", marginBottom:18 }}>Walter explains the science</div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:14 }}>
          {EDUCATION.map((e,i)=>(
            <button key={i} className="btn" onClick={()=>setEduIdx(i)} style={{ padding:"6px 12px", background:eduIdx===i?`${e.color}15`:"rgba(255,255,255,0.03)", border:`1px solid ${eduIdx===i?e.color+"40":"rgba(255,255,255,0.06)"}`, borderRadius:20, fontSize:10, color:eduIdx===i?e.color:"rgba(200,230,215,0.4)", whiteSpace:"nowrap", fontWeight:eduIdx===i?700:400, flexShrink:0 }}>
              {e.icon} {e.title}
            </button>
          ))}
        </div>
        <div style={{ padding:22, background:`${EDUCATION[eduIdx].color}0d`, borderRadius:20, border:`1px solid ${EDUCATION[eduIdx].color}20`, marginBottom:16, animation:"scaleIn 0.3s ease both" }}>
          <div style={{ fontSize:42, marginBottom:12 }}>{EDUCATION[eduIdx].icon}</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:EDUCATION[eduIdx].color, marginBottom:10 }}>{EDUCATION[eduIdx].title}</div>
          <div style={{ fontSize:14, color:"rgba(200,230,215,0.75)", lineHeight:1.8 }}>{EDUCATION[eduIdx].content}</div>
        </div>
        {[
          { icon:"🌍", fact:"Over 2 billion people lack access to safe drinking water. Flo·zēk is designed to democratize water health knowledge." },
          { icon:"🦴", fact:"Osteoporosis costs the US $57 billion annually — water quality is a contributing and preventable factor." },
          { icon:"❤️", fact:"Communities with mineral-rich water have statistically lower rates of cardiovascular disease." },
          { icon:"🧠", fact:"Magnesium deficiency affects an estimated 50% of Americans and is linked to anxiety, depression, and migraines." },
          { icon:"💧", fact:"The WHO recommends minimum calcium (50-100 mg/L) and magnesium (25-50 mg/L) in all drinking water." },
        ].map((f,i)=>(
          <div key={i} style={{ display:"flex", gap:12, padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{f.icon}</span>
            <span style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.7 }}>{f.fact}</span>
          </div>
        ))}
        <div style={{ marginTop:16, padding:16, background:"linear-gradient(135deg,rgba(99,211,158,0.07),rgba(96,165,250,0.04))", borderRadius:16, border:"1px solid rgba(99,211,158,0.1)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#63d39e", marginBottom:6 }}>🌍 Flo·zēk Mission</div>
          <div style={{ fontSize:12, color:"rgba(200,230,215,0.6)", lineHeight:1.7 }}>A portion of every Pro subscription goes toward clean water access in communities that need it most. Knowledge should protect everyone.</div>
        </div>
      </div>
      <NavBar />
    </div>
  );
          }
