import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const MODEL_PATH = './assets/axie.glb';
const AGENT_ID = 'agent_9201m5qk96heefevwfbmg8mp3y94';
const ELEVENLABS_SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.0.0/+esm';

export async function createAxie({ scene, camera, language = 'en', onStatusChange, layoutBounds, requestRender }) {
  let model = null, container = null;
  let conversation = null, conversationSdk = null;
  let speaking = false, volume = 0, targetVolume = 0;
  let originalScale = 1, originalEmissive = null;
  let idleTime = 0;
  const raycaster = new THREE.Raycaster();

  // Load the model with graceful fallback
  async function loadModel() {
    const loader = new GLTFLoader();
    return new Promise((resolve) => {
      loader.load(
        MODEL_PATH,
        (gltf) => {
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
    
    const sdk = await lazyLoadElevenLabs();
    if (!sdk) {
      onStatusChange?.('error', language);
      return;
    }
    
    try {
      const config = { agentId: AGENT_ID };
      // Only pass language override if explicitly safe (ElevenLabs auto-detects by default)
      if (overrideLanguage === 'zh' || overrideLanguage === 'zh-Hans') {
        config.overrides = { agent: { language: 'zh' } };
      }
      
      conversation = await sdk.Conversation.startSession(config);
      
      // Set up event listeners
      conversation.on('connected', () => {
        onStatusChange?.('listening', language);
        speaking = false;
      });
      
      conversation.on('audio', (audio) => {
        speaking = true;
        onStatusChange?.('speaking', language);
        // Simulate volume from audio (ElevenLabs SDK may provide actual volume data)
        targetVolume = 0.8;
      });
      
      conversation.on('message', (message) => {
        if (message.type === 'agent_response_end' || message.type === 'user_transcript') {
          speaking = false;
          targetVolume = 0;
          onStatusChange?.('listening', language);
        }
      });
      
      conversation.on('disconnected', () => {
        speaking = false;
        targetVolume = 0;
        conversation = null;
        onStatusChange?.('idle', language);
      });
      
      conversation.on('error', (error) => {
        console.error('Conversation error:', error);
        endConversation();
        onStatusChange?.('error', language);
      });
      
      // Start microphone
      await conversation.startRecording();
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
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
  
  function isModelClicked(mouse, camera) {
    if (!model) return false;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model, true);
    return intersects.length > 0;
  }
  
  // Initialize
  const result = await loadModel();
  if (result && result.container) {
    // Store the starting Y position for idle animation
    result.container.userData.startY = result.container.position.y;
    requestRender();
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
    startConversation: (overrideLanguage) => startConversation(overrideLanguage),
    endConversation,
    isActive: () => !!conversation,
    setLanguage: (lang) => {
      language = lang;
    }
  };
}
