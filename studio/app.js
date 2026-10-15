"use strict";
(() => {
const translations = {
en: {
skip:"Skip to content",brandSub:"AN INDEPENDENT PRACTICE",navWork:"Selected work",navAbout:"About",navContact:"Let’s talk",location:"NEW YORK · WORKING ACROSS DISCIPLINES",heroOne:"Stories,",heroTwo:"in motion.",heroIntro:"I’m Yiran. I make films, performances, and digital spaces that begin with the body and reach toward connection.",explore:"Explore the work",featured:"FEATURED FILM",quietSubtitle:"寄興園記 · A story told through movement",disciplines:"MOVEMENT / FILM / SPACE / CODE",scroll:"SCROLL TO WANDER ↓",chapterOne:"01 — SELECTED WORK",workTitle:"Different forms.<br>The same curiosity.",workIntro:"A few places where movement, imagination, and people meet.",filterAll:"All work",filterFilm:"Film & movement",filterCommunity:"Community",filterSpace:"Space & code",quietRole:"Co-director · Writer · Choreographer · Performer",breezeRole:"Founder · Creative Director · Curator",nuwaRole:"Concept · Design · Development",urbanRole:"Architecture · Spatial exploration",archive:"ARCHIVE",chapterTwo:"02 — AN OPEN EXPERIMENT",studyTitle:"A little room<br>for play.",studyIntro:"What if a gesture could become a landscape? Move across this drawing and see what follows.",studyNote:"An interactive study made for this site.",studyHint:"MOVE YOUR CURSOR · TOUCH · ARROW KEYS",changeColor:"Change color ↗",pause:"Pause motion Ⅱ",resume:"Resume motion ▷",chapterThree:"03 — THE THREAD BETWEEN THINGS",aboutTitle:"I think with<br>my whole body.",aboutLead:"I’m an artist, filmmaker, dancer, violinist, and builder of things. Architecture taught me to think in space. Dance taught me to listen.",aboutBody:"Originally from China and based in New York, I work between live performance, film, and creative technology. I’m interested in how a body holds memory, how a place changes a story, and how making things together brings us closer.",aboutBreeze:"Through Summer Breeze, I create space for dancers and musicians to share what they make—bringing the energy of sessions and clubs onto the stage.",educationOne:"MA, Performance Studies · NYU Tisch",educationTwo:"M.Arch · Boston Architectural College",educationThree:"Software Engineering · Flatiron School",practiceMovement:"Movement & film",practiceMovementCopy:"Original dance films, choreography, and performance. Collaborations with Gus Dapperton; performances with Ladies of Hip-Hop and MOPTOP Universal.",practiceMusic:"Music & listening",practiceMusicCopy:"Associate Principal Second Violin with the United Nations Symphony Orchestra. Another way to think about rhythm, attention, and working together.",practiceSpace:"Space & technology",practiceSpaceCopy:"Spatial design, websites, and interactive experiments. A practice that connects architectural thinking with code and the moving body.",visitArchive:"Explore the architecture & design archive",chapterFour:"04 — START A CONVERSATION",contactTitle:"What could we<br>make together?",contactIntro:"For a film, a performance, a digital space,<br>or an idea that doesn’t have a name yet.",copyEmail:"Copy email",copied:"Email copied",copyFailed:"Select the email address above to copy it.",footerNote:"Made of many things. Always becoming.",watch:"Play film ▷",watchExternal:"Watch on YouTube ↗",readInterview:"Film & interview ↗",visitBreeze:"Explore Summer Breeze ↗",visitCode:"Explore creative code ↗",visitArchitecture:"Explore the architecture archive ↗",close:"Close project",canvasLabel:"Interactive line sculpture. Move your pointer or use the arrow keys to bend the lines."
},
zh: {
skip:"跳转到正文",brandSub:"跨学科创作实践",navWork:"精选作品",navAbout:"关于",navContact:"聊聊合作",location:"纽约 · 在不同领域之间创作",heroOne:"让故事",heroTwo:"流动起来。",heroIntro:"我是 Yiran。我创作影像、表演和数字空间，从身体出发，寻找人与人之间的连接。",explore:"走进我的作品",featured:"精选短片",quietSubtitle:"寄興園記 · 用身体讲述的故事",disciplines:"身体 / 影像 / 空间 / 代码",scroll:"向下，继续探索 ↓",chapterOne:"01 — 精选作品",workTitle:"不同的形式。<br>同一种好奇。",workIntro:"让身体、想象和人与人相遇的几种方式。",filterAll:"全部作品",filterFilm:"影像与身体",filterCommunity:"社群",filterSpace:"空间与代码",quietRole:"联合导演 · 编剧 · 编舞 · 表演",breezeRole:"创始人 · 创意总监 · 策展",nuwaRole:"概念 · 设计 · 开发",urbanRole:"建筑设计 · 空间探索",archive:"作品档案",chapterTwo:"02 — 一次开放的实验",studyTitle:"留一点空间，<br>自由玩耍。",studyIntro:"如果一个动作能变成一片风景呢？在画面上移动，看看线条如何回应。",studyNote:"为这个网站创作的一次交互练习。",studyHint:"移动鼠标 · 触摸 · 方向键",changeColor:"换一种颜色 ↗",pause:"暂停动态 Ⅱ",resume:"继续动态 ▷",chapterThree:"03 — 连接这些事物的线",aboutTitle:"用整个身体<br>思考。",aboutLead:"我是艺术家、影像创作者、舞者、小提琴手，也喜欢动手创造。建筑让我学会理解空间，舞蹈让我学会倾听。",aboutBody:"来自中国，现居纽约。我的创作穿行于现场表演、影像和创意技术之间。我关心身体如何保存记忆，空间如何改变故事，以及共同创作如何让人与人靠近。",aboutBreeze:"通过 Summer Breeze，我为舞者和音乐人创造分享作品的空间，把练习室与俱乐部中的生命力带到舞台。",educationOne:"表演研究硕士 · 纽约大学 Tisch 艺术学院",educationTwo:"建筑学硕士 · 波士顿建筑学院",educationThree:"软件工程 · Flatiron School",practiceMovement:"身体与影像",practiceMovementCopy:"舞蹈短片、编舞与现场表演。与 Gus Dapperton 合作，并参与 Ladies of Hip-Hop 和 MOPTOP Universal 的演出。",practiceMusic:"音乐与倾听",practiceMusicCopy:"联合国交响乐团第二小提琴副首席。通过音乐，继续练习节奏、专注，以及如何与他人共同创造。",practiceSpace:"空间与技术",practiceSpaceCopy:"空间设计、网站与交互实验。把建筑的思考方式、代码与运动中的身体连接起来。",visitArchive:"探索建筑与设计作品档案",chapterFour:"04 — 从一次对话开始",contactTitle:"我们可以<br>一起创造什么？",contactIntro:"一部影片，一场演出，一个数字空间，<br>或者一个还没有名字的想法。",copyEmail:"复制邮箱",copied:"邮箱已复制",copyFailed:"可以选中上方邮箱地址进行复制。",footerNote:"由许多事物组成。始终在生长。",watch:"播放短片 ▷",watchExternal:"在 YouTube 观看 ↗",readInterview:"短片与访谈 ↗",visitBreeze:"走进 Summer Breeze ↗",visitCode:"探索创意代码作品 ↗",visitArchitecture:"探索建筑作品档案 ↗",close:"关闭作品",canvasLabel:"可交互线条雕塑。移动鼠标或使用方向键改变线条。"
}};
const projects = {
quiet:{
title:"A Quiet Longing",image:"https://i.ytimg.com/vi/BVErHsmFASQ/hqdefault.jpg",video:true,
en:{category:"01 / DANCE FILM",subtitle:"寄興園記 · 2025",meta:["Co-director, writer, choreographer & performer","New York"],description:"Two friends find each other again through movement. Filmed in the New York Chinese Scholar’s Garden, A Quiet Longing follows the closeness, distance, and possibility of understanding that exist inside a friendship.",second:"I approached the film through choreography and architecture: where a body moves, how two people share a frame, and what a place remembers. The story unfolds without spoken dialogue.",credits:"Co-directed with Pearlyn Ho. Choreography and performance: Yiran Shu and Wan-Rong Tseng. Cinematography: Yu Jiang."},
zh:{category:"01 / 舞蹈短片",subtitle:"寄興園記 · 2025",meta:["联合导演、编剧、编舞与表演","纽约"],description:"两个朋友通过舞蹈重新相遇。在纽约寄兴园拍摄的《寄興園記》，讲述友谊里的亲近、距离，以及重新理解彼此的可能。",second:"我从编舞和建筑出发思考影像：身体如何移动，两个人如何共享一个画面，一个空间又保存着什么。故事通过动作展开，没有对白。",credits:"联合导演：Yiran Shu、Pearlyn Ho。编舞与表演：Yiran Shu、Wan-Rong Tseng。摄影：Yu Jiang。"},
actions:[["readInterview","https://cineasianfilms.com/shorts/a-quiet-longing/"]]
},
breeze:{
title:"Summer Breeze",image:"/images/3_graphicdesign/0_2_summerbreeze.png",contain:true,
en:{category:"02 / COMMUNITY & PERFORMANCE",subtitle:"An independent platform for performance · 2023—",meta:["Founder & Creative Director","New York"],description:"Summer Breeze brings the creative energy of dance sessions and clubs to the stage. I founded it as a place for artists to share work in their own language, across Hip Hop, House, Waacking, Popping, and beyond.",second:"The work is as much about making connections as making a show: inviting artists, curating a program, and shaping a space where dancers, musicians, and audiences can meet.",credits:"Selected visual identity from my design archive. Explore the Summer Breeze archive for event programs, artists, and documentation."},
zh:{category:"02 / 社群与现场表演",subtitle:"独立表演艺术平台 · 2023—",meta:["创始人、创意总监","纽约"],description:"Summer Breeze 把舞蹈练习室与俱乐部里的创作能量带上舞台。我创立这个平台，希望艺术家可以用自己的语言分享作品，跨越 Hip Hop、House、Waacking、Popping 以及更多形式。",second:"这份工作也在于建立连接：邀请艺术家、策划节目，并创造一个让舞者、音乐人和观众相遇的空间。",credits:"图像选自我的视觉设计档案。活动节目、艺术家与影像记录可在 Summer Breeze 档案中浏览。"},
actions:[["visitBreeze","https://summer-breeze.cargo.site/"]]
},
nuwa:{
title:"Nüwa Creation",image:"/images/8_developer/12_nuwacreation.png",contain:true,
en:{category:"03 / CREATIVE TECHNOLOGY",subtitle:"女娲造人 · Gesture-driven experiment · 2026",meta:["Concept, design & development","Interactive prototype"],description:"An experiment inspired by the story of Nüwa, exploring the body as an interface. Camera gestures become a way of interacting with a digital world.",second:"This is where my interest in movement meets code: an invitation to participate through physical action. Alongside this project, I build websites, digital environments, and playful creative tools.",credits:"Prototype image from my existing portfolio. The creative code archive includes further interactive projects and websites."},
zh:{category:"03 / 创意技术",subtitle:"女娲造人 · 手势交互实验 · 2026",meta:["概念、设计与开发","交互原型"],description:"受女娲造人故事启发的一次实验，探索身体作为界面的可能。摄像头捕捉的手势，成为与数字世界互动的方式。",second:"在这里，我对身体动作的兴趣与代码相遇：通过真实的身体行动参与创作。我也设计和开发网站、数字环境与富有趣味的创意工具。",credits:"图像来自我的现有作品集。创意代码档案收录了更多交互项目和网站。"},
actions:[["visitCode","/#/developer"]]
},
urban:{
title:"Urban Sensorium",image:"/images/2_architecture/2_4_urbansensorium.jpg",
en:{category:"04 / ARCHITECTURE",subtitle:"A spatial project from the architecture archive",meta:["Architectural design","Spatial exploration"],description:"Architecture was my first way of working with experience. Urban Sensorium belongs to that foundation: thinking through drawings, spatial relationships, and the way a body encounters a place.",second:"The questions continue in my performances, films, and digital work. Where does attention go? What happens when a person moves through a space? How can an environment hold an encounter?",credits:"Original project drawing by Yiran Shu. Explore the architecture archive for additional drawings and projects."},
zh:{category:"04 / 建筑设计",subtitle:"来自建筑作品档案的空间项目",meta:["建筑设计","空间探索"],description:"建筑是我最初理解体验的方式。Urban Sensorium 是这段探索的一部分：通过绘图、空间关系，以及身体与场所的相遇来思考。",second:"这些问题延续到我的表演、影像和数字作品中：注意力流向哪里？当人穿过一个空间，会发生什么？一个环境如何承载一次相遇？",credits:"Yiran Shu 原创项目图纸。建筑作品档案中收录了更多图纸和项目。"},
actions:[["visitArchitecture","/#/architecture"]]
}};
let lang = "en", activeFilter = "all", activeProject = null, previousFocus = null;
try { if(localStorage.getItem("ys-language")==="zh") lang="zh"; } catch (_) {}
const $ = s => document.querySelector(s);
const dialog = $("#project-dialog");
const t = key => translations[lang][key] || translations.en[key] || key;
function updateCount(){
const count=[...document.querySelectorAll(".project")].filter(el=>!el.hidden).length;
$("#work-count").textContent=lang==="zh"?count+" 个作品":count+(count===1?" project":" projects");
}
function applyLanguage(){
document.documentElement.lang=lang==="zh"?"zh-Hans":"en";
document.querySelectorAll("[data-i18n]").forEach(el=>{el.innerHTML=t(el.dataset.i18n);});
$("#language").innerHTML=lang==="en"?'中<span aria-hidden="true"> / EN</span>':'EN<span aria-hidden="true"> / 中</span>';
$("#language").setAttribute("aria-label",lang==="en"?"切换为中文":"Switch to English");
$("#language").lang=lang==="en"?"zh-Hans":"en";
$("#close-dialog").setAttribute("aria-label",t("close"));
$("#gesture").setAttribute("aria-label",t("canvasLabel"));
$("#copy-status").textContent="";
updateCount();
updateMotionButton();
}
$("#language").addEventListener("click",()=>{lang=lang==="en"?"zh":"en";try{localStorage.setItem("ys-language",lang);}catch(_){}applyLanguage();});
document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
activeFilter=button.dataset.filter;
document.querySelectorAll("[data-filter]").forEach(el=>{const on=el===button;el.classList.toggle("active",on);el.setAttribute("aria-pressed",String(on));});
document.querySelectorAll(".project").forEach(el=>{el.hidden=activeFilter!=="all"&&el.dataset.category!==activeFilter;el.classList.remove("project-offset");});
if(activeFilter==="all") [...document.querySelectorAll(".project")].forEach((el,i)=>el.classList.toggle("project-offset",i%2===1));
updateCount();
}));
function imageElement(project){
const img=document.createElement("img");img.src=project.image;img.alt=project.title;img.className="dialog-image"+(project.contain?" contain":"");return img;
}
function openProject(key){
const project=projects[key];if(!project)return;
activeProject=key;previousFocus=document.activeElement;
const content=project[lang];
$("#dialog-title").textContent=project.title;
$("#dialog-category").textContent=content.category;
$("#dialog-subtitle").textContent=content.subtitle;
$("#dialog-description").textContent=content.description;
$("#dialog-description-two").textContent=content.second;
$("#dialog-credits").textContent=content.credits;
$("#dialog-meta").replaceChildren(...content.meta.map(value=>{const el=document.createElement("span");el.textContent=value;return el;}));
const visual=$("#dialog-visual");visual.replaceChildren();
if(project.video){
const shell=document.createElement("div");shell.className="dialog-video";shell.append(imageElement(project));
const play=document.createElement("button");play.type="button";play.className="play-film";play.textContent=t("watch");
play.addEventListener("click",()=>{
const iframe=document.createElement("iframe");iframe.title="A Quiet Longing — dance film";iframe.src="https://www.youtube-nocookie.com/embed/BVErHsmFASQ?autoplay=1&rel=0";iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";iframe.allowFullscreen=true;shell.replaceChildren(iframe);
});shell.append(play);visual.append(shell);
}else visual.append(imageElement(project));
const actions=document.createElement("div");actions.className="dialog-actions";
const links=[...project.actions];if(project.video)links.unshift(["watchExternal","https://www.youtube.com/watch?v=BVErHsmFASQ"]);
links.forEach(([label,url])=>{const a=document.createElement("a");a.href=url;a.textContent=t(label);if(url.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}actions.append(a);});
$("#dialog-actions").replaceChildren(actions);
if(typeof dialog.showModal==="function"){dialog.showModal();dialog.scrollTop=0;document.body.classList.add("modal-open");$("#close-dialog").focus();}
else{window.location.href=links[0][1];}
}
document.querySelectorAll("[data-project]").forEach(button=>button.addEventListener("click",()=>openProject(button.dataset.project)));
$("#close-dialog").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
dialog.addEventListener("close",()=>{$("#dialog-visual").replaceChildren();document.body.classList.remove("modal-open");activeProject=null;if(previousFocus&&previousFocus.isConnected)previousFocus.focus();});
dialog.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const items=[...dialog.querySelectorAll('button,a[href],iframe')].filter(el=>!el.disabled);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
$("#copy-email").addEventListener("click",async()=>{try{if(!navigator.clipboard)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText("yiranshu11@gmail.com");$("#copy-status").textContent=t("copied");}catch(_){$("#copy-status").textContent=t("copyFailed");}});
document.querySelectorAll("img[data-fallback]").forEach(img=>img.addEventListener("error",()=>{const fallback=img.dataset.fallback;if(fallback&&img.src!==fallback)img.src=fallback;},{once:true}));

