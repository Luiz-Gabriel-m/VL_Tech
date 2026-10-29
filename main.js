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
function initThreeCanvas() {
  const canvas = document.getElementById('gl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

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
  const canopyDome = document.getElementById('pillar-canopy-dome');
  const stepperBtns = document.querySelectorAll('.stepper-pill-btn');
  const founderBtns = document.querySelectorAll('.founder-pill-btn');

  // Manual Stepper Clicks
  stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-pillar-idx'), 10);
      switchPillar(idx);
    });
  });

  // Manual Founder Clicks
  founderBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const fId = btn.getAttribute('data-founder');
      switchFounder(fId);
    });
  });

  // GSAP ScrollTrigger Pinned Scrollytelling
  if (typeof ScrollTrigger !== 'undefined' && track) {
    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.33) {
          if (activePillarIndex !== 0) switchPillar(0, false);
        } else if (p >= 0.33 && p < 0.66) {
          if (activePillarIndex !== 1) switchPillar(1, false);
        } else {
          if (activePillarIndex !== 2) switchPillar(2, false);
        }
      }
    });
  }

  // Mouse Parallax on Stage
  const stage = document.querySelector('.hero-stage-inner');
  if (stage) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      if (canopyDome) {
        canopyDome.style.transform = `translate3d(${x * 12}px, ${y * 8}px, 0) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      }

      const portraits = document.querySelectorAll('.founder-portrait');
      portraits.forEach((p) => {
        p.style.transform = `translate3d(${x * 8}px, ${y * 4}px, 0)`;
      });
    });
  }
}

function switchPillar(idx, animateFounder = true) {
  if (activePillarIndex === idx && !animateFounder) return;
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

  // Auto switch founder associated with pillar if desired
  if (animateFounder) {
    if (pData.founder === 'luiz' || pData.founder === 'duo') {
      switchFounder('luiz');
    } else if (pData.founder === 'vitor') {
      switchFounder('vitor');
    }
  }
}

function switchFounder(founderId) {
  activeFounderId = founderId;

  // Update Buttons
  const founderBtns = document.querySelectorAll('.founder-pill-btn');
  founderBtns.forEach((b) => {
    if (b.getAttribute('data-founder') === founderId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Crossfade Portraits
  const pLuiz = document.getElementById('portrait-luiz');
  const pVitor = document.getElementById('portrait-vitor');

  if (pLuiz && pVitor) {
    if (founderId === 'luiz') {
      pLuiz.classList.add('is-active');
      pLuiz.classList.remove('is-hidden');
      pVitor.classList.remove('is-active');
      pVitor.classList.add('is-hidden');
    } else {
      pVitor.classList.add('is-active');
      pVitor.classList.remove('is-hidden');
      pLuiz.classList.remove('is-active');
      pLuiz.classList.add('is-hidden');
    }
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
