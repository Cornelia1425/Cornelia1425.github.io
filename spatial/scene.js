import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { CARD, LAYER_HEADING, ROOM_GRID, archiveViewport, buildLayout, coverWindow, fitView, headingBounds, roomBounds } from './layout.js';

export function createSpatialCollection({container,projects,language='en',getNavigationRight,onOpen,onHover,onLayerChange,onOrbitChange,onProgress,onUnavailable,onCamera}) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,1);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden','true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.05,500);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.rotateSpeed = .5;
  controls.zoomSpeed = .75;
  controls.panSpeed = .75;
  controls.screenSpacePanning = true;
  controls.minDistance = 3;
  controls.maxDistance = 180;
  controls.minPolarAngle = .04;
  controls.maxPolarAngle = Math.PI-.04;
  controls.autoRotateSpeed = -.18;

  const layers = buildLayout(projects,container.clientWidth<700);
  const groups = new Map(), cards = [], pickTargets = [], headings = [], headingTargets = [];
  const loader = new THREE.TextureLoader();
  const imageGeometry = new THREE.PlaneGeometry(CARD.width,CARD.height);
  const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(CARD.width+.025,CARD.height+.025));
  let active=true, renderPending=true, tween=null, layerId='all', hovered=null, hoveredHeading=null;
  let loaded=0, failed=0, lastTime=0, pointerDown=null, dragged=false, pointerCount=0;
  const total = layers.reduce((count,layer)=>count+layer.cards.length,0);
  const requestRender = ()=>{renderPending=true;};

  // The far walls extend past the view and disappear into a soft distance fade.
  const room=roomBounds(layers), roomCenter=new THREE.Vector3(...room.center);
  const roomDirection=new THREE.Vector3(), roomFaces=[];
  const wallMaterial=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  for(let axis=0;axis<3;axis++)for(const side of [-1,1]){
    const [u,v]=[0,1,2].filter(index=>index!==axis);
    const fixed=side<0?room.min[axis]:room.max[axis], positions=[];
    const uMin=Math.floor((room.center[u]-ROOM_GRID.extent)/room.step)*room.step;
    const uMax=Math.ceil((room.center[u]+ROOM_GRID.extent)/room.step)*room.step;
    const vMin=Math.floor((room.center[v]-ROOM_GRID.extent)/room.step)*room.step;
    const vMax=Math.ceil((room.center[v]+ROOM_GRID.extent)/room.step)*room.step;
    function coordinates(a,b){
      const coordinates=[0,0,0];coordinates[axis]=fixed;coordinates[u]=a;coordinates[v]=b;
      return coordinates;
    }
    for(let a=uMin;a<=uMax+1e-6;a+=room.step){positions.push(...coordinates(a,vMin),...coordinates(a,vMax));}
    for(let b=vMin;b<=vMax+1e-6;b+=room.step){positions.push(...coordinates(uMin,b),...coordinates(uMax,b));}
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const material=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,toneMapped:false,
      uniforms:{
        uColor:{value:new THREE.Color(0xaaaaaa)},uOpacity:{value:ROOM_GRID.opacity},
        uFadeCenter:{value:roomCenter},uFadeStart:{value:ROOM_GRID.fadeStart},uFadeEnd:{value:ROOM_GRID.fadeEnd}
      },
      vertexShader:`
        varying vec3 vWorldPosition;
        void main(){
          vec4 worldPosition=modelMatrix*vec4(position,1.0);
          vWorldPosition=worldPosition.xyz;
          gl_Position=projectionMatrix*viewMatrix*worldPosition;
        }
      `,
      fragmentShader:`
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform vec3 uFadeCenter;
        uniform float uFadeStart;
        uniform float uFadeEnd;
        varying vec3 vWorldPosition;
        void main(){
          float fade=1.0-smoothstep(uFadeStart,uFadeEnd,distance(vWorldPosition,uFadeCenter));
          float alpha=uOpacity*fade;
          if(alpha<0.001)discard;
          gl_FragColor=vec4(uColor,alpha);
          #include <colorspace_fragment>
        }
      `
    });
    const grid=new THREE.LineSegments(geometry,material);
    // Black wall surfaces keep distant extensions behind adjoining walls.
    const wallGeometry=new THREE.BufferGeometry();
    wallGeometry.setAttribute('position',new THREE.Float32BufferAttribute([
      ...coordinates(uMin,vMin),...coordinates(uMax,vMin),...coordinates(uMax,vMax),...coordinates(uMin,vMax)
    ],3));
    wallGeometry.setIndex([0,1,2,0,2,3]);
    const wall=new THREE.Mesh(wallGeometry,wallMaterial);
    grid.renderOrder=-10;scene.add(wall,grid);roomFaces.push({axis,side,grid,wall});
  }
  function updateRoom(){
    roomDirection.copy(camera.position).sub(roomCenter).normalize();
    for(const {axis,side,grid,wall} of roomFaces){
      const facing=-side*roomDirection.getComponent(axis);
      // Fade a wall as it becomes edge-on, then reveal its opposite wall.
      grid.visible=wall.visible=facing>0;
      grid.material.uniforms.uOpacity.value=ROOM_GRID.opacity*THREE.MathUtils.smoothstep(facing,0,.06);
    }
  }

  function textPlane(text,width,height,color='#858585',fontSize=26) {
    const canvas=document.createElement('canvas');
    canvas.width=1024; canvas.height=Math.round(1024*height/width);
    const context=canvas.getContext('2d');
    context.fillStyle=color;
    context.font=`${fontSize}px Arial, sans-serif`;
    context.textBaseline='middle';
    context.fillText(text,0,canvas.height/2,canvas.width-4);
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    return new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
  }

  function layerHeading(text) {
    const {width,height,fontSize}=LAYER_HEADING;
    const canvas=document.createElement('canvas');
    canvas.width=2048;canvas.height=Math.round(canvas.width*height/width);
    const context=canvas.getContext('2d');
    const glowCanvas=document.createElement('canvas');
    glowCanvas.width=canvas.width;glowCanvas.height=canvas.height;
    const glowContext=glowCanvas.getContext('2d');
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const glowTexture=new THREE.CanvasTexture(glowCanvas);glowTexture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    glowTexture.anisotropy=texture.anisotropy;
    let alpha;
    function update(value){
      context.clearRect(0,0,canvas.width,canvas.height);
      let pixels=Math.round(fontSize*canvas.width/width);
      const font=()=>`600 ${pixels}px Arial, Helvetica, sans-serif`;
      context.font=font();
      // Measure either language in the actual canvas font without stretching.
      const measured=context.measureText(value).width;
      if(measured>canvas.width-8){pixels=Math.floor(pixels*(canvas.width-8)/measured);context.font=font();}
      context.fillStyle='#f2f2f2';context.textAlign='left';context.textBaseline='middle';
      context.fillText(value,0,canvas.height/2);
      const metrics=context.measureText(value);
      const inkRight=Number.isFinite(metrics.actualBoundingBoxRight)?metrics.actualBoundingBoxRight:metrics.width;
      alpha=context.getImageData(0,0,canvas.width,canvas.height).data;
      glowContext.clearRect(0,0,glowCanvas.width,glowCanvas.height);
      glowContext.font=context.font;glowContext.textAlign='left';glowContext.textBaseline='middle';
      glowContext.fillStyle='rgba(255,255,255,.72)';glowContext.shadowColor='#fff';
      glowContext.shadowBlur=Math.round(canvas.height*.12);
      glowContext.fillText(value,0,glowCanvas.height/2);
      texture.needsUpdate=true;glowTexture.needsUpdate=true;
      return Math.min(inkRight,canvas.width)*width/canvas.width;
    }
    function hitTest(uv){
      const x=Math.round(uv.x*(canvas.width-1));
      const y=Math.round((1-uv.y)*(canvas.height-1));
      const radius=Math.max(3,Math.round(canvas.height*.03));
      const left=Math.max(0,x-radius),top=Math.max(0,y-radius);
      const right=Math.min(canvas.width-1,x+radius),bottom=Math.min(canvas.height-1,y+radius);
      for(let sampleY=top;sampleY<=bottom;sampleY++)for(let sampleX=left;sampleX<=right;sampleX++){
        if(alpha[(sampleY*canvas.width+sampleX)*4+3]>24)return true;
      }
      return false;
    }
    const geometry=new THREE.PlaneGeometry(width,height);
    const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
      map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide
    }));
    const glow=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
      map:glowTexture,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
    }));
    glow.position.z=-.002;glow.renderOrder=1;mesh.renderOrder=2;mesh.add(glow);
    return {mesh,glow,inkWidth:update(text),update,hitTest};
  }

  const layerEdgeMaterial=new THREE.MeshBasicMaterial({color:0xff2020,side:THREE.DoubleSide});
  const layerEdgeThickness=.07*.65;
  function setColorMode(value){layerEdgeMaterial.color.setHex(value?0xff2020:0xd7dce3);requestRender();}
  layers.forEach(layer=>{
    const group=new THREE.Group(); group.position.z=layer.z; scene.add(group); groups.set(layer.id,group);
    layer.cards.forEach(card=>{
      const holder=new THREE.Group();
      holder.position.set(card.x,card.y,0);
      holder.rotation.x=card.rotationX;
      // Fixed in world space: Orbit changes the camera, never the image orientation.
      const material=new THREE.MeshBasicMaterial({color:0x222222,side:THREE.DoubleSide});
      const plane=new THREE.Mesh(imageGeometry,material);
      plane.userData=card; holder.add(plane); pickTargets.push(plane);
      const borderMaterial=new THREE.LineBasicMaterial({color:0x777777,transparent:true,opacity:.35});
      const border=new THREE.LineSegments(borderGeometry,borderMaterial);
      border.position.z=.008; holder.add(border);
      const label=textPlane(card.project.title,CARD.width,.23,'#8b8b8b',29);
      label.position.set(0,-CARD.height/2-.19,.01); holder.add(label);
      group.add(holder); cards.push({holder,plane,border,card});
      const texture=loader.load(card.image.thumb,()=>{
        const crop=coverWindow(texture.image.width,texture.image.height);
        // Keep large source screenshots out of GPU memory at full resolution.
        const source=texture.image,scale=Math.min(1,1024/Math.max(source.width,source.height));
        if(scale<1){
          const canvas=document.createElement('canvas');
          canvas.width=Math.round(source.width*scale);canvas.height=Math.round(source.height*scale);
          canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);
          texture.image=canvas;texture.needsUpdate=true;
        }
        texture.repeat.set(crop.repeatX,crop.repeatY);
        texture.offset.set(crop.offsetX,crop.offsetY);
        material.color.setHex(0xffffff); material.map=texture; material.needsUpdate=true;
        loaded++; onProgress?.({loaded,failed,total}); requestRender();
      },undefined,()=>{failed++;onProgress?.({loaded,failed,total});requestRender();});
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    });

    const left=layer.left-.6, right=layer.right+.6;
    const bottom=layer.bottom-.7, top=layer.top+.85;
    const frame=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(left,bottom,-.035),new THREE.Vector3(right,bottom,-.035),
      new THREE.Vector3(right,top,-.035)
    ]),new THREE.LineBasicMaterial({color:0x626262,transparent:true,opacity:.22}));
    group.add(frame);
    const titleBounds=headingBounds(layer);
    const {mesh:heading,glow,inkWidth,update,hitTest}=layerHeading(language==='zh'?layer.titleZh:layer.title);
    // Stop just after the final visible letter, using the actual rendered font.
    const topRight=titleBounds.left+inkWidth+.035;
    const topStart=left-layerEdgeThickness/2;
    const topEdge=new THREE.Mesh(new THREE.PlaneGeometry(1,layerEdgeThickness),layerEdgeMaterial);
    topEdge.scale.x=topRight-topStart;
    topEdge.position.set((topStart+topRight)/2,top,.02);
    const leftEdge=new THREE.Mesh(new THREE.PlaneGeometry(layerEdgeThickness,top-bottom+layerEdgeThickness),layerEdgeMaterial);
    leftEdge.position.set(left,(bottom+top)/2,.02);
    group.add(topEdge,leftEdge);
    heading.position.set((titleBounds.left+titleBounds.right)/2,(titleBounds.bottom+titleBounds.top)/2,.01);
    heading.userData.layerId=layer.id;
    group.add(heading);
    headings.push({layer,mesh:heading,glow,inkWidth,update,hitTest,topEdge,topStart,titleLeft:titleBounds.left});
    headingTargets.push(heading);
    const points=[];
    for(let x=left;x<=right;x+=4.05) for(let y=bottom;y<=top;y+=2.9) {
      points.push(new THREE.Vector3(x-.05,y,-.04),new THREE.Vector3(x+.05,y,-.04),new THREE.Vector3(x,y-.05,-.04),new THREE.Vector3(x,y+.05,-.04));
    }
    group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x555555,transparent:true,opacity:.25})));
  });

  const spineX=Math.min(...layers.map(layer=>layer.left))-1.2;
  const spineY=layers[0].top+.85;
  const spine=new THREE.Group();scene.add(spine);
  spine.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(spineX,spineY,Math.min(...layers.map(layer=>layer.z))-1.2),
    new THREE.Vector3(spineX,spineY,Math.max(...layers.map(layer=>layer.z))+2)
  ]),new THREE.LineBasicMaterial({color:0x888888,transparent:true,opacity:.5})));
  layers.forEach(layer=>{
    const node=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:0xdf8038}));
    node.position.set(spineX,spineY,layer.z);spine.add(node);
    spine.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      node.position,new THREE.Vector3(layer.left-.6,spineY,layer.z)
    ]),new THREE.LineBasicMaterial({color:0x777777,transparent:true,opacity:.3})));
  });

  function fittedView(id,front=false) {
    const view=fitView(layers,id,camera.aspect,front);
    controls.maxDistance=Math.max(180,view.distance*2);
    return {target:new THREE.Vector3(...view.target),position:new THREE.Vector3(...view.position),fov:view.fov};
  }

  function stopOrbit(){controls.autoRotate=false;onOrbitChange?.(false);}
  function move(view,immediate=false) {
    if(reducedMotion||immediate){camera.position.copy(view.position);camera.fov=view.fov;camera.updateProjectionMatrix();controls.target.copy(view.target);controls.update();requestRender();return;}
    tween={from:camera.position.clone(),to:view.position,targetFrom:controls.target.clone(),targetTo:view.target,fovFrom:camera.fov,fovTo:view.fov,start:performance.now()};
    requestRender();
  }
  function setLayer(id,immediate=false) {
    if(id!=='all'&&!groups.has(id))return;
    layerId=id;
    groups.forEach((group,key)=>group.visible=id==='all'||key===id);
    spine.visible=id==='all';
    clearHover();move(fittedView(id),immediate);onLayerChange?.(id);
  }
  function clearHover(){
    if(hovered){hovered.border.material.color.setHex(0x777777);hovered.border.material.opacity=.35;hovered=null;}
    if(hoveredHeading){hoveredHeading.glow.material.opacity=0;hoveredHeading=null;}
    renderer.domElement.style.cursor='var(--cursor-scene)';onHover?.(null);requestRender();
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function hit(event){
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const visibleCards=pickTargets.filter(plane=>groups.get(plane.userData.layerId).visible);
    const visibleHeadings=headingTargets.filter(heading=>groups.get(heading.userData.layerId).visible);
    const intersections=raycaster.intersectObjects([...visibleCards,...visibleHeadings],false);
    for(const intersection of intersections){
      const heading=headings.find(item=>item.mesh===intersection.object);
      if(heading){
        if(!intersection.uv||intersection.uv.x>heading.inkWidth/LAYER_HEADING.width||!heading.hitTest(intersection.uv))continue;
        return {type:'layer',item:heading};
      }
      const card=cards.find(item=>item.plane===intersection.object);
      if(card)return {type:'card',item:card};
    }
    return null;
  }
  renderer.domElement.addEventListener('pointerdown',event=>{
    pointerCount++;pointerDown={x:event.clientX,y:event.clientY,button:event.button};
    dragged=pointerCount>1;tween=null;clearHover();
    renderer.domElement.style.cursor='var(--cursor-scene)';
  });
  renderer.domElement.addEventListener('pointermove',event=>{
    if(pointerDown){if(Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)>5)dragged=true;return;}
    if(event.pointerType==='touch')return;
    const target=hit(event);
    const card=target?.type==='card'?target.item:null;
    const heading=target?.type==='layer'?target.item:null;
    if(card!==hovered||heading!==hoveredHeading){
      clearHover();hovered=card;hoveredHeading=heading;
      if(card){card.border.material.color.setHex(0xff8a32);card.border.material.opacity=1;}
      if(heading)heading.glow.material.opacity=.82;
    }
    renderer.domElement.style.cursor=target?'var(--cursor-action)':'var(--cursor-scene)';
    if(card)onHover?.({project:card.card.project,imageIndex:card.card.imageIndex,x:event.clientX,y:event.clientY});
    requestRender();
  });
  renderer.domElement.addEventListener('pointerup',event=>{
    const shouldOpen=pointerDown&&!dragged&&pointerDown.button===0&&pointerCount===1;
    pointerCount=Math.max(0,pointerCount-1);pointerDown=null;
    renderer.domElement.style.cursor='var(--cursor-scene)';
    if(shouldOpen){
      const target=hit(event);
      if(target?.type==='card')onOpen(target.item.card.project.id,target.item.card.imageIndex);
      else if(target?.type==='layer')setLayer(target.item.layer.id);
    }
  });
  renderer.domElement.addEventListener('pointercancel',()=>{pointerDown=null;pointerCount=0;dragged=false;clearHover();});
  renderer.domElement.addEventListener('pointerleave',()=>{if(!pointerDown)clearHover();});
  controls.addEventListener('start',()=>{tween=null;clearHover();});
  controls.addEventListener('change',requestRender);

  function resize(){
    const width=container.clientWidth,height=container.clientHeight;if(!width||!height)return;
    renderer.setSize(width,height);
    const viewport=archiveViewport(width,height,getNavigationRight?.()||0);
    // Keep the canvas and room full-screen while centering the archive to the
    // right of the navigation. Raycasting uses this same projection matrix.
    camera.setViewOffset(viewport.width,viewport.height,-viewport.left,0,width,height);
    move(fittedView(layerId),true);
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  let lastAxis=0;
  function frame(now){
    requestAnimationFrame(frame);
    if(!active||document.hidden)return;
    if(now-lastTime<1000/45)return;
    const delta=Math.min((now-lastTime)/1000,.05);lastTime=now;
    if(tween){
      const t=Math.min((now-tween.start)/850,1),ease=1-Math.pow(1-t,3);
      camera.position.lerpVectors(tween.from,tween.to,ease);
      controls.target.lerpVectors(tween.targetFrom,tween.targetTo,ease);
      camera.fov=THREE.MathUtils.lerp(tween.fovFrom,tween.fovTo,ease);
      camera.updateProjectionMatrix();
      if(t===1)tween=null;requestRender();
    }
    const autoRotate=controls.autoRotate;
    if(tween)controls.autoRotate=false;
    controls.update(delta);
    controls.autoRotate=autoRotate;
    if(!renderPending&&!tween&&!controls.autoRotate)return;
    updateRoom();renderer.render(scene,camera);renderPending=false;
    if(now-lastAxis>50){
      lastAxis=now;
      const inverse=camera.quaternion.clone().invert();
      onCamera?.(['x','y','z'].map((axis,index)=>{
        const vector=new THREE.Vector3(...[0,1,2].map(i=>i===index?1:0)).applyQuaternion(inverse);
        return {axis,x:vector.x,y:-vector.y,z:vector.z};
      }));
    }
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',requestRender);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();active=false;onUnavailable?.();});
  return {
    setLayer,
    setLanguage(value){
      const next=value==='zh'?'zh':'en';
      if(next===language)return;
      language=next;
      for(const item of headings){
        const inkWidth=item.update(language==='zh'?item.layer.titleZh:item.layer.title);
        item.inkWidth=inkWidth;
        const end=item.titleLeft+inkWidth+.035;
        item.topEdge.scale.x=end-item.topStart;
        item.topEdge.position.x=(item.topStart+end)/2;
      }
      clearHover();requestRender();
    },
    reset(){setLayer('all');},
    front(){stopOrbit();move(fittedView(layerId,true));},
    setColorMode,
    setOrbit(value){controls.autoRotate=value;onOrbitChange?.(value);requestRender();},
    setActive(value){active=value;controls.enabled=value;clearHover();requestRender();},
    zoom(direction){
      tween=null;const offset=camera.position.clone().sub(controls.target);
      offset.multiplyScalar(direction>0?.82:1.22).clampLength(controls.minDistance,controls.maxDistance);
      camera.position.copy(controls.target).add(offset);controls.update();requestRender();
    }
  };
}
