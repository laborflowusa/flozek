import { useState } from "react";

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
  { id:21, name:"Essentia",          tier:"midtier",  logo:"⚗️", color:"#8b5cf6", pH:9.5, calcium:0,   magnesium:0,   sodium:7,   tds:35,   bicarbonate:0,    price:1.80, plastic:true,  type:"Ionized Alkaline",  origin:"Municipal tap, ionized",         verdict:"High pH via ionization, NOT natural minerals. Zero Ca and Mg undermines all alkaline health claims." },
  { id:22, name:"Eternal",           tier:"midtier",  logo:"♾️", color:"#6ee7b7", pH:8.1, calcium:22,  magnesium:8,   sodium:6,   tds:100,  bicarbonate:95,   price:1.30, plastic:true,  type:"Natural Still",     origin:"Natural Springs, USA/Canada",    verdict:"Naturally alkaline spring with modest minerals. Better than artificially alkaline brands." },
  { id:23, name:"Core Hydration",    tier:"midtier",  logo:"🔵",  color:"#38bdf8", pH:7.4, calcium:0,   magnesium:0,   sodium:0,   tds:10,   bicarbonate:0,    price:1.50, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Ultra-purified near-zero TDS with pH adjusted. Despite claims, mineral content is essentially zero." },
  { id:24, name:"Liquid Death",      tier:"specialty",logo:"💀",  color:"#475569", pH:7.0, calcium:14,  magnesium:5,   sodium:10,  tds:100,  bicarbonate:74,   price:1.80, plastic:false, type:"Natural Still",     origin:"Austrian Alps, Austria",         verdict:"Austrian alpine water in aluminum cans. Decent minerals for price. Sustainable packaging positive." },
  { id:25, name:"Flow Alkaline",     tier:"specialty",logo:"🌊",  color:"#67e8f9", pH:8.1, calcium:38,  magnesium:13,  sodium:6,   tds:148,  bicarbonate:128,  price:2.20, plastic:false, type:"Artesian Alkaline", origin:"Canadian Artesian Spring",       verdict:"Naturally alkaline Canadian artesian with real minerals behind the pH. Eco-friendly packaging." },
  { id:26, name:"Just Water",        tier:"specialty",logo:"🌍",  color:"#4ade80", pH:8.0, calcium:24,  magnesium:8,   sodium:5,   tds:98,   bicarbonate:90,   price:1.90, plastic:false, type:"Natural Still",     origin:"Glens Falls, NY Spring",         verdict:"Naturally alkaline NY spring in plant-based packaging. Decent minerals, strong eco credentials." },
  { id:27, name:"LaCroix",           tier:"specialty",logo:"🌈",  color:"#fb7185", pH:4.7, calcium:0,   magnesium:0,   sodium:2,   tds:10,   bicarbonate:0,    price:0.85, plastic:false, type:"Sparkling Purified", origin:"Municipal tap plus CO2",         verdict:"Popular purified sparkling. Acidic pH from carbonation. Zero minerals. Occasional variety only." },
  { id:28, name:"Pure Life",         tier:"budget",   logo:"💧",  color:"#3b82f6", pH:7.2, calcium:18,  magnesium:5,   sodium:8,   tds:95,   bicarbonate:45,   price:0.60, plastic:true,  type:"Purified Remineralized", origin:"Municipal tap, remineralized", verdict:"Purified tap with minerals added back. Balanced LSI. Best budget remineralized option." },
  { id:29, name:"Dasani",            tier:"budget",   logo:"🏭",  color:"#94a3b8", pH:5.6, calcium:0,   magnesium:0,   sodium:6,   tds:20,   bicarbonate:0,    price:0.80, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Filtered municipal with acidic pH and near-zero minerals. One of the poorest health choices available." },
  { id:30, name:"Aquafina",          tier:"budget",   logo:"🏭",  color:"#94a3b8", pH:6.0, calcium:0,   magnesium:0,   sodium:0,   tds:10,   bicarbonate:0,    price:0.75, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Lowest TDS in database. Near-maximally aggressive. Removes contaminants AND all beneficial minerals." },
  { id:31, name:"Great Value",       tier:"budget",   logo:"🛒",  color:"#fde047", pH:6.5, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.25, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Walmart store brand. Lowest cost accessible. Better pH than Dasani. Zero minerals but clean water." },
  { id:32, name:"Kirkland",          tier:"budget",   logo:"🏪",  color:"#ef4444", pH:6.8, calcium:0,   magnesium:0,   sodium:3,   tds:15,   bicarbonate:0,    price:0.20, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Costco bulk. Best value per gallon. Better pH than most purified waters. Zero minerals." },
  { id:33, name:"Crystal Geyser",    tier:"budget",   logo:"🗻",  color:"#22d3ee", pH:6.9, calcium:14,  magnesium:5,   sodium:4,   tds:74,   bicarbonate:57,   price:0.50, plastic:true,  type:"Natural Still",     origin:"Mount Shasta, CA Springs",       verdict:"Genuine spring from Mt. Shasta at budget price. Best mineral-containing option at the budget tier." },
  { id:34, name:"Dollar Tree",       tier:"budget",   logo:"🌳",  color:"#86efac", pH:6.7, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.17, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Lowest cost in database. Critically important clean water access for underserved communities." },
  { id:35, name:"Kirkland Sparkling",tier:"budget",   logo:"🫧",  color:"#67e8f9", pH:5.8, calcium:35,  magnesium:8,   sodium:8,   tds:130,  bicarbonate:105,  price:0.35, plastic:false, type:"Natural Sparkling", origin:"Natural Spring plus CO2",        verdict:"Costco sparkling with real spring minerals. Best value sparkling water with actual mineral content." },
  { id:36, name:"Aldi Store Brand",  tier:"budget",   logo:"🏷️", color:"#a3e635", pH:7.0, calcium:0,   magnesium:0,   sodium:5,   tds:15,   bicarbonate:0,    price:0.19, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Aldi house brand. Neutral pH is one of best in budget purified category. Excellent community value." },
  { id:37, name:"Members Mark",      tier:"budget",   logo:"🏬",  color:"#f97316", pH:6.7, calcium:0,   magnesium:0,   sodium:4,   tds:14,   bicarbonate:0,    price:0.22, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Sams Club store brand. Ultra-low cost clean water. Widely available, very affordable for families." },
  { id:38, name:"Niagara",           tier:"budget",   logo:"🌊",  color:"#67e8f9", pH:6.9, calcium:0,   magnesium:0,   sodium:5,   tds:18,   bicarbonate:0,    price:0.28, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"One of largest US bottlers. Reasonable pH for a purified product. Budget accessible." },
  { id:39, name:"Target GoodGather", tier:"budget",   logo:"🎯",  color:"#ef4444", pH:7.0, calcium:0,   magnesium:0,   sodium:4,   tds:12,   bicarbonate:0,    price:0.22, plastic:true,  type:"Purified",          origin:"Municipal tap, purified",        verdict:"Target house brand. Clean neutral pH. Zero minerals. One of cleaner-profile budget purified waters." },
  { id:40, name:"Proud Source",      tier:"specialty",logo:"🏔️", color:"#f97316", pH:7.8, calcium:35,  magnesium:12,  sodium:7,   tds:148,  bicarbonate:140,  price:2.10, plastic:false, type:"Artesian Still",    origin:"Snake River Plain Aquifer, ID",  verdict:"Idaho artesian in aluminum can. Good mineral profile, naturally alkaline. Strong health and eco profile." },
];

const CITIES = [
  { name:"New York, NY",          state:"NY", pH:7.2, tds:50,  calcium:14, bicarbonate:30,  region:"tristate" },
  { name:"Los Angeles, CA",       state:"CA", pH:7.8, tds:280, calcium:68, bicarbonate:120, region:"west" },
  { name:"Chicago, IL",           state:"IL", pH:7.4, tds:165, calcium:45, bicarbonate:75,  region:"midwest" },
  { name:"Houston, TX",           state:"TX", pH:7.9, tds:310, calcium:75, bicarbonate:130, region:"south" },
  { name:"Phoenix, AZ",           state:"AZ", pH:7.6, tds:420, calcium:95, bicarbonate:155, region:"west" },
  { name:"Philadelphia, PA",      state:"PA", pH:7.1, tds:120, calcium:28, bicarbonate:55,  region:"tristate" },
  { name:"San Antonio, TX",       state:"TX", pH:7.7, tds:380, calcium:85, bicarbonate:145, region:"south" },
  { name:"San Diego, CA",         state:"CA", pH:7.5, tds:490, calcium:110,bicarbonate:165, region:"west" },
  { name:"Dallas, TX",            state:"TX", pH:7.8, tds:290, calcium:70, bicarbonate:125, region:"south" },
  { name:"Miami, FL",             state:"FL", pH:7.3, tds:200, calcium:52, bicarbonate:85,  region:"fl" },
  { name:"Atlanta, GA",           state:"GA", pH:6.9, tds:65,  calcium:18, bicarbonate:28,  region:"south" },
  { name:"Seattle, WA",           state:"WA", pH:7.0, tds:45,  calcium:12, bicarbonate:22,  region:"west" },
  { name:"Denver, CO",            state:"CO", pH:7.6, tds:175, calcium:42, bicarbonate:78,  region:"west" },
  { name:"Boston, MA",            state:"MA", pH:7.1, tds:90,  calcium:22, bicarbonate:40,  region:"northeast" },
  { name:"Detroit, MI",           state:"MI", pH:7.4, tds:155, calcium:38, bicarbonate:70,  region:"midwest" },
  { name:"Nashville, TN",         state:"TN", pH:7.5, tds:210, calcium:55, bicarbonate:92,  region:"south" },
  { name:"Portland, OR",          state:"OR", pH:7.1, tds:50,  calcium:14, bicarbonate:25,  region:"west" },
  { name:"Las Vegas, NV",         state:"NV", pH:8.0, tds:550, calcium:125,bicarbonate:180, region:"west" },
  { name:"Minneapolis, MN",       state:"MN", pH:7.6, tds:200, calcium:52, bicarbonate:88,  region:"midwest" },
  { name:"New Orleans, LA",       state:"LA", pH:7.8, tds:175, calcium:42, bicarbonate:80,  region:"south" },
  { name:"Buffalo, NY",           state:"NY", pH:7.5, tds:165, calcium:42, bicarbonate:78,  region:"ny" },
  { name:"Rochester, NY",         state:"NY", pH:7.4, tds:145, calcium:38, bicarbonate:68,  region:"ny" },
  { name:"Syracuse, NY",          state:"NY", pH:7.3, tds:130, calcium:34, bicarbonate:62,  region:"ny" },
  { name:"Albany, NY",            state:"NY", pH:7.2, tds:85,  calcium:20, bicarbonate:38,  region:"ny" },
  { name:"Yonkers, NY",           state:"NY", pH:7.2, tds:55,  calcium:15, bicarbonate:32,  region:"tristate" },
  { name:"Long Island Nassau",    state:"NY", pH:7.4, tds:175, calcium:44, bicarbonate:80,  region:"tristate" },
  { name:"Long Island Suffolk",   state:"NY", pH:7.3, tds:155, calcium:38, bicarbonate:70,  region:"tristate" },
  { name:"Westchester, NY",       state:"NY", pH:7.2, tds:60,  calcium:16, bicarbonate:34,  region:"tristate" },
  { name:"Poughkeepsie, NY",      state:"NY", pH:7.3, tds:95,  calcium:24, bicarbonate:45,  region:"ny" },
  { name:"Newburgh, NY",          state:"NY", pH:7.1, tds:80,  calcium:20, bicarbonate:38,  region:"ny" },
  { name:"Newark, NJ",            state:"NJ", pH:7.1, tds:55,  calcium:13, bicarbonate:28,  region:"tristate" },
  { name:"Jersey City, NJ",       state:"NJ", pH:7.2, tds:60,  calcium:15, bicarbonate:30,  region:"tristate" },
  { name:"Trenton, NJ",           state:"NJ", pH:7.4, tds:220, calcium:55, bicarbonate:95,  region:"nj" },
  { name:"Camden, NJ",            state:"NJ", pH:7.2, tds:135, calcium:32, bicarbonate:58,  region:"nj" },
  { name:"Paterson, NJ",          state:"NJ", pH:7.1, tds:65,  calcium:16, bicarbonate:30,  region:"tristate" },
  { name:"Elizabeth, NJ",         state:"NJ", pH:7.2, tds:97,  calcium:24, bicarbonate:45,  region:"tristate" },
  { name:"East Orange, NJ",       state:"NJ", pH:7.8, tds:485, calcium:110,bicarbonate:165, region:"tristate" },
  { name:"Edison, NJ",            state:"NJ", pH:7.5, tds:185, calcium:46, bicarbonate:84,  region:"nj" },
  { name:"Woodbridge, NJ",        state:"NJ", pH:7.4, tds:170, calcium:42, bicarbonate:78,  region:"nj" },
  { name:"Toms River, NJ",        state:"NJ", pH:7.3, tds:115, calcium:28, bicarbonate:52,  region:"nj" },
  { name:"Hackensack, NJ",        state:"NJ", pH:7.2, tds:75,  calcium:18, bicarbonate:35,  region:"tristate" },
  { name:"Princeton, NJ",         state:"NJ", pH:7.3, tds:130, calcium:32, bicarbonate:58,  region:"nj" },
  { name:"Bridgeport, CT",        state:"CT", pH:7.2, tds:110, calcium:27, bicarbonate:50,  region:"ct" },
  { name:"New Haven, CT",         state:"CT", pH:7.1, tds:95,  calcium:24, bicarbonate:44,  region:"ct" },
  { name:"Hartford, CT",          state:"CT", pH:7.0, tds:75,  calcium:18, bicarbonate:32,  region:"ct" },
  { name:"Stamford, CT",          state:"CT", pH:7.1, tds:51,  calcium:13, bicarbonate:26,  region:"ct" },
  { name:"Waterbury, CT",         state:"CT", pH:7.2, tds:105, calcium:26, bicarbonate:48,  region:"ct" },
  { name:"Norwalk, CT",           state:"CT", pH:7.1, tds:88,  calcium:22, bicarbonate:40,  region:"ct" },
  { name:"Danbury, CT",           state:"CT", pH:7.0, tds:70,  calcium:17, bicarbonate:30,  region:"ct" },
  { name:"Greenwich, CT",         state:"CT", pH:7.1, tds:60,  calcium:15, bicarbonate:28,  region:"ct" },
  { name:"Allentown, PA",         state:"PA", pH:7.6, tds:222, calcium:56, bicarbonate:105, region:"lehigh" },
  { name:"Bethlehem, PA",         state:"PA", pH:7.2, tds:17,  calcium:4,  bicarbonate:14,  region:"lehigh" },
  { name:"Easton, PA",            state:"PA", pH:7.1, tds:46,  calcium:11, bicarbonate:24,  region:"lehigh" },
  { name:"Reading, PA",           state:"PA", pH:7.4, tds:130, calcium:32, bicarbonate:60,  region:"pa" },
  { name:"Lancaster, PA",         state:"PA", pH:7.5, tds:163, calcium:41, bicarbonate:75,  region:"pa" },
  { name:"Harrisburg, PA",        state:"PA", pH:7.4, tds:137, calcium:34, bicarbonate:62,  region:"pa" },
  { name:"Scranton, PA",          state:"PA", pH:7.3, tds:115, calcium:28, bicarbonate:52,  region:"pa" },
  { name:"Pittsburgh, PA",        state:"PA", pH:7.4, tds:130, calcium:32, bicarbonate:58,  region:"pa" },
  { name:"York, PA",              state:"PA", pH:7.3, tds:89,  calcium:22, bicarbonate:42,  region:"pa" },
  { name:"Wilkes-Barre, PA",      state:"PA", pH:7.3, tds:108, calcium:27, bicarbonate:50,  region:"pa" },
  { name:"Kutztown, PA",          state:"PA", pH:7.4, tds:145, calcium:36, bicarbonate:66,  region:"lehigh" },
  { name:"Tampa, FL",             state:"FL", pH:7.8, tds:285, calcium:68, bicarbonate:120, region:"fl" },
  { name:"Orlando, FL",           state:"FL", pH:7.6, tds:245, calcium:58, bicarbonate:105, region:"fl" },
  { name:"Jacksonville, FL",      state:"FL", pH:7.5, tds:190, calcium:46, bicarbonate:88,  region:"fl" },
  { name:"Fort Lauderdale, FL",   state:"FL", pH:7.9, tds:310, calcium:74, bicarbonate:130, region:"fl" },
  { name:"Tallahassee, FL",       state:"FL", pH:7.2, tds:125, calcium:30, bicarbonate:58,  region:"fl" },
  { name:"Gainesville, FL",       state:"FL", pH:7.4, tds:168, calcium:42, bicarbonate:78,  region:"fl" },
  { name:"Sarasota, FL",          state:"FL", pH:7.7, tds:260, calcium:62, bicarbonate:112, region:"fl" },
  { name:"Cape Coral, FL",        state:"FL", pH:7.8, tds:290, calcium:70, bicarbonate:125, region:"fl" },
  { name:"St Petersburg, FL",     state:"FL", pH:7.6, tds:240, calcium:56, bicarbonate:100, region:"fl" },
  { name:"Pensacola, FL",         state:"FL", pH:7.3, tds:145, calcium:36, bicarbonate:68,  region:"fl" },
  { name:"Columbus, OH",          state:"OH", pH:7.5, tds:235, calcium:58, bicarbonate:102, region:"oh" },
  { name:"Cleveland, OH",         state:"OH", pH:7.4, tds:195, calcium:48, bicarbonate:88,  region:"oh" },
  { name:"Cincinnati, OH",        state:"OH", pH:7.6, tds:260, calcium:64, bicarbonate:112, region:"oh" },
  { name:"Toledo, OH",            state:"OH", pH:7.5, tds:220, calcium:54, bicarbonate:98,  region:"oh" },
  { name:"Akron, OH",             state:"OH", pH:7.3, tds:175, calcium:42, bicarbonate:80,  region:"oh" },
  { name:"Dayton, OH",            state:"OH", pH:7.4, tds:205, calcium:50, bicarbonate:92,  region:"oh" },
  { name:"Youngstown, OH",        state:"OH", pH:7.2, tds:155, calcium:38, bicarbonate:72,  region:"oh" },
  { name:"Canton, OH",            state:"OH", pH:7.4, tds:190, calcium:46, bicarbonate:85,  region:"oh" },
  { name:"Charlotte, NC",         state:"NC", pH:7.2, tds:125, calcium:30, bicarbonate:56,  region:"nc" },
  { name:"Raleigh, NC",           state:"NC", pH:7.1, tds:95,  calcium:22, bicarbonate:42,  region:"nc" },
  { name:"Greensboro, NC",        state:"NC", pH:7.2, tds:110, calcium:27, bicarbonate:50,  region:"nc" },
  { name:"Durham, NC",            state:"NC", pH:7.1, tds:100, calcium:24, bicarbonate:45,  region:"nc" },
  { name:"Winston-Salem, NC",     state:"NC", pH:7.3, tds:135, calcium:33, bicarbonate:62,  region:"nc" },
  { name:"Fayetteville, NC",      state:"NC", pH:7.2, tds:118, calcium:28, bicarbonate:52,  region:"nc" },
  { name:"Wilmington, NC",        state:"NC", pH:7.4, tds:155, calcium:38, bicarbonate:70,  region:"nc" },
  { name:"Asheville, NC",         state:"NC", pH:6.9, tds:65,  calcium:16, bicarbonate:28,  region:"nc" },
  { name:"Columbia, SC",          state:"SC", pH:7.2, tds:115, calcium:27, bicarbonate:52,  region:"sc" },
  { name:"Charleston, SC",        state:"SC", pH:7.5, tds:185, calcium:44, bicarbonate:82,  region:"sc" },
  { name:"Greenville, SC",        state:"SC", pH:7.1, tds:88,  calcium:20, bicarbonate:40,  region:"sc" },
  { name:"Rock Hill, SC",         state:"SC", pH:7.3, tds:130, calcium:32, bicarbonate:58,  region:"sc" },
  { name:"Spartanburg, SC",       state:"SC", pH:7.2, tds:110, calcium:26, bicarbonate:50,  region:"sc" },
  { name:"Myrtle Beach, SC",      state:"SC", pH:7.5, tds:195, calcium:47, bicarbonate:88,  region:"sc" },
  { name:"Hilton Head, SC",       state:"SC", pH:7.4, tds:170, calcium:40, bicarbonate:76,  region:"sc" },
  { name:"Summerville, SC",       state:"SC", pH:7.3, tds:140, calcium:34, bicarbonate:64,  region:"sc" },
];

const GLOSSARY = [
  { term:"LSI", full:"Langelier Saturation Index", icon:"🔬", color:"#00d4ff", def:"A scientific formula that measures whether water is corrosive (negative), balanced (near zero), or scale-forming (positive). Negative LSI water pulls calcium and magnesium from your body with every sip. The ideal range is -0.2 to +0.2.", example:"Dasani LSI: -1.8 (very aggressive). Evian LSI: +0.1 (balanced)." },
  { term:"TDS", full:"Total Dissolved Solids", icon:"💧", color:"#63d39e", def:"The total concentration of dissolved minerals, salts, and metals in water, measured in mg/L. Higher TDS from natural minerals is generally positive for health.", example:"NYC tap: 50 mg/L (very low). Gerolsteiner: 2527 mg/L (very high, mineral-rich)." },
  { term:"pH", full:"Potential of Hydrogen", icon:"⚗️", color:"#a78bfa", def:"A scale from 0-14 measuring how acidic or alkaline water is. 7.0 is neutral. Below 7 is acidic. Above 7 is alkaline. Ideal drinking water pH is 7.0-8.5.", example:"Aquafina: pH 6.0 (acidic). Evian: pH 7.2 (ideal). Icelandic Glacial: pH 8.4 (alkaline)." },
  { term:"Calcium", full:"Calcium Hardness", icon:"🦴", color:"#fbbf24", def:"Essential mineral for bone density, muscle contraction, nerve transmission, and heart rhythm. WHO recommends 50-100 mg/L minimum in drinking water.", example:"Contrex: 486 mg/L (exceptional). Aquafina: 0 mg/L (none at all)." },
  { term:"Magnesium", full:"Magnesium Content", icon:"⚡", color:"#34d399", def:"The master mineral involved in 300+ enzymatic reactions. Regulates sleep, stress, muscle function, blood sugar, and heart rhythm. Up to 50% of Americans are deficient.", example:"Apollinaris: 130 mg/L (highest available). Smartwater: 0 mg/L (none)." },
  { term:"Bicarbonate", full:"Bicarbonate Alkalinity", icon:"🌊", color:"#60a5fa", def:"Acts as a natural buffer that neutralizes acidity in water and in your body. Higher bicarbonate content protects tooth enamel and is a key component in LSI calculation.", example:"Gerolsteiner: 1816 mg/L. Dasani: 0 mg/L." },
  { term:"Sodium", full:"Sodium Content", icon:"🧂", color:"#f97316", def:"Naturally present in all water in small amounts. High sodium water above 200 mg/L can be a concern for people managing blood pressure.", example:"Apollinaris: 410 mg/L (very high). Mountain Valley: 3 mg/L (excellent)." },
  { term:"Hardness", full:"Water Hardness", icon:"💎", color:"#c084fc", def:"A measure of calcium and magnesium content in water. Soft water 0-75 ppm is low in beneficial minerals. Hard water 150+ ppm contains more minerals.", example:"Bethlehem PA: very soft 17 ppm. Allentown PA: moderately hard 222 ppm." },
  { term:"Aggressive", full:"Aggressive or Corrosive Water", icon:"⚠️", color:"#ef4444", def:"Water with a negative LSI that actively dissolves minerals it contacts including the calcium in your teeth and bones. Purified waters like Dasani are highly aggressive.", example:"Any water with LSI below -0.5 is classified as aggressive by Walter." },
  { term:"Artesian", full:"Artesian Spring Water", icon:"🏔️", color:"#84cc16", def:"Water drawn from a confined underground aquifer where natural pressure pushes water to the surface without pumping. Often mineral-rich from geological layers.", example:"Fiji Water comes from an artesian aquifer in the Fijian volcanic highlands." },
  { term:"WHO Standard", full:"World Health Organization Guideline", icon:"🌍", color:"#059669", def:"The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely.", example:"Only 12 of the 40 brands Walter tracks meet WHO mineral minimums." },
];

const calcLSI = (w) => {
  const A = w.tds < 50 ? 0.07 : w.tds < 150 ? 0.14 : w.tds < 300 ? 0.19 : w.tds < 500 ? 0.22 : 0.26;
  const C = w.calcium < 25 ? 1.0 : w.calcium < 50 ? 1.3 : w.calcium < 100 ? 1.6 : w.calcium < 200 ? 1.9 : 2.2;
  const D = w.bicarbonate < 25 ? 1.1 : w.bicarbonate < 50 ? 1.4 : w.bicarbonate < 100 ? 1.7 : w.bicarbonate < 200 ? 2.0 : 2.3;
  return parseFloat((w.pH - ((9.3 + A + 1.0) - (C + D))).toFixed(2));
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
  const lsi = calcLSI(w);
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
            "Dasani scores a D. Aquafina scores a D. Your body deserves better and I am going to show you exactly what to drink instead."
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"🔬", title:"Test My Water",  sub:"LSI Calculator",      id:"test",   color:"#00d4ff" },
            { icon:"💧", title:"Browse Brands",  sub:"40 brands analyzed",  id:"brands", color:"#63d39e" },
            { icon:"🌆", title:"City Water",     sub:"96 cities scored",    id:"cities", color:"#a78bfa" },
            { icon:"📚", title:"Water Academy",  sub:"Science plus Glossary", id:"learn", color:"#fbbf24" },
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
        <div style={{ padding:16, background:"rgba(255,255,255,0.02)", borderRadius:16, border:"1px solid rgba(255,255,255,0.05)", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"rgba(200,230,215,0.35)", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>LSI Health Scale</div>
          <div style={{ display:"flex", gap:5 }}>
            {[["Aggressive","#ef4444","below -0.5"],["Low Mineral","#f97316","-0.5 to -0.2"],["Ideal","#22c55e","-0.2 to 0.2"],["Scaling","#eab308","above 0.2"]].map(([l,c,r],i)=>(
              <div key={i} style={{ flex:1, textAlign:"center" }}>
                <div style={{ height:5, background:c, borderRadius:3, marginBottom:5 }} />
                <div style={{ fontSize:8, color:"rgba(200,230,215,0.5)" }}>{l}</div>
                <div style={{ fontSize:7, color:"rgba(200,230,215,0.25)", marginTop:1 }}>{r}</div>
              </div>
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
      { id:1,  label:"Muscle cramps",       mineral:"Magnesium",   icon:"⚡" },
      { id:2,  label:"Poor sleep",          mineral:"Magnesium",   icon:"🌙" },
      { id:3,  label:"Chronic fatigue",     mineral:"Magnesium",   icon:"😴" },
      { id:4,  label:"Frequent headaches",  mineral:"Magnesium",   icon:"🧠" },
      { id:5,  label:"Brittle nails/hair",  mineral:"Calcium",     icon:"💅" },
      { id:6,  label:"Anxiety/Depression",  mineral:"Magnesium",   icon:"😰" },
      { id:7,  label:"Irregular heartbeat", mineral:"Magnesium",   icon:"❤️" },
      { id:8,  label:"Brain fog",           mineral:"Electrolytes",icon:"🌫️" },
      { id:9,  label:"Joint/bone pain",     mineral:"Calcium",     icon:"🦴" },
      { id:10, label:"Constipation",        mineral:"Magnesium",   icon:"🔄" },
      { id:11, label:"High blood pressure", mineral:"Magnesium",   icon:"🩺" },
      { id:12, label:"Tooth sensitivity",   mineral:"Calcium",     icon:"🦷" },
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
            { key:"pH",          label:"pH Level",                    min:5,   max:10,  step:0.1, unit:"" },
            { key:"tds",         label:"TDS Total Dissolved Solids",  min:0,   max:1000,step:5,   unit:"mg/L" },
            { key:"calcium",     label:"Calcium Hardness",             min:0,   max:500, step:5,   unit:"mg/L" },
            { key:"bicarbonate", label:"Bicarbonate Alkalinity",       min:0,   max:500, step:5,   unit:"mg/L" },
          ].map((p)=>(
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
      .map(w => ({ ...w, score: getScore(w), lsi: calcLSI(w) }))
      .sort((a,b) => brandSort === "score" ? b.score - a.score : brandSort === "price" ? a.price - b.price : brandSort === "calcium" ? b.calcium - a.calcium : b.magnesium - a.magnesium);
    if (selBrand) {
      const w = { ...selBrand, score: getScore(selBrand), lsi: calcLSI(selBrand) };
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
                { label:"pH",     val:w.pH,            color:"#a78bfa" },
                { label:"Price",  val:`$${w.price}/L`, color:"#fbbf24" },
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
      { id:"all",      label:"All Cities"    },
      { id:"tristate", label:"Tri-State"     },
      { id:"ny",       label:"NY State"      },
      { id:"nj",       label:"New Jersey"    },
      { id:"ct",       label:"Connecticut"   },
      { id:"lehigh",   label:"Lehigh Valley" },
      { id:"pa",       label:"Pennsylvania"  },
      { id:"fl",       label:"Florida"       },
      { id:"oh",       label:"Ohio"          },
      { id:"nc",       label:"N Carolina"    },
      { id:"sc",       label:"S Carolina"    },
      { id:"south",    label:"South"         },
      { id:"west",     label:"West"          },
      { id:"midwest",  label:"Midwest"       },
      { id:"northeast",label:"Northeast"     },
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
    { title:"What is LSI", icon:"🔬", color:"#00d4ff", time:"3 min", content:"The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936. It measures whether water is corrosive, balanced, or scale-forming. Water with a negative LSI actively dissolves minerals it contacts including calcium in your teeth and bones. Most purified bottled waters score between -1.0 and -2.0, meaning they are aggressively stripping minerals. The ideal LSI range is -0.2 to +0.2. At this level water is in equilibrium with your body and neither deposits nor removes minerals." },
    { title:"The Mineral Gap", icon:"⚡", color:"#63d39e", time:"4 min", content:"Up to 50% of Americans are deficient in magnesium. The WHO recommends drinking water contain a minimum of 50-100 mg/L calcium and 25-50 mg/L magnesium. Most bottled waters fail this standard completely. Dasani, Aquafina, and Smartwater contain zero magnesium and zero calcium. Gerolsteiner contains 348 mg/L calcium and 108 mg/L magnesium meeting WHO standards in a single liter. The minerals you get from water are more bioavailable than those from food or supplements because they are already in ionic form ready for direct cellular absorption." },
    { title:"Hard vs Soft Water", icon:"💎", color:"#a78bfa", time:"3 min", content:"Hard water contains high concentrations of calcium and magnesium. Soft water contains very little. Epidemiological studies have consistently shown that populations drinking hard water have lower rates of cardiovascular disease than those drinking soft water. The landmark WHO report on drinking water quality concluded that water hardness is inversely associated with heart disease mortality. Las Vegas tap water is very hard at 550 TDS. Seattle tap water is very soft at 45 TDS. The sweet spot is 150-400 TDS from natural mineral sources." },
    { title:"pH and Your Body", icon:"⚗️", color:"#fbbf24", time:"3 min", content:"Your blood maintains a precise pH of 7.35-7.45. Drinking highly acidic water below pH 6.5 adds an acid load your kidneys must neutralize. Aquafina at pH 6.0 and LaCroix at pH 4.7 are both acidic. Natural alkaline spring waters like Evian pH 7.2 and Mountain Valley pH 7.8 align with your body chemistry. Artificially alkaline waters like Essentia use ionization to raise pH without adding minerals. The alkalinity is not backed by the bicarbonate buffer that makes natural alkaline water beneficial." },
    { title:"Reading Water Labels", icon:"📋", color:"#34d399", time:"4 min", content:"Every bottled water label tells a story. Look for source which can be spring, purified tap, or artesian. Check mineral content including calcium, magnesium, sodium, and bicarbonate in mg/L. Check TDS which is the sum of all minerals. Check pH which should ideally be 7.0-8.5. Red flags include purified or distilled without remineralization, zero or near-zero TDS, pH below 6.5. Green flags include natural spring or artesian source, calcium above 50 mg/L, magnesium above 20 mg/L, bicarbonate above 100 mg/L." },
    { title:"Municipal vs Bottled", icon:"🏙️", color:"#f97316", time:"4 min", content:"US municipal tap water is among the most regulated in the world under the Safe Drinking Water Act. The EPA sets maximum contaminant levels for over 90 substances. However tap water is optimized for safety not mineral content. NYC tap water scores an LSI of approximately -0.6 which is mildly aggressive. The real differentiator is mineral optimization not safety. Filtering tap water with a carbon filter removes chlorine and taste issues. Adding mineral drops post-filter can bring tap water close to premium spring water quality at a fraction of the cost." },
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
                <button className="btn" onClick={()=>setEduIdx(Math.max(0,eduIdx-1))} disabled={eduIdx===0} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:eduIdx===0?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)", cursor:eduIdx===0?"not-allowed":"pointer" }}>Previous</button>
                <span style={{ fontSize:11, color:"rgba(200,230,215,0.3)", alignSelf:"center" }}>{eduIdx+1} of {LESSONS.length}</span>
                <button className="btn" onClick={()=>setEduIdx(Math.min(LESSONS.length-1,eduIdx+1))} disabled={eduIdx===LESSONS.length-1} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:eduIdx===LESSONS.length-1?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)", cursor:eduIdx===LESSONS.length-1?"not-allowed":"pointer" }}>Next</button>
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
                <button className="btn" onClick={()=>setGlossaryIdx(Math.max(0,glossaryIdx-1))} disabled={glossaryIdx===0} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:glossaryIdx===0?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)", cursor:glossaryIdx===0?"not-allowed":"pointer" }}>Previous</button>
                <span style={{ fontSize:11, color:"rgba(200,230,215,0.3)", alignSelf:"center" }}>{glossaryIdx+1} of {GLOSSARY.length}</span>
                <button className="btn" onClick={()=>setGlossaryIdx(Math.min(GLOSSARY.length-1,glossaryIdx+1))} disabled={glossaryIdx===GLOSSARY.length-1} style={{ padding:"10px 18px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, fontSize:12, color:glossaryIdx===GLOSSARY.length-1?"rgba(200,230,215,0.2)":"rgba(200,230,215,0.6)", cursor:glossaryIdx===GLOSSARY.length-1?"not-allowed":"pointer" }}>Next</button>
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
  }

  return null;
          }
