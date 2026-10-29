/**
 * VL TECH - SCROLLYTELLING HERO & INTERACTION ENGINE
 * Three.js WebGL Canvas + GSAP 3 ScrollTrigger (Lando Norris Showcase Architecture)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initCustomCursor();
  initThreeCanvas();
  initLandoHeroScrollytelling();
  initCircuitTelemetry();
  initAudioFeedback();
  initInteractiveChat();
  initMetricCounters();
  init3DCardTilt();
  initCaseModals();
  initMobileMenu();
  initFloatingBar();
  initLucide();
});

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   1. CUSTOM INTERACTIVE CURSOR WITH LERP
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  const hoverables = document.querySelectorAll('a, button, .interactive-hover, .floating-canopy-dome');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '52px';
      follower.style.height = '52px';
      follower.style.borderColor = 'var(--color--lime)';
      follower.style.backgroundColor = 'rgba(210, 255, 0, 0.08)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(210, 255, 0, 0.4)';
      follower.style.backgroundColor = 'transparent';
    });
  });
}

/* ==========================================================================
   2. THREE.JS WEBGL PARTICLES & WAVE MESH CANVAS (.gl-canvas)
   ========================================================================== */
let globalThreeMaterial = null;
let targetThreeColor = null;

function initThreeCanvas() {
  const canvas = document.getElementById('gl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  targetThreeColor = new THREE.Color('#d2ff00');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle Grid Geometry
  const cols = 55;
  const rows = 35;
  const numParticles = cols * rows;
  const positions = new Float32Array(numParticles * 3);
  const scales = new Float32Array(numParticles);

  let idx = 0;
  for (let ix = 0; ix < cols; ix++) {
    for (let iy = 0; iy < rows; iy++) {
      positions[idx] = (ix - cols / 2) * 1.3;
      positions[idx + 1] = (iy - rows / 2) * 1.1;
      positions[idx + 2] = 0;
      scales[ix * rows + iy] = 1.2;
      idx += 3;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  // Subtle F1 Green / Lime shader material
  const material = new THREE.PointsMaterial({
    color: new THREE.Color('#d2ff00'),
    size: 0.15,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending
  });

  globalThreeMaterial = material;

  const particles = new THREE.Points(geometry, material);
  particles.rotation.x = 0.35;
  scene.add(particles);

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    const pos = geometry.attributes.position.array;
    let i = 0;
    for (let ix = 0; ix < cols; ix++) {
      for (let iy = 0; iy < rows; iy++) {
        pos[i + 2] = Math.sin((ix + elapsedTime * 1.4) * 0.28) * 1.5 + Math.cos((iy + elapsedTime * 1.2) * 0.25) * 1.5;
        i += 3;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    // Smoothly morph particle color to active pillar / founder theme
    if (globalThreeMaterial && targetThreeColor) {
      globalThreeMaterial.color.lerp(targetThreeColor, 0.04);
    }

    particles.rotation.y += (mouseX - particles.rotation.y) * 0.05;
    particles.rotation.x = 0.35 + (mouseY - particles.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   3. LANDO NORRIS SHOWCASE SCROLLYTELLING (.sticky-track.home-hero)
   ========================================================================== */
const pillars = [
  {
    id: 'web',
    name: 'Web Dev & 3D Motion',
    subtitle: 'High-Performance & Vercel Edge',
    tag: '01 // ARCHITECTURE',
    color: '#d2ff00',
    circuitName: 'CIRCUIT // VERCEL EDGE',
    circuitStatus: '< 0.8s LCP • GSAP 3',
    founder: 'luiz',
    themeClass: 'dome-theme-web'
  },
  {
    id: 'social',
    name: 'Instagram Growth & Reels',
    subtitle: 'Direção Criativa de Alto Impacto',
    tag: '02 // STRATEGY',
    color: '#ff6b00',
    circuitName: 'FEED // VIRAL MATRIX',
    circuitStatus: '+850K REACH • DESIGN SYSTEM',
    founder: 'vitor',
    themeClass: 'dome-theme-social'
  },
  {
    id: 'ai',
    name: 'Automated AI & Chatbots',
    subtitle: 'Atendimento & Qualificação 24/7',
    tag: '03 // NEURAL BOT',
    color: '#00f0ff',
    circuitName: 'NETWORK // CLOUD API',
    circuitStatus: '24/7 AUTONOMOUS • ZERO LATENCY',
    founder: 'duo',
    themeClass: 'dome-theme-ai'
  }
];

let activePillarIndex = 0;
let activeFounderId = 'luiz';

function initLandoHeroScrollytelling() {
  const track = document.getElementById('hero-track');
  const stageBox = document.getElementById('stage-3d-box');
  const visorAssemblyRig = document.getElementById('visor-assembly-rig');
  const topCowl = document.getElementById('visor-top-cowl');
  const pivotLeft = document.getElementById('visor-pivot-left');
  const pivotRight = document.getElementById('visor-pivot-right');
  const canopyDome = document.getElementById('pillar-canopy-dome');
  const chinGuard = document.getElementById('visor-chin-guard');
  const sweepGlare = document.getElementById('visor-assembly-sweep');
  const visorGlare = document.getElementById('visor-glare');
  const stageGlow = document.getElementById('stage-3d-glow');
  const stepperBtns = document.querySelectorAll('.stepper-pill-btn');
  const founderBtns = document.querySelectorAll('.founder-pill-btn');
  const quickSwapBtn = document.getElementById('portrait-quick-swap-btn');

  let sweepFired = false;

  // Manual Stepper Clicks
  stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-pillar-idx'), 10);
      switchPillar(idx);
    });
  });

  // Dedicated Founder Switcher Buttons
  founderBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const fId = btn.getAttribute('data-founder');
      switchFounder(fId);
    });
  });

  // Quick Swap Chip on Portrait
  if (quickSwapBtn) {
    quickSwapBtn.addEventListener('click', () => {
      const nextFounder = activeFounderId === 'luiz' ? 'vitor' : 'luiz';
      switchFounder(nextFounder);
    });
  }

  // GSAP ScrollTrigger Pinned Scrollytelling
  if (typeof ScrollTrigger !== 'undefined' && track) {
    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // 1. 3D Visor / Canopy Assembly Mechanics (Progress 0% -> 18%)
        const normP = Math.min(Math.max(p / 0.18, 0), 1);
        const inv = 1 - normP;

        if (topCowl) {
          topCowl.style.transform = `translateZ(65px) translateY(${inv * -48}px) rotateX(${inv * 26}deg)`;
          topCowl.style.opacity = `${0.35 + normP * 0.65}`;
        }
        if (pivotLeft) {
          pivotLeft.style.transform = `translateZ(50px) translateX(${inv * -42}px) rotateY(${inv * -35}deg)`;
          pivotLeft.style.opacity = `${0.35 + normP * 0.65}`;
        }
        if (pivotRight) {
          pivotRight.style.transform = `translateZ(50px) translateX(${inv * 42}px) rotateY(${inv * 35}deg)`;
          pivotRight.style.opacity = `${0.35 + normP * 0.65}`;
        }
        if (canopyDome) {
          canopyDome.style.transform = `translateZ(55px) translateY(${inv * -22}px) rotateX(${inv * 18}deg) scale(${0.9 + normP * 0.1})`;
        }
        if (chinGuard) {
          chinGuard.style.transform = `translateZ(45px) translateY(${inv * 32}px)`;
          chinGuard.style.opacity = `${0.35 + normP * 0.65}`;
        }

        // Glare sweep flash when visor components snap together
        if (normP >= 0.95 && !sweepFired && sweepGlare && typeof gsap !== 'undefined') {
          sweepFired = true;
          gsap.fromTo(sweepGlare, 
            { left: '-120%', opacity: 1 }, 
            { left: '160%', opacity: 0, duration: 0.75, ease: 'power2.out' }
          );
        } else if (normP < 0.7) {
          sweepFired = false;
        }

        // 2. Deliverable Pillars & Co-Founder Choreography (Progress 18% -> 100%)
        if (p < 0.38) {
          if (activePillarIndex !== 0) switchPillar(0, false);
          if (activeFounderId !== 'luiz') switchFounder('luiz', false);
        } else if (p >= 0.38 && p < 0.72) {
          if (activePillarIndex !== 1) switchPillar(1, false);
          if (activeFounderId !== 'vitor') switchFounder('vitor', false);
        } else {
          if (activePillarIndex !== 2) switchPillar(2, false);
        }
      }
    });
  }

  // 3D Tilt & Cursor Tracking with Multi-Plane Stereoscopic Lerp
  if (stageBox) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    function render3DStage() {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      const rotY = currentX * 12;
      const rotX = -currentY * 8;

      stageBox.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      if (visorAssemblyRig) {
        visorAssemblyRig.style.transform = `translate3d(${currentX * 14}px, ${currentY * 8}px, 0) rotateY(${rotY * 0.5}deg) rotateX(${rotX * 0.5}deg)`;
      }

      if (visorGlare) {
        visorGlare.style.transform = `translate3d(${-currentX * 35}px, ${-currentY * 15}px, 0) translateZ(10px)`;
      }

      if (stageGlow) {
        stageGlow.style.transform = `translateZ(-50px) translate3d(${currentX * 25}px, ${currentY * 15}px, 0)`;
      }

      requestAnimationFrame(render3DStage);
    }
    requestAnimationFrame(render3DStage);

    // Mobile Touch Swipe support
    let touchStartX = 0;
    stageBox.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    stageBox.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) switchFounder('luiz');
        else switchFounder('vitor');
      }
    }, { passive: true });
  }
}

