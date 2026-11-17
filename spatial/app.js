import { LAYERS } from './layout.js';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let language='en';
try{language=localStorage.getItem('yiran-language')==='zh'?'zh':'en';}catch{}
const t=(en,zh)=>language==='zh'?zh:en;
let projects=[],spatial=null,activeProject=null,plate=0,orbit=!matchMedia('(prefers-reduced-motion: reduce)').matches,colorMode=true,selectedLayer='all',lastProjectFocus=null;
try{colorMode=localStorage.getItem('yiran-color-mode')!=='off';}catch{}
document.documentElement.dataset.colorMode=colorMode?'on':'off';
const imageProjects=()=>projects.filter(project=>!project.externalUrl);
const projectDialog=$('#project-dialog'),imageDialog=$('#image-dialog'),indexDialog=$('#index-dialog'),aboutDialog=$('#about-dialog'),controlsDialog=$('#controls-dialog');
const dialogs=[projectDialog,imageDialog,indexDialog,aboutDialog,controlsDialog];
const syncActivity=()=>spatial?.setActive(!dialogs.some(dialog=>dialog.open));

function updateLayer(id){
  selectedLayer=id;
  $$('[data-layer]').forEach(button=>{const active=button.dataset.layer===id;button.classList.toggle('active',active);button.ariaPressed=String(active);});
  $$('[data-link]').forEach(link=>link.classList.toggle('active',id==='all'||link.dataset.link.split(' ').includes(id)));
  $('.layer-nav').dataset.selected=id;
  const layer=LAYERS.find(layer=>layer.id===id);
  $('#view-label').textContent=layer?t(layer.title.toUpperCase(),layer.titleZh):t('ALL LAYERS','全部层');
}
function updateOrbit(value){
  orbit=value;$('#auto-orbit').ariaPressed=String(value);
  $('#orbit-label').textContent=value?t('Pause orbit','暂停旋转'):t('Auto orbit','自动旋转');
  $('#auto-orbit').ariaLabel=$('#orbit-label').textContent;
}
function updateColorMode(value){
  colorMode=Boolean(value);document.documentElement.dataset.colorMode=colorMode?'on':'off';
  $('#color-mode').ariaPressed=String(colorMode);
  $('#color-mode').ariaLabel=t(`Color Mode ${colorMode?'On':'Off'}`,`色彩模式${colorMode?'开启':'关闭'}`);
  $('#color-mode-state').textContent=colorMode?'ON':'OFF';
  spatial?.setColorMode(colorMode);
}
function updateCount(){
  const visible=$$('.project-card').filter(card=>!card.hidden);
  const count=visible.reduce((n,card)=>n+(projects.find(project=>project.id===card.dataset.id)?.images.length||0),0);
  $('#gallery-count').textContent=t(`${String(visible.length).padStart(2,'0')} PROJECTS / ${count} IMAGES`,`${visible.length} 个项目 / ${count} 张作品图`);
}
function translate(){
  document.documentElement.lang=language==='zh'?'zh-Hans':'en';
  document.title=t('Yiran Shu — 3D Portfolio','Yiran Shu — 三维作品集');
  $$('[data-en][data-zh]').forEach(element=>element.textContent=element.dataset[language]);
  $$('[data-label-en][data-label-zh]').forEach(element=>element.ariaLabel=element.dataset[language==='zh'?'labelZh':'labelEn']);
  $$('[data-language]').forEach(button=>button.ariaPressed=String(button.dataset.language===language));
  $('#load-label').textContent=t('Loading images','正在载入图片');
  spatial?.setLanguage(language);
  document.querySelector('elevenlabs-convai')?.setAttribute('language',language);
  updateLayer(selectedLayer);updateOrbit(orbit);updateColorMode(colorMode);updateCount();
  if(activeProject)fillProjectInfo();
}
function showIndex(){indexDialog.showModal();syncActivity();}
$$('[data-index]').forEach(button=>button.addEventListener('click',showIndex));
$('#index-open').addEventListener('click',showIndex);
$('#index-close').addEventListener('click',()=>indexDialog.close());
$('#about-open').addEventListener('click',()=>{aboutDialog.showModal();syncActivity();});
$('#about-close').addEventListener('click',()=>aboutDialog.close());
$('#controls-open').addEventListener('click',()=>{controlsDialog.showModal();syncActivity();});
$('#controls-close').addEventListener('click',()=>controlsDialog.close());
$('#color-mode').addEventListener('click',()=>{
  updateColorMode(!colorMode);
  try{localStorage.setItem('yiran-color-mode',colorMode?'on':'off');}catch{}
});
for(const dialog of dialogs){
  dialog.addEventListener('close',syncActivity);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
}

