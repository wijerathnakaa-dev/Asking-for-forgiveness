/**
 * Romantic Apology Web Experience
 * Interactive Particle Engine, Web Audio Synthesizer,
 * Envelope Animation, Playful Runaway Button, Confetti & Card Export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const customizeBtn = document.getElementById('customizeBtn');
  const closeCustomizeBtn = document.getElementById('closeCustomizeBtn');
  const customizeModal = document.getElementById('customizeModal');
  const saveCustomizeBtn = document.getElementById('saveCustomizeBtn');
  const downloadCardBtn = document.getElementById('downloadCardBtn');
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('waxSeal');
  const letterSection = document.getElementById('letterSection');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const noBtnText = document.getElementById('noBtnText');
  const dodgeHint = document.getElementById('dodgeHint');
  const celebrationModal = document.getElementById('celebrationModal');
  const celebrationCloseBtn = document.getElementById('celebrationCloseBtn');
  const exportCanvas = document.getElementById('exportCanvas');

  // Input & Display Elements
  const inputRecipient = document.getElementById('inputRecipient');
  const inputSender = document.getElementById('inputSender');
  const inputLetter = document.getElementById('inputLetter');
  const displayRecipient = document.getElementById('displayRecipient');
  const displaySender = document.getElementById('displaySender');
  const displayLetterBody = document.getElementById('displayLetterBody');
  const recipientNamePreview = document.querySelector('.recipient-name-preview');
  const letterDate = document.getElementById('letterDate');

  // Set today's date
  if (letterDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    letterDate.textContent = new Date().toLocaleDateString(undefined, options);
  }

  // State
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicInterval = null;
  let yesBtnScale = 1.0;
  let dodgeCount = 0;

  const dodgePhrases = [
    "Are you sure? 🥺",
    "Please reconsider? 🥺",
    "I'll buy you your favorite snacks! 🍫",
    "What if I give you unlimited hugs? 🫂",
    "I promise to be better! 🌸",
    "Just one more chance? ❤️",
    "Don't click this one! 👉",
    "Look at the red button instead! ✨"
  ];

  /* ==========================================================================
     1. CANVAS PARTICLE ENGINE (Floating Hearts & Glowing Stars)
     ========================================================================== */
  let particles = [];
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class HeartParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 0.8 + 0.5;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.swing = Math.random() * 2;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.angle = 0;
    }

    update() {
      this.y -= this.speedY;
      this.angle += this.swingSpeed;
      this.x += Math.sin(this.angle) * this.swing;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#ff5e89';
      ctx.shadowColor = '#ff4b72';
      ctx.shadowBlur = 8;

      // Draw Heart Shape
      const s = this.size / 16;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-4 * s, -6 * s, -10 * s, -3 * s, -10 * s, 3 * s);
      ctx.bezierCurveTo(-10 * s, 8 * s, 0, 13 * s, 0, 16 * s);
      ctx.bezierCurveTo(0, 13 * s, 10 * s, 8 * s, 10 * s, 3 * s);
      ctx.bezierCurveTo(10 * s, -3 * s, 4 * s, -6 * s, 0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  class StarParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.twinkleSpeed = Math.random() * 0.015 + 0.005;
      this.twinkleFactor = Math.random() * Math.PI;
    }

    update() {
      this.twinkleFactor += this.twinkleSpeed;
      this.currentAlpha = this.alpha * (0.5 + 0.5 * Math.sin(this.twinkleFactor));
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.currentAlpha})`;
      ctx.shadowColor = '#ffe082';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const heartCount = Math.floor(Math.min(width, 1200) / 45);
    const starCount = Math.floor(Math.min(width, 1200) / 18);

    for (let i = 0; i < starCount; i++) {
      particles.push(new StarParticle());
    }
    for (let i = 0; i < heartCount; i++) {
      particles.push(new HeartParticle());
    }
  }

  initParticles();

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  /* ==========================================================================
     2. WEB AUDIO API - SOFT ROMANTIC PIANO CHORD PROGRESSION
     ========================================================================== */
  function playPianoNote(freq, time, duration = 1.6, gainLevel = 0.08) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Romantic arpeggio sequence in key of C/Am (notes in Hz: C4=261.63, E4=329.63, G4=392, A4=440, etc.)
  const chords = [
    // Am7 (A3, C4, E4, G4, C5)
    [220.00, 261.63, 329.63, 392.00, 523.25],
    // Fadd9 (F3, C4, G4, A4, C5)
    [174.61, 261.63, 392.00, 440.00, 523.25],
    // Cmaj7 (C3, G3, C4, E4, B4)
    [130.81, 196.00, 261.63, 329.63, 493.88],
    // Gsus4 -> G (G3, D4, G4, B4, D5)
    [196.00, 293.66, 392.00, 493.88, 587.33]
  ];

  let currentChordIndex = 0;

  function scheduleChordPattern() {
    if (!audioCtx || !isMusicPlaying) return;
    const now = audioCtx.currentTime;
    const notes = chords[currentChordIndex];

    // Play arpeggio
    notes.forEach((freq, idx) => {
      playPianoNote(freq, now + idx * 0.35, 2.2, 0.07);
    });

    currentChordIndex = (currentChordIndex + 1) % chords.length;
  }

  function startMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isMusicPlaying = true;
    musicToggleBtn.classList.add('playing');
    musicStatusText.textContent = 'Music: Playing';
    scheduleChordPattern();
    musicInterval = setInterval(scheduleChordPattern, 2400);
  }

  function stopMusic() {
    isMusicPlaying = false;
    musicToggleBtn.classList.remove('playing');
    musicStatusText.textContent = 'Music: Off';
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  musicToggleBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // Chime sound effect for interactions
  function playSweetChime() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      playPianoNote(freq, now + i * 0.08, 1.2, 0.1);
    });
  }

  /* ==========================================================================
     3. INTERACTIVE ENVELOPE (Idea 3)
     ========================================================================== */
  function openEnvelope() {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      playSweetChime();
      if (!isMusicPlaying) {
        startMusic();
      }
      setTimeout(() => {
        letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 700);
    }
  }

  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelope.addEventListener('click', openEnvelope);

  /* ==========================================================================
     4. PLAYFUL DODGING "NO" BUTTON & "YES" CELEBRATION (Idea 5)
     ========================================================================== */
  function dodgeButton() {
    dodgeCount++;
    // Cycle text
    const phrase = dodgePhrases[dodgeCount % dodgePhrases.length];
    noBtnText.textContent = phrase;
    dodgeHint.textContent = phrase;

    // Expand Yes button slightly to nudge user
    yesBtnScale = Math.min(yesBtnScale + 0.05, 1.35);
    yesBtn.style.transform = `scale(${yesBtnScale})`;

    // Random relocation within safe bounds
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 80;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    noBtn.style.transform = `translate(${x}px, ${y}px)`;
  }

  noBtn.addEventListener('mouseenter', dodgeButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeButton();
  });
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeButton();
  });

  // Confetti & Celebration
  function triggerConfettiBurst() {
    playSweetChime();
    celebrationModal.classList.add('active');

    // Spawn 50 falling confetti hearts and stars on the canvas
    for (let i = 0; i < 45; i++) {
      const p = new HeartParticle();
      p.x = width / 2 + (Math.random() - 0.5) * 300;
      p.y = height / 2 + (Math.random() - 0.5) * 200;
      p.speedY = -(Math.random() * 6 + 3);
      p.speedX = (Math.random() - 0.5) * 8;
      p.size = Math.random() * 20 + 12;
      particles.push(p);
    }
  }

  yesBtn.addEventListener('click', triggerConfettiBurst);

  celebrationCloseBtn.addEventListener('click', () => {
    celebrationModal.classList.remove('active');
  });

  celebrationModal.addEventListener('click', (e) => {
    if (e.target === celebrationModal) {
      celebrationModal.classList.remove('active');
    }
  });

  /* ==========================================================================
     5. THEME SWITCHING (Midnight -> Rose -> Starry)
     ========================================================================== */
  const themes = ['theme-midnight', 'theme-rose', 'theme-starry'];
  let currentThemeIdx = 0;

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.remove(themes[currentThemeIdx]);
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    document.body.classList.add(themes[currentThemeIdx]);
  });

  /* ==========================================================================
     6. PERSONALIZATION DRAWER & LOCAL STORAGE
     ========================================================================== */
  function openCustomizer() {
    customizeModal.classList.add('active');
  }

  function closeCustomizer() {
    customizeModal.classList.remove('active');
  }

  customizeBtn.addEventListener('click', openCustomizer);
  closeCustomizeBtn.addEventListener('click', closeCustomizer);
  customizeModal.addEventListener('click', (e) => {
    if (e.target === customizeModal) closeCustomizer();
  });

  function applyCustomData() {
    const recipient = inputRecipient.value.trim() || 'Sachindi';
    const sender = inputSender.value.trim() || 'Achintha';
    const customText = inputLetter.value.trim();

    displayRecipient.textContent = recipient;
    if (recipientNamePreview) recipientNamePreview.textContent = recipient;
    displaySender.textContent = sender;

    if (customText) {
      displayLetterBody.innerHTML = customText
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    }

    // Save to localStorage
    const savedData = { recipient, sender, customText };
    localStorage.setItem('apology_custom_data', JSON.stringify(savedData));
    closeCustomizer();
  }

  saveCustomizeBtn.addEventListener('click', applyCustomData);

  // Restore saved data if exists
  try {
    const raw = localStorage.getItem('apology_custom_data');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.recipient) {
        inputRecipient.value = data.recipient;
        displayRecipient.textContent = data.recipient;
        if (recipientNamePreview) recipientNamePreview.textContent = data.recipient;
      }
      if (data.sender) {
        inputSender.value = data.sender;
        displaySender.textContent = data.sender;
      }
      if (data.customText) {
        inputLetter.value = data.customText;
        displayLetterBody.innerHTML = data.customText
          .split('\n\n')
          .filter(p => p.trim())
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');
      }
    }
  } catch (err) {
    console.warn('LocalStorage access issue:', err);
  }

  // Handle custom photo uploads
  function handlePhotoUpload(inputId, imgId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    if (!input || !img) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  handlePhotoUpload('filePhoto1', 'memImg1');
  handlePhotoUpload('filePhoto2', 'memImg2');
  handlePhotoUpload('filePhoto3', 'memImg3');

  /* ==========================================================================
     7. EXPORT APOLOGY CARD AS IMAGE (Idea 1)
     ========================================================================== */
  function exportApologyCard() {
    const exportCtx = exportCanvas.getContext('2d');
    const w = exportCanvas.width;
    const h = exportCanvas.height;

    // 1. Background Gradient (Luxury Dark Indigo / Velvet Rose)
    const grad = exportCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0c102b');
    grad.addColorStop(0.5, '#190a1b');
    grad.addColorStop(1, '#050711');
    exportCtx.fillStyle = grad;
    exportCtx.fillRect(0, 0, w, h);

    // 2. Elegant Border Frame
    exportCtx.strokeStyle = '#f6cf7d';
    exportCtx.lineWidth = 4;
    exportCtx.strokeRect(50, 50, w - 100, h - 100);

    exportCtx.strokeStyle = 'rgba(255, 94, 137, 0.4)';
    exportCtx.lineWidth = 1;
    exportCtx.strokeRect(65, 65, w - 130, h - 130);

    // 3. Heart Emblem at Top
    exportCtx.font = '70px serif';
    exportCtx.textAlign = 'center';
    exportCtx.fillText('❤️', w / 2, 180);

    // 4. Recipient Title
    const recipient = displayRecipient.textContent || 'Sachindi';
    exportCtx.fillStyle = '#f6cf7d';
    exportCtx.font = 'bold 36px Outfit, sans-serif';
    exportCtx.fillText(`FOR ${recipient.toUpperCase()}`, w / 2, 260);

    // 5. Main Title
    exportCtx.fillStyle = '#ffffff';
    exportCtx.font = 'italic 65px "Playfair Display", serif';
    exportCtx.fillText("I'm Truly Sorry", w / 2, 360);

    // 6. Gold Separator Line
    exportCtx.beginPath();
    exportCtx.moveTo(w / 2 - 120, 410);
    exportCtx.lineTo(w / 2 + 120, 410);
    exportCtx.strokeStyle = '#f6cf7d';
    exportCtx.lineWidth = 2;
    exportCtx.stroke();

    // 7. Heartfelt Quote (from Idea 1 & 2)
    exportCtx.fillStyle = '#e4e7f2';
    exportCtx.font = '34px "Outfit", sans-serif';
    const lines = [
      '"I know I made a mistake,',
      'and I am truly sorry for what I did.',
      'I deeply regret causing you pain.',
      'I have learned from this mistake.',
      'Please forgive me."'
    ];

    let yOffset = 520;
    lines.forEach(line => {
      exportCtx.fillText(line, w / 2, yOffset);
      yOffset += 60;
    });

    // 8. Reasons highlights
    yOffset += 40;
    exportCtx.fillStyle = '#ff8fa9';
    exportCtx.font = '26px "Outfit", sans-serif';
    exportCtx.fillText('✨ I miss your smile and kindness', w / 2, yOffset);
    yOffset += 45;
    exportCtx.fillText('✨ I care about you deeply', w / 2, yOffset);
    yOffset += 45;
    exportCtx.fillText('✨ I will work hard to become better', w / 2, yOffset);

    // 9. Bottom Sign-off
    const sender = displaySender.textContent || 'your boyfriend Achintha';
    exportCtx.fillStyle = '#f6cf7d';
    exportCtx.font = 'italic 44px "Playfair Display", serif';
    exportCtx.fillText(`With love, ${sender}`, w / 2, h - 160);

    exportCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    exportCtx.font = '20px Outfit, sans-serif';
    exportCtx.fillText('From My Heart • Forever Hopeful', w / 2, h - 100);

    // 10. Trigger Download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `apology-card-for-${recipient.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  }

  downloadCardBtn.addEventListener('click', exportApologyCard);
});