function switchPillar(idx, syncFounder = true) {
  if (activePillarIndex === idx && !syncFounder) return;
  activePillarIndex = idx;
  const pData = pillars[idx];

  // Update Stepper buttons
  const stepperBtns = document.querySelectorAll('.stepper-pill-btn');
  stepperBtns.forEach((b, i) => {
    if (i === idx) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Update Canopy Dome Theme
  const dome = document.getElementById('pillar-canopy-dome');
  if (dome) {
    dome.className = `floating-canopy-dome ${pData.themeClass}`;
  }

  // Crossfade Canopy Content Layers
  const layers = document.querySelectorAll('.dome-content-layer');
  layers.forEach((layer) => {
    if (layer.getAttribute('data-layer-id') === pData.id) {
      layer.classList.add('active');
      layer.classList.remove('inactive');
    } else {
      layer.classList.remove('active');
      layer.classList.add('inactive');
    }
  });

  // Update Telemetry Track Card
  const trackName = document.getElementById('circuit-track-name');
  const trackStatus = document.getElementById('circuit-track-status');
  if (trackName) trackName.textContent = pData.circuitName;
  if (trackStatus) trackStatus.textContent = pData.circuitStatus;

  // Update Three.js WebGL particle target color
  if (pData.color && targetThreeColor) {
    targetThreeColor.set(pData.color);
  }

  // Auto switch founder associated with pillar if requested
  if (syncFounder) {
    if (pData.founder === 'luiz' || pData.founder === 'duo') {
      switchFounder('luiz', false);
    } else if (pData.founder === 'vitor') {
      switchFounder('vitor', false);
    }
  }
}

function switchFounder(founderId, syncPillar = true) {
  if (activeFounderId === founderId && !syncPillar) return;
  activeFounderId = founderId;

  // Update Three.js WebGL target color
  if (targetThreeColor) {
    targetThreeColor.set(founderId === 'luiz' ? '#d2ff00' : '#ff6b00');
  }

  // Update Buttons
  const btnLuiz = document.getElementById('btn-toggle-luiz');
  const btnVitor = document.getElementById('btn-toggle-vitor');

  if (btnLuiz && btnVitor) {
    if (founderId === 'luiz') {
      btnLuiz.className = 'founder-pill-btn active theme-lime';
      btnVitor.className = 'founder-pill-btn';
    } else {
      btnVitor.className = 'founder-pill-btn active theme-orange';
      btnLuiz.className = 'founder-pill-btn';
    }
  }

  // Crossfade 3D Cards with exact GSAP cubic-bezier easing
  const cardLuiz = document.getElementById('card-founder-luiz');
  const cardVitor = document.getElementById('card-founder-vitor');
  const stageGlow = document.getElementById('stage-3d-glow');
  const quickSwapLabel = document.getElementById('quick-swap-label');
  const ledLeft = document.getElementById('pivot-led-left');
  const ledRight = document.getElementById('pivot-led-right');

  const cubicEase = "cubic-bezier(0.65, 0.05, 0, 1)";

  if (cardLuiz && cardVitor) {
    if (founderId === 'luiz') {
      if (typeof gsap !== 'undefined') {
        gsap.to(cardVitor, {
          opacity: 0,
          y: 20,
          scale: 0.94,
          duration: 0.65,
          ease: cubicEase,
          pointerEvents: 'none'
        });
        gsap.to(cardLuiz, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: cubicEase,
          pointerEvents: 'auto'
        });
      } else {
        cardVitor.classList.remove('is-active');
        cardVitor.classList.add('is-hidden');
        cardLuiz.classList.add('is-active');
        cardLuiz.classList.remove('is-hidden');
      }

      cardLuiz.classList.add('is-active');
      cardLuiz.classList.remove('is-hidden');
      cardVitor.classList.remove('is-active');
      cardVitor.classList.add('is-hidden');

      if (stageGlow) stageGlow.className = 'stage-3d-glow glow-luiz';
      if (quickSwapLabel) quickSwapLabel.textContent = 'VER VITOR (02)';
      if (ledLeft) ledLeft.style.backgroundColor = 'var(--color--lime)';
      if (ledRight) ledRight.style.backgroundColor = 'var(--color--lime)';

      if (syncPillar && activePillarIndex !== 0) {
        switchPillar(0, false);
      }
    } else {
      if (typeof gsap !== 'undefined') {
        gsap.to(cardLuiz, {
          opacity: 0,
          y: 20,
          scale: 0.94,
          duration: 0.65,
          ease: cubicEase,
          pointerEvents: 'none'
        });
        gsap.to(cardVitor, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: cubicEase,
          pointerEvents: 'auto'
        });
      } else {
        cardLuiz.classList.remove('is-active');
        cardLuiz.classList.add('is-hidden');
        cardVitor.classList.add('is-active');
        cardVitor.classList.remove('is-hidden');
      }

      cardVitor.classList.add('is-active');
      cardVitor.classList.remove('is-hidden');
      cardLuiz.classList.remove('is-active');
      cardLuiz.classList.add('is-hidden');

      if (stageGlow) stageGlow.className = 'stage-3d-glow glow-vitor';
      if (quickSwapLabel) quickSwapLabel.textContent = 'VER LUIZ (01)';
      if (ledLeft) ledLeft.style.backgroundColor = 'var(--color--orange)';
      if (ledRight) ledRight.style.backgroundColor = 'var(--color--orange)';

      if (syncPillar && activePillarIndex !== 1) {
        switchPillar(1, false);
      }
    }
  }

  // Subtle audio tone
  if (typeof playTone === 'function' && soundEnabled) {
    playTone(founderId === 'luiz' ? 660 : 880, 0.05, 'sine', 0.04);
  }
}

