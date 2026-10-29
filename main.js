/**
 * VL TECH - HIGH-PERFORMANCE CINEMATIC INTERACTIONS
 * GSAP 3 + ScrollTrigger + Interactive Canvas + Web Audio API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initCustomCursor();
  initParticleCanvas();
  initAudioFeedback();
  initFounderShowcase();
  initHeroAnimations();
  initServicePillars();
  initInteractiveChat();
  initMetricCounters();
  init3DCardTilt();
  initCaseModals();
  initMobileMenu();
  initLucide();
});

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   1. CUSTOM GLOWING CURSOR WITH LERP
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

  // Smooth lerp loop for follower
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Expand cursor on hoverable elements
  const hoverables = document.querySelectorAll('a, button, .interactive-hover, .glass-card-hover');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '54px';
      follower.style.height = '54px';
      follower.style.borderColor = 'rgba(0, 240, 255, 0.9)';
      follower.style.backgroundColor = 'rgba(0, 240, 255, 0.08)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(0, 240, 255, 0.4)';
      follower.style.backgroundColor = 'transparent';
    });
  });
}

/* ==========================================================================
   2. INTERACTIVE PARTICLES & TELEMETRY CANVAS
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width < 768 ? 40 : 85, 100);

  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.6;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.color = Math.random() > 0.6 ? '#00f0ff' : Math.random() > 0.5 ? '#ff2a54' : '#ffffff';
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse repulsion/attraction
      if (mouse.x !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.2;
          this.y -= (dy / dist) * force * 1.2;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - dist / 110) * 0.08 + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   3. WEB AUDIO API SYNTHESIZER (Haptic UI Feedback)
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
        playBeep(880, 0.06, 'sine');
        if (soundStatusText) soundStatusText.textContent = 'FX ON';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
        toggleBtn.classList.add('border-cyan-500/50', 'text-cyan-400');
      } else {
        if (soundStatusText) soundStatusText.textContent = 'FX OFF';
        if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
        toggleBtn.classList.remove('border-cyan-500/50', 'text-cyan-400');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // Bind audio to buttons
  const clickables = document.querySelectorAll('button, .interactive-click');
  clickables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playBeep(520, 0.04, 'triangle', 0.03);
    });
    el.addEventListener('click', () => {
      if (soundEnabled) playBeep(980, 0.08, 'sine', 0.07);
    });
  });
}

function playBeep(freq = 440, duration = 0.05, type = 'sine', volume = 0.05) {
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
  } catch (err) {
    // Silent fail if audio blocked
  }
}

/* ==========================================================================
   4. SCROLLYTELLING HERO & ENTRANCE ANIMATIONS
   ========================================================================== */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('#hero-badge', {
    y: -30,
    opacity: 0,
    duration: 0.8,
    delay: 0.2
  })
    .from('.hero-headline-line', {
      y: 60,
      opacity: 0,
      stagger: 0.15,
      duration: 1.1
    }, '-=0.5')
    .from('#hero-description', {
      y: 30,
      opacity: 0,
      duration: 0.9
    }, '-=0.6')
    .from('#hero-actions', {
      y: 25,
      opacity: 0,
      duration: 0.8
    }, '-=0.6')
    .from('#hero-telemetry-hud', {
      y: 40,
      opacity: 0,
      duration: 1
    }, '-=0.5');

  // Floating scroll indicator
  gsap.to('#scroll-indicator-arrow', {
    y: 8,
    repeat: -1,
    yoyo: true,
    duration: 1.2,
    ease: 'power1.inOut'
  });

  // Sticky Header blur on scroll
  const header = document.getElementById('main-nav');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('bg-zinc-950/85', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'shadow-2xl');
      } else {
        header.classList.remove('bg-zinc-950/85', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'shadow-2xl');
      }
    });
  }
}

/* ==========================================================================
   5. INTERACTIVE FOUNDERS SHOWCASE (The F1 Driver / Co-Founder Swap)
   ========================================================================== */
