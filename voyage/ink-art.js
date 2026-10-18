import {CHAPTERS,groundY,rocksFor,WORLD} from './game-core.js';
import {character as traveler} from './art.js';

// Artwork uses one source paper tone; the final wash warms every layer alike.
export const PAPER='#f2f1e9',XUAN_PAPER='#f0e4cc',INK='#242722';
const f=n=>Number(n.toFixed(2));
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const line=(d,w=2,color=INK,opacity=1)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
const contour=pts=>'M'+pts.map(([x,y])=>`${f(x)},${f(y)}`).join('L');

export function defs(){return `<defs>
 <filter id="xuanPaperTone" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".99174"/><feFuncG type="linear" slope=".94606"/><feFuncB type="linear" slope=".87554"/></feComponentTransfer></filter>
 <linearGradient id="ridgeWash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#54594f" stop-opacity=".65"/><stop offset=".3" stop-color="#787c6e" stop-opacity=".36"/><stop offset=".8" stop-color="#969a8c" stop-opacity=".06"/><stop offset="1" stop-color="#b2b5a7" stop-opacity="0"/></linearGradient>
 <linearGradient id="bottomMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAPER}" stop-opacity="0"/><stop offset="1" stop-color="${PAPER}" stop-opacity=".82"/></linearGradient>
 <linearGradient id="creekWash" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#809c95" stop-opacity=".36"/><stop offset=".45" stop-color="#9bb4ad" stop-opacity=".32"/><stop offset="1" stop-color="#b4c7bc" stop-opacity=".04"/></linearGradient>
 <filter id="brushEdge" x="-4%" y="-10%" width="108%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="13" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="2.1" xChannelSelector="R" yChannelSelector="G"/></filter>
 <filter id="softInk" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".6"/></filter>
 </defs>`;}

export function sky(){return `<rect x="-100" y="-100" width="4800" height="1100" fill="${PAPER}"/>`;}
export function distant(){return `<image href="./assets/huangshan-ink-v2.png" x="0" y="-100" width="3000" height="1000" preserveAspectRatio="none"/><image href="./assets/huangshan-ink-v2.png" x="0" y="-100" width="3000" height="1000" preserveAspectRatio="none" transform="translate(6000 0) scale(-1 1)"/><rect x="0" y="620" width="4800" height="180" fill="url(#bottomMist)"/>`;}

function washRibbon(x,y,width,height,seed,opacity=.16){
 const r=rng(seed);const pts=[];for(let i=0;i<=30;i++){let t=i/30;pts.push([x+t*width,y-Math.sin(Math.PI*t)*height*(.6+r()*.4)]);}
 const d=contour(pts)+`Q${x+width*.7},${y+height*.22} ${x+width*.4},${y+height*.17}Q${x+width*.1},${y+height*.5} ${x},${y}Z`;
 return `<path d="${d}" fill="#8f9485" opacity="${opacity}" filter="url(#brushEdge)"/>`;
}
export function middle(level=0){
 let s='';for(let i=0;i<8;i++)s+=washRibbon(-350+i*630,482+(i%3)*32-level*12,730+(i%2)*140,19+(i%3)*11,31+i,.09+(i%2)*.025);
 return s;
}

// A closer painted layer, present only in the third scroll. Opaque white
// walls and transparent surrounding paper let the mountain wash show through.
export function village(level){
 if(level!==2)return '';
 return `<image href="./assets/huizhou-village-v4.png" x="1410" y="290" width="640" height="214" preserveAspectRatio="xMidYMid meet" opacity=".9"/>`;
}

