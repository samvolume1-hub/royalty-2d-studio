

const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];

const state = {
  prompt: 'A funny little purple dragon with big eyes, a round belly and tiny wings',
  view: 'front', expression: 'happy', mouth: 'REST', hand: 'open',
  rig: true, style: 'cute', seed: 1, zoom: 1, panX: 0, panY: 0
};
const history = { undo: [], redo: [], limit: 40 };
function snapshot(){ return JSON.stringify({ ...state, palette: [...palette] }); }
function remember(){ history.undo.push(snapshot()); if(history.undo.length>history.limit) history.undo.shift(); history.redo.length=0; updateHistoryButtons(); }
function restoreSnapshot(raw){ const d=JSON.parse(raw); Object.assign(state,d); if(Array.isArray(d.palette)&&d.palette.length===3) palette=d.palette; else setPalette(); $('#prompt').value=state.prompt; $('#style').value=state.style; $('#character-name').value=state.name||'Bobo'; draw(); updateHistoryButtons(); }
function undo(){ if(!history.undo.length)return; history.redo.push(snapshot()); restoreSnapshot(history.undo.pop()); notice('Last change undone.'); }
function redo(){ if(!history.redo.length)return; history.undo.push(snapshot()); restoreSnapshot(history.redo.pop()); notice('Change restored.'); }
function updateHistoryButtons(){ const u=$('#undo'),r=$('#redo'); if(u)u.disabled=!history.undo.length; if(r)r.disabled=!history.redo.length; }
const palettes = [
  ['#b99af8','#8d68d7','#f2c8a6'], ['#ffb45e','#e87a47','#f7d0a0'],
  ['#82d5c5','#45a895','#f5cba7'], ['#f38db5','#d9548b','#f6c9a8'],
  ['#9cc9fa','#5588ce','#f0c4a2'], ['#f3d76a','#dba934','#f2c39f']
];
let palette = palettes[0], character = 'Bobo', species = 'dragon';

const icons = {
  front: '<path d="M7 14h10M12 9v10"/>',
  side: '<path d="M8 6l8 6-8 6"/>',
  back: '<path d="M8 5v14M16 5v14M8 12h8"/>',
  top: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'
};