const foundersData = {
  luiz: {
    id: 'luiz',
    num: '01',
    name: 'Luiz Gabriel',
    role: 'Co-Founder & Head of Tech & AI Architecture',
    accentClass: 'text-cyan-400',
    accentBorder: 'border-cyan-500/40',
    tag: '// FULLSTACK & AI CORE',
    glowClass: 'glow-mode-luiz',
    bio: 'Engenheiro de software e especialista em inteligência artificial aplicada. Arquiteta plataformas web de altíssima conversão, pipelines de automação 24/7 e integrações profundas com LLMs para eliminar gargalos operacionais.',
    quote: '"Código sem velocidade é prejuízo. Construímos softwares com padrão F1 de precisão para colocar sua empresa no topo."',
    stats: [
      { label: 'Latency Target', val: '< 0.8s' },
      { label: 'AI Uptime', val: '99.98%' },
      { label: 'Code Base', val: '100% Custom' },
      { label: 'Automations', val: 'Deep Webhooks' }
    ],
    skills: ['GSAP / WebGL Motion', 'Vercel Edge Computing', 'WhatsApp Cloud API & AI', 'High-Converting Architecture'],
    image: 'assets/socios/luiz-dark.jpg',
    studioImage: 'assets/socios/luiz-studio.jpg'
  },
  vitor: {
    id: 'vitor',
    num: '02',
    name: 'Vitor',
    role: 'Co-Founder & Head of Growth & Creative Direction',
    accentClass: 'text-rose-500',
    accentBorder: 'border-rose-500/40',
    tag: '// GROWTH & VIRAL BRANDING',
    glowClass: 'glow-mode-vitor',
    bio: 'Estrategista de marcas, diretor criativo e especialista em retenção de audiência. Desenvolve narrativas visuais cinematográficas, funis de conversão de alto impacto e sistemas de design proprietários que transformam visualizações em faturamento.',
    quote: '"Atenção é a moeda mais valiosa do século. Criamos conteúdo e design impossíveis de serem ignorados."',
    stats: [
      { label: 'Avg Conv Boost', val: '+340%' },
      { label: 'Organic Reach', val: '1.2M+' },
      { label: 'Design System', val: 'Proprietário' },
      { label: 'Retention Rate', val: '98.2%' }
    ],
    skills: ['Reels Cinematográficos', 'Identidade Visual de Elite', 'Copywriting de Alta Conversão', 'Gestão Estratégica de Redes'],
    image: 'assets/socios/vitor-dark.jpg',
    studioImage: 'assets/socios/vitor-studio.jpg'
  }
};

let currentFounderId = 'luiz';

function initFounderShowcase() {
  const toggleLuizBtn = document.getElementById('btn-founder-luiz');
  const toggleVitorBtn = document.getElementById('btn-founder-vitor');
  const showcaseContainer = document.getElementById('founders-showcase-section');

  if (toggleLuizBtn && toggleVitorBtn) {
    toggleLuizBtn.addEventListener('click', () => switchFounder('luiz'));
    toggleVitorBtn.addEventListener('click', () => switchFounder('vitor'));
  }

  // Scrollytelling Pinning with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined' && showcaseContainer) {
    ScrollTrigger.create({
      trigger: '#founders-showcase-section',
      start: 'top top+=60',
      end: '+=1300',
      pin: '#founders-pin-wrapper',
      scrub: 1,
      onUpdate: (self) => {
        // Toggle founder based on scroll progress
        if (self.progress > 0.48 && currentFounderId !== 'vitor') {
          switchFounder('vitor', false);
        } else if (self.progress <= 0.48 && currentFounderId !== 'luiz') {
          switchFounder('luiz', false);
        }
      }
    });
  }
}

