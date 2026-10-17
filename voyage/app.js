import {Journey,WORLD} from './game-core.js';
import {sceneMarkup,setSceneTransforms} from './ink-art.js';
import {groundCameraY,applyCamera} from './camera.js';
import {COPY,LANGUAGE_KEY,COLOR_KEY,readLanguage} from './locale.js';
import {NatureSound} from './sound.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const svg=$('#scene'),stage=$('#stage'),hint=$('#hint'),actions=$('#actions');
const SAVE_KEY='beyond-the-mountains-v1';
const coarse=window.matchMedia('(pointer:coarse)').matches;
let language='en',colorOn=true,soundVolume=.33,save={version:1,unlocked:0,records:[null,null,null],current:null},storageAvailable=true;
try{
 language=readLanguage(localStorage);
 colorOn=localStorage.getItem(COLOR_KEY)!=='off';
 const data=JSON.parse(localStorage.getItem(SAVE_KEY));
 if(data?.version===1){
  save.unlocked=Math.max(0,Math.min(2,Number(data.unlocked)||0));
  save.records=[0,1,2].map(i=>Number.isFinite(data.records?.[i])?Math.max(0,Math.min(3,data.records[i])):null);
  if(Number.isInteger(data.current?.level)&&data.current.level>=0&&data.current.level<=save.unlocked)save.current=data.current;
 }
}catch{storageAvailable=false;}
let mode='playing',game=new Journey(),camera=0,viewWidth=1440,lastFrame=0,accumulator=0,lastArt=0;
let jumpQueued=false,hintTimer,hintKey=coarse?'touchHint':'hint';
const keys=new Set(),touches=new Set();
const soundscape=new NatureSound({volume:soundVolume}),soundVolumeInput=$('#soundVolume');
const t=key=>COPY[language][key];
function announce(message){$('#srStatus').textContent=message;}
function syncSoundControl(){
 const percent=Math.round(soundVolume*100);
 $('#soundLabel').textContent=t('sound');soundVolumeInput.value=String(percent);
 soundVolumeInput.setAttribute('aria-label',t('soundVolume'));
 soundVolumeInput.setAttribute('aria-valuetext',`${percent}%`);
}
function showHint(key,duration=7000){
 hintKey=key;hint.textContent=t(key);hint.classList.remove('faded');
 clearTimeout(hintTimer);hintTimer=setTimeout(()=>hint.classList.add('faded'),duration);
}
function refreshActions(){
 actions.hidden=mode==='playing';hint.hidden=mode!=='playing';
 $('#touchControls').hidden=mode!=='playing';
 $('#advance').textContent=mode==='paused'?t('resume'):game.level===2?t('again'):t('next');
 $('#retry').hidden=mode!=='paused';$('#retry').textContent=t('retry');
 syncSoundControl();
 document.body.classList.toggle('resting',mode!=='playing');
 soundscape.setActive(mode==='playing'&&!document.hidden);
}
function applyLanguage(){
 document.documentElement.lang=language==='zh'?'zh-CN':'en';
 document.title=t('title');$('meta[name="description"]').setAttribute('content',t('description'));
 stage.setAttribute('aria-label',t('stage'));$('.language-switch').setAttribute('aria-label',t('language'));
 $('#touchControls').setAttribute('aria-label',t('touch'));
 $$('[data-control]').forEach(b=>b.setAttribute('aria-label',t(b.dataset.control)));
 $$('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
 hint.textContent=t(hintKey);refreshActions();
 document.documentElement.classList.toggle('monochrome',!colorOn);
 $('#colorToggle').textContent=t(colorOn?'colorOn':'colorOff');
 $('#colorToggle').setAttribute('aria-pressed',String(colorOn));
}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch{if(storageAvailable)showHint('noSave');storageAvailable=false;}}
function saveCurrent(){if(!game.complete){save.current=game.snapshot();persist();}}
function clearInput(){keys.clear();touches.clear();jumpQueued=false;$$('[data-control]').forEach(b=>b.classList.remove('held'));}
function targetCamera(){return Math.max(0,Math.min(WORLD-viewWidth,game.player.x-viewWidth*.73));}
function resize(){const r=stage.getBoundingClientRect();viewWidth=Math.max(360,Math.min(WORLD,r.width/r.height*760));svg.setAttribute('viewBox',`0 0 ${viewWidth} 760`);camera=targetCamera();paint(0,true);}
function rebuild(){svg.innerHTML=sceneMarkup(game.level);camera=targetCamera();lastArt=0;resize();}
function paint(time,force=false){
 const vertical=groundCameraY(game.level,game.player);
 applyCamera(svg,camera,vertical,game.player);
 if(force||time-lastArt>=1000/12){setSceneTransforms(svg,camera,game.player,game.time,game.walk,game.collected,vertical);lastArt=time;}
}
function begin(level=0,resume=null,initial=false){
 clearInput();mode='playing';game=new Journey(level,resume);accumulator=0;
 rebuild();refreshActions();saveCurrent();
 if(initial)showHint(coarse?'touchHint':'hint');
 else hint.classList.add('faded');
 announce(COPY[language].chapters[game.level]);stage.focus({preventScroll:true});
}
function pauseGame(){if(mode!=='playing')return;saveCurrent();mode='paused';clearInput();refreshActions();announce(t('paused'));$('#advance').focus({preventScroll:true});}
function resumeGame(){if(mode!=='paused')return;mode='playing';accumulator=0;clearInput();refreshActions();stage.focus({preventScroll:true});}
function finish(){
 mode='result';clearInput();
 save.records[game.level]=Math.max(save.records[game.level]??0,game.collected.size);
 save.unlocked=Math.max(save.unlocked,Math.min(2,game.level+1));
 save.current=game.level===2?null:new Journey(game.level+1).snapshot();persist();
 refreshActions();
 announce(t(game.level===2?'finished':'complete'));$('#advance').focus({preventScroll:true});
}
function processEvents(){for(const event of game.drain()){
 if(event.type==='checkpoint'){saveCurrent();announce(t('saved'));}
 if(event.type==='fall'){clearInput();camera=targetCamera();showHint('fall',2400);announce(t('fall'));}
 if(event.type==='complete')finish();
}}
function frame(time){
 const dt=lastFrame?Math.min((time-lastFrame)/1000,.08):0;lastFrame=time;
 if(mode==='playing'){
  accumulator+=dt;
  while(accumulator>=1/120&&mode==='playing'){
   const jump=jumpQueued;jumpQueued=false;
   game.step(1/120,{left:keys.has('left')||touches.has('left'),right:keys.has('right')||touches.has('right'),jump});
   accumulator-=1/120;processEvents();
  }
  camera+=(targetCamera()-camera)*Math.min(1,dt*8);paint(time);soundscape.update(game.player,game.walk,game.chapter.gaps);
 }
 requestAnimationFrame(frame);
}
function keyName(e){if(['ArrowLeft','KeyA'].includes(e.code))return 'left';if(['ArrowRight','KeyD'].includes(e.code))return 'right';if(['Space','ArrowUp','KeyW'].includes(e.code))return 'jump';}
window.addEventListener('keydown',e=>{
 if(['Escape','KeyP'].includes(e.code)){if(e.repeat)return;e.preventDefault();if(mode==='playing')pauseGame();else if(mode==='paused')resumeGame();return;}
 if(e.target.closest?.('button,input'))return;
 const k=keyName(e);if(!k||mode!=='playing')return;e.preventDefault();
 if(k==='jump'&&!e.repeat&&!keys.has(k))jumpQueued=true;keys.add(k);
});
window.addEventListener('keyup',e=>{const k=keyName(e);if(k){keys.delete(k);if(mode==='playing')e.preventDefault();}});
window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pauseGame();});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){clearInput();if(mode==='playing')pauseGame();}
});
window.addEventListener('pagehide',saveCurrent);
stage.addEventListener('pointerdown',()=>{if(mode==='paused')resumeGame();else stage.focus({preventScroll:true});});
$$('[data-control]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);const k=b.dataset.control;touches.add(k);b.classList.add('held');if(k==='jump')jumpQueued=true;});
 const release=()=>{touches.delete(b.dataset.control);b.classList.remove('held');};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
});
$$('[data-language]').forEach(b=>b.addEventListener('click',()=>{
 language=b.dataset.language;try{localStorage.setItem(LANGUAGE_KEY,language);}catch{}
 applyLanguage();if(mode==='playing')showHint(coarse?'touchHint':'hint',5000);
 announce(t('title'));stage.focus({preventScroll:true});
}));
$('#colorToggle').onclick=()=>{colorOn=!colorOn;try{localStorage.setItem(COLOR_KEY,colorOn?'on':'off');}catch{}applyLanguage();stage.focus({preventScroll:true});};
$('#advance').onclick=()=>{if(mode==='paused')resumeGame();else if(mode==='result')begin(game.level===2?0:game.level+1);};
$('#retry').onclick=()=>{if(mode==='paused'){game.respawn();resumeGame();processEvents();paint(0,true);}};
soundVolumeInput.addEventListener('pointerdown',()=>{void setSoundVolume(soundVolumeInput.value);});
soundVolumeInput.addEventListener('input',()=>{void setSoundVolume(soundVolumeInput.value);});

async function setSoundVolume(value){
 soundVolume=Math.max(0,Math.min(1,Number(value)/100));syncSoundControl();
 try{await soundscape.setVolume(soundVolume);}catch{announce(t('soundUnavailable'));}
}
applyLanguage();begin(save.current?.level||0,save.current,true);
new ResizeObserver(resize).observe(stage);requestAnimationFrame(frame);