const canvas=$("#gesture"), ctx=canvas.getContext("2d");
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let paused=reduced.matches, visible=false, frame=0, time=.4, last=0, width=0, height=0, palette=0;
const pointer={x:0,y:0,tx:0,ty:0};
const palettes=[["#2d4638","#8a9c71"],["#934a36","#ca967c"],["#414b72","#8c97b0"]];
function updateMotionButton(){const button=$("#motion");button.textContent=t(paused?"resume":"pause");button.setAttribute("aria-pressed",String(paused));}
function resize(){if(!ctx)return;const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);width=r.width;height=r.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function draw(){
if(!ctx||!width)return;
ctx.clearRect(0,0,width,height);
const base=Math.min(width*.30,height*.65), cx=width/2, cy=height/2-5;
const rotX=.8+pointer.y*.45, rotY=.3+pointer.x*.8, rotation=time*.17;
const lines=width<600?44:68,points=width<600?90:120;
const gradient=ctx.createLinearGradient(cx-base,cy-base,cx+base,cy+base);gradient.addColorStop(0,palettes[palette][0]);gradient.addColorStop(1,palettes[palette][1]);ctx.strokeStyle=gradient;ctx.lineWidth=width<600?.75:.65;
for(let line=0;line<lines;line++){
const u=line/lines*Math.PI*2;ctx.beginPath();
for(let point=0;point<=points;point++){
const v=point/points*Math.PI*2;
const ring=.63+.06*Math.sin(u*3+time*.3);
const tube=.29+.04*Math.cos(u*2+time*.2);
let x=(ring+tube*Math.cos(v))*Math.cos(u),y=(ring+tube*Math.cos(v))*Math.sin(u),z=tube*Math.sin(v)+.09*Math.sin(u*3+time*.4);
const xr=x*Math.cos(rotation)-y*Math.sin(rotation),yr=x*Math.sin(rotation)+y*Math.cos(rotation);x=xr;y=yr;
const y1=y*Math.cos(rotX)-z*Math.sin(rotX),z1=y*Math.sin(rotX)+z*Math.cos(rotX);y=y1;z=z1;
const x1=x*Math.cos(rotY)+z*Math.sin(rotY),z2=-x*Math.sin(rotY)+z*Math.cos(rotY);x=x1;z=z2;
const depth=1/(1+z*.28),px=cx+x*base*depth,py=cy+y*base*depth;
if(point===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
}ctx.globalAlpha=.35+.35*(Math.sin(u)+1)/2;ctx.stroke();
}ctx.globalAlpha=1;
}
function tick(now){frame=0;if(paused||!visible||document.hidden)return;const delta=last?Math.min((now-last)/1000,.05):.016;last=now;time+=delta;pointer.x+=(pointer.tx-pointer.x)*.045;pointer.y+=(pointer.ty-pointer.y)*.045;draw();frame=requestAnimationFrame(tick);}
function start(){if(ctx&&!paused&&visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick);}}
function stop(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}
function move(e){const r=canvas.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width*2-1;pointer.ty=(e.clientY-r.top)/r.height*2-1;if(paused){pointer.x=pointer.tx;pointer.y=pointer.ty;draw();}}
canvas.addEventListener("pointermove",move);
canvas.addEventListener("pointerdown",move);
canvas.addEventListener("pointerleave",()=>{pointer.tx=0;pointer.ty=0;});
canvas.addEventListener("keydown",e=>{const keys={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};if(!keys[e.key])return;e.preventDefault();pointer.tx=Math.max(-1,Math.min(1,pointer.tx+keys[e.key][0]));pointer.ty=Math.max(-1,Math.min(1,pointer.ty+keys[e.key][1]));if(paused){pointer.x=pointer.tx;pointer.y=pointer.ty;draw();}});
$("#motion").addEventListener("click",()=>{paused=!paused;updateMotionButton();if(paused)stop();else start();});
$("#color").addEventListener("click",()=>{palette=(palette+1)%palettes.length;draw();});
document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else start();});
if("IntersectionObserver"in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:.05}).observe(canvas);}else visible=true;
if("ResizeObserver"in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener("resize",resize);
if(reduced.addEventListener)reduced.addEventListener("change",e=>{if(e.matches){paused=true;stop();updateMotionButton();draw();}});
if(!ctx){$("#motion").disabled=true;$("#color").disabled=true;}
applyLanguage();resize();start();
})();
