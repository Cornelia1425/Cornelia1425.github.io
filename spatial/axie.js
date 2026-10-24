import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const MODEL_PATH = './assets/axie.glb';
const AGENT_ID = 'agent_9201m5qk96heefevwfbmg8mp3y94';
const ELEVENLABS_SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.0.0/+esm';

export async function createAxie({ scene, camera, language = 'en', onStatusChange }) {
  let model = null, mixer = null, idleAction = null;
  let conversation = null, conversationSdk = null;
  let speaking = false, volume = 0, targetVolume = 0;
  let originalScale = 1, originalEmissive = null;
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();

  // Load the model with graceful fallback
  async function loadModel() {
    const loader = new GLTFLoader();
    return new Promise((resolve) => {
      loader.load(
        MODEL_PATH,
        (gltf) => {
          model = gltf.scene;
          
          // Auto-fit: compute bounding box and scale
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          originalScale = 2.5 / maxDim; // Target size: ~2.5 units
          model.scale.setScalar(originalScale);
          
          // Center the model at its base
          box.setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -box.min.y, -center.z);
          
          // Position in a visible corner (front-left, not blocking center)
          const container = new THREE.Group();
          container.position.set(-8, 0, 2);
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
          
          // Add gentle idle float animation
          addIdleAnimation(container);
          
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
  
  function addIdleAnimation(container) {
    const startY = container.position.y;
    const amplitude = 0.15;
    const frequency = 0.0008;
    let time = 0;
    
    function animate() {
      if (!container.parent) return;
      time += clock.getDelta() * 1000;
      container.position.y = startY + Math.sin(time * frequency) * amplitude;
      container.rotation.y = Math.sin(time * frequency * 0.5) * 0.08;
      
      requestAnimationFrame(animate);
    }
    animate();
  }
  
  function updateVisuals(delta) {
    if (!model) return;
    
    // Smooth volume transition
    volume += (targetVolume - volume) * 5 * delta;
    
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
  }
  
  function startAnimationLoop() {
    function animate() {
      if (!model || !model.parent) return;
      const delta = clock.getDelta();
      updateVisuals(delta);
      requestAnimationFrame(animate);
    }
    animate();
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
  if (result) {
    startAnimationLoop();
  }
  
  return {
    isVisible: () => !!model,
    isModelClicked,
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