function hash(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
function setPalette(){
  const h=hash(state.prompt); palette=palettes[h%palettes.length];
  const p=state.prompt.toLowerCase();
  const colorMap={purple:0,violet:0,orange:1,green:2,teal:2,pink:3,blue:4, yellow:5,gold:5};
  const requested=Object.keys(colorMap).find(color=>new RegExp('\\b'+color+'\\b').test(p));
  if(requested) palette=palettes[colorMap[requested]];
  // Match human descriptions before the generic creature fallback.
  species=/\b(boy|man|male|guy|human|person|child|kid)\b/.test(p)?'boy':/robot|android|machine/.test(p)?'robot':/cat|kitten|tiger|lion/.test(p)?'cat':/dog|puppy|wolf/.test(p)?'dog':/dragon|dinosaur|dino/.test(p)?'dragon':/rabbit|bunny/.test(p)?'rabbit':/alien|space/.test(p)?'alien':'creature';
  const words=state.prompt.trim().split(/\s+/).filter(Boolean);
  character=words.length?words.slice(0,3).map(w=>w.replace(/[^a-z]/gi,'')).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(' '):'Bobo';
}
function mouthSvg(cx,cy,scale=1){
  let w=30,h=13;
  switch(state.mouth){case'AI':w=24;h=23;break;case'E':w=31;h=9;break;case'O':w=16;h=22;break;case'U':w=12;h=10;break;case'FV':w=26;h=5;break;case'MBP':w=29;h=3;break;case'L':w=23;h=14;break;default:h=state.expression==='happy'?12:4;}
  w*=scale;h*=scale;
  if(state.mouth==='REST'&&state.expression==='happy') return `<path d="M${cx-w/2} ${cy} Q${cx} ${cy+h*1.7} ${cx+w/2} ${cy}" fill="#7f344e" class="outline" stroke-width="2"/><path d="M${cx-w*.28} ${cy+h*.6} Q${cx} ${cy+h*1.25} ${cx+w*.28} ${cy+h*.6}" fill="#fff1dd" stroke="none"/>`;
  if(state.mouth==='MBP') return `<path d="M${cx-w/2} ${cy} Q${cx} ${cy+h} ${cx+w/2} ${cy}" fill="none" class="outline" stroke-width="2"/>`;
  if(state.mouth==='FV') return `<path d="M${cx-w/2} ${cy} Q${cx} ${cy+h*1.3} ${cx+w/2} ${cy}" fill="#fff4df" class="outline" stroke-width="2"/><path d="M${cx-w/2} ${cy} Q${cx} ${cy+h*.4} ${cx+w/2} ${cy}" fill="none" stroke="#28233b" stroke-width="1.3"/>`;
  if(state.mouth==='L') return `<ellipse cx="${cx}" cy="${cy+h/2}" rx="${w/2}" ry="${h/2}" fill="#7e304d" class="outline" stroke-width="2"/><path d="M${cx-3*scale} ${cy+h/2} l${6*scale} 0 l${-1*scale} ${7*scale}" fill="#f38db5" stroke="#b74d77" stroke-width="1.2"/>`;
  return `<ellipse cx="${cx}" cy="${cy+h/2}" rx="${w/2}" ry="${h/2}" fill="${state.mouth==='E'?'#fff2de':'#79304b'}" class="outline" stroke-width="2"/>`;
}
function handSvg(x,y,scale=1){
 const c=palette[0];
 if(state.hand==='fist') return `<path d="M${x-9*scale} ${y+1*scale} Q${x-13*scale} ${y-7*scale} ${x-8*scale} ${y-11*scale} L${x+7*scale} ${y-11*scale} Q${x+14*scale} ${y-8*scale} ${x+12*scale} ${y+3*scale} Q${x+7*scale} ${y+10*scale} ${x-4*scale} ${y+7*scale}Z" fill="${c}" class="outline" stroke-width="2"/>`;
 if(state.hand==='point') return `<path d="M${x-8*scale} ${y+8*scale} Q${x-14*scale} ${y+2*scale} ${x-8*scale} ${y-3*scale} L${x+1*scale} ${y-4*scale} L${x+3*scale} ${y-20*scale} Q${x+7*scale} ${y-25*scale} ${x+9*scale} ${y-19*scale} L${x+10*scale} ${y-3*scale} L${x+14*scale} ${y+3*scale} Q${x+12*scale} ${y+12*scale} ${x} ${y+11*scale}Z" fill="${c}" class="outline" stroke-width="2"/>`;
 if(state.hand==='thumb') return `<path d="M${x-9*scale} ${y+1*scale} L${x-7*scale} ${y-8*scale} L${x} ${y-9*scale} L${x+3*scale} ${y-19*scale} Q${x+8*scale} ${y-23*scale} ${x+10*scale} ${y-17*scale} L${x+8*scale} ${y-7*scale} L${x+13*scale} ${y-4*scale} L${x+9*scale} ${y+8*scale} L${x-3*scale} ${y+10*scale}Z" fill="${c}" class="outline" stroke-width="2"/>`;
 if(state.hand==='pinch') return `<path d="M${x-9*scale} ${y+8*scale} Q${x-14*scale} ${y} ${x-7*scale} ${y-5*scale} L${x} ${y-3*scale} Q${x+8*scale} ${y-15*scale} ${x+12*scale} ${y-10*scale} Q${x+14*scale} ${y-5*scale} ${x+7*scale} ${y+1*scale} L${x+12*scale} ${y+6*scale} Q${x+5*scale} ${y+13*scale} ${x-2*scale} ${y+11*scale}Z" fill="${c}" class="outline" stroke-width="2"/>`;
 const wave=state.hand==='wave';
 return `<path d="M${x-9*scale} ${y+3*scale} L${x-10*scale} ${y-(wave?17:8)*scale} Q${x-9*scale} ${y-(wave?22:12)*scale} ${x-5*scale} ${y-(wave?19:10)*scale} L${x-3*scale} ${y+1*scale} L${x-1*scale} ${y-(wave?24:13)*scale} Q${x+3*scale} ${y-(wave?27:16)*scale} ${x+4*scale} ${y-(wave?20:10)*scale} L${x+4*scale} ${y+1*scale} L${x+8*scale} ${y-(wave?19:8)*scale} Q${x+12*scale} ${y-(wave?22:11)*scale} ${x+13*scale} ${y-(wave?15:6)*scale} L${x+9*scale} ${y+7*scale} Q${x} ${y+15*scale} ${x-9*scale} ${y+3*scale}Z" fill="${c}" class="outline" stroke-width="2"/><path d="M${x-6*scale} ${y+1*scale} Q${x-14*scale} ${y-4*scale} ${x-15*scale} ${y+1*scale} Q${x-14*scale} ${y+9*scale} ${x-5*scale} ${y+9*scale}" fill="${c}" class="outline" stroke-width="2"/>`;
}
function characterSvg(view,mini=false){
 const p=palette[0],dark=palette[1],skin=palette[2];
 let parts='';
 if(view==='top'){
  parts=`<ellipse cx="200" cy="165" rx="88" ry="71" fill="${p}" class="outline"/><ellipse cx="200" cy="165" rx="52" ry="37" fill="${dark}" opacity=".3"/>`;
  if(species==='dragon')parts+=`<path d="M160 130 L130 99 L169 111 M237 130 L267 99 L231 111" fill="${dark}" class="outline"/>`;
  parts+=`<ellipse cx="183" cy="147" rx="11" ry="14" fill="#fff"/><ellipse cx="217" cy="147" rx="11" ry="14" fill="#fff"/><circle cx="184" cy="151" r="5" fill="#28233b"/><circle cx="216" cy="151" r="5" fill="#28233b"/>`;
 } else if(view==='back'){
  parts=`<ellipse cx="200" cy="280" rx="57" ry="18" fill="#322b47" opacity=".12"/><path d="M154 262 L145 321 Q160 337 181 325 L190 275 M210 275 L219 325 Q240 337 255 321 L246 262" fill="${dark}" class="outline"/><path d="M153 168 Q130 178 136 223 L145 276 Q200 296 255 276 L264 223 Q270 178 247 168 Q200 147 153 168Z" fill="${p}" class="outline"/><path d="M166 183 Q200 199 234 183 L229 258 Q200 272 171 258Z" fill="${dark}" opacity=".45"/><ellipse cx="200" cy="130" rx="63" ry="69" fill="${p}" class="outline"/>`;
  if(species==='dragon')parts+=`<path d="M151 93 L132 52 Q164 56 177 83 M229 83 L248 52 Q216 56 203 83" fill="${dark}" class="outline"/><path d="M165 127 Q200 155 235 127" fill="none" stroke="${dark}" stroke-width="7"/>`;
  else parts+=`<path d="M152 91 Q168 62 191 86 Q209 59 235 92" fill="${dark}" stroke="#28233b" stroke-width="2"/>`;
 } else if(view==='side'){
  parts=`<ellipse cx="200" cy="280" rx="56" ry="16" fill="#322b47" opacity=".12"/><path d="M174 253 L166 321 Q180 332 194 321 L200 265 M211 262 L224 321 Q238 333 249 320 L237 250" fill="${p}" class="outline"/><path d="M161 173 Q143 194 158 244 Q171 268 211 263 L239 233 L239 187 Q219 161 184 166Z" fill="${p}" class="outline"/><path d="M171 195 Q139 207 148 231" fill="none" stroke="${dark}" stroke-width="14"/><ellipse cx="204" cy="132" rx="55" ry="66" fill="${p}" class="outline"/><path d="M235 113 Q276 132 248 157 Q230 168 220 151Z" fill="${skin}" class="outline"/><ellipse cx="221" cy="118" rx="11" ry="16" fill="#fff" class="outline"/><ellipse cx="225" cy="120" rx="5" ry="8" fill="#28233b"/><path d="M231 150 Q246 158 255 147" fill="none" stroke="#28233b" stroke-width="3"/>`;
  if(species==='rabbit')parts+=`<path d="M178 86 Q157 27 179 40 Q194 49 195 92 M206 88 Q214 26 232 40 Q243 61 219 99" fill="${p}" class="outline"/>`;
 } else {
  parts=`<ellipse cx="200" cy="280" rx="56" ry="16" fill="#322b47" opacity=".12"/><path d="M166 249 L156 316 Q170 329 187 318 L196 266 M207 266 L217 318 Q232 331 245 316 L234 249" fill="${p}" class="outline"/><ellipse cx="173" cy="320" rx="23" ry="10" fill="${dark}" class="outline"/><ellipse cx="232" cy="320" rx="23" ry="10" fill="${dark}" class="outline"/><path d="M154 171 Q126 185 138 231 L153 268 Q200 286 247 268 L262 231 Q274 185 246 171 Q200 153 154 171Z" fill="${p}" class="outline"/><path d="M172 183 Q200 204 228 183 L232 257 Q200 277 168 257Z" fill="${skin}" opacity=".72"/><path d="M151 186 Q129 213 148 250 L161 256 L169 244 L160 210 M249 186 Q271 213 252 250 L239 256 L231 244 L240 210" fill="${p}" class="outline"/>`;
  if(species==='boy')parts+=`<path d="M171 190 L181 202 L200 215 L219 202 L229 190" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/><path d="M184 215 L200 226 L216 215" fill="none" stroke="${dark}" stroke-width="3"/><path d="M177 268 L173 302 M223 268 L227 302" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
  if(species==='dragon')parts+=`<path d="M151 98 L130 55 Q160 58 176 86 L224 86 Q240 58 270 55 L249 99" fill="${dark}" class="outline"/><path d="M145 192 Q109 173 123 149 Q135 141 150 171Z M253 192 Q291 171 277 149 Q265 141 250 171Z" fill="${dark}" class="outline"/><path d="M181 85 L188 70 L201 85 L215 70 L224 91" fill="${dark}" class="outline"/>`;
  else if(species==='cat')parts+=`<path d="M143 117 L145 61 L184 89 Q200 80 216 89 L255 61 L257 117" fill="${p}" class="outline"/><path d="M153 106 L154 77 L177 94Z M245 106 L246 77 L223 94Z" fill="#f5a4c2"/>`;
  else if(species==='rabbit')parts+=`<path d="M166 88 Q138 11 165 25 Q190 34 190 91 M207 91 Q212 17 239 27 Q259 48 221 97" fill="${p}" class="outline"/><path d="M160 40 Q173 52 180 83 M231 40 Q225 53 220 82" fill="none" stroke="#e79aba" stroke-width="6"/>`;
  else if(species==='robot')parts+=`<rect x="143" y="71" width="114" height="116" rx="24" fill="${p}" class="outline"/><path d="M200 71 L200 51" stroke="#28233b" stroke-width="4"/><circle cx="200" cy="45" r="9" fill="#f7c75d" class="outline"/>`;
  else if(species==='dog')parts+=`<path d="M151 104 Q114 80 129 134 L151 155 M249 104 Q286 80 271 134 L249 155" fill="${dark}" class="outline"/>`;
  else if(species==='boy')parts+=`<path d="M141 121 Q129 78 158 58 Q183 37 211 49 Q247 50 260 84 Q266 101 258 123 L246 105 Q239 90 225 84 Q204 99 174 88 Q160 96 153 119Z" fill="#493326" class="outline"/><path d="M143 130 Q132 130 136 145 Q141 155 151 149 M257 130 Q268 130 264 145 Q259 155 249 149" fill="${skin}" class="outline" stroke-width="2"/>`;
  else parts+=`<path d="M152 104 Q128 76 153 61 L177 91 M248 104 Q272 76 247 61 L223 91" fill="${dark}" class="outline"/>`;
  if(species!=='robot'){
   parts+=`<ellipse cx="174" cy="128" rx="17" ry="23" fill="#fff" class="outline" stroke-width="2.5"/><ellipse cx="226" cy="128" rx="17" ry="23" fill="#fff" class="outline" stroke-width="2.5"/><ellipse cx="178" cy="132" rx="8" ry="12" fill="#29233a"/><ellipse cx="222" cy="132" rx="8" ry="12" fill="#29233a"/><circle cx="180" cy="127" r="3.4" fill="#fff"/><circle cx="224" cy="127" r="3.4" fill="#fff"/>`;
  } else parts+=`<rect x="158" y="107" width="34" height="43" rx="14" fill="#fff" class="outline"/><rect x="208" y="107" width="34" height="43" rx="14" fill="#fff" class="outline"/><circle cx="177" cy="128" r="8" fill="#29233a"/><circle cx="225" cy="128" r="8" fill="#29233a"/>`;
  if(species==='boy')parts+=`<path d="M184 179 L184 194 Q200 205 216 194 L216 179" fill="${skin}" class="outline" stroke-width="2"/><path d="M166 184 L184 199 L200 211 L216 199 L234 184" fill="#f4f0ff" class="outline" stroke-width="2"/><path d="M174 82 Q184 91 198 87 M204 87 Q222 91 233 80" fill="none" stroke="#30251f" stroke-width="3" stroke-linecap="round"/><path d="M158 70 Q177 47 202 53 Q229 48 246 72" fill="none" stroke="#6b4936" stroke-width="5" stroke-linecap="round"/>`;
  if(state.expression==='sad')parts+=`<path d="M158 106 Q173 96 188 108 M212 108 Q227 96 242 106" fill="none" stroke="#28233b" stroke-width="4"/>`;
  else if(state.expression==='angry')parts+=`<path d="M158 104 L186 113 M214 113 L242 104" fill="none" stroke="#28233b" stroke-width="4"/>`;
  else parts+=`<path d="M158 102 Q172 94 186 102 M214 102 Q228 94 242 102" fill="none" stroke="#28233b" stroke-width="3"/>`;
  if(state.expression==='surprised')parts+=`<ellipse cx="200" cy="170" rx="11" ry="17" fill="#79304b" class="outline"/>`;
  else parts+=mouthSvg(200,165,1.05);
  if(state.expression==='silly')parts+=`<path d="M190 168 Q200 174 210 168 L204 190 Q197 195 193 186Z" fill="#ed7fa4" class="outline" stroke-width="2"/>`;
  parts+=`<ellipse cx="149" cy="153" rx="11" ry="6" fill="#f28db1" opacity=".7"/><ellipse cx="251" cy="153" rx="11" ry="6" fill="#f28db1" opacity=".7"/>`;
 }
 if(view!=='back'&&view!=='top'){
  parts+=handSvg(128,235,.86)+handSvg(271,235,.86);
  if(state.rig)parts+=`<g fill="none" stroke="#7850e9" stroke-width="1.5" stroke-dasharray="4 3" opacity=".9"><circle cx="200" cy="125" r="67"/><ellipse cx="200" cy="220" rx="39" ry="43"/><path d="M147 190 L132 233 M253 190 L268 233 M175 276 L170 313 M225 276 L230 313"/><circle cx="147" cy="188" r="6"/><circle cx="253" cy="188" r="6"/><circle cx="200" cy="184" r="5"/><circle cx="170" cy="312" r="5"/><circle cx="230" cy="312" r="5"/></g>`;
 }
 if(view==='back'&&state.rig)parts+=`<g fill="none" stroke="#7850e9" stroke-width="1.5" stroke-dasharray="4 3"><ellipse cx="200" cy="130" rx="65" ry="70"/><ellipse cx="200" cy="220" rx="53" ry="52"/><path d="M150 187 L140 236 M250 187 L260 236 M177 274 L170 315 M223 274 L230 315"/></g>`;
 if(mini) return `<g transform="translate(0,-8) scale(.58) translate(145,48)">${parts}</g>`;
 return `<rect width="400" height="390" fill="transparent"/>${parts}`;
}
function draw(){
 $('#canvas').innerHTML=characterSvg(state.view);
 $('#canvas').setAttribute('viewBox','0 0 400 390');
 updateCanvasViewport();
 $('#charname').textContent=(state.name||character)+' · Character 001';
 $('#viewtag').textContent=state.view.toUpperCase()+' VIEW';
 $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
 $$('[data-expression]').forEach(b=>b.classList.toggle('selected',b.dataset.expression===state.expression));
 $$('[data-mouth]').forEach(b=>b.classList.toggle('selected',b.dataset.mouth===state.mouth));
 $$('[data-hand]').forEach(b=>b.classList.toggle('selected',b.dataset.hand===state.hand));
 $('#rig').checked=state.rig;
 $$('[data-sheetview]').forEach(b=>b.querySelector('svg').innerHTML=characterSvg(b.dataset.sheetview,true));
 save();
 const status=$('#save-status'); if(status)status.textContent='Autosaved in this browser';
}
function save(){try{localStorage.setItem('royalty2d-project',JSON.stringify({...state,palette:[...palette]}));}catch{}}
function load(){try{const saved=JSON.parse(localStorage.getItem('royalty2d-project'));if(saved&&saved.prompt){Object.assign(state,saved);setPalette();if(Array.isArray(saved.palette)&&saved.palette.length===3&&saved.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c)))palette=[...saved.palette];}}catch{}}
function escapeXml(value){return String(value).replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&apos;'}[ch]));}
function svgStyles(){return `<style>.outline{stroke:#28233b;stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round}</style>`;}
function makeSvg(view){return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="780" viewBox="0 0 400 390"><title>${escapeXml(state.name||character)} — ${view} view</title><desc>Locally generated vector-style character concept. View is an approximation.</desc>${svgStyles()}<rect width="400" height="390" fill="#f2f0f8"/>${characterSvg(view)}</svg>`;}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function notice(s){$('#message').textContent=s;}

$('#app').innerHTML=`
<div class="app-shell">
 <header class="topbar">
  <div class="brand"><div class="brand-icon">R</div><div><div class="brand-title">ROYALTY <span>2D STUDIO</span></div><div class="brand-sub">CHARACTER LAB · VECTOR CARTOON DESIGNER</div></div></div>
  <div class="top-actions"><button class="quiet-btn animation-shortcut" id="jump-animation" type="button">▶ Animation Lab</button><span class="local-badge"><i></i> Local project</span><button class="quiet-btn" id="undo" disabled title="Undo (Ctrl+Z)">↶ Undo</button><button class="quiet-btn" id="redo" disabled title="Redo (Ctrl+Y)">↷ Redo</button><button class="quiet-btn" id="reset">↺ Reset</button></div>
 </header>
 <section class="ai-generator card" aria-labelledby="ai-generator-title">
  <div class="ai-generator-head"><div><div class="section-kicker">AI CHARACTER FORGE · PHASE 1</div><h1 id="ai-generator-title">Create any cartoon character</h1><p>Describe anything you can imagine — people, animals, monsters, robots, aliens, fantasy creatures or talking objects.</p></div><span class="ai-pill">AI POWERED</span></div>
  <div class="ai-generator-controls">
   <label class="ai-prompt-label" for="ai-character-prompt">What should we create?</label>
   <textarea id="ai-character-prompt" rows="3" maxlength="1200" placeholder="A short, round, funny old fisherman with enormous ears, tiny legs, a crooked nose, one missing tooth and oversized yellow boots…"></textarea>
   <div class="ai-options">
    <label>Character style<select id="ai-style"><option value="2d">Classic 2D cartoon</option><option value="3d">Polished 3D cartoon</option><option value="both" selected>Surprise me · 2D or 3D</option></select></label>
    <label>Character framing<select id="ai-framing"><option value="full">Full body · standing</option><option value="portrait">Head and shoulders</option><option value="pose">Dynamic funny pose</option><option value="sheet">Character concept sheet</option></select></label>
    <label>Background<select id="ai-background"><option value="opaque" selected>Studio background</option><option value="transparent" disabled>Transparent (not available on free model)</option></select></label>
    <label>Quality<select id="ai-quality"><option value="medium">Medium · draft</option><option value="high" selected>High · detailed</option><option value="xhigh">Extra high · premium</option></select></label>
    <label>Variations<select id="ai-count"><option value="1" selected>1 character</option><option value="2">2 characters</option><option value="3">3 characters</option><option value="4">4 characters</option></select></label>
   </div>
   <div class="ai-examples"><span>TRY:</span><button type="button" data-ai-prompt="A tiny, grumpy purple elephant wearing enormous red spectacles and shoes three sizes too big">🐘 Funny elephant</button><button type="button" data-ai-prompt="A skinny, hilarious alien with five eyes, spaghetti arms, tiny feet and a huge smile">👽 Weird alien</button><button type="button" data-ai-prompt="A very short, round village comedian with a giant head, big ears, one missing tooth and oversized boots">😂 Funny human</button><button type="button" data-ai-prompt="A nervous little robot made from mismatched kitchen pots, with expressive eyes and bendy legs">🤖 Silly robot</button></div>
   <div class="ai-action-row"><button class="primary ai-generate-button" id="ai-generate" type="button">✦ Generate with AI</button><span id="ai-status" role="status" aria-live="polite">Ready · Free Cloudflare AI connection required</span></div>
  </div>
  <div id="ai-results" class="ai-results" hidden><div class="ai-results-heading"><strong>Your generated characters</strong><span>Choose one to use in the studio</span></div><div id="ai-image-grid" class="ai-image-grid"></div></div>
 </section>
 <section class="brief card">
  <div class="section-kicker">01 / CHARACTER BRIEF</div><label for="prompt" class="field-label">Describe your cartoon character</label>
  <textarea id="prompt" rows="2" placeholder="A mischievous purple baby dragon with huge eyes, a round belly, little wings and oversized sneakers…"></textarea>
  <div class="prompt-examples"><button data-prompt="A funny little purple dragon with big eyes, a round belly and tiny wings">🐉 Baby dragon</button><button data-prompt="A silly orange cat with huge cheeks, buck teeth and oversized sneakers">🐱 Silly cat</button><button data-prompt="A goofy little robot with a square head, antenna, large eyes and mitten hands">🤖 Funny robot</button><button data-prompt="A happy blue alien with three eyes, a tiny body and huge boots">👽 Little alien</button></div>
  <div class="brief-bottom"><div class="style-choice"><label for="style">Art direction</label><select id="style"><option value="cute">Cute & round</option><option value="wacky">Wacky & exaggerated</option><option value="storybook">Storybook</option></select></div><button class="primary" id="generate">✦ Generate character</button></div>
  <div class="palette-picker" aria-label="Character colour palette"><span>PALETTE</span><div id="palette-options"></div></div>
  <div id="message" class="message" aria-live="polite">Local concept generator ready. Your project autosaves in this browser.</div>
 </section>
 <div class="workspace">
  <main class="card canvas-card">
   <div class="canvas-heading"><div><div class="section-kicker">02 / CHARACTER CANVAS</div><h2 id="charname">Bobo · Character 001</h2></div><div class="canvas-export-actions"><button id="import-png-top" class="secondary-btn" type="button">↑ Import PNG</button><label class="png-file-picker" for="import-png-file">Choose file<input id="import-png-file" type="file" accept=".png,image/png" aria-label="Choose a PNG character file"></label><button id="clear-imported-png" class="secondary-btn" type="button" hidden>× Clear image</button><button id="export-png-top" class="primary" type="button">↓ PNG</button><button id="export" class="secondary-btn">↓ SVG</button></div></div>
   <div class="canvas-tools"><span>CANVAS VIEW</span><div><button class="secondary-btn" id="zoom-out" aria-label="Zoom out">−</button><button class="secondary-btn" id="zoom-fit">Fit</button><button class="secondary-btn" id="zoom-in" aria-label="Zoom in">+</button><button class="secondary-btn" id="pan-toggle" aria-pressed="false" title="Drag canvas to pan">✋ Pan</button><span id="zoom-level" class="zoom-level">100%</span></div></div>
   <div class="stage"><img id="imported-png-reference" alt="Imported PNG reference" hidden><svg id="rig-overlay" viewBox="0 0 400 390" aria-label="Editable bone rig overlay"></svg><svg id="canvas" viewBox="0 0 400 390" role="img" aria-label="Editable vector-style cartoon preview"></svg><div class="stage-tags"><span>VECTOR PREVIEW</span><span id="viewtag">FRONT VIEW</span></div></div>
   <div class="control-heading"><strong>Camera angles</strong><span>4 turnaround views</span></div>
   <div class="view-tabs"><button class="active" data-view="front"><span>◉</span> Front</button><button data-view="side"><span>◐</span> Side</button><button data-view="back"><span>◉</span> Back</button><button data-view="top"><span>◎</span> Top</button></div>
   <div class="stats"><div><span>OUTPUT</span><strong>SVG</strong><small>Vector artwork</small></div><div><span>VIEWS</span><strong>04</strong><small>Turnaround</small></div><div><span>RIG REGIONS</span><strong>12</strong><small>Guide points</small></div></div>
   <div class="callout">Illustrator-friendly SVG preview. Views are illustrative approximations, not guaranteed geometrically consistent AI model outputs.</div>
  </main>
  <aside class="card toolkit">
   <div class="section-kicker">03 / DESIGN TOOLKIT</div>
   <div class="tool-section"><div class="tool-title">Facial expressions <span>ACTING</span></div><div class="expression-grid"><button class="selected" data-expression="happy"><b>😄</b><span>Happy</span></button><button data-expression="surprised"><b>😮</b><span>Surprised</span></button><button data-expression="sad"><b>🥺</b><span>Sad</span></button><button data-expression="silly"><b>😜</b><span>Silly</span></button><button data-expression="angry"><b>😠</b><span>Angry</span></button></div></div>
   <div class="tool-section"><div class="tool-title">Mouth shapes <span>PHONEMES</span></div><p class="help">Select a mouth pose for lip-sync planning.</p><div class="mouth-grid"><button class="selected" data-mouth="REST"><b>😐</b><span>REST</span></button><button data-mouth="AI"><b>🗣️</b><span>AI</span></button><button data-mouth="E"><b>😁</b><span>E</span></button><button data-mouth="O"><b>😮</b><span>O</span></button><button data-mouth="U"><b>😗</b><span>U</span></button><button data-mouth="FV"><b>🤍</b><span>F / V</span></button><button data-mouth="MBP"><b>🤐</b><span>M / B / P</span></button><button data-mouth="L"><b>👅</b><span>L / TH</span></button></div></div>
   <div class="tool-section"><div class="tool-title">Hand poses <span>GESTURES</span></div><div class="hand-grid"><button class="selected" data-hand="open"><b>🖐️</b><span>Open</span></button><button data-hand="fist"><b>✊</b><span>Fist</span></button><button data-hand="point"><b>☝️</b><span>Point</span></button><button data-hand="wave"><b>👋</b><span>Wave</span></button><button data-hand="pinch"><b>🤏</b><span>Pinch</span></button><button data-hand="thumb"><b>👍</b><span>Thumb</span></button></div></div>
   <div class="tool-section"><div class="tool-title">Rigging guide <span>PREP</span></div><label class="check-row"><input id="rig" type="checkbox" checked><span>Show rig regions & joints</span></label><p class="help">Head · neck · torso · arms · hands · thighs · shins · feet · mouth.</p></div>
  </aside>
 </div>
 <section class="card sheet-card"><div class="sheet-heading"><div><div class="section-kicker">04 / CHARACTER SHEET</div><h2>Turnaround & production assets</h2></div><span class="draft-badge">CONCEPT SHEET</span></div><div class="sheet-grid"><button data-sheetview="front"><span>01 / FRONT</span><svg viewBox="0 0 120 115"></svg></button><button data-sheetview="side"><span>02 / SIDE</span><svg viewBox="0 0 120 115"></svg></button><button data-sheetview="back"><span>03 / BACK</span><svg viewBox="0 0 120 115"></svg></button><button data-sheetview="top"><span>04 / TOP</span><svg viewBox="0 0 120 115"></svg></button></div><div class="sheet-actions"><button class="primary" id="sheet-export">↓ Export character sheet SVG</button><button class="secondary-btn" id="notes-export">Export rigging notes TXT</button></div><p class="footnote">Production note: these are vector concepts and rigging guides, not a layered deformable skeletal rig. True AI artwork, exact multi-view consistency, lip-sync timing and cloud projects require additional model/backend integrations.</p></section>
 <footer><span>ROYALTY 2D STUDIO</span><span>Concept locally · Export anywhere</span></footer>
</div>`;

// AI Character Forge: secure same-origin backend; provider keys never enter the browser.
let aiGeneratedImages = [];
let aiGeneratedMimeType = 'image/jpeg';
const aiStyleDescriptions = { '2d':'classic professional 2D cartoon illustration, clean confident outlines, expressive shapes and rich flat colours', '3d':'high-end stylized 3D animated feature-film character, appealing sculpted forms, detailed materials and expressive lighting', 'both':'follow the artistic style requested in the prompt; if no style is specified, create a polished 2D cartoon illustration' };
const aiFrameDescriptions = { full:'show the complete character from head to toe, centered, entire body and feet visible', portrait:'head and shoulders portrait, face large and expressive', pose:'full-body dynamic comedic action pose with clear readable silhouette', sheet:'clean professional character concept sheet with one large hero character and a few small expression/pose studies; no labels or text' };
function renderAiImages(images,mimeType='image/jpeg'){
 aiGeneratedMimeType=mimeType;
 const grid=$('#ai-image-grid');grid.replaceChildren();
 images.forEach((item,index)=>{const card=document.createElement('article');card.className='ai-image-card';const img=document.createElement('img');img.alt=`AI generated cartoon character option ${index+1}`;img.src=`data:${aiGeneratedMimeType};base64,${item}`;const actions=document.createElement('div');actions.className='ai-image-actions';const use=document.createElement('button');use.type='button';use.className='primary';use.textContent='Use in Character Canvas';use.addEventListener('click',()=>useAiImage(index));const save=document.createElement('button');save.type='button';save.className='secondary-btn';save.textContent=aiGeneratedMimeType==='image/png'?'Download PNG':'Download JPG';save.addEventListener('click',()=>download(`royalty-ai-character-${index+1}.${aiGeneratedMimeType==='image/png'?'png':'jpg'}`,new Uint8Array(atob(item).split('').map(c=>c.charCodeAt(0))), aiGeneratedMimeType));actions.append(use,save);card.append(img,actions);grid.append(card)});
 $('#ai-results').hidden=!images.length;
}
function useAiImage(index){
 const encoded=aiGeneratedImages[index];if(!encoded)return;
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:aiGeneratedMimeType});const nextUrl=URL.createObjectURL(blob);const img=$('#imported-png-reference');
 img.onload=()=>{if(importedPngObjectUrl)URL.revokeObjectURL(importedPngObjectUrl);importedPngObjectUrl=nextUrl;img.hidden=false;$('.stage').classList.add('imported-image-mode');$('#clear-imported-png').hidden=false;$('#viewtag').textContent='AI GENERATED IMAGE';generatedBodyParts=[];$('#generated-parts-panel').hidden=true;$('#generated-parts-list').replaceChildren();$('#download-parts-zip-top').disabled=true;try{autoRigFromPng(img);generateStarterAnimation();$('#rig-status').textContent='AI character loaded. Starter rig and animation keyframes created; refine joint positions before production.';}catch(e){$('#rig-status').textContent='AI character loaded. Adjust the starter rig manually.'}$('#charname').textContent=(state.name||'AI Character')+' · AI artwork';notice('AI character loaded into the canvas.');$('.canvas-card').scrollIntoView({behavior:'smooth',block:'start'});};img.onerror=()=>{URL.revokeObjectURL(nextUrl);$('#ai-status').textContent='Could not load the generated image. Please try again.'};img.src=nextUrl;
}
async function generateAiCharacter(){
 const prompt=$('#ai-character-prompt').value.trim();if(!prompt){$('#ai-status').textContent='Please describe your character first.';$('#ai-character-prompt').focus();return;}
 const button=$('#ai-generate'),status=$('#ai-status');button.disabled=true;button.textContent='Generating…';status.textContent='Creating your original cartoon character. This may take a little while.';
 const style=$('#ai-style').value,framing=$('#ai-framing').value,background=$('#ai-background').value,quality=$('#ai-quality').value,variations=Number($('#ai-count').value)||1;
 const finalPrompt=`Create one original, memorable cartoon character based on this exact brief: ${prompt}. Style: ${aiStyleDescriptions[style]}. Composition: ${aiFrameDescriptions[framing]}. Make the character visually coherent, appealing, expressive and suitable for professional animation. Preserve requested details. Character only; no watermark, lettering, captions, logo, border or extra characters unless requested. Use a simple clean studio background.`;
 try{const aiApiBase=(import.meta.env.VITE_AI_API_BASE_URL||'').replace(/\/$/,'');const apiStyle=style==='both'?'auto':style;const response=await fetch(`${aiApiBase}/api/character/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:finalPrompt,style:apiStyle,steps:4,n:variations})});const payload=await response.json().catch(()=>({}));if(!response.ok||payload.success===false)throw new Error(payload.error||`AI service returned ${response.status}`);const returnedImages=Array.isArray(payload.images)?payload.images:(payload.imageBase64?[payload.imageBase64]:[]);if(!returnedImages.length)throw new Error('The AI service returned no images.');aiGeneratedImages=returnedImages;aiGeneratedMimeType=payload.mimeType||'image/jpeg';renderAiImages(aiGeneratedImages,aiGeneratedMimeType);status.textContent=`${payload.style||apiStyle} character generated successfully with ${payload.model||'Cloudflare Workers AI'}. Select it to load it into the studio.`;$('#ai-results').scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(error){status.textContent=error.message.includes('Failed to fetch')?'Cannot reach the AI service. Check that the Cloudflare Worker is deployed and connected.':error.message;}
 finally{button.disabled=false;button.textContent='✦ Generate with AI';}
}
$('#ai-generate').addEventListener('click',generateAiCharacter);
$$('[data-ai-prompt]').forEach(button=>button.addEventListener('click',()=>{$('#ai-character-prompt').value=button.dataset.aiPrompt;$('#ai-character-prompt').focus()}));