/* ==========================================================================
   4. CIRCUIT TELEMETRY PATH ANIMATION (F1 Track Simulation)
   ========================================================================== */
function initCircuitTelemetry() {
  const dot = document.getElementById('racing-circuit-dot');
  const path = document.getElementById('racing-circuit-path');
  if (!dot || !path) return;

  const pathLength = path.getTotalLength();
  let progress = 0;

  function loop() {
    progress += 0.004;
    if (progress > 1) progress = 0;

    const pt = path.getPointAtLength(progress * pathLength);
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);

    requestAnimationFrame(loop);
  }

  loop();
}

/* ==========================================================================
   5. WEB AUDIO API SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initAudioFeedback() {
  const toggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundStatusText = document.getElementById('sound-status');

  function initCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      initCtx();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        playTone(720, 0.05, 'sine');
        if (soundStatusText) soundStatusText.textContent = 'FX ON';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
        toggleBtn.classList.add('text-lime-400', 'border-lime-400/40');
      } else {
        if (soundStatusText) soundStatusText.textContent = 'FX OFF';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
        toggleBtn.classList.remove('text-lime-400', 'border-lime-400/40');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  const clickables = document.querySelectorAll('button, a, .stepper-pill-btn, .founder-pill-btn');
  clickables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playTone(440, 0.03, 'triangle', 0.02);
    });
    el.addEventListener('click', () => {
      if (soundEnabled) playTone(880, 0.06, 'sine', 0.05);
    });
  });
}

function playTone(freq = 440, duration = 0.05, type = 'sine', volume = 0.04) {
  if (!audioCtx || !soundEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {}
}

/* ==========================================================================
   6. INTERACTIVE AI CHATBOT SIMULATION
   ========================================================================== */