export function streams(level){
 // Every actual gap becomes a shallow ink-wash channel. Water stays below
 // the walking line; the existing jump and checkpoint rules still apply.
 return CHAPTERS[level].gaps.map(([a,b],i)=>{
  const y=groundY(level,a),w=b-a,c=(a+b)/2,bottom=890;
  const shape=`M${a+1} ${f(y+15)}Q${f(c)} ${f(y+23)} ${b-1} ${f(y+15)}Q${b+7} ${f(y+61)} ${b+12} ${f(y+100)}L${b+37} ${bottom}Q${f(c)} ${bottom-15} ${a-32} ${bottom}L${a-12} ${f(y+100)}Q${a-4} ${f(y+55)} ${a+1} ${f(y+15)}Z`;
  const clip=`creekClip-${level}-${i}`;
  let s=`<g class="creek"><defs><clipPath id="${clip}"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="${PAPER}" opacity=".86"/><path d="${shape}" fill="url(#creekWash)" filter="url(#brushEdge)"/><g clip-path="url(#${clip})">`;
  // Loose cross-current ripples and a few drifting white brush marks.
  for(let j=0;y+28+j*29<bottom;j++){
   const yy=y+28+j*29,span=w*(.25+(j%3)*.14),cx=c+Math.sin(j*2.1+i)*w*.16;
   s+=line(`M${f(cx-span/2)} ${f(yy)}q${f(span*.25)} -4 ${f(span*.5)} 0t${f(span*.5)} 0`,1.3,j%2?PAPER:'#68877f',j%2?.64:.24);
  }
  for(let j=0;j<3;j++){
   const x=c+(j-1)*w*.23;
   s+=`<path class="stream-flow" d="M${f(x)} ${f(y+18)}C${f(x-18)} ${f(y+85)} ${f(x+22)} ${f(y+135)} ${f(x+4)} ${f(y+195)}S${f(x-14)} ${bottom-60} ${f(x+8)} ${bottom}" fill="none" stroke="#f8f8ef" stroke-width="${j===1?2.5:1.8}" stroke-linecap="round" stroke-dasharray="9 15 21 27" opacity=".76" style="animation-delay:${-j*1.4-i*.7}s"/>`;
  }
  s+='</g>';
  for(const [x,yy,rx] of [[a+2,y+23,7],[a-2,y+34,4],[b-1,y+25,6]])s+=`<ellipse cx="${x}" cy="${f(yy)}" rx="${rx}" ry="2.5" fill="#788274" opacity=".46"/>`;
  return s+'</g>';
 }).join('');
}

export function pine(x,y,scale=1,seed=9){
 const r=rng(Math.imul(seed,104729)),height=116+r()*57,lean=(r()-.5)*48,count=3+Math.floor(r()*3),flip=r()<.5?-1:1;
 const shoulder=lean*.42+(r()-.5)*8,upper=lean*.78+(r()-.5)*5;
 const stem=t=>t<.48?shoulder*t/.48:t<.8?shoulder+(upper-shoulder)*(t-.48)/.32:upper+(lean-upper)*(t-.8)/.2;
 // Broad overlapping brush marks read as ink masses, including at the treetop.
 const crown=(cx,cy,span)=>{
  const marks=4+Math.floor(r()*3);let ink='';
  for(let i=0;i<marks;i++){
   const t=i/(marks-1),xx=cx+(t-.5)*span+(r()-.5)*5,yy=cy-Math.sin(t*Math.PI)*3+(r()-.5)*5;
   const width=14+r()*16,depth=4+r()*4,angle=(r()-.5)*23;
   const d=`M${f(-width*.55)} 0Q${f(-width*.42)} ${f(-depth*.6)} ${f(-width*.15)} ${f(-depth*.55)}L${f(width*.08)} ${f(-depth*.72)}Q${f(width*.31)} ${f(-depth*.5)} ${f(width*.54)} ${f(-depth*.12)}L${f(width*.41)} ${f(depth*.29)}Q${f(width*.08)} ${f(depth*.57)} ${f(-width*.2)} ${f(depth*.27)}Z`;
   ink+=`<path d="${d}" transform="translate(${f(xx)} ${f(yy)}) rotate(${f(angle)})" fill="${i===0?'#5b6051':INK}" opacity="${f(.65+r()*.3)}"/>`;
  }
  return `<g filter="url(#brushEdge)">${ink}</g>`;
 };
 let s=`<g transform="translate(${f(x)} ${f(y)}) scale(${scale})" opacity=".94">`;
 // Slender tapered trunks have a few angular changes, like brush strokes.
 s+=`<path d="M-2.7 1L${f(shoulder-1.7)} ${f(-height*.48)}L${f(upper-1)} ${f(-height*.8)}L${f(lean-.5)} ${f(-height)}L${f(lean+.65)} ${f(-height)}L${f(upper+1.3)} ${f(-height*.8)}L${f(shoulder+2.1)} ${f(-height*.48)}L2.4 1Z" fill="#434536"/>`;
 s+=line(`M-.7 -3L${f(shoulder-.3)} ${f(-height*.47)}L${f(upper-.2)} ${f(-height*.77)}`,.65,PAPER,.6);
 for(let j=0;j<count;j++){
  const t=.43+j/(count-1)*.48,a=stem(t),b=-height*t,side=(j%2?1:-1)*flip;
  const reach=(25+r()*32)*(1-t*.18),c=a+side*reach,d=b-7-r()*13,kx=a+side*reach*.36,ky=b-3+r()*4,span=23+r()*20;
  s+=line(`M${f(a)} ${f(b)}L${f(kx)} ${f(ky)}L${f(c)} ${f(d)}`,f(1.05+(1-t)*1.5),'#343a2d');
  if(j%2===0){
   const tx=kx+side*reach*.17,ty=d-6-r()*8;
   s+=line(`M${f(kx)} ${f(ky)}L${f(tx)} ${f(ty)}`,.9,'#343a2d');
   s+=crown(tx,ty,span*.55);
  }
  s+=crown(c,d,span);
 }
 s+=crown(lean,-height,26+r()*13);
 return s+'</g>';
}

