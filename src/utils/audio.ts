// Web Audio API Sound Synthesizer for Phone Heat

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private fanOscillator: OscillatorNode | null = null;
  private fanGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.fanGain) {
      this.stopCoolingSound();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play a sleek UI click/mode switch tone
  public playClick(frequency = 800, type: OscillatorType = 'sine', duration = 0.08) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  // Play Game Boost sound effect
  public playBoostSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio errors
    }
  }

  // Play Overheat Siren Alert sound
  public playOverheatAlarm() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.25);
      osc.frequency.linearRampToValueAtTime(880, now + 0.5);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Ignore audio errors
    }
  }

  // Start Cooling Fan hum simulation
  public startCoolingSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.fanGain) return; // Already running

    try {
      // Create white noise buffer for fan wind sound
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate low hum fan sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      this.fanGain = this.ctx.createGain();
      this.fanGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.fanGain);
      this.fanGain.connect(this.ctx.destination);

      whiteNoise.start();
      this.fanOscillator = whiteNoise as unknown as OscillatorNode;
    } catch {
      // Ignore audio errors
    }
  }

  // Stop Cooling Fan sound
  public stopCoolingSound() {
    if (this.fanGain && this.ctx) {
      try {
        this.fanGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        setTimeout(() => {
          if (this.fanOscillator) {
            try { this.fanOscillator.stop(); } catch { /* ignore */ }
            this.fanOscillator = null;
          }
          this.fanGain = null;
        }, 300);
      } catch {
        this.fanGain = null;
        this.fanOscillator = null;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
