import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const MODEL_PATH = './assets/axie.glb';
const AGENT_ID = 'agent_9201m5qk96heefevwfbmg8mp3y94';
const ELEVENLABS_SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.30.0/+esm';

export function createAxieOverlay({ container, language = 'en', onStatusChange }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Create separate renderer for overlay
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'low-power'
  });
  renderer.setClearColor(0x000000, 0); // Transparent
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  
  // Separate scene and camera for overlay
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  
  // Lighting for Axie
  const hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  const directional = new THREE.DirectionalLight(0xffddbb, 0.8);
  directional.position.set(2, 3, 1);
  scene.add(hemisphere, directional);
  
  let model = null, container3D = null;
  let conversation = null, conversationSdk = null;
  let speaking = false, volume = 0, targetVolume = 0;
  let originalScale = 1;
  let idleTime = 0;
  const clock = new THREE.Clock();
  let active = true;
  const raycaster = new THREE.Raycaster();
  
  // Load model
  async function loadModel() {
    const loader = new GLTFLoader();
    console.log('Axie overlay: Loading model from', MODEL_PATH);
    return new Promise((resolve) => {
      loader.load(
        MODEL_PATH,
        (gltf) => {
          console.log('Axie overlay: Model loaded successfully');
          model = gltf.scene;
          
          // Auto-fit and scale
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          originalScale = 2.2 / maxDim; // Fit nicely in overlay
          model.scale.setScalar(originalScale);
          
          // Center the model
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -center.y, -center.z);
          
          container3D = new THREE.Group();
          container3D.add(model);
          scene.add(container3D);
          
          // Store emissive colors for glow effect
          model.traverse((child) => {
            if (child.isMesh && child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (!mat.userData.originalEmissive) {
                  mat.userData.originalEmissive = mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000);
                  mat.userData.originalEmissiveIntensity = mat.emissiveIntensity || 0;
                }
              });
            }
          });
          
          resolve({ model, container: container3D });
        },
        undefined,
        (error) => {
          console.warn('Axie overlay: Model not found —', MODEL_PATH, '— skipping character.');
          resolve(null);
        }
      );
    });
  }
  
  // Animation and visual updates
  function update() {
    if (!model || !container3D || !active) return;
    
    const delta = clock.getDelta();
    idleTime += delta;
    
    // Gentle float: bob and sway
    const bobAmplitude = reducedMotion ? 0.03 : 0.08;
    const swayAmplitude = reducedMotion ? 0.02 : 0.05;
    const bobFreq = 1.2;
    const swayFreq = 0.8;
    
    container3D.position.y = Math.sin(idleTime * bobFreq) * bobAmplitude;
    container3D.rotation.y = Math.sin(idleTime * swayFreq) * swayAmplitude;
    container3D.rotation.z = Math.cos(idleTime * swayFreq * 0.5) * swayAmplitude * 0.5;
    
    // Get real-time output volume if speaking
    if (speaking && conversation && conversation.getOutputVolume) {
      try {
        const outputVolume = conversation.getOutputVolume();
        targetVolume = Math.max(0, Math.min(1, outputVolume));
      } catch (e) {
        targetVolume = 0.8;
      }
    } else if (!speaking) {
      targetVolume = 0;
    }
    
    // Smooth volume transition
    volume += (targetVolume - volume) * 5 * delta;
    
    // Scale pulse when speaking
    const scalePulse = speaking ? 1 + volume * 0.15 : 1;
    model.scale.setScalar(originalScale * scalePulse);
    
    // Emissive glow when speaking
    const glowIntensity = speaking ? volume * 0.6 : 0;
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat.userData.originalEmissive) {
            const baseColor = mat.userData.originalEmissive;
            const glowColor = new THREE.Color(0xff8a32);
            mat.emissive = baseColor.clone().lerp(glowColor, glowIntensity);
            mat.emissiveIntensity = mat.userData.originalEmissiveIntensity + glowIntensity * 2;
          }
        });
      }
    });
  }
  
  // Render loop
  function render() {
    if (!active) return;
    requestAnimationFrame(render);
    if (document.hidden) return;
    
    update();
    renderer.render(scene, camera);
  }
  
  // Resize handler
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  
  // Voice integration
  async function lazyLoadElevenLabs() {
    if (conversationSdk) return conversationSdk;
    try {
      const module = await import(ELEVENLABS_SDK);
      conversationSdk = module;
      return conversationSdk;
    } catch (error) {
      console.error('Failed to load ElevenLabs SDK:', error);
      return null;
    }
  }
  
  async function startConversation() {
    if (conversation) return;
    
    onStatusChange?.('connecting', language);
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Microphone permission denied:', error);
      onStatusChange?.('error', language);
      return;
    }
    
    const sdk = await lazyLoadElevenLabs();
    if (!sdk || !sdk.Conversation) {
      console.error('ElevenLabs SDK not available');
      onStatusChange?.('error', language);
      return;
    }
    
    try {
      conversation = await sdk.Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
        onConnect: () => {
          console.log('Axie overlay: Connected');
          onStatusChange?.('listening', language);
        },
        onDisconnect: () => {
          console.log('Axie overlay: Disconnected');
          speaking = false;
          targetVolume = 0;
          conversation = null;
          onStatusChange?.('idle', language);
        },
        onError: (error) => {
          console.error('Axie overlay: Error', error);
          speaking = false;
          targetVolume = 0;
          conversation = null;
          onStatusChange?.('error', language);
        },
        onModeChange: ({ mode }) => {
          if (mode === 'speaking') {
            speaking = true;
            onStatusChange?.('speaking', language);
          } else if (mode === 'listening') {
            speaking = false;
            targetVolume = 0;
            onStatusChange?.('listening', language);
          }
        }
      });
      console.log('Axie overlay: Session started');
    } catch (error) {
      console.error('Failed to start Axie conversation:', error);
      conversation = null;
      onStatusChange?.('error', language);
    }
  }
  
  async function endConversation() {
    if (!conversation) return;
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
    conversation = null;
    speaking = false;
    targetVolume = 0;
    onStatusChange?.('idle', language);
  }
  
  // Click detection on canvas
  function isCanvasClicked(event) {
    if (!model) return false;
    
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(container3D, true);
    return intersects.length > 0;
  }
  
  // Canvas click handler
  renderer.domElement.addEventListener('click', (event) => {
    if (isCanvasClicked(event)) {
      console.log('Axie overlay: Clicked');
      if (conversation) {
        endConversation();
      } else {
        startConversation();
      }
    }
  });
  
  // Hover cursor
  renderer.domElement.addEventListener('pointermove', (event) => {
    if (isCanvasClicked(event)) {
      renderer.domElement.style.cursor = 'pointer';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
  });
  
  // Initialize
  loadModel().then((result) => {
    if (result) {
      console.log('Axie overlay: Initialized');
      render();
    }
  });
  
  return {
    setLanguage(lang) {
      language = lang;
    },
    destroy() {
      active = false;
      resizeObserver.disconnect();
      if (conversation) endConversation();
      renderer.dispose();
    }
  };
}