export function boulder(level,{x,y,w,h},index=0){
 const r=rng(x*97+level*131+index),left=x+w*(.14+r()*.06),right=x+w*(.81+r()*.06),peak=.3+r()*.26;
 const p=(xx,yy)=>`${f(x+w*xx)} ${f(y+h*yy)}`;
 const base=[];for(let xx=right;xx>left;xx-=6)base.push([xx,groundY(level,xx)-.7]);base.push([left,groundY(level,left)-.7]);
 const shoulder=.14+r()*.12,side=.48+r()*.14;
 const rim=`M${f(left)} ${f(groundY(level,left)-.7)}Q${p(-.025,.67)} ${p(.075,.39)}Q${p(.13,shoulder)} ${p(.27,shoulder*.65)}Q${p(peak-.06,-.015)} ${p(peak+.07,.025)}Q${p(.68,.035+r()*.1)} ${p(.81,.18+r()*.09)}Q${p(.98,.31)} ${p(.99,side)}Q${p(.98,.82)} ${f(right)} ${f(groundY(level,right)-.7)}`;
 const d=rim+base.slice(1).map(([a,b])=>`L${f(a)} ${f(b)}`).join('')+'Z',clip=`stone-${level}-${index}-${x}`;
 // Neutral gray washes stay flat; the contact edge dissolves into the trail.
 let wash='';
 for(let j=0;j<7;j++){
  const a=.12+r()*.7,b=.2+r()*.57,len=.08+r()*.17;
  wash+=line(`M${p(a,b)}l${f(w*len*.35)} ${f(h*(r()-.5)*.1)}l${f(w*len*.25)} ${f(h*(r()-.5)*.16)}l${f(w*len*.4)} ${f(h*(r()-.5)*.12)}`,2+r()*5,'#777772',.09+r()*.09);
 }
 const crease=index%2===0?line(`M${p(.13,.66)}Q${p(.25,.65)} ${p(.3,.45)}Q${p(.35,.54)} ${p(.48,.54)}`,1.1,'#7c7c76',.36):'';
 const foot=[];for(let xx=left-7;xx<right+7;xx+=3)foot.push([xx,groundY(level,xx)]);foot.push([right+7,groundY(level,right+7)]);
 const bottom=Math.max(...base.map(([,yy])=>yy));
 return `<g filter="url(#brushEdge)"><defs><clipPath id="${clip}"><path d="${d}"/></clipPath><linearGradient id="${clip}-foot" gradientUnits="userSpaceOnUse" x1="${f(left-7)}" y1="0" x2="${f(right+7)}" y2="0"><stop stop-color="${PAPER}" stop-opacity="0"/><stop offset=".18" stop-color="${PAPER}" stop-opacity=".72"/><stop offset=".82" stop-color="${PAPER}" stop-opacity=".72"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></linearGradient><linearGradient id="${clip}-rim" gradientUnits="userSpaceOnUse" x1="0" y1="${f(y)}" x2="0" y2="${f(bottom)}"><stop stop-color="#686862" stop-opacity=".85"/><stop offset=".62" stop-color="#686862" stop-opacity=".78"/><stop offset="1" stop-color="#686862" stop-opacity=".18"/></linearGradient></defs>${line(contour(foot),7.5,`url(#${clip}-foot)`)}<path d="${d}" fill="#d8d8d1"/><g clip-path="url(#${clip})">${wash}${crease}</g>${line(rim,2.3,`url(#${clip}-rim)`)}</g>`;
}

export function pavilion(x,y){return `<g transform="translate(${x} ${f(y)})">
 <ellipse cx="0" cy="5" rx="78" ry="8" fill="#858c79" opacity=".13"/>
 <path d="M-64 0Q0 -6 64 0L70 6Q0 2 -70 6Z" fill="#7c8470" opacity=".6"/>
 <path d="M-31 -84L-31 -8M31 -84L31 -8" fill="none" stroke="#80866f" stroke-width="3" opacity=".65"/>
 <path d="M-49 -82L-47 0M49 -82L47 0M-48 -78Q0 -74 48 -78M-48 -62L-33 -77M48 -62L33 -77" fill="none" stroke="#535c47" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M-35 -19Q0 -21 35 -19M-29 -18L-29 -7M29 -18L29 -7" fill="none" stroke="#737c64" stroke-width="2.8" stroke-linecap="round"/>
 <path d="M-84 -98Q-74 -87 -56 -94Q-16 -110 0 -137Q18 -112 55 -94Q72 -87 84 -98Q78 -80 48 -79Q0 -71 -48 -79Q-78 -80 -84 -98Z" fill="#30372c" filter="url(#brushEdge)"/>
 <path d="M-70 -89Q0 -80 70 -89M-1 -133Q-12 -107 -40 -91M5 -126Q20 -103 42 -91" fill="none" stroke="#a4ab93" stroke-width="1.5" opacity=".62" stroke-linecap="round"/>
 <path d="M0 -135L0 -143M-4 -138Q0 -135 4 -138" fill="none" stroke="#3e4735" stroke-width="2.3" stroke-linecap="round"/>
 </g>`;}

export function trailSign(x,y){return `<g transform="translate(${x} ${f(y)})">
 <path d="M0 1L-1 -53" fill="none" stroke="#7c7d6c" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M-30 -48.5L-21 -55L22 -54L21 -41L-21 -42Z" fill="#c1c0ae" stroke="#777d6c" stroke-width="1" stroke-linejoin="round"/>
 </g>`;}

export function landscape(level){
 const c=CHAPTERS[level],r=rng(95+level),edge=[0,...c.gaps.flat().sort((a,b)=>a-b),WORLD];let s='';
 for(let k=0;k<edge.length-1;k+=2){
  const a=edge[k],b=edge[k+1],leftEdge=a===0?-180:a,pts=[];
  if(a===0)pts.push([leftEdge,groundY(level,a)]);
  for(let x=a;x<b;x+=8)pts.push([x,groundY(level,x)]);pts.push([b,groundY(level,b)]);
  let d=contour(pts)+`Q${b-6},${groundY(level,b)+36} ${b-12},${groundY(level,b)+100}L${b-30},890L${a===0?leftEdge:a+35},890L${a===0?leftEdge:a+12},${groundY(level,a)+100}Z`;
  s+=`<g filter="url(#brushEdge)">${level===2?`<path d="${d}" fill="${PAPER}"/>`:''}<path d="${d}" fill="url(#ridgeWash)"/>`;
  s+=line(contour(pts),5.6,'#42483d',.87);
  // Broken dry-brush bands follow the actual walkable contour.
  for(let x=a+6;x<b-20;x+=22+r()*32){const end=Math.min(b-3,x+15+r()*42),y=groundY(level,x),ey=groundY(level,end);
   s+=line(`M${f(x)} ${f(y+5+r()*3)}Q${f((x+end)/2)} ${f((y+ey)/2+8)} ${f(end)} ${f(ey+6)}`,2+r()*5,'#555d4c',.14+r()*.25);
  }
  for(let i=0;i<(b-a)/18;i++){const x=a+r()*(b-a),y=groundY(level,x)+8+r()*70;
   s+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2+r()*14)}" ry="${f(1+r()*3)}" fill="#67705c" opacity="${f(.03+r()*.1)}"/>`;
  }
  s+='</g>';
 }
 for(const [i,rock] of rocksFor(level).entries())s+=boulder(level,rock,i);
 // Unmarked horizontal wooden boards mark return points along the trail.
 for(const [i,cp] of c.checkpoints.entries())if(i>0)s+=trailSign(cp,groundY(level,cp));
 s+=pine(3780,groundY(level,3780),.91,72+level*101)+pine(1450,groundY(level,1450),.82,15+level*101)+pine(410,groundY(level,410),.82,34+level*101);
 if(level===2)s+=pine(2600,groundY(level,2600),.62,141);
 s+=pavilion(105,groundY(level,105));
 return s;
}

