// Web Audio API Synthesizer for Barista Alerts & Customer Notifications
// Features: Auto-unlock on window interaction, asynchronous context resumption, dual harmonics bell

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('kroma_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }

      // Auto-unlock audio on ANY first user interaction anywhere on the screen
      const unlockAudio = () => {
        if (!this.ctx) {
          this.initContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.isUnlocked = true;
          }).catch(() => {});
        } else if (this.ctx && this.ctx.state === 'running') {
          this.isUnlocked = true;
        }
      };

      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public getAudioContextState(): AudioContextState | 'uninitialized' {
    if (!this.ctx) return 'uninitialized';
    return this.ctx.state;
  }

  public async enableAudio(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.isUnlocked = true;
      this.isMuted = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kroma_audio_muted', 'false');
      }
      this.playTestChime();
      return true;
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kroma_audio_muted', String(muted));
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Harmonious cafe counter bell chime for Incoming Orders (G5 -> C6 -> E6)
   */
  public playNewOrderChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playNotes = () => {
      try {
        const now = ctx.currentTime;
        // Tone 1: 784 Hz (G5)
        this.synthesizeChimeTone(ctx, 783.99, now, 0.5, 0.35);
        // Tone 2: 1046.5 Hz (C6) slightly delayed
        this.synthesizeChimeTone(ctx, 1046.5, now + 0.12, 0.7, 0.4);
        // Sparkle overtone: 1318.5 Hz (E6) & 1568 Hz (G6)
        this.synthesizeChimeTone(ctx, 1318.51, now + 0.24, 0.9, 0.3);
        this.synthesizeChimeTone(ctx, 1567.98, now + 0.36, 1.1, 0.25);
      } catch (e) {
        console.warn('Audio chime playback error:', e);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(playNotes).catch(() => {});
    } else {
      playNotes();
    }
  }

  /**
   * Status change chime (C5 -> E5)
   */
  public playStatusChangeChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const playNotes = () => {
      try {
        const now = ctx.currentTime;
        this.synthesizeChimeTone(ctx, 523.25, now, 0.35, 0.25);
        this.synthesizeChimeTone(ctx, 659.25, now + 0.14, 0.45, 0.28);
      } catch {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(playNotes).catch(() => {});
    } else {
      playNotes();
    }
  }

  /**
   * Quick confirmation beep
   */
  public playTestChime(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    const playNotes = () => {
      try {
        const now = ctx.currentTime;
        this.synthesizeChimeTone(ctx, 880, now, 0.3, 0.3);
        this.synthesizeChimeTone(ctx, 1318.51, now + 0.1, 0.5, 0.35);
      } catch {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(playNotes).catch(() => {});
    } else {
      playNotes();
    }
  }

  private synthesizeChimeTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number
  ): void {
    // Primary pure tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    // Fast attack
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), startTime + 0.015);
    // Natural exponential bell decay
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    // Warm overtone (triangle) for realistic physical bell sparkle
    try {
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(freq * 2, startTime);

      harmonicGain.gain.setValueAtTime(0.0001, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(volume * 0.25, startTime + 0.01);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonicOsc.start(startTime);
      harmonicOsc.stop(startTime + duration * 0.6 + 0.05);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
