// Quiet, original procedural field sounds. No external audio files or music.
const RATE=24000;
const OUTPUT_BOOST=.42;
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

export function water(seed=1,duration=8,rate=RATE){
 const r=seeded(seed),length=Math.ceil(rate*duration),fade=Math.ceil(rate*.7),raw=new Float32Array(length+fade);
 let body=0,flow=0,sheen=0;
 for(let i=0;i<raw.length;i++){
  const t=i/rate,n=r()*2-1;
  body+=(n-body)*.018;flow+=(body-flow)*.075;sheen+=(n-sheen)*.19;
  const current=.8+.12*Math.sin(t*.73+seed)+.08*Math.sin(t*1.91+.6);
  raw[i]=(flow*.86+(sheen-body)*.12)*current;
 }
 const out=raw.slice(0,length);
 // Fold a short continuation over the opening so the repeating stream has no seam.
 for(let i=0;i<fade;i++){const mix=i/fade;out[i]=raw[length+i]*(1-mix)+raw[i]*mix;}
 return normalize(out,.42);
}

export function streamPresence(x,gaps,radius=460){
 let nearest=null,distance=Infinity;
 for(const [a,b] of gaps||[]){
  const d=x<a?a-x:x>b?x-b:0;
  if(d<distance){distance=d;nearest=[a,b];}
 }
 if(!nearest||distance>=radius)return {amount:0,pan:0};
 const center=(nearest[0]+nearest[1])/2;
 return {
  amount:Math.pow(1-distance/radius,1.6),
  pan:Math.max(-.65,Math.min(.65,(center-x)/radius))
 };
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

export function swoosh(seed=1,rate=RATE){
 const r=seeded(seed),duration=.22,out=new Float32Array(Math.ceil(rate*duration));
 let phase=0,air=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,p=t/duration,n=r()*2-1;
  const pitch=560+1120*Math.pow(p,.62);
  phase+=2*Math.PI*pitch/rate;
  air+=(n-air)*(.07+p*.09);
  const envelope=Math.pow(Math.sin(Math.PI*p),1.45);
  out[i]=(Math.sin(phase)*.36+(n-air)*.14+air*.06)*envelope;
 }
 return normalize(out,.24);
}

export function yelp(seed=1,rate=RATE){
 const r=seeded(seed),duration=.3,out=new Float32Array(Math.ceil(rate*duration));
 let phase=0,breath=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate;
  // A short, steady "ah" with pitch vibrato—no descending glide.
  const pitch=390*(1+.055*Math.sin(t*Math.PI*17));
  phase+=2*Math.PI*pitch/rate;
  let voice=0,weight=0;
  // Harmonics clustered around the "ah" vowel formants keep the procedural
  // sound voice-like without using a recorded person or an external file.
  for(let harmonic=1;harmonic<=9;harmonic++){
   const frequency=pitch*harmonic;
   const formant=Math.exp(-Math.pow((frequency-760)/270,2))+.58*Math.exp(-Math.pow((frequency-1160)/430,2))+.16;
   const amount=formant/Math.pow(harmonic,.72);
   voice+=Math.sin(phase*harmonic+(harmonic%2)*.08)*amount;weight+=amount;
  }
  breath+=((r()*2-1)-breath)*.19;
  const attack=Math.min(1,t/.015),release=Math.min(1,(duration-t)/.055);
  const envelope=attack*Math.max(0,release)*(.92+.08*Math.sin(t*Math.PI*13));
  out[i]=(voice/weight+breath*.035)*envelope;
 }
 return normalize(out,.38);
}