// Project workflow additions: versioned JSON files, validated import, named projects.
state.name = state.name || 'Bobo';
const projectTools = document.createElement('div');
projectTools.className = 'project-tools card';
projectTools.innerHTML = `<div class="project-tools-head"><div><div class="section-kicker">PROJECT WORKSPACE</div><strong>Save and manage your characters</strong></div><span id="save-status" aria-live="polite">Local demo</span></div>
<div class="project-tool-row"><label class="project-name-label" for="character-name">Character name</label><input id="character-name" maxlength="48" value="" placeholder="Name your character"><button class="secondary-btn" id="save-project">Save project</button><button class="secondary-btn" id="new-project">New</button><button class="secondary-btn" id="export-project">Export project</button><button class="secondary-btn" id="import-project">Import project</button><input id="project-file" type="file" accept=".json,application/json" hidden></div>
<div class="saved-projects"><span>Saved projects</span><div id="project-list">No saved projects yet.</div></div>`;
$('.workspace').after(projectTools);
// Production-lab additions: prompt parser, animation controls, rig pose controls,
// keyframe data, transparent PNG export, CSS 3D turntable and audio-driven mouth poses.
const lab=document.createElement('section'); lab.className='card pro-lab'; lab.innerHTML=`
 <div class="section-kicker">05 / ANIMATION & PRODUCTION LAB</div><h2>Animate, rig and export</h2>
 <div class="pro-grid">
  <section class="pro-module"><h3>Animation preview</h3><label>Motion<select id="motion-preset"><option value="idle">Idle</option><option value="walk">Walk</option><option value="run">Run</option><option value="jump">Jump</option><option value="dance">Dance</option></select></label><div class="inline-controls"><button class="primary" id="play-motion">▶ Play</button><button class="secondary-btn" id="stop-motion">■ Stop</button><label>Speed <input id="motion-speed" type="range" min="0.5" max="2" step="0.1" value="1"></label></div><label>Timeline <input id="timeline-time" type="range" min="0" max="100" value="0"></label><div class="inline-controls"><button class="secondary-btn" id="add-keyframe">＋ Add keyframe</button><button class="secondary-btn" id="export-keyframes">Export timeline JSON</button></div><div id="keyframe-list" class="keyframe-list">No keyframes yet.</div><p class="help">Preview motions are procedural 2D motion cycles. Keyframes save pose and timing data.</p></section>
  <section class="pro-module"><h3>Bone pose controls</h3><p class="help">Adjust guide joints and save pose values for animation planning.</p><div class="bone-controls">${[['head','Head tilt'],['torso','Torso lean'],['leftArm','Left arm'],['rightArm','Right arm'],['leftLeg','Left leg'],['rightLeg','Right leg']].map(([id,label])=>`<label>${label}<input type="range" min="-45" max="45" value="0" data-bone="${id}"><output data-bone-value="${id}">0°</output></label>`).join('')}</div><button class="secondary-btn" id="reset-bones">Reset joint values</button><p class="help">These are pose/rig guide controls; full independent mesh deformation needs layered artwork and a skeletal runtime.</p></section>
  <section class="pro-module"><h3>3D turntable preview</h3><label class="check-row"><input id="preview-3d" type="checkbox"><span>Enable perspective turntable</span></label><label>Rotation <input id="turntable-angle" type="range" min="-45" max="45" value="0"></label><p class="help">A CSS perspective presentation of the 2D artwork, not a true volumetric 3D model.</p></section>
  <section class="pro-module"><h3>Voice lip-sync</h3><label>Audio file <input id="lip-audio-file" type="file" accept="audio/*"></label><audio id="lip-audio" controls></audio><div class="inline-controls"><button class="secondary-btn" id="mic-lipsync">🎙 Use microphone</button><button class="secondary-btn" id="stop-mic" disabled>Stop mic</button></div><p id="lip-status" class="help">Choose audio and play it to drive mouth poses from volume.</p></section>
 </div>
 <section class="pro-module rig-editor-module"><h3>PNG character bone rig</h3><p class="help">Import a PNG, then drag the purple joint dots to line up the skeleton with the head, shoulders, elbows, wrists, hips, knees and feet.</p><div class="inline-controls"><button class="primary" id="rig-toggle">Show bone rig</button><button class="secondary-btn" id="rig-auto">✨ Auto-rig PNG</button><button class="primary" id="generate-body-parts" type="button">✂ Generate all body parts</button><button class="secondary-btn" id="download-parts-zip-top" type="button" disabled>↓ Download all body parts ZIP</button><button class="secondary-btn" id="generate-download-parts" type="button">✂ Generate + Download ZIP</button><button class="secondary-btn" id="rig-reset">Reset joints</button><button class="secondary-btn" id="rig-export">↓ Save rig JSON</button><button class="secondary-btn" id="rig-import">↑ Load rig JSON</button><input id="rig-file" type="file" accept=".json,application/json" hidden><button class="secondary-btn" id="rig-play">▶ Preview skeleton motion</button></div><label class="check-row"><input id="rig-labels" type="checkbox" checked><span>Show joint labels</span></label><p class="help" id="rig-status">Default humanoid skeleton ready. Drag joints on the canvas to fit your imported PNG.</p><div id="generated-parts-panel" class="generated-parts-panel" hidden><strong>Generated transparent body parts</strong><div id="generated-parts-list" class="generated-parts-list"></div><button class="primary" id="download-all-parts" type="button">↓ Download body parts ZIP</button></div><p class="help"><strong>How it works:</strong> Drag the purple joints directly over your imported PNG to build and save its skeleton. You can reload the rig JSON later. Preview animates the skeleton guide. Auto-rig estimates joint locations from the PNG silhouette and creates starter keyframe data. It cannot identify exact anatomy or bend a flattened PNG; real limb deformation requires separate transparent body-part layers or mesh cutout rigging.</p></section>
 <div class="pro-export"><button class="primary" id="export-png">↓ Export transparent PNG</button><label class="help" for="png-scale">Resolution <select id="png-scale"><option value="1">1× · 400 × 390</option><option value="2" selected>2× · 800 × 780</option><option value="4">4× · 1600 × 1560</option></select></label><label class="check-row"><input id="png-background" type="checkbox"><span>White background (otherwise transparent)</span></label><span class="help">Exports the current character view as a PNG image.</span></div>`;
