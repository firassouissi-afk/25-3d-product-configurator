
const workspace=document.querySelector("#workspace");
const folder=location.pathname.split("/").filter(Boolean).at(-2)||"01-pixel-art-editor";
const status=t=>`<p class="status">${t}</p>`;
const canvasApp=(id)=>{
 const c=document.querySelector(`#${id}`),ctx=c.getContext("2d");
 ctx.fillStyle="#091522";ctx.fillRect(0,0,c.width,c.height);return [c,ctx];
};
const handlers={
"01-pixel-art-editor":()=>{
 workspace.innerHTML=`<div class="row"><input id="color" type="color" value="#64d8cb"><button id="clear">Clear</button><button id="frame">Save frame</button><button id="play">Play timeline</button></div><canvas id="pixel" width="640" height="380"></canvas><div id="frames" class="row"></div>`;
 const [c,ctx]=canvasApp("pixel"),frames=[];let drawing=false;
 const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.onpointerdown=e=>{drawing=true;c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(drawing){const[x,y]=pos(e);ctx.fillStyle=document.querySelector("#color").value;ctx.fillRect(Math.floor(x/10)*10,Math.floor(y/10)*10,10,10)}};c.onpointerup=()=>drawing=false;
 document.querySelector("#clear").onclick=()=>{ctx.fillStyle="#091522";ctx.fillRect(0,0,c.width,c.height)};
 document.querySelector("#frame").onclick=()=>{frames.push(ctx.getImageData(0,0,c.width,c.height));document.querySelector("#frames").innerHTML=frames.map((_,i)=>`<button class="secondary">Frame ${i+1}</button>`).join("")};
 document.querySelector("#play").onclick=()=>{let i=0;if(!frames.length)return;const timer=setInterval(()=>{ctx.putImageData(frames[i++%frames.length],0,0);if(i>frames.length*3)clearInterval(timer)},180)};
},
"02-markdown-notes":()=>{
 workspace.innerHTML=`<div class="shell"><textarea id="md" placeholder="# My note&#10;[[Ideas]]"></textarea><div id="preview" class="card"></div></div><div class="row"><input id="wiki" placeholder="[[Links to]]"><button id="save">Save note</button></div><div id="graph" class="card"></div>`;
 const md=document.querySelector("#md"),preview=document.querySelector("#preview"),graph=document.querySelector("#graph");
 md.value=localStorage.getItem("markdown-note")||"# Welcome\nUse [[Ideas]] wiki links.";
 const render=()=>{let html=md.value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/^# (.*)$/gm,"<h2>$1</h2>").replace(/\[\[(.*?)\]\]/g,"<strong style='color:#64d8cb'>[[$1]]</strong>").replace(/\n/g,"<br>");preview.innerHTML=html;const links=[...md.value.matchAll(/\[\[(.*?)\]\]/g)].map(x=>x[1]);graph.textContent=links.length?"Connected notes: "+links.join(", "):"No wiki links yet.";};md.oninput=render;render();
 document.querySelector("#save").onclick=()=>{localStorage.setItem("markdown-note",md.value);document.querySelector("#graph").insertAdjacentHTML("beforeend",status("Saved locally"));};
},
"03-physics-sandbox":()=>{
 workspace.innerHTML=`<div class="row"><button id="box">Add box</button><button id="bird">Launch ball</button></div><canvas id="matter" width="760" height="440"></canvas>`;
 const [c,ctx]=canvasApp("matter");let bodies=[];
 const draw=()=>{ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#091522";ctx.fillRect(0,0,c.width,c.height);for(const b of bodies){b.vy+=.22;b.x+=b.vx;b.y+=b.vy;if(b.y>b.yMax){b.y=b.yMax;b.vy*=-.72;b.vx*=.98}ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(draw)};
 document.querySelector("#box").onclick=()=>bodies.push({x:180,y:50,r:22,vx:2,vy:0,yMax:410,color:"#b8a0ff"});
 document.querySelector("#bird").onclick=()=>bodies.push({x:80,y:300,r:16,vx:8,vy:-8,yMax:410,color:"#64d8cb"});draw();
},
"04-typing-race":()=>{
 const words=["pixel","canvas","syntax","combo","level","race","browser","project","keyboard"];
 workspace.innerHTML=`<div class="card"><h2 id="word"></h2><input id="type" autocomplete="off" placeholder="Type the word"></div><div class="row"><b id="score">Score 0</b><b id="combo">Combo 0</b></div><ol id="leaderboard"></ol>`;
 let current=words[0],score=0,combo=0,difficulty=1;
 const next=()=>{current=words[Math.floor(Math.random()*words.length)];document.querySelector("#word").textContent=current};const input=document.querySelector("#type");next();
 input.oninput=()=>{if(input.value===current){score+=10+difficulty*combo;combo++;input.value="";next()}else combo=0;document.querySelector("#score").textContent=`Score ${score}`;document.querySelector("#combo").textContent=`Combo ${combo}`};
 document.querySelector("#word").insertAdjacentHTML("beforeend",status("Difficulty: medium"));
 const board=JSON.parse(localStorage.getItem("typing-scores")||"[]");board.push(score);localStorage.setItem("typing-scores",JSON.stringify(board.slice(-5)));document.querySelector("#leaderboard").innerHTML=board.slice().sort((a,b)=>b-a).slice(0,5).map(v=>`<li>${v} points</li>`).join("");
},
"05-music-theory-explorer":()=>{
 workspace.innerHTML=`<div class="row" id="piano"></div><div id="theory" class="card"></div>`;
 const notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];document.querySelector("#piano").innerHTML=notes.map(n=>`<button class="key">${n}</button>`).join("");
 document.querySelectorAll(".key").forEach((b,i)=>b.onclick=()=>{const n=b.textContent,scale=[notes[i],notes[(i+2)%12],notes[(i+4)%12],notes[(i+5)%12],notes[(i+7)%12],notes[(i+9)%12],notes[(i+11)%12],notes[(i+12)%12]];document.querySelector("#theory").innerHTML=`<h2>${n} major</h2><p>Scale: ${scale.join(" - ")}</p><p>Chords: ${n} major · ${notes[(i+2)%12]} minor · ${notes[(i+4)%12]} minor</p>`;const ctx=new AudioContext(),o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=261.63*Math.pow(2,i/12);g.gain.value=.12;o.connect(g).connect(ctx.destination);o.start();setTimeout(()=>o.stop(),350)});
},
"06-palette-extractor":()=>{
 workspace.innerHTML=`<div class="row"><input id="image" type="file" accept="image/*"><input id="foreground" type="color" value="#ffffff"><input id="background" type="color" value="#07111f"></div><div class="swatches" id="swatches"></div><div id="contrast" class="card"></div>`;
 const luminance=h=>{const rgb=h.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
 document.querySelector("#image").onchange=e=>{const c=document.createElement("canvas"),x=c.getContext("2d"),img=new Image();img.onload=()=>{c.width=120;c.height=120;x.drawImage(img,0,0,120,120);const d=x.getImageData(0,0,120,120).data,colors={};for(let i=0;i<d.length;i+=1600){const k=`${Math.round(d[i]/32)*32},${Math.round(d[i+1]/32)*32},${Math.round(d[i+2]/32)*32}`;colors[k]=(colors[k]||0)+1}const list=Object.entries(colors).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([rgb])=>"#"+rgb.split(",").map(v=>(+v).toString(16).padStart(2,"0")).join(""));document.querySelector("#swatches").innerHTML=list.map(c=>`<button style="background:${c}">${c}</button>`).join("")};img.src=URL.createObjectURL(e.target.files[0])};
 const check=()=>{const a=luminance(document.querySelector("#foreground").value.slice(1)),b=luminance(document.querySelector("#background").value.slice(1)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);document.querySelector("#contrast").innerHTML=`<h2>${ratio.toFixed(2)}:1 contrast</h2><p>${ratio>=7?"AAA":"No"} WCAG threshold</p>`};document.querySelectorAll("input[type=color]").forEach(x=>x.oninput=check);check();
},
"07-live-money-dashboard":()=>{
 workspace.innerHTML=`<div class="row"><input id="amount" type="number" value="100"><select id="currency"><option value="3.15">TND</option><option value="1">USD</option><option value=".92">EUR</option></select><button id="convert">Convert</button></div><div class="grid" id="rates"></div><canvas id="moneyChart" height="220"></canvas>`;
 const rates={TND:3.15,USD:1,EUR:.92};document.querySelector("#rates").innerHTML=Object.entries(rates).map(([k,v])=>`<div class="card"><b>${k}</b><br>${v}</div>`).join("");
 document.querySelector("#convert").onclick=()=>{const amount=+document.querySelector("#amount").value,rate=+document.querySelector("#currency").value;document.querySelector("#rates").insertAdjacentHTML("beforeend",`<div class="card">${(amount/rate).toFixed(2)} USD</div>`)};
 if(window.Chart)new Chart(document.querySelector("#moneyChart"),{type:"bar",data:{labels:Object.keys(rates),datasets:[{label:"Relative value",data:Object.values(rates),backgroundColor:"#64d8cb"}]}});
},
"08-mind-map-editor":()=>{
 workspace.innerHTML=`<div class="row"><input id="idea" placeholder="Idea"><button id="add">Add node</button><button id="export" class="secondary">Export SVG</button></div><svg id="map" viewBox="0 0 760 430" style="width:100%;border:1px solid #385a78;border-radius:13px"></svg>`;
 const svg=document.querySelector("#map"),ns="http://www.w3.org/2000/svg",nodes=[{x:380,y:215,text:"Central idea"}];
 const draw=()=>{svg.innerHTML="";nodes.forEach((n,i)=>{if(i){const line=document.createElementNS(ns,"line");line.setAttribute("x1","380");line.setAttribute("y1","215");line.setAttribute("x2",n.x);line.setAttribute("y2",n.y);line.setAttribute("stroke","#64d8cb");svg.append(line)} const g=document.createElementNS(ns,"g");g.setAttribute("transform",`translate(${n.x},${n.y})`);g.innerHTML=`<circle r="42" fill="${i?"#64d8cb":"#b8a0ff"}"></circle><text y="5" text-anchor="middle" fill="#07111f">${n.text.slice(0,10)}</text>`;g.onpointerdown=e=>{g.setPointerCapture(e.pointerId);const move=e=>{const r=svg.getBoundingClientRect();n.x=(e.clientX-r.left)*760/r.width;n.y=(e.clientY-r.top)*430/r.height;draw()};svg.onpointermove=move};svg.append(g)});};
 document.querySelector("#add").onclick=()=>{const text=document.querySelector("#idea").value.trim();if(text){const a=Math.random()*Math.PI*2,n=nodes.length;nodes.push({x:380+Math.cos(a)*220,y:215+Math.sin(a)*150,text});draw()}};
 document.querySelector("#export").onclick=()=>{const blob=new Blob([svg.outerHTML],{type:"image/svg+xml"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mind-map.svg";a.click()};
 draw();
},
"09-browser-chess":()=>{
 const board=["♜♞♝♛♚♝♞♜","♟♟♟♟♟♟♟♟","........","........","........","........","♙♙♙♙♙♙♙♙","♖♖♗♕♔♗♘♖"];let selected=null,moves=[];
 workspace.innerHTML=`<div id="board" style="display:grid;grid-template-columns:repeat(8,1fr);max-width:560px"></div><ol id="history"></ol>`;
 const render=()=>{const el=document.querySelector("#board");el.innerHTML="";[...board.join("")].forEach((p,i)=>{if(p===".")p="";const r=Math.floor(i/8),c=i%8,s=document.createElement("button");s.text=r.text||s.text;s.textContent=p;s.style.cssText=`aspect-ratio:1;background:${(r+c)%2?"#a8b89a":"#617765"};color:${r<2?"#f6c65b":"#07111f"};font-size:clamp(20px,5vw,38px);border-radius:0`;s.onclick=()=>{if(selected===null&&p){selected=i}else if(selected!==null){board[Math.floor(selected/8)]=board[Math.floor(selected/8)].substring(0,selected%8)+p+board[Math.floor(selected/8)].substring((selected%8)+1);board[r]=board[r].substring(0,c)+"."+board[r].substring(c+1);moves.push(`${selected}-${i}`);selected=null;document.querySelector("#history").innerHTML=moves.map(m=>`<li>${m}</li>`).join("");render()}};el.append(s)});};render();
},
"10-pure-css-art-gallery":()=>{
 workspace.innerHTML=`<div class="grid">${["Sunset","Ocean","Orbit","Forest"].map((n,i)=>`<div class="card"><div style="height:150px;border-radius:12px;animation:pulse 3s infinite;background:${["linear-gradient(135deg,#ff8a65,#312e81)","linear-gradient(160deg,#22d3ee,#312e81)","radial-gradient(circle,#64d8cb 5%,transparent 6%,#312e81 45%)","linear-gradient(145deg,#22c55e,#14532d)"][i]}"></div><h3>${n}</h3></div>`).join("")}</div><style>@keyframes pulse{50%{filter:hue-rotate(35deg);transform:scale(.96)}}`;
},
"11-canvas-photo-editor":()=>{
 workspace.innerHTML=`<div class="row"><input id="image" type="file" accept="image/*"><input id="brightness" type="range" min="-100" max="100" value="0"><button id="gray">Grayscale</button><button id="blur">Blur</button><button id="edge">Edge</button></div><canvas id="photo" width="720" height="420"></canvas>`;
 const [c,ctx]=canvasApp("photo");let original=null;
 document.querySelector("#image").onchange=e=>{const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,c.width,c.height);original=ctx.getImageData(0,0,c.width,c.height)};img.src=URL.createObjectURL(e.target.files[0])};
 const restore=()=>{if(original)ctx.putImageData(original,0,0)};
 document.querySelector("#brightness").oninput=e=>{restore();if(!original)return;const d=ctx.getImageData(0,0,c.width,c.height),n=+e.target.value;for(let i=0;i<d.data.length;i+=4){d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}ctx.putImageData(d,0,0)};
 document.querySelector("#gray").onclick=()=>{restore();const d=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<d.data.length;i+=4){const v=(d.data[i]+d.data[i+1]+d.data[i+2])/3;d.data[i]=d.data[i+1]=d.data[i+2]=v}ctx.putImageData(d,0,0)};
 document.querySelector("#blur").onclick=()=>ctx.filter="blur(3px)";
 document.querySelector("#edge").onclick=()=>{restore();const d=ctx.getImageData(0,0,c.width,c.height),src=new Uint8ClampedArray(d.data);for(let y=1;y<c.height-1;y++)for(let x=1;x<c.width-1;x++){const i=(y*c.width+x)*4,v=src[i]-src[i-4];d.data[i]=d.data[i+1]=d.data[i+2]=Math.abs(v)}ctx.putImageData(d,0,0)};
},
"12-canvas-roguelike":()=>{
 workspace.innerHTML=`<canvas id="rogue" width="640" height="400"></canvas><p>Use arrow keys. Find the gold, avoid red enemies and collect inventory.</p><div id="stats"></div>`;
 const [c,ctx]=canvasApp("rogue");let player={x:40,y:40,hp:5,inventory:[]},gold={x:580,y:340},enemy={x:300,y:200};
 const draw=()=>{ctx.fillStyle="#091522";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#64d8cb";ctx.fillRect(player.x,player.y,20,20);ctx.fillStyle="#ffd166";ctx.fillRect(gold.x,gold.y,16,16);ctx.fillStyle="#ff6b6b";ctx.fillRect(enemy.x,enemy.y,20,20);document.querySelector("#stats").textContent=`HP ${player.hp} · Inventory ${player.inventory.join(", ")||"empty"}`};
 addEventListener("keydown",e=>{const d={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];if(!d)return;player.x=Math.max(0,Math.min(620,player.x+d[0]));player.y=Math.max(0,Math.min(380,player.y+d[1]));if(Math.hypot(player.x-gold.x,player.y-gold.y)<24){player.inventory.push("Gold");gold={x:40+Math.random()*520,y:40+Math.random()*300}}if(Math.hypot(player.x-enemy.x,player.y-enemy.y)<24){player.hp--;enemy={x:300,y:200}}draw()});draw();
},
"13-productivity-tracker":()=>{
 workspace.innerHTML=`<div class="card"><h2 id="timer">25:00</h2><div class="row"><button id="start">Start</button><button id="reset" class="secondary">Reset</button></div></div><div id="heat" class="grid"></div>`;
 let seconds=1500,timer,rounds=+localStorage.getItem("rounds")||0;
 const render=()=>document.querySelector("#timer").textContent=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
 document.querySelector("#start").onclick=()=>{clearInterval(timer);timer=setInterval(()=>{seconds--;render();if(seconds===0){clearInterval(timer);rounds++;localStorage.setItem("rounds",rounds);seconds=1500;render();drawHeat()}},1000)};
 document.querySelector("#reset").onclick=()=>{clearInterval(timer);seconds=1500;render()};
 const drawHeat=()=>document.querySelector("#heat").innerHTML=Array.from({length:28},(_,i)=>`<div class="card" style="height:28px;padding:4px;background:${i<rounds?"#64d8cb":"#1a344d"}"></div>`).join("");drawHeat();
},
"14-webcam-photo-booth":()=>{
 workspace.innerHTML=`<video id="camera" autoplay playsinline></video><canvas id="shot" width="640" height="480"></canvas><div class="row"><button id="start">Start camera</button><button id="capture">Capture</button><select id="filter"><option value="none">Normal</option><option value="grayscale(1)">Mono</option><option value="sepia(1)">Sepia</option></select><button id="download" class="secondary">Download</button></div>`;
 document.querySelector("#start").onclick=async()=>{try{document.querySelector("#camera").srcObject=await navigator.mediaDevices.getUserMedia({video:true})}catch(e){workspace.insertAdjacentHTML("beforeend",status("Camera unavailable; allow access on localhost or HTTPS."))}};
 document.querySelector("#capture").onclick=()=>{const v=document.querySelector("#camera"),c=document.querySelector("#shot"),ctx=c.getContext("2d");ctx.filter=document.querySelector("#filter").value;ctx.drawImage(v,0,0,c.width,c.height);ctx.filter="none";ctx.fillStyle="#64d8cb";ctx.font="32px sans-serif";ctx.fillText("ST",24,c.height-24)};
 document.querySelector("#download").onclick=()=>{const a=document.createElement("a");a.href=document.querySelector("#shot").toDataURL("image/png");a.download="photo-booth.png";a.click()};
},
"15-expense-splitter":()=>{
 workspace.innerHTML=`<div class="row"><input id="name" placeholder="Name"><input id="paid" type="number" placeholder="Amount"><button id="add">Add expense</button></div><div id="people" class="grid"></div><pre id="result"></pre>`;const people=[];
 document.querySelector("#add").onclick=()=>{const n=document.querySelector("#name").value.trim(),p=+document.querySelector("#paid").value;if(!n||p<=0)return;people.push({name:n,paid:p});const average=people.reduce((s,x)=>s+x.paid,0)/people.length,creditors=people.filter(x=>x.paid>average).map(x=>({...x,amount:x.paid-average})),debtors=people.filter(x=>x.paid<average).map(x=>({...x,amount:average-x.paid}));let payments=[];for(const d of debtors)for(const c of creditors){if(d.amount<=0||c.amount<=0)continue;const amount=Math.min(d.amount,c.amount);d.amount-=amount;c.amount-=amount;payments.push(`${d.name} pays ${c.name} ${amount.toFixed(2)}`)}document.querySelector("#people").innerHTML=people.map(x=>`<div class="card">${x.name}: ${x.paid.toFixed(2)}</div>`).join("");document.querySelector("#result").textContent=`Equal share: ${average.toFixed(2)}\n`+(payments.join("\n")||"No payments needed")};
},
"16-tunisia-map":()=>{
 workspace.innerHTML=`<div class="row"><select id="filter"><option value="all">All regions</option><option value="coast">Coast</option><option value="heritage">Heritage</option></select></div><div id="map" class="map"></div>`;
 if(window.L){const map=L.map("map").setView([34.0,9.6],6);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);const places=[["Tunis",36.8065,10.1815,"coast heritage"],["Sousse",35.8256,10.63699,"coast heritage"],["Tozeur",33.9197,8.1339,"heritage"]];const markers=places.map(p=>L.marker([p[1],p[2]]).bindPopup(p[0]).addTo(map));document.querySelector("#filter").onchange=e=>{markers.forEach((m,i)=>e.target.value==="all"||places[i][3].includes(e.target.value)?map.addLayer(m):map.removeLayer(m))}}else workspace.insertAdjacentHTML("beforeend",status("Leaflet network unavailable. Map will load with internet access."));
},
"17-trivia-battle":()=>{
 const questions=[["Capital of Tunisia","Tunis"],["Largest planet","Jupiter"],["JS runs in a","browser"],["2 + 2","4"]];
 let i=0,score=0,streak=0,seconds=15,timer;
 const render=()=>{seconds=15;workspace.innerHTML=`<div class="card"><h2>${questions[i][0]}</h2><input id="answer" placeholder="Answer"><div class="row"><b id="time">${seconds}s</b><b>Score ${score}</b></div><button id="submit">Submit</button></div><button id="share" class="secondary">Share score</button>`;clearInterval(timer);timer=setInterval(()=>{seconds--;document.querySelector("#time").textContent=seconds+"s";if(seconds===0)submit(false)},1000);document.querySelector("#submit").onclick=()=>submit(true);document.querySelector("#share").onclick=()=>navigator.share?navigator.share({title:"Trivia score",text:`I scored ${score}`}):navigator.clipboard?.writeText(`I scored ${score}`)};
 const submit=correct=>{clearInterval(timer);const value=document.querySelector("#answer")?.value.trim().toLowerCase();if(correct&&value===questions[i][1].toLowerCase())score+=(100+seconds*3)+streak*20,streak++;else streak=0;i++;i<questions.length?render():workspace.innerHTML=`<h2>Battle complete</h2>${status(`Final score: ${score}`)}<button onclick="location.reload()">Play again</button>`};render();
},
"18-meal-planner":()=>{
 workspace.innerHTML=`<div class="row"><select id="meal"><option>Couscous</option><option>Salad</option><option>Pasta</option><option>Soup</option></select><select id="day"><option>Mon</option><option>Tue</option><option>Wed</option><option>Thu</option><option>Fri</option><option>Sat</option><option>Sun</option></select><button id="plan">Add meal</button></div><div id="week" class="grid"></div><div id="list" class="card"></div>`;const plan={};
 document.querySelector("#plan").onclick=()=>{const d=document.querySelector("#day").value,m=document.querySelector("#meal").value;plan[d]=m;document.querySelector("#week").innerHTML=Object.entries(plan).map(([d,m])=>`<div class="card"><b>${d}</b><br>${m}</div>`).join("");const ingredients={Couscous:["Couscous","Vegetables"],Salad:["Lettuce","Tomato"],Pasta:["Pasta","Cheese"],Soup:["Stock","Vegetables"]};const items=[...new Set(Object.values(plan).flatMap(m=>ingredients[m]))];document.querySelector("#list").innerHTML=`<h3>Shopping list</h3>${items.map(x=>`<label><input type="checkbox"> ${x}</label><br>`).join("")}`};
},
"19-glsl-playground":()=>{
 workspace.innerHTML=`<div class="row"><button data-preset="plasma" class="secondary">Plasma</button><button data-preset="fluid" class="secondary">Fluid</button></div><textarea id="shader"></textarea><canvas id="gl" width="720" height="420"></canvas>`;
 const source=document.querySelector("#shader"),canvas=document.querySelector("#gl"),gl=canvas.getContext("webgl");
 const presets={plasma:`precision mediump float;\nvoid main(){vec2 p=gl_FragCoord.xy/vec2(720.0,420.0);gl_FragColor=vec4(p.x,p.y,.8,1.0);}`,fluid:`precision mediump float;\nvoid main(){vec2 p=gl_FragCoord.xy/vec2(720.0,420.0);float v=sin(p.x*20.0)+cos(p.y*20.0);gl_FragColor=vec4(v*.5+.5,.2,.8,1.0);}`};
 const render=()=>{if(!gl)return;const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,"attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0)}");gl.compileShader(vs);const fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,source.value);gl.compileShader(fs);const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6)};
 source.value=presets.plasma;source.oninput=render;document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{source.value=presets[b.dataset.preset];render});render();
},
"20-mini-codepen":()=>{
 workspace.innerHTML=`<div class="shell"><textarea id="html" placeholder="<h2>Hello</h2>"></textarea><textarea id="css" placeholder="h2 { color: teal; }"></textarea></div><textarea id="js" placeholder="console.log('Hello')"></textarea><div class="row"><button id="run">Run</button><button id="save" class="secondary">Save snippet</button></div><iframe id="preview" class="preview" sandbox="allow-scripts"></iframe>`;
 const run=()=>{const doc=document.querySelector("#preview").contentDocument;doc.open();doc.write(`<style>${document.querySelector("#css").value}</style>${document.querySelector("#html").value}<script>${document.querySelector("#js").value}<\\/script>`);doc.close()};
 document.querySelector("#run").onclick=run;document.querySelector("#save").onclick=()=>{localStorage.setItem("codepen",JSON.stringify({html:document.querySelector("#html").value,css:document.querySelector("#css").value,js:document.querySelector("#js").value}))};const saved=JSON.parse(localStorage.getItem("codepen")||"{}");document.querySelector("#html").value=saved.html||"<h2>Hello</h2>";document.querySelector("#css").value=saved.css||"h2{color:teal}";document.querySelector("#js").value=saved.js||"";run();
},
"21-offline-flashcards":()=>{
 let cards=JSON.parse(localStorage.getItem("flashcards")||'[{"q":"What is HTML?","a":"Web page structure"}]'),i=0,shown=false;
 const render=()=>{workspace.innerHTML=`<div class="card" id="card">${shown?cards[i].a:cards[i].q}</div><div class="row"><button id="flip">Flip</button><button id="next" class="secondary">Next</button></div><div class="row"><input id="q" placeholder="Question"><input id="a" placeholder="Answer"><button id="add">Add card</button></div>`;document.querySelector("#flip").onclick=()=>{shown=!shown;render()};document.querySelector("#next").onclick=()=>{i=(i+1)%cards.length;shown=false;render()};document.querySelector("#add").onclick=()=>{const q=document.querySelector("#q").value.trim(),a=document.querySelector("#a").value.trim();if(q&&a){cards.push({q,a});localStorage.setItem("flashcards",JSON.stringify(cards));render()}}};render();
},
"22-racing-bar-chart":()=>{
 workspace.innerHTML=`<div class="row"><button id="step">Next year</button></div><div id="chart" class="grid"></div><p id="year"></p>`;let year=2020,data=[["Alpha",70],["Beta",55],["Gamma",42],["Delta",28]];
 const render=()=>{document.querySelector("#chart").innerHTML=data.sort((a,b)=>b[1]-a[1]).map(([name,v])=>`<div class="card"><b>${name}</b><div style="height:${v*2}px;max-height:180px;background:#64d8cb;border-radius:8px"></div><span>${v}</span></div>`).join("");document.querySelector("#year").textContent=`Year ${year}`};document.querySelector("#step").onclick=()=>{year++;data=data.map(([n,v])=>[n,Math.max(10,Math.min(100,v+Math.round(Math.random()*20-8)))]);render};render();
},
"23-tower-defense":()=>{
 workspace.innerHTML=`<canvas id="tower" width="760" height="420"></canvas><div class="row"><button id="basic">Basic tower</button><button id="slow" class="secondary">Slow tower</button></div><p id="wave"></p>`;
 const [c,ctx]=canvasApp("tower");let towers=[],enemy={x:0,y:210,hp:30},wave=1,money=100,type="basic";
 document.querySelector("#basic").onclick=()=>type="basic";document.querySelector("#slow").onclick=()=>type="slow";
 c.onclick=e=>{const r=c.getBoundingClientRect(),cost=type==="basic"?20:35;if(money>=cost){towers.push({x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height,type});money-=cost}};
 const tick=()=>{ctx.fillStyle="#091522";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#315170";ctx.fillRect(0,200,c.width,50);ctx.fillStyle="#64d8cb";towers.forEach(t=>ctx.fillRect(t.x-12,t.y-12,24,24));ctx.fillStyle="#ff6b6b";ctx.fillRect(enemy.x,enemy.y,20,20);enemy.x+=1.5;for(const t of towers)if(Math.hypot(enemy.x-t.x,enemy.y-t.y)<80)enemy.hp-=.2;if(enemy.hp<=0){wave++;money+=30;enemy={x:0,y:210,hp:30+wave*8}}document.querySelector("#wave").textContent=`Wave ${wave} · $${money}`;if(enemy.x>c.width)enemy.x=0;requestAnimationFrame(tick)};tick();
},
"24-resume-builder":()=>{
 workspace.innerHTML=`<div class="shell"><div><input id="name" placeholder="Full name"><input id="role" placeholder="Role"><textarea id="summary" placeholder="Professional summary"></textarea><input id="email" placeholder="Email"></div><div id="resume" class="card"></div></div><div class="row"><button id="print">Print / Save PDF</button></div>`;
 const render=()=>document.querySelector("#resume").innerHTML=`<h2>${document.querySelector("#name").value||"Your Name"}</h2><h3>${document.querySelector("#role").value||"Professional"}</h3><p>${document.querySelector("#summary").value||"Add a concise summary."}</p><p>${document.querySelector("#email").value||"email@example.com"}</p>`;workspace.querySelectorAll("input,textarea").forEach(x=>x.oninput=render);render();document.querySelector("#print").onclick=()=>print();
},
"25-3d-product-configurator":()=>{
 workspace.innerHTML=`<div class="row"><input id="color" type="color" value="#64d8cb"><select id="material"><option value="standard">Standard</option><option value="metal">Metal</option><option value="soft">Soft</option></select></div><div id="three" style="height:420px"></div>`;
 if(window.THREE){const host=document.querySelector("#three"),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,host.clientWidth/420,.1,100),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(host.clientWidth,420);host.append(renderer.domElement);const geometry=new THREE.TorusGeometry(2,0.8,32,100),material=new THREE.MeshStandardMaterial({color:"#64d8cb",roughness:.5}),mesh=new THREE.Mesh(geometry,material);scene.add(mesh);scene.add(new THREE.DirectionalLight(0xffffff,3));camera.position.z=7;const animate=()=>{mesh.rotation.x+=.006;mesh.rotation.y+=.008;renderer.render(scene,camera);requestAnimationFrame(animate)};animate();document.querySelector("#color").oninput=e=>material.color.set(e.target.value);document.querySelector("#material").onchange=e=>material.metalness=e.target.value==="metal"?1:e.target.value==="soft"?0:.35}else workspace.insertAdjacentHTML("beforeend",status("Three.js unavailable; internet access is required."));
}
};
handlers[folder]?.()||workspace.insertAdjacentHTML("beforeend",status("Project ready."));