export class NatureSound{
 constructor({createContext=null,random=Math.random,volume=.85}={}){
  this.createContext=createContext;this.random=random;
  this.volume=Math.max(0,Math.min(1,volume));
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
  this.swoosh=buffer(swoosh(457));
  this.yelp=buffer(yelp(311));
  this.water=buffer(water(207));this.waterGain=this.context.createGain();this.waterGain.gain.value=0;
  this.waterPan=this.context.createStereoPanner?.();
  if(this.waterPan){this.waterGain.connect(this.waterPan);this.waterPan.connect(this.master);}
  else this.waterGain.connect(this.master);
  this.waterSource=this.context.createBufferSource();this.waterSource.buffer=this.water;this.waterSource.loop=true;
  this.waterSource.connect(this.waterGain);this.waterSource.start();this.nextWaterUpdate=0;
 }
 scheduleAmbience(){
  const now=this.context.currentTime;
  this.nextWind=now+this.between(.2,.65);
  this.nextBird=now+this.between(7,13);
 }
 prime(){
  // iOS needs an audio source to start inside the trusted touch event. A
  // one-sample silent buffer unlocks Web Audio without adding a click.
  const source=this.context.createBufferSource(),gain=this.context.createGain();
  source.buffer=this.context.createBuffer(1,1,this.context.sampleRate||RATE);
  gain.gain.value=0;source.connect(gain);gain.connect(this.context.destination);
  source.onended=()=>{source.disconnect();gain.disconnect();};source.start(0);
 }
 get running(){return Boolean(this.context&&this.enabled&&this.context.state==='running');}
 async setEnabled(on){
  if(on){
   this.initialize();
   try{await this.context.resume();}catch{}
   on=this.context.state==='running';
  }
  this.enabled=Boolean(on);this.setActive(this.active);return this.enabled;
 }
 async setVolume(volume){
  this.volume=Math.max(0,Math.min(1,Number(volume)||0));
  await this.setEnabled(this.volume>0);return this.volume;
 }
 async unlock(volume=this.volume){
  this.volume=Math.max(0,Math.min(1,Number(volume)||0));
  if(!this.volume)return this.setEnabled(false);
  this.initialize();
  // Both calls must happen synchronously while the browser still considers
  // this a user gesture; only await the resume promise afterwards.
  let resume;
  try{resume=this.context.resume();}catch{}
  try{this.prime();}catch{}
  try{await resume;}catch{}
  this.enabled=this.context.state==='running';this.setActive(this.active);
  return this.enabled;
 }
 setActive(active){
  this.active=active;if(!this.context)return;
  const audible=this.enabled&&active&&this.volume>0,wasAudible=this.audible;this.audible=audible;
  const now=this.context.currentTime,volume=audible ? this.volume*OUTPUT_BOOST : 0;
  this.master.gain.cancelScheduledValues(now);
  this.master.gain.setValueAtTime(this.master.gain.value,now);
  this.master.gain.linearRampToValueAtTime(volume,now+.06);
  if(audible&&!wasAudible){this.scheduleAmbience();this.lastStep=-1;}
  else if(!audible&&wasAudible)for(const source of this.sources)try{source.stop(now+.065);}catch{}
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
 jump(){this.play(this.swoosh,.52,this.between(-.1,.1));}
 plunge(){this.play(this.yelp,.78,this.between(-.18,.18));}
 update(player,walk,gaps=[]){
  const moved=walk>this.lastWalk+.001;this.lastWalk=walk;
  if(!this.enabled||!this.active||this.context.state!=='running')return;
  const now=this.context.currentTime,step=Math.floor((walk+Math.PI/2)/Math.PI);
  if(now>=this.nextWaterUpdate){
   const stream=streamPresence(player.x,gaps),target=stream.amount*.36;
   this.waterGain.gain.cancelScheduledValues(now);
   this.waterGain.gain.setValueAtTime(this.waterGain.gain.value,now);
   this.waterGain.gain.linearRampToValueAtTime(target,now+.28);
   if(this.waterPan){this.waterPan.pan.cancelScheduledValues(now);this.waterPan.pan.setValueAtTime(this.waterPan.pan.value,now);this.waterPan.pan.linearRampToValueAtTime(stream.pan,now+.28);}
   this.nextWaterUpdate=now+.12;
  }
  if(player.grounded&&moved&&step!==this.lastStep){
   this.play(this.steps[Math.floor(this.random()*this.steps.length)],this.between(.36,.5),this.between(-.08,.08));
  }
  this.lastStep=step;
  if(now>=this.nextWind){
   this.play(this.winds[Math.floor(this.random()*this.winds.length)],this.between(.34,.48),this.between(-.35,.35));
   this.nextWind=now+this.between(20,34);
  }
  if(now>=this.nextBird){
   this.play(this.calls[Math.floor(this.random()*this.calls.length)],this.between(.26,.4),this.between(-.8,.8));
   this.nextBird=now+this.between(24,43);
  }
 }
}
