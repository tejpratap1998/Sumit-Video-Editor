/* ============================================================
   SYNTHESIZED INTERACTIVE SOUND FX ENGINE
   (Mouse Movement, Hover Micro-Pips & Mechanical Clicks)
   ============================================================ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.lastMoveTime = 0;
    this.movePitch = 600;

    this.toggleBtn = document.getElementById('soundToggleBtn');
    this.soundLabel = document.getElementById('soundLabel');

    this.initEventListeners();
  }

  init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported on this browser', e);
    }
  }

  initEventListeners() {
    if (this.toggleBtn) {
      this.toggleBtn.classList.add('sound-active');
      if (this.soundLabel) this.soundLabel.textContent = 'FX: ON';

      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }

    // Auto-unlock audio context on first interaction
    const unlockAudio = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  toggleSound() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      if (this.toggleBtn) this.toggleBtn.classList.remove('sound-active');
      if (this.soundLabel) this.soundLabel.textContent = 'FX: MUTED';
    } else {
      if (this.toggleBtn) this.toggleBtn.classList.add('sound-active');
      if (this.soundLabel) this.soundLabel.textContent = 'FX: ON';
      this.playCameraClick();
    }
  }

  // 1. Mouse Movement Harmonic Sound FX (throttled subtly)
  playMouseMoveFX(speed = 1) {
    if (this.isMuted || !this.ctx) return;
    const now = Date.now();
    if (now - this.lastMoveTime < 110) return; // Throttle to 9-10 ticks/sec max
    this.lastMoveTime = now;

    try {
      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Subtle dynamic frequency modulation (800Hz - 1400Hz)
      this.movePitch = 800 + Math.sin(now * 0.005) * 400;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.movePitch, audioNow);
      osc.frequency.exponentialRampToValueAtTime(this.movePitch * 1.2, audioNow + 0.025);

      // Very subtle volume (0.015) for elegant high-end feel
      gain.gain.setValueAtTime(0.018, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioNow + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(audioNow);
      osc.stop(audioNow + 0.03);
    } catch (e) {}
  }

  // 2. Tactile Mechanical Razor / Shutter Click (For Clicks)
  playCameraClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // Secondary snap
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(900, now2);
        osc2.frequency.exponentialRampToValueAtTime(240, now2 + 0.03);

        gain2.gain.setValueAtTime(0.1, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.035);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.04);
      }, 40);
    } catch (e) {}
  }

  // 3. Hover Micro-Pip (For Interactive UI elements)
  playPip(freq = 1600) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.03);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 4. Whoosh (For major modal/reveal transitions)
  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);
    } catch (e) {}
  }
}

// Instantiate Sound Engine
window.soundEngine = new SoundEngine();
