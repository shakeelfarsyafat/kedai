// Web Audio API Synthesizer for Barista Alerts & Customer Notifications
// No external MP3 assets needed - guarantees instant playback and avoids CORS or missing asset issues.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('kroma_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
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
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.isMuted = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kroma_audio_muted', 'false');
    }
    this.playTestChime();
    return true;
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
   * Harmonious two-tone bell chime for Incoming Orders (G5 -> C6)
   */
  public playNewOrderChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: 784 Hz (G5)
      this.synthesizeChimeTone(ctx, 783.99, now, 0.45, 0.28);
      // Note 2: 1046.5 Hz (C6) slightly delayed
      this.synthesizeChimeTone(ctx, 1046.5, now + 0.12, 0.65, 0.32);
      // Sparkle overtone: 1567.98 Hz (G6)
      this.synthesizeChimeTone(ctx, 1567.98, now + 0.24, 0.8, 0.2);
    } catch {
      // Audio autoplay policy might be blocking, fail silently
    }
  }

  /**
   * Status change chime (C5 -> E5)
   */
  public playStatusChangeChime(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.synthesizeChimeTone(ctx, 523.25, now, 0.35, 0.22);
      this.synthesizeChimeTone(ctx, 659.25, now + 0.14, 0.45, 0.25);
    } catch {
      // Silent catch
    }
  }

  /**
   * Quick confirmation beep
   */
  public playTestChime(): void {
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      this.synthesizeChimeTone(ctx, 880, now, 0.3, 0.25);
      this.synthesizeChimeTone(ctx, 1318.51, now + 0.1, 0.5, 0.3);
    } catch {
      // Silent catch
    }
  }

  private synthesizeChimeTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm bell sound: sine wave + soft high-order harmonics
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    // Instant attack
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    // Exponential bell decay
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const soundEngine = new SoundEngine();