export function character(player,time=0,walk=0,smooth=false){return traveler(player,time,walk,smooth);}
export function sceneMarkup(level=0){return defs()+`<g id="paperTone" filter="url(#xuanPaperTone)">`+sky()+`<g id="farLayer">${distant()}</g><g id="midLayer">${middle(level)}</g><g id="villageLayer">${village(level)}</g><g id="cloudLayer"><g class="cloud-drift"><path d="M-120 404Q130 380 350 411T850 404T1350 421T1950 399T2750 419T3650 398T4550 414L4800 442Q3900 466 3000 437T2000 455 1570 438T750 442T-120 431Z" fill="${PAPER}" opacity=".4"/></g></g><g id="worldLayer"><g id="streamLayer">${streams(level)}</g>${landscape(level)}<g id="traveler"></g></g><g id="airLayer"></g><rect x="0" y="710" width="4800" height="80" fill="url(#bottomMist)" pointer-events="none"/></g>`;}
const sceneCache=new WeakMap();
function movingNodes(svg){
 let nodes=sceneCache.get(svg);
 if(!nodes?.traveler?.isConnected){nodes={traveler:svg.querySelector('#traveler'),airLayer:svg.querySelector('#airLayer')};sceneCache.set(svg,nodes);}
 return nodes;
}
export function setSceneTransforms(svg,camera,player,time=0,walk=0,collected=new Set(),cameraY=0,smooth=false){
 const nodes=movingNodes(svg);
 nodes.traveler.innerHTML=character({...player,x:0,y:0},time,walk,smooth);
 nodes.airLayer.innerHTML=birds(time);
}

