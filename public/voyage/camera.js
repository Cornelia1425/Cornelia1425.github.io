import {groundY} from './game-core.js';

// The running surface stays at the same screen height. Tracking the terrain
// instead of airborne feet preserves visible jumps and falls.
export const RUNNING_LINE = 580;
export function groundCameraY(level,player){return groundY(level,player.x)-RUNNING_LINE;}

export function applyCamera(svg,x,y,player){
 svg.querySelector('#farLayer').setAttribute('transform',`translate(${-x*.18} ${-y*.4})`);
 svg.querySelector('#midLayer').setAttribute('transform',`translate(${-x*.42} ${-y*.62})`);
 svg.querySelector('#villageLayer').setAttribute('transform',`translate(${-x*.74} ${-y*.8})`);
 svg.querySelector('#cloudLayer').setAttribute('transform',`translate(0 ${-y*.46})`);
 svg.querySelector('#worldLayer').setAttribute('transform',`translate(${-x} ${-y})`);
 // Project the birds horizontally so the traveler can pass them. Their screen
 // height is fixed: never apply the terrain camera's vertical offset here.
 svg.querySelector('#airLayer').setAttribute('transform',`translate(${-x} 0)`);
 // Position updates every render frame; the drawn pose changes at 12 fps.
 svg.querySelector('#traveler').setAttribute('transform',`translate(${player.x} ${player.y})`);
}
