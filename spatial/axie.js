import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const MODEL_PATH = './assets/axie.glb';
const AGENT_ID = 'agent_9201m5qk96heefevwfbmg8mp3y94';
const ELEVENLABS_SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.30.0/+esm';

export async function createAxie({ scene, camera, language = 'en', onStatusChange, layoutBounds, requestRender }) {
  let model = null, container = null;
  let conversation = null, conversationSdk = null;
  let speaking = false, volume = 0, targetVolume = 0;
  let originalScale = 1, originalEmissive = null;
  let idleTime = 0;
  const raycaster = new THREE.Raycaster();
  
  // Create lighting for Axie's PBR materials (doesn't affect MeshBasicMaterial cards)
  const axieLight = new THREE.Group();
  const hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  const directional = new THREE.DirectionalLight(0xffddbb, 0.8);
  directional.position.set(2, 3, 1);
  axieLight.add(hemisphere, directional);
  scene.add(axieLight);

  // Load the model with graceful fallback
  async function loadModel() {
    const loader = new GLTFLoader();
    console.log('Axie: Starting model load from', MODEL_PATH);
    return new Promise((resolve) => {
      loader.load(
        MODEL_PATH,
        (gltf) => {
          console.log('Axie: Model loaded successfully');
          model = gltf.scene;
          
          // Auto-fit: scale to be similar to a project card (CARD.width ~3.2)
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          originalScale = 2.8 / maxDim; // Slightly smaller than card width
          model.scale.setScalar(originalScale);
          
          // Center the model at its base
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -box.min.y, -center.z);
          
          // Position relative to layout: lower-right area of the view, clearly visible but not blocking cards
          // Use the layout bounds to position intelligently
          const bounds = layoutBounds;
          container = new THREE.Group();
          // Place at right edge + offset, slightly below center, and in front (positive Z)
          container.position.set(
            bounds.right + 2.5,  // Right edge with margin
            bounds.bottom + 1.5, // Lower third
            bounds.frontZ + 1    // In front of the front layer
          );
          container.add(model);
          scene.add(container);
          
          // Position lights near Axie
          axieLight.position.copy(container.position);
          
          // Store emissive colors for all materials
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
          
          resolve({ model, container });
        },
        undefined,
        (error) => {
          console.warn('Axie model not found:', MODEL_PATH, '— skipping character.');
          resolve(null);
        }
      );
    });
  }
  
  // Update function called from scene.js's render loop with delta time in seconds
  function update(deltaSeconds) {
    if (!model || !container || !container.parent) return;
    
    // Idle animation: gentle float and rotation
    const startY = container.userData.startY;
    const deltaMs = deltaSeconds * 1000;
    idleTime += deltaMs;
    const amplitude = 0.15;
    const frequency = 0.0008;
    container.position.y = startY + Math.sin(idleTime * frequency) * amplitude;
    container.rotation.y = Math.sin(idleTime * frequency * 0.5) * 0.08;
    
    // Get real-time output volume from conversation if speaking
    if (speaking && conversation && conversation.getOutputVolume) {
      try {
        const outputVolume = conversation.getOutputVolume();
        // outputVolume is typically 0-1, use it directly
        targetVolume = Math.max(0, Math.min(1, outputVolume));
      } catch (e) {
        // If getOutputVolume fails, fall back to simulated volume
        targetVolume = 0.8;
      }
    } else if (!speaking) {
      targetVolume = 0;
    }
    
    // Smooth volume transition
    volume += (targetVolume - volume) * 5 * deltaSeconds;
    
    // Scale pulse based on volume (speaking)
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
            // Warm glow color (orange-yellow)
            const glowColor = new THREE.Color(0xff8a32);
            mat.emissive = baseColor.clone().lerp(glowColor, glowIntensity);
            mat.emissiveIntensity = mat.userData.originalEmissiveIntensity + glowIntensity * 2;
          }
        });
      }
    });
    
    requestRender();
  }
  
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
  
  async function startConversation(overrideLanguage) {
    if (conversation) return; // Already active
    
    onStatusChange?.('connecting', language);
    
    // First request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Microphone permission denied or unavailable:', error);
      onStatusChange?.('error', language);
      return;
    }
    
    const sdk = await lazyLoadElevenLabs();
    if (!sdk || !sdk.Conversation) {
      console.error('ElevenLabs SDK not available or missing Conversation API');
      onStatusChange?.('error', language);
      return;
    }
    
    try {
      const config = {
        agentId: AGENT_ID,
        connectionType: 'webrtc', // WebRTC recommended for public agents
        onConnect: () => {
          console.log('Axie conversation connected');
          onStatusChange?.('listening', language);
        },
        onDisconnect: () => {
          console.log('Axie conversation disconnected');
          speaking = false;
          targetVolume = 0;
          conversation = null;
          onStatusChange?.('idle', language);
        },
        onError: (error) => {
          console.error('Axie conversation error:', error);
          speaking = false;
          targetVolume = 0;
          conversation = null;
          onStatusChange?.('error', language);
        },
        onModeChange: ({ mode }) => {
          console.log('Axie mode change:', mode);
          if (mode === 'speaking') {
            speaking = true;
            onStatusChange?.('speaking', language);
          } else if (mode === 'listening') {
            speaking = false;
            targetVolume = 0;
            onStatusChange?.('listening', language);
          }
        }
      };
      
      // Only pass language override if explicitly safe
      if (overrideLanguage === 'zh' || overrideLanguage === 'zh-Hans') {
        config.overrides = { agent: { language: 'zh' } };
      }
      
      conversation = await sdk.Conversation.startSession(config);
      console.log('Axie conversation started');
      
    } catch (error) {
      console.error('Failed to start Axie conversation:', error);
      conversation = null;
      onStatusChange?.('error', language);
    }
  }
  
  async function endConversation() {
    if (!conversation) return;
    try {
      console.log('Ending Axie conversation');
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending Axie conversation:', error);
    }
    conversation = null;
    speaking = false;
    targetVolume = 0;
    onStatusChange?.('idle', language);
  }
  
  function isModelClicked(mouse, camera) {
    if (!model || !container) {
      console.log('Axie: isModelClicked called but no model or container');
      return false;
    }
    raycaster.setFromCamera(mouse, camera);
    // Raycast the container which includes the model
    const intersects = raycaster.intersectObject(container, true);
    const hit = intersects.length > 0;
    if (hit) console.log('Axie: Raycast hit!', intersects.length, 'objects');
    return hit;
  }
  
  // Initialize
  const result = await loadModel();
  if (result && result.container) {
    // Store the starting Y position for idle animation
    result.container.userData.startY = result.container.position.y;
    const pos = result.container.position;
    console.log('Axie: Initialized at position', pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));
    
    // Log bounding box
    const box = new THREE.Box3().setFromObject(result.container);
    const size = box.getSize(new THREE.Vector3());
    console.log('Axie: Bounding box size', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));
    console.log('Axie: Bounding box min', box.min.x.toFixed(2), box.min.y.toFixed(2), box.min.z.toFixed(2));
    console.log('Axie: Bounding box max', box.max.x.toFixed(2), box.max.y.toFixed(2), box.max.z.toFixed(2));
    
    requestRender();
  } else {
    console.log('Axie: Model not loaded, skipping initialization');
  }
  
  return {
    isVisible: () => !!model,
    isModelClicked,
    update,
    toggleConversation: async () => {
      if (conversation) {
        await endConversation();
      } else {
        await startConversation();
      }
    },
    // Expose for testing
    _testStart: () => startConversation(),
    startConversation: (overrideLanguage) => startConversation(overrideLanguage),
    endConversation,
    isActive: () => !!conversation,
    setLanguage: (lang) => {
      language = lang;
    }
  };
}
