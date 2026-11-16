export const CARD = Object.freeze({width:3.2, height:1.8, gapX:.85, gapY:1.1});
export const LAYER_LEFT = -CARD.width/2;
export const LAYER_TOP = CARD.height/2;
export const ROOM_GRID = Object.freeze({step:CARD.width+CARD.gapX, opacity:.325, extent:320, fadeStart:80, fadeEnd:240});
export const LAYER_HEADING = Object.freeze({width:14.5, height:1.9, fontSize:1.4, gap:.35, gridColumn:5});
const VIEW_FIT = .78;
export const LAYERS = Object.freeze([
  {id:'digital', title:'Axie Gallery', titleZh:'Axie 画廊', z:0, category:'digital'},
  {id:'architecture', title:'Architecture', sourceTitle:'Architectural Design', titleZh:'建筑设计', z:-5, category:'architecture'},
  {id:'fabrication', title:'Digital Fabrication', titleZh:'数字制造', z:-10, category:'objects'},
  {id:'developer', title:'Developer', titleZh:'开发项目', z:-15, category:'developer'}
]);

// Offset complete collections only along X. Every block shares the same top
// edge and reads in project order on a compact, uninterrupted grid of its own.
const ARCHIVE_BLOCKS = {
  digital:{columns:2,compactColumns:2,startColumn:0},
  architecture:{columns:3,compactColumns:2,startColumn:1},
  fabrication:{columns:1,compactColumns:1,startColumn:3},
  developer:{columns:3,compactColumns:2,startColumn:1.75}
};

// Centered cover crop: retain source proportions inside the 16:9 frame.
export function coverWindow(width, height) {
  const ratio = width / height, target = CARD.width / CARD.height;
  const repeatX = Math.min(1, target / ratio);
  const repeatY = Math.min(1, ratio / target);
  return {repeatX, repeatY, offsetX:(1-repeatX)/2, offsetY:(1-repeatY)/2};
}

export function buildLayout(projects, compact = false) {
  const layers=LAYERS.map(layer => {
    const images = projects.filter(p=>p.category===layer.category).flatMap(project=>
      (layer.id==='architecture'?project.images.slice(0,1):project.images)
        .map((image,imageIndex)=>({project,image,imageIndex})));
    const block=ARCHIVE_BLOCKS[layer.id];
    const columns=compact?block.compactColumns:block.columns;
    // Keep the wall grid/title anchors unchanged while tightening image gaps.
    const pitchX=CARD.width+.4,pitchY=CARD.height+.62;
    const startX=block.startColumn*ROOM_GRID.step;
    const startY=LAYER_TOP-CARD.height/2;
    const cards=images.map((entry,i)=>{
      return {...entry,layerId:layer.id,
        x:startX+(i%columns)*pitchX,
        y:startY-Math.floor(i/columns)*pitchY,
        z:layer.z,rotationX:0};
    });
    const imageLeft=Math.min(...cards.map(card=>card.x-CARD.width/2));
    const imageTop=Math.max(...cards.map(card=>card.y+CARD.height/2));
    const right=Math.max(...cards.map(card=>card.x+CARD.width/2));
    const bottom=Math.min(...cards.map(card=>card.y-CARD.height/2));
    return {...layer,width:right-LAYER_LEFT,height:LAYER_TOP-bottom,
      left:LAYER_LEFT,right,top:LAYER_TOP,bottom,imageLeft,imageTop,cards};
  });
  // Count from the first image column at X=0; all titles begin at column five.
  const headingLeft=(LAYER_HEADING.gridColumn-1)*ROOM_GRID.step;
  return layers.map(layer=>({...layer,headingLeft}));
}

export function headingBounds(layer) {
  const left=layer.headingLeft, bottom=layer.top+.85+LAYER_HEADING.gap;
  return {left,right:left+LAYER_HEADING.width,bottom,top:bottom+LAYER_HEADING.height};
}

export function viewBounds(layers, id='all') {
  return layers.filter(layer=>id==='all'||layer.id===id).flatMap(layer=>{
    const heading=headingBounds(layer);
    return [Math.min(layer.left-1.5,heading.left-.5),Math.max(layer.right+1,heading.right+.5)].flatMap(x=>
      [layer.bottom-1,heading.top+.45].map(y=>[x,y,layer.z]));
  });
}

export function roomBounds(layers) {
  const points=viewBounds(layers), step=ROOM_GRID.step, padding=[8,6,8];
  const min=[0,1,2].map(axis=>Math.floor((Math.min(...points.map(point=>point[axis]))-padding[axis])/step)*step);
  const max=[0,1,2].map(axis=>Math.ceil((Math.max(...points.map(point=>point[axis]))+padding[axis])/step)*step);
  return {min,max,center:min.map((value,axis)=>(value+max[axis])/2),step};
}

// Reserve a wider navigation gutter for the close overview.
// Cap the inset on phones, where the collection sits below the navigation.
export function archiveViewport(width, height, navigationRight=0) {
  const margin=.06;
  const inset=Math.max(0,(navigationRight+28-width*margin)/(1-margin));
  const left=Math.min(inset,width*.25);
  return {left,width:width-left,height};
}

export function fitView(layers, id, aspect, front=false) {
  const points=viewBounds(layers,id);
  const target=[0,1,2].map(i=>(Math.min(...points.map(p=>p[i]))+Math.max(...points.map(p=>p[i])))/2);
  const normalize=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
  const dot=(a,b)=>a.reduce((sum,value,i)=>sum+value*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  // Look gently upward with a more frontal overview so the images read larger.
  // Individual collections retain their closer-to-level viewing angle.
  const elevation=id==='all'?-.4:.18,side=id==='all'?.4:.65;
  const direction=normalize(front?[0,0,1]:[side,elevation,1]);
  const right=normalize(cross([0,1,0],direction)),up=normalize(cross(direction,right));
  // Keep the close overview framing and clear separation between headings.
  const overview=id==='all'&&!front;
  const fov=overview?28:38,fill=overview?.98:VIEW_FIT;
  const tanV=Math.tan(fov/2*Math.PI/180)*fill,tanH=tanV*aspect;
  let distance=10;
  for(const point of points){
    const relative=point.map((value,i)=>value-target[i]),depth=dot(relative,direction);
    distance=Math.max(distance,Math.abs(dot(relative,right))/tanH+depth,Math.abs(dot(relative,up))/tanV+depth);
  }
  return {target,position:target.map((value,i)=>value+direction[i]*distance),distance,fov};
}
