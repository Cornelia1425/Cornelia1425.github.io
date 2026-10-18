import {groundY} from './game-core.js';

// The running surface stays at the same screen height. Tracking the terrain
// instead of airborne feet preserves visible jumps and falls.
export const RUNNING_LINE = 580;
export function groundCameraY(level,player){return groundY(level,player.x)-RUNNING_LINE;}

const sceneCache=new WeakMap();
function sceneNodes(svg){
 let nodes=sceneCache.get(svg);
 if(!nodes?.worldLayer?.isConnected){
  nodes={
   farLayer:svg.querySelector('#farLayer'),midLayer:svg.querySelector('#midLayer'),villageLayer:svg.querySelector('#villageLayer'),
   cloudLayer:svg.querySelector('#cloudLayer'),worldLayer:svg.querySelector('#worldLayer'),airLayer:svg.querySelector('#airLayer'),
   traveler:svg.querySelector('#traveler'),transforms:{}
  };
  sceneCache.set(svg,nodes);
 }
 return nodes;
}
const rounded=n=>Math.round(n*10)/10;
function move(nodes,key,x,y){
 const value=`translate(${rounded(x)} ${rounded(y)})`;
 if(nodes.transforms[key]!==value){nodes[key].setAttribute('transform',value);nodes.transforms[key]=value;}
}
export function applyCamera(svg,x,y,player){
 const nodes=sceneNodes(svg);
 move(nodes,'farLayer',-x*.18,-y*.4);
 move(nodes,'midLayer',-x*.42,-y*.62);
 move(nodes,'villageLayer',-x*.74,-y*.8);
 move(nodes,'cloudLayer',0,-y*.46);
 move(nodes,'worldLayer',-x,-y);
 // Project the birds horizontally so the traveler can pass them. Their screen
 // height is fixed: never apply the terrain camera's vertical offset here.
 move(nodes,'airLayer',-x,0);
 // Position updates every render frame; the drawn pose has its own cadence.
 move(nodes,'traveler',player.x,player.y);
}