projectTools.after(lab);
$('#jump-animation').addEventListener('click',()=>{lab.scrollIntoView({behavior:'smooth',block:'start'});lab.classList.add('lab-highlight');setTimeout(()=>lab.classList.remove('lab-highlight'),1400)});
$('#character-name').value=state.name;
const PROJECT_KEY='royalty2d-projects-v1';
function readProjects(){try{const v=JSON.parse(localStorage.getItem(PROJECT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function projectData(){return {format:'royalty2d-project',version:1,updatedAt:new Date().toISOString(),character:{name:$('#character-name').value.trim()||character,prompt:state.prompt,style:state.style,palette:[...palette],species},pose:{view:state.view,expression:state.expression,mouth:state.mouth,hand:state.hand},guides:{rig:state.rig},generation:{mode:'procedural-local',seed:state.seed||1}}}
function validateProject(d){return !!d&&d.format==='royalty2d-project'&&d.version===1&&d.character&&typeof d.character.prompt==='string'&&d.character.prompt.length<=1200&&typeof d.character.name==='string'&&d.character.name.length<=48&&['cute','wacky','storybook'].includes(d.character.style)&&d.pose&&['front','side','back','top'].includes(d.pose.view)&&['happy','surprised','sad','silly','angry'].includes(d.pose.expression)&&['REST','AI','E','O','U','FV','MBP','L'].includes(d.pose.mouth)&&['open','fist','point','wave','pinch','thumb'].includes(d.pose.hand)&&d.guides&&typeof d.guides.rig==='boolean'&&(!d.character.palette||(Array.isArray(d.character.palette)&&d.character.palette.length===3&&d.character.palette.every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))))}
function refreshProjects(){const list=$('#project-list');const items=readProjects();list.innerHTML='';if(!items.length){list.textContent='No saved projects yet.';return}items.forEach((item,index)=>{const b=document.createElement('button');b.className='project-chip';b.textContent=item.character.name||`Project ${index+1}`;b.title='Open saved project';b.addEventListener('click',()=>applyProject(item));list.append(b)})}
function applyProject(d){if(!validateProject(d)){notice('This project file is invalid or uses an unsupported version.');return}state.prompt=d.character.prompt;state.style=d.character.style||'cute';state.view=d.pose.view;state.expression=d.pose.expression;state.mouth=d.pose.mouth;state.hand=d.pose.hand;state.rig=d.guides.rig;state.name=d.character.name||'Character';$('#prompt').value=state.prompt;$('#style').value=state.style;$('#character-name').value=state.name;setPalette();if(Array.isArray(d.character.palette)&&d.character.palette.length===3&&d.character.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c)))palette=[...d.character.palette];draw();notice('Project loaded successfully.')}
function saveProject(){const d=projectData();const items=readProjects();const at=items.findIndex(x=>x.character?.name===d.character.name);if(at>=0)items[at]=d;else items.unshift(d);try{localStorage.setItem(PROJECT_KEY,JSON.stringify(items.slice(0,30)));$('#save-status').textContent='Saved locally';notice('Project saved in this browser. Export a JSON backup to move it to another device.');refreshProjects()}catch{notice('Could not save: browser storage may be full or unavailable. Export the project JSON instead.')}}
$('#save-project').addEventListener('click',saveProject);
$('#character-name').addEventListener('change',()=>{remember();state.name=$('#character-name').value.trim()||'Character';$('#save-status').textContent='Unsaved changes';draw()});
$('#export-project').addEventListener('click',()=>download('royalty-2d-project.json',JSON.stringify(projectData(),null,2),'application/json'));
$('#import-project').addEventListener('click',()=>$('#project-file').click());
$('#project-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>2_000_000){notice('Import rejected: project files must be smaller than 2 MB.');e.target.value='';return}try{const d=JSON.parse(await file.text());if(!validateProject(d))throw new Error('Unsupported or malformed project structure');applyProject(d)}catch(err){notice(`Import failed: ${err.message}`)}finally{e.target.value=''}});
$('#new-project').addEventListener('click',()=>{if(!confirm('Start a new character? Unsaved changes will be replaced.'))return;remember();Object.assign(state,{prompt:'A funny little purple dragon with big eyes, a round belly and tiny wings',view:'front',expression:'happy',mouth:'REST',hand:'open',rig:true,style:'cute',name:'Bobo',zoom:1,panX:0,panY:0});$('#prompt').value=state.prompt;$('#style').value='cute';$('#character-name').value='Bobo';setPalette();draw();notice('New character workspace ready.')});
refreshProjects();
$('#undo').addEventListener('click',undo); $('#redo').addEventListener('click',redo);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}});
const paletteHost=$('#palette-options'); palettes.forEach((colors,index)=>{const b=document.createElement('button');b.type='button';b.className='palette-swatch';b.title=`Palette ${index+1}`;b.setAttribute('aria-label',`Select palette ${index+1}`);b.innerHTML=colors.map(c=>`<i style="background:${c}"></i>`).join('');b.addEventListener('click',()=>{remember();palette=[...colors];draw();notice(`Colour palette ${index+1} applied.`)});paletteHost.append(b)});
$('#zoom-in').addEventListener('click',()=>{state.zoom=Math.min(4,+(state.zoom*1.2).toFixed(2));updateCanvasViewport()});
$('#zoom-out').addEventListener('click',()=>{state.zoom=Math.max(.25,+(state.zoom/1.2).toFixed(2));updateCanvasViewport()});
$('#zoom-fit').addEventListener('click',()=>{state.zoom=1;state.panX=0;state.panY=0;updateCanvasViewport()});
let panEnabled=false,panDrag=null;
const stageEl=$('.stage');
function updateCanvasViewport(){
 const z=Math.max(.25,Math.min(4,Number(state.zoom)||1));state.zoom=z;
 stageEl?.style.setProperty('--view-zoom',String(z));stageEl?.style.setProperty('--pan-x',`${state.panX||0}px`);stageEl?.style.setProperty('--pan-y',`${state.panY||0}px`);
 const label=$('#zoom-level');if(label)label.textContent=`${Math.round(z*100)}%`;
}
$('#pan-toggle').addEventListener('click',()=>{panEnabled=!panEnabled;$('#pan-toggle').classList.toggle('active',panEnabled);$('#pan-toggle').setAttribute('aria-pressed',String(panEnabled));stageEl.classList.toggle('pan-mode',panEnabled);$('#pan-toggle').textContent=panEnabled?'✋ Pan ON':'✋ Pan'});
stageEl.addEventListener('pointerdown',e=>{if(!panEnabled && e.button!==1 && !(e.buttons===1&&e.shiftKey))return;if(e.target.closest('.rig-joint'))return;panDrag={id:e.pointerId,x:e.clientX,y:e.clientY,originX:state.panX||0,originY:state.panY||0};stageEl.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();},{capture:true});
stageEl.addEventListener('pointermove',e=>{if(!panDrag||panDrag.id!==e.pointerId)return;state.panX=panDrag.originX+(e.clientX-panDrag.x);state.panY=panDrag.originY+(e.clientY-panDrag.y);updateCanvasViewport()});
function endPan(e){if(panDrag&&panDrag.id===e.pointerId){panDrag=null;if(stageEl.hasPointerCapture(e.pointerId))stageEl.releasePointerCapture(e.pointerId)}}
stageEl.addEventListener('pointerup',endPan);stageEl.addEventListener('pointercancel',endPan);
stageEl.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.25,Math.min(4,state.zoom*(e.deltaY<0?1.12:1/1.12)));updateCanvasViewport()},{passive:false});
updateCanvasViewport();
refreshProjects();

