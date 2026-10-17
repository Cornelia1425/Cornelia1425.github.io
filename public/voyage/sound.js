// Quiet, original procedural field sounds. No external audio files or music.
const RATE=24000;
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function normalize(samples,peak){
 let max=0;for(const sample of samples)max=Math.max(max,Math.abs(sample));
 if(max)for(let i=0;i<samples.length;i++)samples[i]*=peak/max;
 return samples;
}

export function footstep(seed=1,rate=RATE){
 const r=seeded(seed),duration=.19+r()*.022,out=new Float32Array(Math.ceil(rate*duration));
 let air=0,soft=0,bass=0;
 for(let i=0;i<out.length;i++){
  const p=i/(out.length-1),n=r()*2-1;
  const smoothing=1-Math.exp(-2*Math.PI*(1150-p*500)/rate);
  air+=(n-air)*smoothing;soft+=(air-soft)*smoothing;bass+=(soft-bass)*.025;
  // One loose, rounded brush of sole and cloth. A short, smooth envelope leaves
  // space between steps; no crackle modulation or sharp low-frequency impact.
  const envelope=Math.pow(Math.sin(Math.PI*p),1.1);
  out[i]=(soft-bass)*envelope;
 }
 return normalize(out,.21);
}

export function wind(seed=1,duration=10,rate=RATE){
 const r=seeded(seed),out=new Float32Array(Math.ceil(rate*duration));let deep=0,air=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,p=t/duration,n=r()*2-1;
  deep+=(n-deep)*.009;air+=(n-air)*.065;
  const swell=Math.pow(Math.sin(Math.PI*p),1.7);
  const uneven=.72+.16*Math.sin(t*1.2+seed)+.12*Math.sin(t*2.7+.7);
  out[i]=(deep*.8+air*.18)*swell*uneven;
 }
 return normalize(out,.23);
}

export function birdcall(seed=1,rate=RATE){
 const r=seeded(seed),duration=3.2+r()*.8,out=new Float32Array(Math.ceil(rate*duration));
 const pitch=980+r()*340,length=duration-.7;let phase=0,breath=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,p=Math.min(1,t/length);
  const frequency=pitch*(1+.11*Math.sin(Math.PI*p)-.17*p)+7*Math.sin(t*31);
  phase+=2*Math.PI*frequency/rate;
  breath+=((r()*2-1)-breath)*.24;
  const envelope=t<length?Math.pow(Math.sin(Math.PI*p),1.45):0;
  out[i]=(Math.sin(phase)+.045*Math.sin(phase*2)+breath*.025)*envelope;
 }
 // Faint, softened reflections give the long call distance without a loud echo.
 const dry=out.slice();let filtered=0;
 for(let i=0;i<out.length;i++){
  filtered+=(dry[i]-filtered)*.35;
  for(const [seconds,gain] of [[.19,.1],[.38,.045],[.57,.02]]){
   const at=i+Math.round(seconds*rate);if(at<out.length)out[at]+=filtered*gain;
  }
 }
 return normalize(out,.17);
}

export class NatureSound{
 constructor({createContext=null,random=Math.random}={}){
  this.createContext=createContext;this.random=random;
  this.enabled=false;this.active=true;this.sources=new Set();this.lastWalk=0;this.lastStep=-1;
 }
 between(a,b){return a+(b-a)*this.random();}
 initialize(){
  if(this.context)return;
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!this.createContext&&!Audio)throw Error('Audio unavailable');
  this.context=this.createContext?this.createContext():new Audio();
  this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);
  const buffer=samples=>{const b=this.context.createBuffer(1,samples.length,RATE);b.getChannelData(0).set(samples);return b;};
  this.steps=Array.from({length:6},(_,i)=>buffer(footstep(31+i*17)));
  this.winds=[buffer(wind(74,9)),buffer(wind(119,12))];
  this.calls=[buffer(birdcall(29)),buffer(birdcall(81)),buffer(birdcall(143))];
 }
 scheduleAmbience(){
  const now=this.context.currentTime;
  this.nextWind=now+this.between(1.2,3.5);
  this.nextBird=now+this.between(7,13);
 }
 async setEnabled(on){
  if(on){this.initialize();await this.context.resume();}
  this.enabled=on;this.setActive(this.active);return this.enabled;
 }
 setActive(active){
  this.active=active;if(!this.context)return;
  const audible=this.enabled&&active;if(this.audible===audible)return;this.audible=audible;
  const now=this.context.currentTime,volume=audible ? .55 : 0;
  this.master.gain.cancelScheduledValues(now);
  this.master.gain.setValueAtTime(this.master.gain.value,now);
  this.master.gain.linearRampToValueAtTime(volume,now+.06);
  if(volume){this.scheduleAmbience();this.lastStep=-1;}
  else for(const source of this.sources)try{source.stop(now+.065);}catch{}
 }
 play(buffer,volume,pan=0){
  if(!this.enabled||!this.active)return;
  const c=this.context,source=c.createBufferSource(),gain=c.createGain();
  source.buffer=buffer;gain.gain.value=volume;source.connect(gain);
  const position=c.createStereoPanner?.();
  if(position){position.pan.value=pan;gain.connect(position);position.connect(this.master);}else gain.connect(this.master);
  this.sources.add(source);
  source.onended=()=>{this.sources.delete(source);source.disconnect();gain.disconnect();position?.disconnect();};
  source.start(c.currentTime);
 }
 update(player,walk){
  const moved=walk>this.lastWalk+.001;this.lastWalk=walk;
  if(!this.enabled||!this.active||this.context.state!=='running')return;
  const now=this.context.currentTime,step=Math.floor((walk+Math.PI/2)/Math.PI);
  if(player.grounded&&moved&&step!==this.lastStep){
   this.play(this.steps[Math.floor(this.random()*this.steps.length)],this.between(.25,.33),this.between(-.08,.08));
  }
  this.lastStep=step;
  if(now>=this.nextWind){
   this.play(this.winds[Math.floor(this.random()*this.winds.length)],this.between(.2,.3),this.between(-.35,.35));
   this.nextWind=now+this.between(20,34);
  }
  if(now>=this.nextBird){
   this.play(this.calls[Math.floor(this.random()*this.calls.length)],this.between(.15,.23),this.between(-.8,.8));
   this.nextBird=now+this.between(24,43);
  }
 }
}
