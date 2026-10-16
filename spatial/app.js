import { LAYERS } from './layout.js';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let language='en';
try{language=localStorage.getItem('yiran-language')==='zh'?'zh':'en';}catch{}
const t=(en,zh)=>language==='zh'?zh:en;
let projects=[],spatial=null,activeProject=null,plate=0,orbit=!matchMedia('(prefers-reduced-motion: reduce)').matches,selectedLayer='all',lastProjectFocus=null;
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
  updateLayer(selectedLayer);updateOrbit(orbit);updateCount();
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
  tooltip.style.left=`${Math.max(10,Math.min(item.x+18,innerWidth-tooltip.offsetWidth-14))}px`;
  tooltip.style.top=`${Math.max(10,Math.min(item.y+18,innerHeight-tooltip.offsetHeight-14))}px`;
}
function unavailable(){
  document.body.classList.add('scene-unavailable');
  $('#scene-loading').hidden=true;$('#scene-fallback').hidden=false;
  $$('.scene-actions button,[data-layer]').forEach(button=>button.disabled=true);
}
async function boot(){
  translate();
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
      spatial.setOrbit(orbit);
      syncActivity();
    }catch(error){unavailable();console.warn('3D collection unavailable:',error.message);}
  }catch(error){unavailable();console.warn(error.message);}
}
boot();