function switchFounder(founderId, animateScroll = true) {
  if (currentFounderId === founderId && !animateScroll) return;
  currentFounderId = founderId;
  const data = foundersData[founderId];

  // Update Buttons
  const btnLuiz = document.getElementById('btn-founder-luiz');
  const btnVitor = document.getElementById('btn-founder-vitor');

  if (btnLuiz && btnVitor) {
    if (founderId === 'luiz') {
      btnLuiz.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300', 'shadow-[0_0_20px_rgba(0,240,255,0.3)]');
      btnLuiz.classList.remove('bg-zinc-900/60', 'border-white/10', 'text-zinc-400');

      btnVitor.classList.remove('bg-rose-500/20', 'border-rose-400', 'text-rose-300', 'shadow-[0_0_20px_rgba(255,42,84,0.3)]');
      btnVitor.classList.add('bg-zinc-900/60', 'border-white/10', 'text-zinc-400');
    } else {
      btnVitor.classList.add('bg-rose-500/20', 'border-rose-400', 'text-rose-300', 'shadow-[0_0_20px_rgba(255,42,84,0.3)]');
      btnVitor.classList.remove('bg-zinc-900/60', 'border-white/10', 'text-zinc-400');

      btnLuiz.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300', 'shadow-[0_0_20px_rgba(0,240,255,0.3)]');
      btnLuiz.classList.add('bg-zinc-900/60', 'border-white/10', 'text-zinc-400');
    }
  }

  // Dynamic Background Glow Field
  const dynamicGlow = document.getElementById('dynamic-glow');
  if (dynamicGlow) {
    dynamicGlow.className = `absolute inset-0 pointer-events-none transition-all duration-1000 ${data.glowClass}`;
  }

  // Portrait Container HUD
  const portraitFrame = document.getElementById('founder-hud-frame');
  if (portraitFrame) {
    if (founderId === 'luiz') {
      portraitFrame.classList.remove('theme-red');
    } else {
      portraitFrame.classList.add('theme-red');
    }
  }

  // Animate Portrait Swap with GSAP
  const imgLuiz = document.getElementById('portrait-img-luiz');
  const imgVitor = document.getElementById('portrait-img-vitor');
  const founderDetailsBox = document.getElementById('founder-details-content');

  if (typeof gsap !== 'undefined') {
    // Fade content box slightly, replace and fade back
    gsap.to(founderDetailsBox, {
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        updateFounderDOM(data);
        gsap.to(founderDetailsBox, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
    });

    if (founderId === 'luiz') {
      gsap.to(imgVitor, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(imgLuiz, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
    } else {
      gsap.to(imgLuiz, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(imgVitor, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
    }
  } else {
    updateFounderDOM(data);
  }
}

function updateFounderDOM(data) {
  const numEl = document.getElementById('founder-display-num');
  const tagEl = document.getElementById('founder-display-tag');
  const nameEl = document.getElementById('founder-display-name');
  const roleEl = document.getElementById('founder-display-role');
  const bioEl = document.getElementById('founder-display-bio');
  const quoteEl = document.getElementById('founder-display-quote');
  const statsContainer = document.getElementById('founder-display-stats');
  const skillsContainer = document.getElementById('founder-display-skills');

  if (numEl) numEl.textContent = data.num;
  if (tagEl) {
    tagEl.textContent = data.tag;
    tagEl.className = `font-mono-tech text-xs tracking-widest font-semibold ${data.accentClass}`;
  }
  if (nameEl) nameEl.textContent = data.name;
  if (roleEl) roleEl.textContent = data.role;
  if (bioEl) bioEl.textContent = data.bio;
  if (quoteEl) quoteEl.textContent = data.quote;

  if (statsContainer) {
    statsContainer.innerHTML = data.stats
      .map(
        (s) => `
        <div class="glass-panel p-3.5 rounded-xl border border-white/5 bg-zinc-900/40">
          <span class="block text-xs font-mono-tech text-zinc-400 mb-1">${s.label}</span>
          <span class="text-lg font-bold font-syne ${data.accentClass}">${s.val}</span>
        </div>
      `
      )
      .join('');
  }

  if (skillsContainer) {
    skillsContainer.innerHTML = data.skills
      .map(
        (sk) => `
        <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono-tech bg-white/5 border ${data.accentBorder} text-zinc-200">
          <span class="w-1.5 h-1.5 rounded-full ${data.id === 'luiz' ? 'bg-cyan-400' : 'bg-rose-500'} mr-2"></span>
          ${sk}
        </span>
      `
      )
      .join('');
  }
}

/* ==========================================================================
   6. THE 3 CORE PILLARS (Interactive Helmets Replacement)
   ========================================================================== */
function initServicePillars() {
  // Code snippet tabs switcher in Pillar 1
  const tabBtns = document.querySelectorAll('.code-tab-btn');
  const codeDisplay = document.getElementById('code-display-content');

  const codeSnippets = {
    web: `// VL Tech Edge Architecture
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export async function initCinematicHero() {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  await timeline
    .from('.hero-headline', { y: 60, opacity: 0, duration: 1.1 })
    .from('.telemetry-hud', { opacity: 0, scale: 0.95 }, '-=0.4');
    
  console.log('[VL Tech] 60FPS WebGL Engine Running on Edge CDN');
}`,
    seo: `// Global Performance & Core Web Vitals
export const lighthouseReport = {
  performance: 100,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
  firstContentfulPaint: "0.4s",
  largestContentfulPaint: "0.7s",
  cumulativeLayoutShift: "0.00"
};`,
    stack: `// Hardware-Accelerated Stack
{
  "engine": "Vanilla JS / ES6+ & GSAP 3",
  "styling": "TailwindCSS + Liquid Glassmorphism",
  "deployment": "Vercel Edge Network (Global CDN)",
  "optimization": "Sub-second LCP & WebGL 60FPS"
}`
  };

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40'));
      btn.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
      const snippetKey = btn.getAttribute('data-tab');
      if (codeDisplay && codeSnippets[snippetKey]) {
        codeDisplay.textContent = codeSnippets[snippetKey];
      }
    });
  });
}

/* ==========================================================================
   7. INTERACTIVE AI CHATBOT SIMULATION
   ========================================================================== */
function initInteractiveChat() {
  const chatMessages = document.getElementById('chat-messages-container');
  const promptChips = document.querySelectorAll('.chat-chip-btn');
  const chatInput = document.getElementById('chat-custom-input');
  const chatSendBtn = document.getElementById('chat-send-btn');

  const responses = {
    'Como funciona a automação com IA?': 
      'Nossos agentes de IA se conectam diretamente à API oficial do WhatsApp, Instagram Direct e seu CRM. Eles compreendem intenção em linguagem natural, tiram dúvidas técnicas, qualificam o lead e agendam reuniões 24 horas por dia, sem parecer robôs travados.',
    'Quanto tempo leva para criar um site?': 
      'Nossas landing pages de alta conversão são entregues em média entre 7 a 15 dias úteis, incluindo design system exclusivo, animações GSAP personalizadas e deploy no Vercel Edge.',
    'Quero falar com a VL Tech no WhatsApp': 
      'Perfeito! Clique no botão "Falar no WhatsApp" no topo ou chame agora pelo link direto. Luiz ou Vitor entrarão em contato em poucos minutos para entender sua operação.',
    'default': 
      'A VL Tech combina desenvolvimento sob medida, inteligência artificial proprietária e direção criativa para acelerar sua empresa. Vamos agendar uma sessão de alinhamento pelo WhatsApp?'
  };

  function addMessage(sender, text) {
    if (!chatMessages) return;

    const isBot = sender === 'bot';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isBot ? 'justify-start' : 'justify-end'} items-start space-x-2.5 mb-3.5`;

    msgDiv.innerHTML = `
      ${isBot ? '<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0">VL</div>' : ''}
      <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
        isBot 
          ? 'bg-zinc-900/90 border border-white/10 text-zinc-200' 
          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md'
      }">
        <p class="leading-relaxed">${text}</p>
        <span class="block text-[10px] text-zinc-400 mt-1 text-right">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      ${!isBot ? '<div class="w-7 h-7 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">Você</div>' : ''}
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateBotReply(userPrompt) {
    if (!chatMessages) return;

    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'bot-typing-indicator';
    typingIndicator.className = 'flex justify-start items-center space-x-2 mb-3';
    typingIndicator.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[10px] font-bold text-cyan-300">VL</div>
      <div class="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 flex space-x-1.5 items-center">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.4s"></span>
      </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const el = document.getElementById('bot-typing-indicator');
      if (el) el.remove();

      const reply = responses[userPrompt] || responses['default'];
      addMessage('bot', reply);
    }, 1100);
  }

  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      addMessage('user', text);
      simulateBotReply(text);
    });
  });

  if (chatSendBtn && chatInput) {
    const handleSend = () => {
      const val = chatInput.value.trim();
      if (!val) return;
      addMessage('user', val);
      chatInput.value = '';
      simulateBotReply(val);
    };

    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

/* ==========================================================================
   8. METRIC COUNTERS WITH GSAP SCROLLTRIGGER
   ========================================================================== */
function initMetricCounters() {
  if (typeof ScrollTrigger === 'undefined') return;

  const metricCards = document.querySelectorAll('.metric-counter-card');
  metricCards.forEach((card) => {
    const targetVal = parseFloat(card.getAttribute('data-target') || '0');
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
          val: targetVal,
          duration: 2.2,
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
   9. INTERACTIVE 3D CARD TILT
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-tilt-element');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   10. CASE MODALS & INTERACTIVE DETAILS
   ========================================================================== */
const caseDetails = {
  fintech: {
    title: 'Nexus Capital - Plataforma Web 3D & FinTech',
    category: 'High-Performance Web Development',
    stats: '+410% em Conversão de Leads // < 0.6s LCP',
    deliverables: ['Interface 3D interativa com Three.js & GSAP', 'Deploy global em Vercel Edge', 'Integração de checkout e onboarding instantâneo'],
    tech: ['GSAP 3', 'TailwindCSS', 'WebGL/Three.js', 'Vercel Serverless'],
    desc: 'Redesenhamos a presença digital da Nexus Capital para transformar uma financeira tradicional em um benchmark de inovação com estética cyberpunk e taxa de retenção recorde.'
  },
  social: {
    title: 'Aura Lifestyle - Direção Criativa & Reels Escala',
    category: 'Instagram Strategy & Content Production',
    stats: '+1.4M de Alcance Orgânico // 4.8x ROI',
    deliverables: ['Linha editorial cinematográfica para Reels', 'Design System completo para feed e stories', 'Roteirização persuasiva focada em fechamento de vendas'],
    tech: ['Edição 4K Cinematográfica', 'Design System Figma', 'Copywriting Neuro-persuasivo'],
    desc: 'Construção de uma identidade magnética e sofisticada que posicionou a marca no topo do seu nicho, transformando seguidores casuais em clientes fiéis de ticket alto.'
  },
  ai: {
    title: 'OmniFlow AI - Atendimento & Vendas Autônomo',
    category: 'AI Chatbots & Intelligent Automation',
    stats: '140h/mês Poupadas // 99.4% Satisfação',
    deliverables: ['Agente de IA treinado na base de conhecimento da empresa', 'Integração oficial WhatsApp Cloud API + CRM', 'Qualificação autônoma e agendamento no Google Agenda'],
    tech: ['OpenAI GPT-4o / Claude 3.5', 'WhatsApp Cloud API', 'Webhooks & Supabase'],
    desc: 'Eliminação completa de filas de espera no WhatsApp com atendimento humanizado, empático e resolutivo que atende milhares de clientes simultâneos em menos de 2 segundos.'
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
        delList.innerHTML = data.deliverables.map((d) => `<li class="flex items-center text-zinc-300 text-xs sm:text-sm"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2.5"></span>${d}</li>`).join('');
      }

      const techContainer = document.getElementById('modal-case-tech');
      if (techContainer) {
        techContainer.innerHTML = data.tech.map((t) => `<span class="px-2.5 py-1 text-xs font-mono-tech rounded-md bg-white/5 border border-white/10 text-cyan-300">${t}</span>`).join('');
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
   11. MOBILE DRAWER NAVIGATION
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

  links.forEach((link) => {
    link.addEventListener('click', () => toggle(false));
  });
}