// Fixed world routes, with slow rightward flight driven only by elapsed time.
// Horizontal camera projection lets the view pass them; fixed screen heights
// prevent terrain bobbing. Never anchor their x positions to the viewport.
export function birds(time=0){
 const flock=[{x:540,y:176,v:8,phase:.4,size:1.1},{x:1830,y:218,v:6,phase:2.6,size:1.45},{x:3260,y:159,v:7,phase:4.1,size:2},{x:4100,y:205,v:5.5,phase:1.3,size:1.05}];
 return flock.map(b=>{
  const x=b.x+time*b.v+Math.sin(time*.035+b.phase)*9,y=b.y;
  // A few visible wingbeats, then an unhurried glide. Animate the wing shape
  // around the body's fixed origin, never the bird group's flight altitude.
  const cycle=(time+b.phase*1.9)%9.2;
  const activity=Math.max(0,Math.min(1,cycle/.55,(4.8-cycle)/.65));
  const stroke=Math.sin(time*(4.2+(2-b.size)*.6)+b.phase);
  const wingAmount=activity*.5;
  const tip=-2.2+wingAmount*(1-stroke*6.2),elbow=-3.1+wingAmount*(1.7-stroke*2.8);
  const span=8.3-wingAmount*Math.abs(stroke)*1.25;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${b.size})">`+
   line(`M${f(-span)} ${f(tip)}Q-3.6 ${f(elbow)} 0 0Q3.8 ${f(elbow+.3)} ${f(span+.5)} ${f(tip+.4)}`,1.55,INK,.6)+
   line('M-1.25 .35Q0 1.1 1.65 .3',1.05,INK,.56)+'</g>';
 }).join('');
}
