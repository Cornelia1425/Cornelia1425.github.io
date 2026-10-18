import {CHAPTERS,groundY,rocksFor,WORLD} from './game-core.js';
export const PAPER='#f2f1e9', INK='#292d27';
const f=n=>Number(n.toFixed(2));
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function path(d,stroke=INK,width=1,extra=''){return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;}
function sketch(points,seed=1,width=1.1,opacity=1){
 const r=rng(seed);let s='';for(let k=0;k<3;k++){let d='';points.forEach(([x,y],i)=>d+=`${i?'L':'M'}${f(x+(r()-.5)*(k?2.6:.5))},${f(y+(r()-.5)*(k?2.6:.5))}`);s+=path(d,INK,k?width*.5:width,`opacity="${opacity*(k?.22:.75)}"`);}return s;
}
function mountain(x,base,w,h,seed,opacity=.6){
 const r=rng(seed), pts=[];for(let i=0;i<=48;i++){const t=i/48;const form=Math.sin(Math.PI*t);pts.push([x+t*w,base-h*Math.pow(form,1.7)*(1+.13*Math.sin(t*25+seed))+(r()-.5)*9*form]);}
 let d='M'+pts.map(([a,b])=>`${f(a)},${f(b)}`).join('L');let s=`<g opacity="${opacity}"><path d="${d}L${x+w},${base+50}L${x},${base+50}Z" fill="${PAPER}"/>`+sketch(pts,seed,1.25);
 for(let i=3;i<46;i+=2){const [px,py]=pts[i];const end=base-10-r()*28;let q=[[px,py+3]];for(let j=1;j<=9;j++){const t=j/9;q.push([px+(t*(r()-.5)*w*.12)+Math.sin(t*5+i)*8,py+(end-py)*t]);}s+=sketch(q,seed+i,.65,.24+r()*.26);}
 for(let i=0;i<250;i++){const t=r(),idx=Math.floor(t*47),px=x+t*w,py=pts[idx][1]+20+r()*(base-pts[idx][1]-20);if(py<base)s+=path(`M${f(px)},${f(py)}l${f(5+r()*15)},${f(-5-r()*14)}`,INK,.5,`opacity="${.08+r()*.18}"`);}
 return s+'</g>';
}
function pine(x,y,scale=1,seed=6){
 const r=rng(seed);let s=`<g transform="translate(${x} ${y}) scale(${scale})">`;
 s+=sketch([[0,0],[-3,-50],[2,-112],[0,-165]],seed,1.7,.8);
 for(let j=0;j<12;j++){const yy=-152+j*10,w=6+j*3.5;for(let side of [-1,1]){
  s+=sketch([[0,yy],[side*w*.5,yy+5],[side*w,yy+2]],seed+j,1,.8);
  for(let i=0;i<7;i++){let xx=side*w*i/7;s+=path(`M${f(xx)},${yy+4}l${f(side*(5+r()*6))},${f(7+r()*9)}`,INK,.8,`opacity="${.4+r()*.3}"`);}
 }}s+=sketch([[-6,0],[0,-5],[7,0]],5,1,.8);return s+'</g>';
}
function grass(x,y,scale=1,seed=10){const r=rng(seed);let s='';for(let i=0;i<9;i++){let dx=(r()-.5)*22*scale;s+=path(`M${x},${y}Q${f(x+dx)},${f(y-13*scale)} ${f(x+dx*1.4)},${f(y-(12+r()*16)*scale)}`,INK,.7,`opacity="${.22+r()*.25}"`);}return s;}
function gate(x,y,level){let s=`<g transform="translate(${x} ${y})">`;
 s+=sketch([[-38,0],[-38,-87],[38,-87],[38,0]],44,1.6,.9)+sketch([[-46,-87],[0,-113],[47,-87]],12,1.2,.8);
 s+=path('M-42,-84Q0,-99 43,-84',INK,2)+path('M-32,-80V-2M32,-80V-2',INK,.5);
 s+=`<path d="M-14,-72 Q0,-66 13,-72 L11,-25 Q0,-33 -12,-26Z" fill="#a15b4c" opacity=".72"/>`;
 s+=`<text x="0" y="-48" text-anchor="middle" fill="${PAPER}" font-size="13" font-family="serif">${['渡','风','山'][level]}</text>`;
 s+=sketch([[-56,1],[-44,-3],[43,-3],[60,2]],4,1,.7);return s+'</g>';}