function initInteractiveChat() {
  const chatMessages = document.getElementById('chat-messages-container');
  const promptChips = document.querySelectorAll('.chat-chip-btn');
  const chatInput = document.getElementById('chat-custom-input');
  const chatSendBtn = document.getElementById('chat-send-btn');

  const responses = {
    'Como funciona a automação com IA?': 
      'Nossos agentes de IA se conectam à WhatsApp Cloud API oficial e ao seu CRM. Eles entendem o contexto da sua empresa, qualificam leads e agendam reuniões 24h por dia.',
    'Quanto tempo leva para criar um site?': 
      'Nossos sites são 100% customizados e entregues entre 5 dias úteis e 2 semanas, com deploy na Vercel Edge.',
    'Quero falar com a VL Tech no WhatsApp': 
      'Perfeito! Clique no botão de WhatsApp no topo ou na barra flutuante para falar diretamente com Luiz ou Vitor.',
    'default': 
      'A VL Tech transforma tecnologia em escala. Como podemos acelerar seu negócio hoje?'
  };

  function addMsg(sender, text) {
    if (!chatMessages) return;
    const isBot = sender === 'bot';
    const div = document.createElement('div');
    div.className = `flex ${isBot ? 'justify-start' : 'justify-end'} items-start space-x-2 mb-3`;
    div.innerHTML = `
      ${isBot ? '<div class="w-6 h-6 rounded-full bg-lime-400 text-black flex items-center justify-center text-[9px] font-bold shrink-0">VL</div>' : ''}
      <div class="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
        isBot ? 'bg-zinc-900 border border-white/10 text-zinc-200' : 'bg-lime-400 text-black font-semibold'
      }">
        <p>${text}</p>
      </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botReply(prompt) {
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'flex items-center space-x-2 text-xs text-zinc-400 mb-2';
    typing.innerHTML = `<span class="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span><span>Digitando...</span>`;
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const el = document.getElementById('typing-indicator');
      if (el) el.remove();
      addMsg('bot', responses[prompt] || responses['default']);
    }, 900);
  }

  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      addMsg('user', text);
      botReply(text);
    });
  });

  if (chatSendBtn && chatInput) {
    const handleSend = () => {
      const val = chatInput.value.trim();
      if (!val) return;
      addMsg('user', val);
      chatInput.value = '';
      botReply(val);
    };
    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Hall of Fame Card 3: WhatsApp Simulator
  const fameChatStream = document.getElementById('fame-chat-stream');
  const simChips = document.querySelectorAll('.chat-sim-chip');
  if (fameChatStream && simChips.length) {
    const simReplies = {
      'Quanto custa uma Landing Page?': 'Nossos projetos de alta performance começam com diagnóstico gratuito e escopo 100% sob medida. Desenvolvemos máquinas de conversão que se pagam rápido!',
      'Qual o prazo de entrega?': 'Entregamos em média de 5 dias úteis a 2 semanas, com código bespoke sem templates, GSAP 3D e deploy global na Vercel Edge.',
      'Quero falar com os fundadores!': 'Perfeito! Clique no botão de WhatsApp para conversar em tempo real com Luiz Gabriel e Vitor.'
    };

    simChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-sim-text');
        
        // User bubble
        const userDiv = document.createElement('div');
        userDiv.className = 'bg-cyan-500/20 text-cyan-300 text-[10.5px] p-2 rounded-xl rounded-tr-none border border-cyan-400/30 font-sans leading-tight ml-auto max-w-[90%] text-right';
        userDiv.textContent = query;
        fameChatStream.appendChild(userDiv);
        fameChatStream.scrollTop = fameChatStream.scrollHeight;

        // Typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'text-[9.5px] font-mono text-cyan-400/70 italic flex items-center space-x-1 py-1';
        typingDiv.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1"></span><span>Digitando resposta...</span>';
        fameChatStream.appendChild(typingDiv);
        fameChatStream.scrollTop = fameChatStream.scrollHeight;

        setTimeout(() => {
          typingDiv.remove();
          const botDiv = document.createElement('div');
          botDiv.className = 'bg-zinc-800/80 text-zinc-200 text-[10.5px] p-2 rounded-xl rounded-tl-none border border-white/5 font-sans leading-tight';
          botDiv.innerHTML = `<span class="font-bold text-cyan-400 block text-[9px] mb-0.5">VL TECH AI:</span>${simReplies[query] || 'Atendimento automatizado via WhatsApp Cloud API.'}`;
          fameChatStream.appendChild(botDiv);
          fameChatStream.scrollTop = fameChatStream.scrollHeight;
        }, 550);
      });
    });
  }
}