// Editable 2D skeleton overlay for imported PNG characters.
const rigSvg=$('#rig-overlay');
const rigBase={root:[200,210],head:[200,72],neck:[200,125],chest:[200,158],pelvis:[200,235],lShoulder:[157,151],lElbow:[125,195],lWrist:[102,237],rShoulder:[243,151],rElbow:[275,195],rWrist:[298,237],lHip:[180,240],lKnee:[170,300],lAnkle:[162,354],rHip:[220,240],rKnee:[230,300],rAnkle:[238,354]};
let rigPoints=JSON.parse(JSON.stringify(rigBase)),rigVisible=false,rigRaf=0,rigPreviewBase=null,pngRigBounds=null;
// Estimate the visible non-transparent PNG bounds, then auto-place a humanoid guide rig.
function autoRigFromPng(image){
 const probe=document.createElement('canvas'),pc=probe.getContext('2d',{willReadFrequently:true});probe.width=128;probe.height=128;pc.clearRect(0,0,128,128);pc.drawImage(image,0,0,128,128);
 const pixels=pc.getImageData(0,0,128,128).data;let minX=128,minY=128,maxX=-1,maxY=-1;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){if(pixels[(y*128+x)*4+3]>24){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}}
 if(maxX<0){minX=10;minY=3;maxX=117;maxY=124}
 const iw=maxX-minX+1,ih=maxY-minY+1,scale=Math.min(400/image.naturalWidth,390/image.naturalHeight),drawW=image.naturalWidth*scale,drawH=image.naturalHeight*scale,offX=(400-drawW)/2,offY=(390-drawH)/2;
 const x0=offX+(minX/128)*drawW,x1=offX+((maxX+1)/128)*drawW,y0=offY+(minY/128)*drawH,y1=offY+((maxY+1)/128)*drawH;
 const w=x1-x0,h=y1-y0,cx=(x0+x1)/2,X=(f)=>Math.max(4,Math.min(396,cx+w*f)),Y=(f)=>Math.max(4,Math.min(386,y0+h*f));
 rigPoints={root:[cx,Y(.64)],head:[cx,Y(.14)],neck:[cx,Y(.29)],chest:[cx,Y(.39)],pelvis:[cx,Y(.62)],lShoulder:[X(-.20),Y(.39)],lElbow:[X(-.34),Y(.52)],lWrist:[X(-.43),Y(.65)],rShoulder:[X(.20),Y(.39)],rElbow:[X(.34),Y(.52)],rWrist:[X(.43),Y(.65)],lHip:[X(-.10),Y(.63)],lKnee:[X(-.12),Y(.80)],lAnkle:[X(-.13),Y(.97)],rHip:[X(.10),Y(.63)],rKnee:[X(.12),Y(.80)],rAnkle:[X(.13),Y(.97)]};
 pngRigBounds={x:x0,y:y0,width:w,height:h};rigVisible=true;$('#rig-toggle').textContent='Hide bone rig';drawRig();return {bounds:pngRigBounds};
}
function generateStarterAnimation(){
 const clips={idle:[[0,0,0,0,0,0],[.5,2,-3,4,-4,1],[1,0,0,0,0,0]],walk:[[0,0,0,-22,22,22],[.25,0,0,22,-22,-22],[.5,0,0,-22,22,22],[.75,0,0,22,-22,-22],[1,0,0,-22,22,22]],run:[[0,0,0,-38,38,35],[.2,0,0,38,-38,-35],[.4,0,0,-38,38,35],[.6,0,0,38,-38,-35],[.8,0,0,-38,38,35]],jump:[[0,0,0,0,0,0],[.25,-8,-5,-20,20,-25],[.6,4,5,15,-15,18],[1,0,0,0,0,0]],dance:[[0,0,0,-25,25,-15],[.25,12,12,25,-25,15],[.5,-8,-12,-25,25,-15],[.75,12,12,25,-25,15],[1,0,0,0,0,0]]};
 const rows=[];for(const [clip,frames] of Object.entries(clips))frames.forEach(([t,head,torso,leftArm,rightArm,leftLeg],i)=>rows.push({clip,time:t*4,view:state.view,expression:'happy',mouth:'REST',hand:'open',bones:{head,torso,leftArm,rightArm,leftLeg,rightLeg:-leftLeg},generated:true}));
 keyframes=rows.sort((a,b)=>a.time-b.time);refreshKeyframes();
}