function writeProjectHash(push=false){
  if(!activeProject)return;
  const hash=`#work/${activeProject.id}/${plate+1}`;
  if(location.hash!==hash)history[push?'pushState':'replaceState'](null,'',hash);
}
function updatePlate(updateHash=true){
  if(!activeProject)return;
  const image=activeProject.images[plate];
  $('#dialog-image').src=image.image;
  $('#dialog-image').alt=`${activeProject.title} — ${t('image','作品图')} ${plate+1}`;
  $('#plate-counter').textContent=`${String(plate+1).padStart(2,'0')} / ${String(activeProject.images.length).padStart(2,'0')}`;
  $('#plate-prev').disabled=activeProject.images.length<2;
  $('#plate-next').disabled=activeProject.images.length<2;
  $$('#plate-thumbnails button').forEach((button,i)=>{
    button.classList.toggle('active',i===plate);button.ariaPressed=String(i===plate);
    button.ariaLabel=t(`View ${activeProject.title}, image ${i+1}`,`查看 ${activeProject.title} 第 ${i+1} 张作品图`);
  });
  if(imageDialog.open){$('#full-image').src=image.image;$('#full-image').alt=$('#dialog-image').alt;}
  if(updateHash)writeProjectHash();
}
function fillProjectInfo(){
  const project=activeProject,collection=imageProjects(),index=collection.indexOf(project);
  $('#dialog-index').textContent=`${t('PROJECT','项目')} ${String(index+1).padStart(2,'0')} / ${String(collection.length).padStart(2,'0')}`;
  $('#dialog-title').textContent=project.title;
  $('#dialog-category').textContent=t(project.categoryLabel,project.categoryLabelZh);
  const essay=$('#axie-essay');
  essay.hidden=project.id!=='axie-gallery';
  essay.textContent=t('The Axiebitat Gallery is officially open ↗','Axiebitat 画廊正式开放 ↗');
  $('#dialog-subtitle').textContent=t(project.subtitle,project.subtitleZh);
  $('#dialog-description').textContent=t(project.description,project.descriptionZh);
  $('#dialog-plates').textContent=t(`${project.images.length} DRAWINGS & IMAGES`,`${project.images.length} 张图纸与作品图`);
  $('#original-project').href=project.category==='architecture'?'./2d/#/architecture':project.category==='objects'?'./2d/#/digital-fabrication':'./2d/#/axie-gallery';
  $('#next-project-title').textContent=collection[(index+1)%collection.length].title;
  updatePlate(false);
}
function openProject(id,imageIndex=0,pushHash=true){
  const project=projects.find(project=>project.id===id);if(!project)return;
  if(project.externalUrl)return;
  activeProject=project;plate=Math.max(0,Math.min(project.images.length-1,Number(imageIndex)||0));
  $('#plate-thumbnails').replaceChildren();
  project.images.forEach((image,index)=>{
    const button=document.createElement('button'),img=document.createElement('img');
    img.src=image.thumb;img.alt='';img.loading='lazy';
    button.append(img);button.addEventListener('click',()=>{plate=index;updatePlate();});
    $('#plate-thumbnails').append(button);
  });
  fillProjectInfo();
  if(!projectDialog.open){lastProjectFocus=document.activeElement;projectDialog.showModal();}
  syncActivity();
  if(pushHash)writeProjectHash(true);
}
function activateProject(id,imageIndex=0){
  const project=projects.find(project=>project.id===id);
  if(project?.externalUrl){
    window.open(project.externalUrl,'_blank','noopener,noreferrer');
    return;
  }
  openProject(id,imageIndex);
}
function changePlate(delta){
  if(!activeProject)return;
  plate=(plate+delta+activeProject.images.length)%activeProject.images.length;
  updatePlate();
  $$('#plate-thumbnails button')[plate]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('#project-grid').addEventListener('click',event=>{
  const button=event.target.closest('[data-open]');
  if(button&&projects.some(project=>project.id===button.dataset.open)){event.preventDefault();openProject(button.dataset.open);}
});
$('#dialog-close').addEventListener('click',()=>projectDialog.close());
projectDialog.addEventListener('close',()=>{
  activeProject=null;
  if(imageDialog.open)imageDialog.close();
  if(location.hash.startsWith('#work/'))history.replaceState(null,'',location.pathname+location.search);
  if(lastProjectFocus?.isConnected)lastProjectFocus.focus({preventScroll:true});
});
$('#plate-prev').addEventListener('click',()=>changePlate(-1));
$('#plate-next').addEventListener('click',()=>changePlate(1));
$('#next-project').addEventListener('click',()=>{
  if(!activeProject)return;
  const collection=imageProjects();
  openProject(collection[(collection.indexOf(activeProject)+1)%collection.length].id);
  $('.dialog-body').scrollTop=0;
});
$('#plate-open').addEventListener('click',()=>{
  $('#full-image').src=$('#dialog-image').src;$('#full-image').alt=$('#dialog-image').alt;
  imageDialog.showModal();syncActivity();
});
$('#image-close').addEventListener('click',()=>imageDialog.close());
let touchStart=null,suppressClick=false;
$('#plate-open').addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};});
$('#plate-open').addEventListener('pointerup',event=>{
  if(!touchStart)return;
  const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){changePlate(dx>0?-1:1);suppressClick=true;}
});
$('#plate-open').addEventListener('pointercancel',()=>touchStart=null);
$('#plate-open').addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
document.addEventListener('keydown',event=>{
  if(projectDialog.open){
    if(event.key==='ArrowLeft'){event.preventDefault();changePlate(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();changePlate(1);}
  }
});
$$('.filters button').forEach(button=>button.addEventListener('click',()=>{
  $$('.filters button').forEach(other=>{other.classList.toggle('active',other===button);other.ariaPressed=String(other===button);});
  $$('.project-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
  updateCount();
}));
$$('[data-layer]').forEach(button=>button.addEventListener('click',()=>spatial?.setLayer(button.dataset.layer)));
$('#scene-reset').addEventListener('click',()=>spatial?.reset());
$('#brand-home').addEventListener('click',()=>spatial?.reset());
$('#front-view').addEventListener('click',()=>spatial?.front());
$('#auto-orbit').addEventListener('click',()=>spatial?.setOrbit(!orbit));
$('#zoom-in').addEventListener('click',()=>spatial?.zoom(1));
$('#zoom-out').addEventListener('click',()=>spatial?.zoom(-1));
$('#scene').addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if(key==='r'||key==='0'){event.preventDefault();spatial?.reset();}
  else if(key==='f'){event.preventDefault();spatial?.front();}
  else if(key==='+'||key==='='){event.preventDefault();spatial?.zoom(1);}
  else if(key==='-'){event.preventDefault();spatial?.zoom(-1);}
  else if(['1','2','3','4'].includes(key)){event.preventDefault();spatial?.setLayer(LAYERS[Number(key)-1].id);}
});
$$('[data-language]').forEach(button=>button.addEventListener('click',()=>{
  language=button.dataset.language;
  try{localStorage.setItem('yiran-language',language);}catch{}
  translate();
}));
function readHash(){
  const match=location.hash.match(/^#work\/([a-z0-9-]+)(?:\/(\d+))?$/);
  if(match)openProject(match[1],match[2]?Number(match[2])-1:0,false);
  else if(projectDialog.open)projectDialog.close();
}
window.addEventListener('popstate',readHash);
window.addEventListener('hashchange',readHash);
function onHover(item){
  const tooltip=$('#scene-tooltip');tooltip.hidden=!item;
  if(!item)return;
  $('#hover-title').textContent=item.project.title;
  const description=t(item.project.description,item.project.descriptionZh);
  $('#hover-description').textContent=description||'';
  $('#hover-description').hidden=!description;
  tooltip.style.left=`${Math.max(10,Math.min(item.x+18,innerWidth-tooltip.offsetWidth-14))}px`;
  tooltip.style.top=`${Math.max(10,Math.min(item.y+18,innerHeight-tooltip.offsetHeight-14))}px`;
}
function unavailable(){
  document.body.classList.add('scene-unavailable');
  $('#scene-loading').hidden=true;$('#scene-fallback').hidden=false;
  $$('.scene-actions button,[data-layer]').forEach(button=>button.disabled=true);
}
function mountElevenIcon(){
  const widget=$('#elevenlabs-widget'),icon=$('#eleven-icon');
  if(!widget||!icon)return;
  const canvas=icon.querySelector('canvas'),ctx=canvas.getContext('2d');
  icon.style.cursor='grab';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paint=time=>{
    const s=canvas.width,h=s/2,t=time*.001;
    ctx.clearRect(0,0,s,s);
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    [[255,28,28,.95,.85,.6,.48],[226,226,226,.9,-.6,.75,.44],[255,70,70,.5,1.15,-.45,.3],[190,190,190,.65,-.95,-.7,.28]].forEach(([r,g,b,a,sx,sy,rad],i)=>{
      const x=h+Math.cos(t*sx+i)*s*.24,y=h+Math.sin(t*sy+i)*s*.24,radius=s*rad;
      const glow=ctx.createRadialGradient(x,y,0,x,y,radius);
      glow.addColorStop(0,`rgba(${r},${g},${b},${a})`);glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
    });
    ctx.globalCompositeOperation='destination-in';
    const mask=ctx.createRadialGradient(h,h,s*.2,h,h,h);
    mask.addColorStop(0,'#fff');mask.addColorStop(.8,'#fff');mask.addColorStop(1,'#0000');
    ctx.fillStyle=mask;ctx.fillRect(0,0,s,s);
    ctx.restore();
    if(!reduced)requestAnimationFrame(paint);
  };
  requestAnimationFrame(paint);
  const keepInside=()=>{
    if(!icon.style.left)return;
    const size=icon.offsetWidth||46;
    const x=Math.min(Math.max(0,parseFloat(icon.style.left)||0),Math.max(0,innerWidth-size));
    const y=Math.min(Math.max(0,parseFloat(icon.style.top)||0),Math.max(0,innerHeight-size));
    icon.style.left=`${x}px`;icon.style.top=`${y}px`;
  };
  try{
    const saved=JSON.parse(localStorage.getItem('yiran-eleven-icon')||'null');
    if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)){icon.style.left=`${saved.x}px`;icon.style.top=`${saved.y}px`;icon.style.right='auto';icon.style.bottom='auto';keepInside();}
  }catch{}
  addEventListener('resize',keepInside);
  let dragging=false,moved=false,sx=0,sy=0,ox=0,oy=0;
  const place=(x,y)=>{
    const size=icon.offsetWidth;
    const left=Math.min(Math.max(0,x),innerWidth-size),top=Math.min(Math.max(0,y),innerHeight-size);
    icon.style.left=`${left}px`;icon.style.top=`${top}px`;icon.style.right='auto';icon.style.bottom='auto';
    return {x:left,y:top};
  };
  icon.addEventListener('pointerdown',event=>{
    if(event.button!=null&&event.button!==0)return;
    dragging=true;moved=false;sx=event.clientX;sy=event.clientY;
    const box=icon.getBoundingClientRect();ox=box.left;oy=box.top;
    try{icon.setPointerCapture(event.pointerId);}catch{}
    icon.classList.add('is-dragging');icon.style.cursor='grabbing';
  });
  icon.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const dx=event.clientX-sx,dy=event.clientY-sy;
    if(Math.hypot(dx,dy)>5)moved=true;
    place(ox+dx,oy+dy);
  });
  icon.addEventListener('pointerup',()=>{
    if(!dragging)return;
    dragging=false;icon.classList.remove('is-dragging');icon.style.cursor='grab';
    if(!moved)return;
    const box=icon.getBoundingClientRect();
    try{localStorage.setItem('yiran-eleven-icon',JSON.stringify({x:box.left,y:box.top}));}catch{}
  });
  const callButton=()=>{
    const root=widget.shadowRoot;if(!root)return null;
    return [...root.querySelectorAll('button')].find(button=>/start a call|开始通话/i.test(button.getAttribute('aria-label')||''));
  };
  const guideVisible=()=>{
    const root=widget.shadowRoot;if(!root)return false;
    return [...root.querySelectorAll('button')].some(button=>{
      const box=button.getBoundingClientRect();
      return box.width>20&&box.height>12&&/accept|agree|cancel|end call|接受|同意|取消|结束/i.test(`${button.textContent} ${button.getAttribute('aria-label')||''}`);
    });
  };
  const hideLauncher=()=>{
    const root=widget.shadowRoot;if(!root||root.getElementById('eleven-hide'))return;
    const style=document.createElement('style');style.id='eleven-hide';
    style.textContent='.rounded-compact-sheet{display:none!important}.overlay,button{pointer-events:auto}';
    root.addEventListener('click',event=>{
      const button=event.target.closest?.('button');if(!button)return;
      if(/cancel|取消/i.test(`${button.textContent} ${button.getAttribute('aria-label')||''}`))close();
    });
    root.appendChild(style);
  };
  const timer=setInterval(()=>{hideLauncher();if(widget.shadowRoot?.getElementById('eleven-hide'))clearInterval(timer);},200);
  setTimeout(()=>clearInterval(timer),8000);
  const close=()=>widget.classList.remove('is-open');
  icon.addEventListener('click',event=>{
    if(moved){moved=false;event.preventDefault();event.stopPropagation();return;}
    if(widget.classList.contains('is-open'))return;
    const start=callButton();if(!start)return;
    widget.classList.add('is-open');
    start.click();
    setTimeout(()=>{if(!guideVisible())close();},700);
  });
  widget.addEventListener('conversationEnded',close);
}
async function boot(){
  translate();
  mountElevenIcon();
  try{
    const response=await fetch('./projects.json');if(!response.ok)throw new Error('Project data unavailable');
    projects=await response.json();translate();readHash();
    try{
      const {createSpatialCollection}=await import('./scene.js');
      spatial=createSpatialCollection({
        container:$('#scene'),projects,language,onOpen:activateProject,onHover,onLayerChange:updateLayer,onOrbitChange:updateOrbit,onUnavailable:unavailable,
        getNavigationRight:()=>$('.layer-nav').getBoundingClientRect().right,
        onProgress({loaded,failed,total}){
          $('#load-count').textContent=`${String(loaded+failed).padStart(2,'0')} / ${total}`;
          if(loaded+failed===total){$('#scene-loading').classList.add('done');setTimeout(()=>$('#scene-loading').hidden=true,350);}
        },
        onCamera(axes){axes.forEach(axis=>{
          const group=document.querySelector(`[data-axis="${axis.axis}"]`),line=group.querySelector('line'),label=group.querySelector('text');
          line.setAttribute('x2',45+axis.x*27);line.setAttribute('y2',45+axis.y*27);
          label.setAttribute('x',42+axis.x*36);label.setAttribute('y',48+axis.y*36);
          group.style.opacity=String(.6+(axis.z+1)*.2);
        });}
      });
      spatial.setColorMode(colorMode);
      spatial.setOrbit(orbit);
      syncActivity();
    }catch(error){unavailable();console.warn('3D collection unavailable:',error.message);}
  }catch(error){unavailable();console.warn(error.message);}
}
boot();