/* ==========================================================================
   7. METRIC COUNTERS
   ========================================================================== */
function initMetricCounters() {
  if (typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.metric-counter-card');
  cards.forEach((card) => {
    const target = parseFloat(card.getAttribute('data-target') || '0');
    const prefix = card.getAttribute('data-prefix') || '';
    const suffix = card.getAttribute('data-suffix') || '';
    const numDisplay = card.querySelector('.metric-num-display');
    const decimals = parseInt(card.getAttribute('data-decimals') || '0', 10);

    if (!numDisplay) return;

    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            numDisplay.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
          }
        });
      }
    });
  });
}

/* ==========================================================================
   8. 3D CARD TILT
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-tilt-element');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${(-y / rect.height) * 8}deg) rotateY(${(x / rect.width) * 8}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   9. CASE MODALS
   ========================================================================== */
const caseDetails = {
  fintech: {
    title: 'NRAG Gestão & FinTech 3D',
    category: 'High-Performance Web Development',
    stats: '+410% em Conversão de Leads // < 0.6s LCP',
    deliverables: ['Interface 3D interativa com Three.js & GSAP', 'Deploy global em Vercel Edge', 'Checkout e onboarding instantâneo'],
    tech: ['GSAP 3', 'TailwindCSS', 'WebGL/Three.js', 'Vercel Serverless'],
    desc: 'Construção da presença digital da NRAG com carregamento sub-segundo e estética inspirada na telemetria F1.'
  },
  social: {
    title: 'Giobeauty - Direção Criativa & Reels Escala',
    category: 'Instagram Strategy & Content Production',
    stats: '+1.4M de Alcance Orgânico // 4.8x ROI',
    deliverables: ['Linha editorial cinematográfica para Reels', 'Design System completo para feed e stories', 'Roteiros de neuro-conversão'],
    tech: ['Edição 4K Cinematográfica', 'Design System Figma', 'Copywriting Neuro-persuasivo'],
    desc: 'Posicionamento estético de autoridade que multiplicou a percepção de valor da marca.'
  },
  ai: {
    title: 'Acelera Mais - Atendimento & Vendas Autônomo',
    category: 'AI Chatbots & Intelligent Automation',
    stats: '140h/mês Poupadas // 99.4% Satisfação',
    deliverables: ['Agente de IA treinado na base de conhecimento da empresa', 'Integração oficial WhatsApp Cloud API + CRM', 'Qualificação autônoma e agendamento'],
    tech: ['OpenAI GPT-4o / Claude 3.5', 'WhatsApp Cloud API', 'Webhooks'],
    desc: 'Atendimento humanizado sem filas com tempo de resposta inferior a 2 segundos.'
  }
};