export function defs(){return `<defs>
 <filter id="paperNoise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".64" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".13"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
 <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAPER}" stop-opacity="0"/><stop offset="1" stop-color="${PAPER}" stop-opacity=".92"/></linearGradient>
 <pattern id="hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 0V11" stroke="${INK}" stroke-width=".6" opacity=".13"/></pattern>
 </defs>`;}
export function sky(level=0){const r=rng(50);let s=`<rect width="1440" height="760" fill="${PAPER}"/><circle cx="${1030-level*130}" cy="${156+level*5}" r="42" fill="none" stroke="#a3a397" stroke-width=".7" opacity=".65"/><circle cx="${1031-level*130}" cy="${155+level*5}" r="43" fill="none" stroke="#a3a397" stroke-width=".4" opacity=".4"/>`;
 for(let i=0;i<70;i++){const x=r()*1440,y=60+r()*360;s+=path(`M${f(x)},${f(y)}q${20+r()*45},-4 ${50+r()*95},-2`,'#93988e',.45,'opacity=".14"');}
 return s;}
export function distant(level=0){let s='';for(let i=0;i<9;i++)s+=mountain(-600+i*540,520+(i%2)*44,890,270+(i%3)*80,42+i+level*9,.14+(i%3)*.035);return s;}
export function middle(level=0){return mountain(-300,622,1350,440,93+level,.57)+mountain(660,650,1100,390,52+level,.44)+mountain(1550,625,1050,505,35+level,.6)+mountain(2440,640,1450,450,24+level,.4)+`<rect x="-500" y="520" width="5200" height="220" fill="url(#mist)"/>`;}
export function landscape(level){
 const c=CHAPTERS[level],r=rng(77+level);let s='';
 // The ground is cut into real traversable banks, with the same boundaries as physics.
 const banks=[],ends=[0,...c.gaps.flat(),WORLD];for(let i=0;i<ends.length-1;i+=2)banks.push([ends[i],ends[i+1]]);
 // Gaps are provided right-to-left in the level data; sort boundaries before pairing.
 const edge=[0,...c.gaps.flat().sort((a,b)=>a-b),WORLD];
 for(let k=0;k<edge.length-1;k+=2){let a=edge[k],b=edge[k+1],pts=[];for(let x=a;x<b;x+=18)pts.push([x,groundY(level,x)]);pts.push([b,groundY(level,b)]);
  const d='M'+pts.map(([x,y])=>`${f(x)},${f(y)}`).join('L')+`L${b},900L${a},900Z`;
  s+=`<path d="${d}" fill="${PAPER}"/><path d="${d}" fill="url(#hatch)"/>`+sketch(pts,91+k,1.6);
  s+=sketch([[a,groundY(level,a)],[a+5,groundY(level,a)+22],[a-6,760]],k+100,.9,.7)+sketch([[b,groundY(level,b)],[b-4,groundY(level,b)+37],[b+12,800]],k+30,.8,.65);
  for(let i=0;i<(b-a)/15;i++){let x=a+r()*(b-a),y=groundY(level,x)+12+r()*120;s+=path(`M${f(x)},${f(y)}l${f(6+r()*30)},${f(-2+r()*5)}`,INK,.5,`opacity="${.09+r()*.15}"`);}
  for(let x=a+40;x<b-40;x+=66+r()*90)s+=grass(f(x),f(groundY(level,x)),.4+r()*.5,Math.round(x));
 }
 for(const [a,b] of c.gaps){const y=Math.max(groundY(level,a),groundY(level,b))+58;
  for(let j=0;j<6;j++)s+=path(`M${a-50-j*8},${y+j*12}q${(b-a)/3},-7 ${b-a+100+j*16},0`,'#7b8e8a',.65,`opacity="${.42-j*.045}"`);
  s+=`<text x="${(a+b)/2}" y="${y+83}" text-anchor="middle" font-family="serif" font-size="13" fill="#7b837b" opacity=".55">${level===0?'水声':'山涧'}</text>`;
 }
 for(const rock of rocksFor(level)){const {x,y,w,h}=rock;let pts=[[x-2,y+h],[x+3,y+12],[x+w*.22,y+1],[x+w*.68,y-2],[x+w-2,y+9],[x+w+2,y+h]];
  const d='M'+pts.map(p=>p.join(',')).join('L')+'Z';s+=`<path d="${d}" fill="${PAPER}"/><path d="${d}" fill="url(#hatch)"/>`+sketch(pts,Math.round(x),1.4,.9);
  s+=sketch([[x+7,y+14],[x+w*.5,y+11],[x+w*.7,y+h-5]],3,.6,.5);
 }
 for(const [i,cp] of c.checkpoints.entries())if(i>0){const y=groundY(level,cp);s+=sketch([[cp,y],[cp,y-48]],5,1.4)+`<path d="M${cp},${y-46}l-25,2 -7,7 32,-1Z" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/>`+path(`M${cp-7},${y-42}h-15`,INK,.6);}
 s+=pine(3750,groundY(level,3750),1.28,72)+pine(3635,groundY(level,3635),.75,48)+pine(1520,groundY(level,1520),1.22,61);
 s+=pine(440,groundY(level,440),1.2,26)+pine(510,groundY(level,510),.75,37);
 if(level>0)s+=pine(2600,groundY(level,2600),.82,82);
 s+=gate(105,groundY(level,105),level);
 // A small pencilled pavilion, tucked into the opening bank.
 const py=groundY(level,4100);s+=sketch([[4053,py],[4053,py-73],[4150,py-73],[4150,py]],71,1.2,.7)+sketch([[4036,py-73],[4100,py-108],[4167,py-73]],5,1.3,.8)+path(`M4040,${py-74}Q4100,${py-64} 4164,${py-74}`,INK,.8);
 return s;
}
export function leaf(x,y,i){return `<g id="leaf-${i}" transform="translate(${x} ${y})"><circle r="22" fill="#b77b5b" opacity=".06"/><path d="M-10 7Q-13 -8 9 -13Q15 5 -10 7Z" fill="#b77b5b" fill-opacity=".12" stroke="#a56d53" stroke-width="1.1"/><path d="M-13 12L8 -10M-3 1L-5 -5M1 -3L7 -2" fill="none" stroke="#a56d53" stroke-width=".7"/></g>`;}
export function character(player,time=0,walk=0,smooth=false){
 const moving=Math.abs(player.vx)>2,phase=moving?walk:time*1.5,frame=smooth?phase:Math.floor(phase*2)/2,jump=!player.grounded;
 const stride=moving?Math.sin(frame)*11:0,bob=player.grounded?(moving?Math.abs(Math.cos(frame))*1.1:Math.sin(frame)*.35):0;
 const flutter=Math.sin(time*1.15+frame*.18)*(moving?2.5:1.4);
 let s=`<g transform="translate(${f(player.x)} ${f(player.y-bob)}) scale(${-player.facing} 1)">`;
 s+=`<ellipse cx="1" cy="1.5" rx="14" ry="2.3" fill="#5d6259" opacity=".1"/>`;
 const far=jump?[[3,-28],[13,-18],[18,-8]]:[[3,-28],[-stride*.5,-15],[-stride,-3]];
 const near=jump?[[-3,-28],[-13,-17],[-14,-7]]:[[-3,-28],[stride*.5,-15],[stride,-3]];
 // Filled trouser legs and closed cloth shoes remain visible below the robe.
 for(const [points,color] of [[far,'#747d6b'],[near,'#626f60']]){
  const [hip,knee,ankle]=points;
  s+=`<path d="M${f(hip[0]-4)} ${hip[1]}Q${f(knee[0]-6)} ${knee[1]} ${f(ankle[0]-3)} ${ankle[1]}L${f(ankle[0]+4)} ${ankle[1]}Q${f(knee[0]+5)} ${knee[1]} ${f(hip[0]+4)} ${hip[1]}Z" fill="${color}" stroke="${INK}" stroke-width=".65" stroke-linejoin="round"/>`;
  s+=`<path d="M${f(ankle[0]-3)} ${ankle[1]}Q${f(ankle[0]-8)} ${f(ankle[1]+.4)} ${f(ankle[0]-8)} ${f(ankle[1]+2.7)}L${f(ankle[0]+4)} ${f(ankle[1]+3)}L${f(ankle[0]+3)} ${ankle[1]}Z" fill="#363e31"/>`;
 }
 // A compact, loose cloth bundle sits behind the shoulder.
 s+=`<path d="M7 -39Q11 -42 14 -37Q16 -30 11 -29L7 -31Z" fill="#a8a38a" stroke="${INK}" stroke-width=".8"/>`;
 // An ankle-length robe lifts gently with each step and clears the shoes.
 const hemLift=jump?4:Math.abs(stride)*.12;
 s+=`<path d="M-5 -49Q-11 -46 -10 -37L-8 -29Q-10 -17 ${f(-13-stride*.15)} ${f(-6-hemLift)}Q-1 ${f(-3.5-hemLift)} ${f(13+flutter)} ${f(-7-hemLift)}L7 -31L8 -44L1 -49Z" fill="#c2ccc2" stroke="${INK}" stroke-width="1.15" stroke-linejoin="round"/>`;
 s+=path('M-4 -47L2 -38L6 -45M-8 -32Q-1 -30 8 -32',INK,.75,'opacity=".6"');
 // Wide moving sleeve; only a small hand appears beyond the cuff.
 const elbow=jump?[-16,-43]:[-12-stride*.25,-35],hand=jump?[-20,-49]:[-10-stride*.45,-28];
 s+=`<path d="M-6 -45Q${f(elbow[0]-5)} ${elbow[1]} ${f(hand[0]-3)} ${f(hand[1]+3)}L${f(hand[0]+4)} ${f(hand[1]+4)}Q${f(elbow[0]+5)} ${f(elbow[1]+2)} -2 -39Z" fill="#ccd3c7" stroke="${INK}" stroke-width=".95" stroke-linejoin="round"/>`;
 s+=`<path d="M${f(hand[0]-1)} ${f(hand[1]+4)}l-1 2 3 .6 1-2Z" fill="#d9d6c2"/>`;
 // Narrow, quiet profile: no round cartoon cheek or projecting beak.
 s+=`<path d="M-4 -51L-4 -47L1 -45L3 -50" fill="#e1dfcb" stroke="${INK}" stroke-width=".6"/>`;
 s+=`<path d="M-5 -63Q-9 -61 -8.7 -56L-9.4 -53.8L-8.5 -53Q-8.1 -48.2 -4.2 -48L.2 -50L3.7 -56Q3.2 -64 -5 -63Z" fill="#e7e3ce" stroke="${INK}" stroke-width=".8"/>`;
 s+=`<path d="M-8.8 -59Q-9.5 -66 -1.4 -66.5Q5.8 -66 5.2 -57L1.6 -52L.2 -55Q1.8 -61 -3.2 -62Q-6.7 -61.8 -8.8 -59Z" fill="#2b3027"/><ellipse cx="4.2" cy="-68" rx="3.9" ry="3.1" transform="rotate(-18 4.2 -68)" fill="#2b3027"/>`;
 s+=path('M-8 -56.9l1.2 .2M-7.9 -51.8l1.2 .15',INK,.6,'opacity=".75"');
 // Wind catches the hair ties and hem, rather than a neck scarf.
 s+=path(`M3 -65.5Q11 -63 18 ${f(-65+flutter)}M4 -65Q10 -60 15 ${f(-61+flutter*.8)}`,'#68715b',1.2,'opacity=".82"');
 s+=path('M-2 -44Q5 -39 10 -31','#686e59',.8);
 return s+'</g>';
}
export function sceneMarkup(level=0){const c=CHAPTERS[level];return defs()+sky(level)+`<g id="farLayer">${distant(level)}</g><g id="midLayer">${middle(level)}</g><g id="worldLayer">${landscape(level)}<g id="leaves">${c.leaves.map((x,i)=>leaf(x,groundY(level,x)-94,i)).join('')}</g><g id="traveler"></g></g><g id="airLayer"></g><rect width="1440" height="760" filter="url(#paperNoise)" opacity=".36" pointer-events="none" fill="transparent"/>`;}
export function setSceneTransforms(svg,camera,player,time=0,walk=0,collected=new Set()){
 svg.querySelector('#farLayer').setAttribute('transform',`translate(${-camera*.13} 0)`);
 svg.querySelector('#midLayer').setAttribute('transform',`translate(${-camera*.42} 0)`);
 svg.querySelector('#worldLayer').setAttribute('transform',`translate(${-camera} 0)`);
 svg.querySelector('#traveler').innerHTML=character(player,time,walk);
 for(let i=0;i<3;i++){const n=svg.querySelector('#leaf-'+i);if(n){n.style.opacity=collected.has(i)?'0':'1';}}
 const birds=[];for(let i=0;i<4;i++){let x=((time*10+i*330+260)%1670)-100,y=170+i%2*24+Math.sin(time*.5+i)*12;birds.push(path(`M${f(x-6)},${f(y)}q3,${f(-2-Math.sin(Math.floor(time*8)+i)*2)} 6,0q3,-3 7,-1`,INK,.85,'opacity=".5"'));}svg.querySelector('#airLayer').innerHTML=birds.join('');
}