const rigBones=[['head','neck'],['neck','chest'],['chest','pelvis'],['chest','lShoulder'],['lShoulder','lElbow'],['lElbow','lWrist'],['chest','rShoulder'],['rShoulder','rElbow'],['rElbow','rWrist'],['pelvis','lHip'],['lHip','lKnee'],['lKnee','lAnkle'],['pelvis','rHip'],['rHip','rKnee'],['rKnee','rAnkle']];
function drawRig(){
 if(!rigSvg)return;
 rigSvg.innerHTML='';
 const ns='http://www.w3.org/2000/svg';
 // Draw a visible two-layer bone on top of the imported artwork. The dark
 // outline keeps the rig readable on both light and dark character colours.
 const boneLayer=document.createElementNS(ns,'g');boneLayer.setAttribute('class','rig-bone-layer');boneLayer.setAttribute('pointer-events','none');
 rigBones.forEach(([a,b])=>{
  const [x1,y1]=rigPoints[a],[x2,y2]=rigPoints[b];
  const outline=document.createElementNS(ns,'line');
  outline.setAttribute('x1',x1);outline.setAttribute('y1',y1);outline.setAttribute('x2',x2);outline.setAttribute('y2',y2);outline.setAttribute('class','rig-bone-outline');boneLayer.append(outline);
  const shaft=document.createElementNS(ns,'line');
  shaft.setAttribute('x1',x1);shaft.setAttribute('y1',y1);shaft.setAttribute('x2',x2);shaft.setAttribute('y2',y2);shaft.setAttribute('class','rig-bone');boneLayer.append(shaft);
 });
 rigSvg.append(boneLayer);
 Object.entries(rigPoints).forEach(([name,pt])=>{
  const g=document.createElementNS(ns,'g');g.setAttribute('class','rig-joint');g.dataset.joint=name;
  const hit=document.createElementNS(ns,'circle');hit.setAttribute('cx',pt[0]);hit.setAttribute('cy',pt[1]);hit.setAttribute('r',name==='root'?13:11);hit.setAttribute('class','rig-joint-hit');g.append(hit);
  const c=document.createElementNS(ns,'circle');c.setAttribute('cx',pt[0]);c.setAttribute('cy',pt[1]);c.setAttribute('r',name==='root'?7:6);c.setAttribute('class','rig-joint-dot');g.append(c);
  if($('#rig-labels')?.checked){const t=document.createElementNS(ns,'text');t.setAttribute('x',pt[0]+9);t.setAttribute('y',pt[1]-9);t.textContent=name.replace(/([A-Z])/g,' $1');g.append(t)}
  rigSvg.append(g);
 });
 rigSvg.style.display=rigVisible?'block':'none';
}
function rigPointerPosition(evt){const pt=rigSvg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;return pt.matrixTransform(rigSvg.getScreenCTM().inverse())}
let draggingJoint=null;rigSvg.addEventListener('pointerdown',e=>{const g=e.target.closest('.rig-joint');if(!g)return;draggingJoint=g.dataset.joint;rigSvg.setPointerCapture(e.pointerId);e.preventDefault()});rigSvg.addEventListener('pointermove',e=>{if(!draggingJoint)return;const p=rigPointerPosition(e);rigPoints[draggingJoint]=[Math.max(0,Math.min(400,p.x)),Math.max(0,Math.min(390,p.y))];drawRig()});rigSvg.addEventListener('pointerup',()=>{if(draggingJoint){$('#rig-status').textContent=`Moved ${draggingJoint}. Export the rig JSON to save your joint layout.`;draggingJoint=null}});rigSvg.addEventListener('pointercancel',()=>draggingJoint=null);
$('#rig-toggle').addEventListener('click',()=>{rigVisible=!rigVisible;$('#rig-toggle').textContent=rigVisible?'Hide bone rig':'Show bone rig';drawRig()});
$('#rig-import').addEventListener('click',()=>$('#rig-file').click());
$('#rig-file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>250000)throw new Error('Rig file is too large.');const d=JSON.parse(await f.text());if(d.format!=='royalty2d-rig'||d.version!==1||!d.joints||!rigBones.every(([a,b])=>Array.isArray(d.joints[a])&&Array.isArray(d.joints[b])&&d.joints[a].length===2&&d.joints[b].length===2&&d.joints[a].every(Number.isFinite)&&d.joints[b].every(Number.isFinite)))throw new Error('This is not a supported ROYALTY 2D rig file.');rigPoints=Object.fromEntries(Object.entries(d.joints).map(([k,v])=>[k,[Math.max(0,Math.min(400,v[0])),Math.max(0,Math.min(390,v[1]))]]));rigVisible=true;$('#rig-toggle').textContent='Hide bone rig';drawRig();$('#rig-status').textContent='Rig loaded. Drag any purple joint to adjust it.';notice('Character rig loaded.');}catch(err){notice(`Could not load rig: ${err.message}`)}finally{e.target.value=''}});$('#rig-labels').addEventListener('change',drawRig);$('#rig-reset').addEventListener('click',()=>{rigPoints=JSON.parse(JSON.stringify(rigBase));drawRig();$('#rig-status').textContent='Joint positions reset.'});$('#rig-export').addEventListener('click',()=>download('royalty-character-rig.json',JSON.stringify({format:'royalty2d-rig',version:1,canvas:{width:400,height:390},joints:rigPoints,bones:rigBones},null,2),'application/json'));
$('#rig-play').addEventListener('click',()=>{if(rigRaf){cancelAnimationFrame(rigRaf);rigRaf=0;rigPoints=JSON.parse(JSON.stringify(rigPreviewBase||rigBase));rigPreviewBase=null;drawRig();$('#rig-play').textContent='▶ Preview skeleton motion';$('#rig-status').textContent='Skeleton preview stopped. Your saved joint layout is unchanged.';return}rigVisible=true;rigPreviewBase=JSON.parse(JSON.stringify(rigPoints));$('#rig-toggle').textContent='Hide bone rig';$('#rig-play').textContent='■ Stop preview';$('#rig-status').textContent='Previewing the skeleton guide only — the flat PNG artwork stays still.';const start=performance.now();const tick=now=>{const t=(now-start)/450;rigPoints=JSON.parse(JSON.stringify(rigPreviewBase||rigBase));const swing=Math.sin(t)*22;const lift=Math.abs(Math.sin(t*2))*8;for(const [name,angle] of [['lElbow',-swing],['rElbow',swing],['lWrist',-swing*.55],['rWrist',swing*.55],['lKnee',swing*.6],['rKnee',-swing*.6]]){const [x,y]=rigPoints[name];const side=name.startsWith('l')?-1:1;rigPoints[name]=[x+Math.sin(angle*Math.PI/180)*18*side,y+Math.cos(angle*Math.PI/180)*5]}rigPoints.head[1]=rigPreviewBase.head[1]+Math.sin(t*2)*lift*.25;drawRig();rigRaf=requestAnimationFrame(tick)};rigRaf=requestAnimationFrame(tick)});
drawRig();

// Approximate body-part extraction from a single flattened PNG. Each part is a
// transparent masked crop around editable rig landmarks; overlaps are intentional.
let generatedBodyParts=[];
function bodyPartShapes(){
 const p=rigPoints, bounds=pngRigBounds||{x:100,y:20,width:200,height:340};
 // Scale mask widths to the detected character instead of using fixed-size crops.
 const unit=Math.max(8,Math.min(46,bounds.width*.15));
 const capsule=(a,b,rA,rB=rA)=>({type:'capsule',a:p[a],b:p[b],rA:unit*rA,rB:unit*rB});
 const ellipse=(key,rx,ry,dx=0,dy=0)=>({type:'ellipse',cx:p[key][0]+dx,cy:p[key][1]+dy,rx:unit*rx,ry:unit*ry});
 const curved=(points)=>({type:'curved',points});
 const L=p.lShoulder,R=p.rShoulder,LH=p.lHip,RH=p.rHip,C=p.chest,P=p.pelvis;
 return [
  ['head',ellipse('head',.70,.78)],
  ['neck',capsule('neck','chest',.23,.25)],
  ['torso',curved([[L[0],L[1]-unit*.20],[R[0],R[1]-unit*.20],[R[0]+unit*.48,C[1]+unit*.55],[RH[0]+unit*.35,P[1]-unit*.05],[P[0],P[1]+unit*.38],[LH[0]-unit*.35,P[1]],[L[0]-unit*.48,C[1]+unit*.55]])],
  ['pelvis',curved([[LH[0]-unit*.42,P[1]-unit*.10],[RH[0]+unit*.42,P[1]-unit*.10],[RH[0]+unit*.32,P[1]+unit*.45],[P[0],P[1]+unit*.62],[LH[0]-unit*.32,P[1]+unit*.45]])],
  ['left_upper_arm',capsule('lShoulder','lElbow',.30,.25)],['left_forearm',capsule('lElbow','lWrist',.25,.18)],['left_hand',ellipse('lWrist',.27,.30,0,unit*.12)],
  ['right_upper_arm',capsule('rShoulder','rElbow',.30,.25)],['right_forearm',capsule('rElbow','rWrist',.25,.18)],['right_hand',ellipse('rWrist',.27,.30,0,unit*.12)],
  ['left_thigh',capsule('lHip','lKnee',.31,.25)],['left_shin',capsule('lKnee','lAnkle',.24,.17)],
  ['left_foot',curved([[p.lAnkle[0]-unit*.20,p.lAnkle[1]-unit*.10],[p.lAnkle[0]+unit*.19,p.lAnkle[1]-unit*.10],[p.lAnkle[0]+unit*.49,p.lAnkle[1]+unit*.22],[p.lAnkle[0]+unit*.43,p.lAnkle[1]+unit*.36],[p.lAnkle[0]-unit*.17,p.lAnkle[1]+unit*.30]])],
  ['right_thigh',capsule('rHip','rKnee',.31,.25)],['right_shin',capsule('rKnee','rAnkle',.24,.17)],
  ['right_foot',curved([[p.rAnkle[0]-unit*.20,p.rAnkle[1]-unit*.10],[p.rAnkle[0]+unit*.19,p.rAnkle[1]-unit*.10],[p.rAnkle[0]+unit*.49,p.rAnkle[1]+unit*.22],[p.rAnkle[0]+unit*.43,p.rAnkle[1]+unit*.36],[p.rAnkle[0]-unit*.17,p.rAnkle[1]+unit*.30]])]
 ];
}
function makeBodyPartCanvas(image,shape){
 const W=400,H=390,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const scale=Math.min(W/image.naturalWidth,H/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale,ox=(W-dw)/2,oy=(H-dh)/2;
 ctx.drawImage(image,ox,oy,dw,dh);
 // Apply a smooth, anti-aliased anatomical mask to the original artwork.
 const mask=document.createElement('canvas');mask.width=W;mask.height=H;const m=mask.getContext('2d');m.fillStyle='#fff';m.beginPath();
 if(shape.type==='ellipse')m.ellipse(shape.cx,shape.cy,Math.max(3,shape.rx),Math.max(3,shape.ry),0,0,Math.PI*2);
 else if(shape.type==='capsule'){
  const [ax,ay]=shape.a,[bx,by]=shape.b,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  const a=shape.rA,b=shape.rB;
  m.moveTo(ax+nx*a,ay+ny*a);m.quadraticCurveTo(ax-nx*a*1.15,ay-ny*a*1.15,bx-nx*b,by-ny*b);m.quadraticCurveTo(bx+dx/len*b,by+dy/len*b,bx+nx*b,by+ny*b);m.quadraticCurveTo(bx-nx*b*1.15,by-ny*b*1.15,ax+nx*a,ay+ny*a);m.closePath();
 } else {
  const pts=shape.points;m.moveTo(pts[0][0],pts[0][1]);
  if(shape.type==='curved'&&pts.length>=5){for(let i=1;i<pts.length;i++){const prev=pts[i-1],cur=pts[i],next=pts[(i+1)%pts.length],mx=(prev[0]+cur[0])/2,my=(prev[1]+cur[1])/2;m.quadraticCurveTo(prev[0],prev[1],mx,my);if(i===pts.length-1)m.quadraticCurveTo(cur[0],cur[1],next[0],next[1]);}}
  else pts.slice(1).forEach(([x,y])=>m.lineTo(x,y));m.closePath();
 }
 m.fill();ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';return c;
}
function generateAllBodyParts(){
 const button=$('#generate-body-parts');
 const oldLabel=button.textContent;
 try{
  const img=$('#imported-png-reference');
  if(!importedPngObjectUrl||!img||!img.complete||!img.naturalWidth||!img.naturalHeight){
   notice('Import a PNG character first, then click Generate All Body Parts.');
   $('#rig-status').textContent='No ready PNG image found. Import a PNG before generating body parts.';
   return false;
  }
  // One click now builds the complete starter workflow: fitted skeleton, body
  // part layers, and five animation clips with editable keyframes.
  if(!pngRigBounds) autoRigFromPng(img);
  rigVisible=true;
  $('#rig-toggle').textContent='Hide bone rig';
  drawRig();
  generateStarterAnimation();
  const shapes=bodyPartShapes();
  if(!Array.isArray(shapes)||!shapes.length) throw new Error('No body-part shapes were created.');
  button.disabled=true;
  button.textContent='Generating body parts…';
  const nextParts=shapes.map(([name,shape])=>{
   const canvas=makeBodyPartCanvas(img,shape);
   if(!canvas||!canvas.width||!canvas.height) throw new Error(`Could not create ${name}.`);
   return {name,canvas};
  });
  generatedBodyParts=nextParts;
  const panel=$('#generated-parts-panel'),list=$('#generated-parts-list');
  if(!panel||!list) throw new Error('The generated body-parts preview panel is missing.');
  panel.hidden=false;
  list.replaceChildren();
  generatedBodyParts.forEach(part=>{
   const row=document.createElement('div');row.className='generated-part-row';
   const thumb=document.createElement('canvas');thumb.width=64;thumb.height=64;
   const thumbCtx=thumb.getContext('2d');
   if(thumbCtx)thumbCtx.drawImage(part.canvas,0,0,64,64);
   const label=document.createElement('span');label.textContent=part.name.replaceAll('_',' ');
   const btn=document.createElement('button');btn.className='secondary-btn';btn.type='button';btn.textContent='↓ PNG';
   btn.addEventListener('click',()=>downloadBodyPart(part));
   row.append(thumb,label,btn);list.append(row);
  });
  $('#download-parts-zip-top').disabled=false;
  $('#rig-status').textContent=`Complete! Generated ${generatedBodyParts.length} body-part PNGs, fitted the skeleton rig, and created Idle, Walk, Run, Jump and Dance keyframes. Adjust the purple joints, then use Preview skeleton motion to test the rig guide.`;
  notice(`Complete! ${generatedBodyParts.length} body parts, skeleton rig and 5 animation clips generated.`);
  return true;
 }catch(err){
  $('#rig-status').textContent=`Body-part generation failed: ${err?.message||'Unknown error'}`;
  notice(`Body-part generation failed: ${err?.message||'Unknown error'}`);
  console.error('ROYALTY 2D STUDIO body-part generation error:',err);
  return false;
 }finally{
  button.disabled=false;
  button.textContent=oldLabel;
 }
}
function downloadBodyPart(part){part.canvas.toBlob(blob=>{if(!blob){notice('Could not export '+part.name);return}const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`${part.name}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)},'image/png')}
$('#generate-body-parts').addEventListener('click',generateAllBodyParts);
// Build a standards-compliant ZIP archive in-browser (STORE method; no external library/network needed).
function zipCrc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
function zipU16(view,offset,value){view.setUint16(offset,value,true)}
function zipU32(view,offset,value){view.setUint32(offset,value>>>0,true)}
function makeZip(files){
 const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;
 for(const file of files){const name=enc.encode(file.name),data=file.bytes,crc=zipCrc32(data),local=new Uint8Array(30+name.length+data.length),lv=new DataView(local.buffer);
  zipU32(lv,0,0x04034b50);zipU16(lv,4,20);zipU16(lv,6,0);zipU16(lv,8,0);zipU16(lv,10,0);zipU16(lv,12,0);zipU32(lv,14,crc);zipU32(lv,18,data.length);zipU32(lv,22,data.length);zipU16(lv,26,name.length);zipU16(lv,28,0);local.set(name,30);local.set(data,30+name.length);locals.push(local);
  const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);zipU32(cv,0,0x02014b50);zipU16(cv,4,20);zipU16(cv,6,20);zipU16(cv,8,0);zipU16(cv,10,0);zipU16(cv,12,0);zipU16(cv,14,0);zipU32(cv,16,crc);zipU32(cv,20,data.length);zipU32(cv,24,data.length);zipU16(cv,28,name.length);zipU16(cv,30,0);zipU16(cv,32,0);zipU16(cv,34,0);zipU16(cv,36,0);zipU32(cv,38,0);zipU32(cv,42,offset);central.set(name,46);centrals.push(central);offset+=local.length;
 }
 const centralSize=centrals.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);zipU32(ev,0,0x06054b50);zipU16(ev,4,0);zipU16(ev,6,0);zipU16(ev,8,files.length);zipU16(ev,10,files.length);zipU32(ev,12,centralSize);zipU32(ev,16,offset);zipU16(ev,20,0);
 return new Blob([...locals,...centrals,end],{type:'application/zip'});
}
async function downloadGeneratedPartsZip(){
 if(!generatedBodyParts.length){notice('Generate body parts first.');return}
 const button=$('#download-all-parts');button.disabled=true;button.textContent='Preparing ZIP…';
 try{
  const files=[];
  for(const part of generatedBodyParts){const blob=await new Promise((resolve,reject)=>part.canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not create '+part.name+'.png')),'image/png'));files.push({name:`body_parts/${part.name}.png`,bytes:new Uint8Array(await blob.arrayBuffer())})}
  const rig={format:'royalty2d-rig',version:1,canvas:{width:400,height:390},joints:rigPoints,bones:rigBones};
  files.push({name:'rig.json',bytes:new TextEncoder().encode(JSON.stringify(rig,null,2))});
  files.push({name:'README.txt',bytes:new TextEncoder().encode('ROYALTY 2D STUDIO - Generated Body Parts\n\nbody_parts/ contains one transparent PNG per generated body-part mask.\nrig.json contains the current joint positions and bone connections.\n\nNote: parts are approximate masks cut from the original flattened PNG. Check their alignment before animation.\n')});
  const zip=makeZip(files),url=URL.createObjectURL(zip),a=document.createElement('a');a.href=url;a.download='royalty2d-generated-character-parts.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notice(`ZIP downloaded with ${generatedBodyParts.length} body-part PNGs, rig.json and README.`);
 }catch(err){notice('ZIP export failed: '+err.message)}finally{button.disabled=false;button.textContent='↓ Download body parts ZIP'}
}
$('#download-all-parts').addEventListener('click',downloadGeneratedPartsZip);
$('#download-parts-zip-top').addEventListener('click',downloadGeneratedPartsZip);
$('#generate-download-parts').addEventListener('click',()=>{if(generateAllBodyParts())downloadGeneratedPartsZip()});

// Motion timeline and pose data
const bonePose={head:0,torso:0,leftArm:0,rightArm:0,leftLeg:0,rightLeg:0};
let motionFrame=0,motionTimer=null,keyframes=[],micStream=null,audioCtx=null,analyser=null,lipRaf=0;
function setMotionFrame(t){const canvas=$('#canvas');const speed=Number($('#motion-speed').value)||1;const phase=t*speed;const preset=$('#motion-preset').value;let y=0,rot=0,sx=1,sy=1;
 if(preset==='walk'){y=Math.abs(Math.sin(phase*6))*-7;rot=Math.sin(phase*6)*3;}
 if(preset==='run'){y=Math.abs(Math.sin(phase*9))*-12;rot=Math.sin(phase*9)*5;sx=1+Math.sin(phase*9)*.015;}
 if(preset==='jump'){y=-Math.abs(Math.sin(phase*2))*45;rot=Math.sin(phase*2)*3;}
 if(preset==='dance'){y=Math.sin(phase*5)*-9;rot=Math.sin(phase*2.5)*10;sx=1+Math.sin(phase*5)*.035;}
 if(preset==='idle'){y=Math.sin(phase*2)*2;}
 canvas.style.transform=`perspective(700px) translateY(${y}px) rotateZ(${rot+bonePose.torso}deg) scale(${sx},${sy})`;
 $('#timeline-time').value=Math.round((t%4)/4*100);
}
function stopMotion(){if(motionTimer)cancelAnimationFrame(motionTimer);motionTimer=null;$('#canvas').style.transform='';$('#play-motion').textContent='▶ Play'}
function playMotion(){stopMotion();$('#play-motion').textContent='Ⅱ Pause';const start=performance.now()-motionFrame*1000;const tick=now=>{motionFrame=(now-start)/1000;setMotionFrame(motionFrame);motionTimer=requestAnimationFrame(tick)};motionTimer=requestAnimationFrame(tick)}
$('#play-motion').addEventListener('click',()=>motionTimer?stopMotion():playMotion());$('#stop-motion').addEventListener('click',()=>{stopMotion();motionFrame=0;$('#timeline-time').value=0});$('#motion-preset').addEventListener('change',()=>{motionFrame=0;if(motionTimer)playMotion()});$('#motion-speed').addEventListener('input',()=>{if(motionTimer)playMotion()});$('#timeline-time').addEventListener('input',e=>{motionFrame=Number(e.target.value)/100*4;setMotionFrame(motionFrame)});
function refreshKeyframes(){const el=$('#keyframe-list');el.innerHTML='';if(!keyframes.length){el.textContent='No keyframes yet.';return}keyframes.forEach((k,i)=>{const row=document.createElement('div');row.className='keyframe-row';const label=document.createElement('span');label.textContent=`${i+1}. ${k.clip||'custom'} · ${k.time.toFixed(2)}s · ${k.expression} · ${k.mouth}`;const del=document.createElement('button');del.textContent='×';del.title='Delete keyframe';del.onclick=()=>{keyframes.splice(i,1);refreshKeyframes()};row.append(label,del);el.append(row)})}
$('#add-keyframe').addEventListener('click',()=>{keyframes.push({time:Number($('#timeline-time').value)/100*4,view:state.view,expression:state.expression,mouth:state.mouth,hand:state.hand,bones:{...bonePose}});keyframes.sort((a,b)=>a.time-b.time);refreshKeyframes();notice('Keyframe added to the local timeline.')});
$('#export-keyframes').addEventListener('click',()=>download('royalty-animation-timeline.json',JSON.stringify({format:'royalty2d-timeline',version:1,fps:24,duration:4,keyframes},null,2),'application/json'));
$$('[data-bone]').forEach(input=>input.addEventListener('input',()=>{const id=input.dataset.bone;bonePose[id]=Number(input.value);$(`[data-bone-value="${id}"]`).textContent=`${input.value}°`;if(id==='torso')$('#canvas').style.transform=`rotateZ(${bonePose.torso}deg)`;$('#canvas').dataset.bonePose=JSON.stringify(bonePose)}));
$('#reset-bones').addEventListener('click',()=>{$$('[data-bone]').forEach(i=>{i.value=0;bonePose[i.dataset.bone]=0;$(`[data-bone-value="${i.dataset.bone}"]`).textContent='0°'});$('#canvas').style.transform='';$('#canvas').dataset.bonePose=JSON.stringify(bonePose)});
$('#preview-3d').addEventListener('change',e=>{$('#canvas').classList.toggle('turntable-3d',e.target.checked);$('#turntable-angle').disabled=!e.target.checked});$('#turntable-angle').addEventListener('input',e=>{$('#canvas').style.transform=`perspective(650px) rotateY(${e.target.value}deg)`});$('#turntable-angle').disabled=true;
// Export artwork through SVG -> canvas -> PNG; transparent because no background rect is included.
function exportCharacterPNG(){const scale=Number($('#png-scale')?.value)||2;const size=400*scale;const bg=$('#png-background')?.checked;const imported=$('#imported-png-reference');if(importedPngObjectUrl&&imported.complete&&imported.naturalWidth){const ratio=Math.min(size/imported.naturalWidth,(390*scale)/imported.naturalHeight);const w=Math.round(imported.naturalWidth*ratio),h=Math.round(imported.naturalHeight*ratio);const c=document.createElement('canvas');c.width=size;c.height=390*scale;const ctx=c.getContext('2d');if(bg){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)}else ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(imported,(size-w)/2,(c.height-h)/2,w,h);c.toBlob(b=>{if(!b){notice('PNG export failed.');return}const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`royalty-${(state.name||'imported-character').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-imported.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);notice('Imported PNG character exported.');},'image/png');return;}const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${390*scale}" viewBox="0 0 400 390">${svgStyles()}${bg?'<rect width="400" height="390" fill="#ffffff"/>':''}${characterSvg(state.view)}</svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=size;c.height=390*scale;const ctx=c.getContext('2d');if(bg){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)}else ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>{if(!b){notice('PNG export failed. Try SVG export instead.');return}const pngUrl=URL.createObjectURL(b);const a=document.createElement('a');a.href=pngUrl;a.download=`royalty-${(state.name||'character').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${state.view}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(pngUrl),2000);notice(`PNG exported at ${size} × ${390*scale}${bg?' with white background.':' with transparent background.'}`)},'image/png')};img.onerror=()=>{URL.revokeObjectURL(url);notice('Could not render PNG. Try SVG export instead.')};img.src=url}$('#export-png').addEventListener('click',exportCharacterPNG);$('#export-png-top').addEventListener('click',exportCharacterPNG);
// Import PNG as the visible character artwork on the canvas.
let importedPngObjectUrl='';
$('#import-png-top').addEventListener('click',()=>{const picker=$('#import-png-file');if(picker)picker.click();else notice('PNG file picker is unavailable. Reload the app and try again.');});
$('#import-png-file').addEventListener('change',async e=>{
 const picker=e.currentTarget,file=picker.files&&picker.files[0];if(!file)return;
 const isPng=(file.type==='image/png')||/\.png$/i.test(file.name);
 if(!isPng){notice('Please choose a .png image file.');picker.value='';return;}
 if(file.size>25*1024*1024){notice('This PNG is larger than 25 MB. Choose a smaller image.');picker.value='';return;}
 const nextUrl=URL.createObjectURL(file),img=$('#imported-png-reference');
 img.onload=()=>{
   if(importedPngObjectUrl)URL.revokeObjectURL(importedPngObjectUrl);importedPngObjectUrl=nextUrl;
   generatedBodyParts=[];$('#generated-parts-panel').hidden=true;$('#generated-parts-list').replaceChildren();$('#download-parts-zip-top').disabled=true;pngRigBounds=null;
   img.hidden=false;$('.stage').classList.add('imported-image-mode');$('#clear-imported-png').hidden=false;$('#viewtag').textContent='IMPORTED PNG';
   try{autoRigFromPng(img);generateStarterAnimation();$('#rig-status').textContent='PNG imported. Starter skeleton and Idle, Walk, Run, Jump and Dance keyframes are ready. Drag joints to refine the rig.';notice(`Imported ${file.name} successfully.`);}
   catch(err){$('#rig-status').textContent='PNG imported, but automatic rig setup failed. You can still position the skeleton manually.';notice(`PNG imported, but auto-rig could not finish: ${err.message||'unknown error'}`);}
   picker.value='';
 };
 img.onerror=()=>{URL.revokeObjectURL(nextUrl);notice('Could not read this PNG. Try opening it in an image editor and exporting it again as PNG.');picker.value='';};
 img.src=nextUrl;
});
$('#rig-auto').addEventListener('click',()=>{const img=$('#imported-png-reference');if(!importedPngObjectUrl||!img.complete||!img.naturalWidth){notice('Import a PNG character first.');return}autoRigFromPng(img);generateStarterAnimation();$('#rig-status').textContent='Auto-rig and five starter animation keyframe sets regenerated. Refine the joint positions for best results.';notice('Auto-rig and starter animation keyframes generated.');});
$('#clear-imported-png').addEventListener('click',()=>{const img=$('#imported-png-reference');img.onload=null;img.removeAttribute('src');img.hidden=true;$('.stage').classList.remove('imported-image-mode');if(importedPngObjectUrl)URL.revokeObjectURL(importedPngObjectUrl);importedPngObjectUrl='';$('#clear-imported-png').hidden=true;draw();notice('Imported PNG cleared. Generated vector character is visible again.');});
// Audio volume drives mouth shape selection. File playback stays local in the browser.
const audio=$('#lip-audio');$('#lip-audio-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(f){audio.src=URL.createObjectURL(f);$('#lip-status').textContent='Audio loaded locally. Press play to start volume-based lip sync.'}});
async function attachLipAnalyser(source){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')await audioCtx.resume();analyser=audioCtx.createAnalyser();analyser.fftSize=256;source.connect(analyser);const data=new Uint8Array(analyser.frequencyBinCount);const poses=['MBP','FV','AI','E','O','U'];const tick=()=>{analyser.getByteFrequencyData(data);const level=data.reduce((a,b)=>a+b,0)/data.length;const idx=level<5?0:Math.min(5,Math.floor(level/22));const pose=level<5?'REST':poses[idx];if(state.mouth!==pose){state.mouth=pose;$$('[data-mouth]').forEach(b=>b.classList.toggle('selected',b.dataset.mouth===pose));draw()}lipRaf=requestAnimationFrame(tick)};cancelAnimationFrame(lipRaf);tick()}
audio.addEventListener('play',async()=>{try{if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();const src=audioCtx.createMediaElementSource(audio);await attachLipAnalyser(src)}else await audioCtx.resume();$('#lip-status').textContent='Lip sync active: mouth poses respond to audio volume.'}catch(e){$('#lip-status').textContent='Audio analysis unavailable: '+e.message}});audio.addEventListener('pause',()=>{cancelAnimationFrame(lipRaf);state.mouth='REST';draw()});
$('#mic-lipsync').addEventListener('click',async()=>{try{micStream=await navigator.mediaDevices.getUserMedia({audio:true});if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();await attachLipAnalyser(audioCtx.createMediaStreamSource(micStream));$('#stop-mic').disabled=false;$('#lip-status').textContent='Microphone lip sync active. Browser microphone permission granted.'}catch(e){$('#lip-status').textContent='Microphone unavailable: '+e.message}});$('#stop-mic').addEventListener('click',()=>{micStream?.getTracks().forEach(t=>t.stop());micStream=null;cancelAnimationFrame(lipRaf);$('#stop-mic').disabled=true;state.mouth='REST';draw();$('#lip-status').textContent='Microphone stopped.'});

$('#prompt').value=state.prompt;
$('#style').value=state.style;
load();$('#prompt').value=state.prompt;$('#style').value=state.style;$('#character-name').value=state.name||'Bobo';
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>{$('#prompt').value=b.dataset.prompt;notice('Prompt loaded. Generate to update the concept.');}));
$('#generate').addEventListener('click',()=>{
 const prompt=$('#prompt').value.trim();
 if(!prompt){notice('Please describe your cartoon character first.');$('#prompt').focus();return;}
 remember(); state.prompt=prompt;state.style=$('#style').value;state.name=$('#character-name')?.value.trim()||state.name||'Character';setPalette();
 state.expression=state.style==='wacky'?'silly':'happy';state.view='front';state.mouth='REST';
 notice(species==='boy'?'Boy character generated from your description using the local human-character design. This is vector artwork, not cloud AI.':'Character concept updated from your description. This is a local vector illustration, not cloud AI generation.');
 draw();
});
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(state.view===b.dataset.view)return;remember();state.view=b.dataset.view;draw();}));
$$('[data-sheetview]').forEach(b=>b.addEventListener('click',()=>{if(state.view===b.dataset.sheetview)return;remember();state.view=b.dataset.sheetview;draw();}));
$$('[data-expression]').forEach(b=>b.addEventListener('click',()=>{if(state.expression===b.dataset.expression)return;remember();state.expression=b.dataset.expression;draw();}));
$$('[data-mouth]').forEach(b=>b.addEventListener('click',()=>{if(state.mouth===b.dataset.mouth)return;remember();state.mouth=b.dataset.mouth;draw();}));
$$('[data-hand]').forEach(b=>b.addEventListener('click',()=>{if(state.hand===b.dataset.hand)return;remember();state.hand=b.dataset.hand;draw();}));
$('#rig').addEventListener('change',e=>{remember();state.rig=e.target.checked;draw();});
$('#reset').addEventListener('click',()=>{remember();Object.assign(state,{prompt:'A funny little purple dragon with big eyes, a round belly and tiny wings',view:'front',expression:'happy',mouth:'REST',hand:'open',rig:true,style:'cute',name:'Bobo',zoom:1,panX:0,panY:0});$('#prompt').value=state.prompt;$('#style').value='cute';if($('#character-name'))$('#character-name').value='Bobo';setPalette();draw();notice('Design reset. Your default dragon concept is ready.');});
$('#export').addEventListener('click',()=>download('royalty-2d-'+state.view+'.svg',makeSvg(state.view),'image/svg+xml;charset=utf-8'));
$('#sheet-export').addEventListener('click',()=>{
 const views=['front','side','back','top'];let content=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="390" viewBox="0 0 1200 390"><title>${escapeXml(state.name||character)} character turnaround</title>${svgStyles()}<rect width="1200" height="390" fill="#f2f0f8"/>`;
 views.forEach((v,i)=>{content+=`<g transform="translate(${i*300},0)"><text x="150" y="28" font-family="Arial" font-size="16" text-anchor="middle" fill="#332849">${v.toUpperCase()} VIEW</text><g transform="translate(0,35)">${characterSvg(v,true)}</g></g>`;});
 content+='</svg>';download('royalty-2d-character-sheet.svg',content,'image/svg+xml;charset=utf-8');
});
$('#notes-export').addEventListener('click',()=>{
 const notes=`ROYALTY 2D STUDIO — CHARACTER PRODUCTION NOTES\nCharacter: ${character}\nPrompt: ${state.prompt}\nStyle: ${state.style}\nPalette: ${palette.join(', ')}\n\nTURNAROUND VIEWS\n- Front\n- Side\n- Back\n- Top\n\nSUGGESTED RIG HIERARCHY\nRoot > Torso > Neck > Head\nTorso > Left Shoulder > Upper Arm > Forearm > Hand\nTorso > Right Shoulder > Upper Arm > Forearm > Hand\nTorso > Left Hip > Thigh > Shin > Foot\nTorso > Right Hip > Thigh > Shin > Foot\nHead > Jaw/Mouth > Mouth Shape Library\n\nPHONEME POSES\nREST, AI, E, O, U, F/V, M/B/P, L/TH\n\nHAND POSES\nOpen, Fist, Point, Wave, Pinch, Thumb\n\nThis prototype creates vector-style illustrations and design notes. Views are approximations; validate proportions and redraw layered parts before production rigging. Phoneme timing and deformable rig data are not generated.\n`;
 download('royalty-2d-rigging-notes.txt',notes,'text/plain;charset=utf-8');
});
draw();