function initCaseModals() {
  const modal = document.getElementById('case-modal');
  const modalCloseBtn = document.getElementById('case-modal-close');
  const triggerBtns = document.querySelectorAll('.case-inspect-btn');

  if (!modal) return;

  triggerBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-case');
      const data = caseDetails[key];
      if (!data) return;

      document.getElementById('modal-case-title').textContent = data.title;
      document.getElementById('modal-case-category').textContent = data.category;
      document.getElementById('modal-case-stats').textContent = data.stats;
      document.getElementById('modal-case-desc').textContent = data.desc;

      const delList = document.getElementById('modal-case-deliverables');
      if (delList) {
        delList.innerHTML = data.deliverables.map((d) => `<li class="flex items-center text-zinc-300 text-xs sm:text-sm"><span class="w-1.5 h-1.5 rounded-full bg-lime-400 mr-2.5"></span>${d}</li>`).join('');
      }

      const techContainer = document.getElementById('modal-case-tech');
      if (techContainer) {
        techContainer.innerHTML = data.tech.map((t) => `<span class="px-2.5 py-1 text-xs font-mono-tech rounded-md bg-white/5 border border-white/10 text-lime-300">${t}</span>`).join('');
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* ==========================================================================
   10. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const openBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-menu-drawer');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!openBtn || !drawer) return;

  const toggle = (show) => {
    if (show) {
      drawer.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }
  };

  openBtn.addEventListener('click', () => toggle(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
  links.forEach((l) => l.addEventListener('click', () => toggle(false)));
}

/* ==========================================================================
   11. FLOATING BOTTOM BAR
   ========================================================================== */
function initFloatingBar() {
  const bar = document.getElementById('floating-cta-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      bar.classList.add('is-visible');
    } else {
      bar.classList.remove('is-visible');
    }
  });
}
