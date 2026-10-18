export const WORLD = 4200;
export const CHAPTERS = [
  {title:'渡溪',english:'ACROSS THE STREAM',line:'水流向远处，你走向山里。',end:'溪水还在身后，而你已经在另一岸。',
   points:[[0,510],[180,490],[430,556],[720,610],[980,545],[1180,550],[1400,610],[1640,575],[1790,575],[2040,510],[2180,532],[2380,566],[2530,610],[2680,605],[2820,605],[3060,555],[3260,525],[3460,594],[3700,650],[3960,580],[4200,610]],gaps:[[2680,2820],[1640,1790]],rocks:[],leaves:[],checkpoints:[3960,3060,2060,980]},
  {title:'听风',english:'WHERE THE WIND WANDERS',line:'风没有方向，直到你开始行走。',end:'你停下来听了听，风里有自己的声音。',
   points:[[0,455],[200,440],[400,502],[590,520],[735,520],[950,455],[1180,505],[1410,530],[1560,570],[1730,550],[1890,550],[2120,480],[2350,550],[2600,600],[2840,570],[3000,570],[3180,500],[3370,530],[3630,610],[3840,580],[3960,590],[4200,655]],gaps:[[2840,3000],[1730,1890],[590,735]],rocks:[[3460,88,40],[2320,104,47],[1180,82,37]],leaves:[],checkpoints:[3960,3180,2120,1050]},
  {title:'见山',english:'A LITTLE CLOSER TO THE SKY',line:'每一步，都让远山近一点。',end:'山的那边，仍然有山。可你已经走到了这里。',
   points:[[0,370],[220,360],[470,445],[720,470],[890,470],[1030,420],[1230,460],[1460,505],[1650,480],[1840,520],[2000,520],[2150,440],[2350,480],[2580,550],[2790,585],[2950,585],[3140,480],[3370,535],[3630,610],[3960,575],[4200,635]],gaps:[[2790,2950],[1840,2000],[720,890]],rocks:[[3550,96,43],[2430,116,52],[1290,88,46]],leaves:[],checkpoints:[3960,3140,2150,1030]}
];
export function groundY(level,x) {
 const p=CHAPTERS[level].points;
 for(let i=1;i<p.length;i++)if(x<=p[i][0]){const a=p[i-1],b=p[i],t=Math.max(0,(x-a[0])/(b[0]-a[0]));return a[1]+(b[1]-a[1])*t*t*(3-2*t);}
 return p[p.length-1][1];
}
export function inGap(level,x){return CHAPTERS[level].gaps.some(([a,b])=>x>a&&x<b);}
export function rocksFor(level){return CHAPTERS[level].rocks.map(([x,w,h])=>({x,w,h,y:groundY(level,x+w/2)-h}));}
export class Journey {
 constructor(level=0,save=null){this.load(level,save);}
 load(level,save=null){
  this.level=Math.max(0,Math.min(2,level));this.chapter=CHAPTERS[this.level];this.rocks=rocksFor(this.level);
  const cp=this.chapter.checkpoints.includes(save?.checkpoint)?save.checkpoint:this.chapter.checkpoints[0];
  this.checkpoint=cp;this.collected=new Set((Array.isArray(save?.collected)?save.collected:[]).filter(x=>[0,1,2].includes(x)));
  this.player={x:cp,y:groundY(this.level,cp),vx:0,vy:0,grounded:true,facing:-1};
  this.time=0;this.walk=0;this.coyote=.12;this.buffer=0;this.complete=false;this.deaths=0;this.fallCried=false;this.events=[];
 }
 snapshot(){return {level:this.level,checkpoint:this.checkpoint,collected:[...this.collected]};}
 drain(){const e=this.events;this.events=[];return e;}
 respawn(){this.player.x=this.checkpoint;this.player.y=groundY(this.level,this.checkpoint);this.player.vx=0;this.player.vy=0;this.player.grounded=true;this.coyote=.12;this.buffer=0;this.fallCried=false;this.deaths++;this.events.push({type:'fall'});}
 step(dt,input={}){
  if(this.complete)return;dt=Math.min(dt,.025);this.time+=dt;
  const p=this.player;const oldY=p.y,wasGrounded=p.grounded;
  this.buffer=Math.max(0,this.buffer-dt);this.coyote=p.grounded?.12:Math.max(0,this.coyote-dt);
  if(input.jump)this.buffer=Math.max(.05,Math.min(.25,Number.isFinite(input.jumpBuffer)?input.jumpBuffer:.14));
  const dir=(input.right?1:0)-(input.left?1:0);
  const speed=Number.isFinite(input.speed)?Math.max(0,input.speed):310;
  const wind=this.level===1&&dir?Math.sin(this.time*.8)*13:0;
  p.vx=dir*speed+wind;if(dir)p.facing=dir;
  if(this.buffer>0&&this.coyote>0){p.vy=-665;p.grounded=false;this.coyote=0;this.buffer=0;this.events.push({type:'jump'});}
  let nx=Math.max(35,Math.min(WORLD-35,p.x+p.vx*dt));
  for(const r of this.rocks){if(nx+12>r.x&&nx-12<r.x+r.w&&p.y>r.y+3&&p.y-58<r.y+r.h){
   if(p.vx<0)nx=r.x+r.w+12;else if(p.vx>0)nx=r.x-12;
  }}
  this.walk+=Math.abs(nx-p.x)*.045;p.x=nx;
  p.vy+=1600*dt;p.y+=p.vy*dt;p.grounded=false;
  const surfaces=[];if(!inGap(this.level,p.x))surfaces.push(groundY(this.level,p.x));
  for(const r of this.rocks)if(p.x+10>r.x&&p.x-10<r.x+r.w)surfaces.push(r.y);
  surfaces.sort((a,b)=>a-b);
  for(const floor of surfaces){if(p.vy>=0&&(p.y>=floor||(wasGrounded&&Math.abs(floor-oldY)<8))&&(oldY<=floor+4||(wasGrounded&&oldY<=floor+10))){p.y=floor;p.vy=0;p.grounded=true;break;}}
  if(!p.grounded&&!this.fallCried&&p.y>groundY(this.level,p.x)+68){this.fallCried=true;this.events.push({type:'plunge'});}
  for(const cp of this.chapter.checkpoints)if(p.x<=cp&&cp<this.checkpoint&&p.grounded){this.checkpoint=cp;this.events.push({type:'checkpoint'});}
  if(p.y>870)this.respawn();
  if(p.x<160&&p.grounded){this.complete=true;this.events.push({type:'complete'});}
 }
}
