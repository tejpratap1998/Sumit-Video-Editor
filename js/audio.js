/* ============================================================
   SYNTHESIZED WEB AUDIO API SOUND DESIGN ENGINE
   ============================================================ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.isInitialized = false;

    this.toggleBtn = document.getElementById('soundToggleBtn');
    this.soundBars = document.getElementById('soundBars');
    this.soundLabel = document.getElementById('soundLabel');

    this.initEventListeners();
  }

  init() {
    if (this.isInitialized) return;
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
      this.toggleBtn.addEventListener('click', () => this.toggleSound());
    }

    // Initialize audio context on first user interaction anywhere
    const unlockAudio = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  toggleSound() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.stopAmbient();
      if (this.toggleBtn) this.toggleBtn.classList.remove('sound-active');
      if (this.soundLabel) this.soundLabel.textContent = 'SOUND: OFF';
    } else {
      this.startAmbient();
      this.playCameraClick();
      if (this.toggleBtn) this.toggleBtn.classList.add('sound-active');
      if (this.soundLabel) this.soundLabel.textContent = 'SOUND: ON';
    }
  }

  // 1. Low Cinematic Sub Ambient Drone (Subtle 35mm projector room hum)
  startAmbient() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.stopAmbient();

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 2.5);

      // Low frequency oscillator 1 (55Hz sub tone)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Warm overtone oscillator 2 (110Hz)
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(110, this.ctx.currentTime);

      // Lowpass filter for cinematic warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (err) {
      console.warn('Ambient drone error', err);
    }
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.ambientOsc1) { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); }
          if (this.ambientOsc2) { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); }
        }, 500);
      } catch (e) {}
    }
  }

  // 2. Camera Shutter Mechanical Click (For button taps)
  playCameraClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // Shutter release tap
      setTimeout(() => {
        if (!this.ctx) return;
        const now2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, now2);
        osc2.frequency.exponentialRampToValueAtTime(220, now2 + 0.03);

        gain2.gain.setValueAtTime(0.12, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.035);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.04);
      }, 50);
    } catch (e) {}
  }

  // 3. Cinematic Whoosh / Razor Cut Transition Sound
  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3; // 300ms white noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.3);
    } catch (e) {}
  }

  // 4. Glitch / Digital Pip (For timeline tick & hover)
  playPip(freq = 1800) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }
}

// Instantiate Sound Engine
window.soundEngine = new SoundEngine();
