// Web Audio API manager — singleton that precaches AudioBuffers and plays via
// AudioBufferSourceNode.  Works on Android Chrome (which blocks new Audio() in
// non-gesture contexts) because buffers are decoded once, and each play() just
// creates a lightweight source node.

type SoundName = 'car' | 'barrier' | 'jump' | 'death' | 'win';

interface SoundDef {
  url: string;
  offset: number;
  duration: number;
  volume: number;
}

interface PlayOptions {
  volume?: number;
  offset?: number;
  duration?: number;
  playbackRate?: number;
}

const SOUNDS: Record<SoundName, SoundDef> = {
  car: {
    url: '/assets/freesoundsxx-car-drive-by-268509.mp3',
    offset: 3.2,
    duration: 1.8,
    volume: 0.04, // Increased after user request (was 0.015)
  },
  barrier: {
    url: '/assets/olenchic--110065.mp3',
    offset: 4.0,
    duration: 2.0,
    volume: 0.1, // Increased after user request (was 0.05)
  },
  jump: {
    url: '/assets/freesound_community-female-hurt-2-94301.mp3',
    offset: 0,
    duration: 0.5,
    volume: 0.1, // Increased after user request (was 0.05)
  },
  death: {
    url: '/assets/alex_jauk-chicken-noise-228106.mp3',
    offset: 0,
    duration: 0.8,
    volume: 0.17, // Increased after user request (was 0.0875)
  },
  win: {
    url: '/assets/WinSound.mp3',
    offset: 0,
    duration: 3.0,
    volume: 0.15,
  },
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Map<SoundName, AudioBuffer> = new Map();
  private unlocked = false;
  private loading = false;
  private muted = false;

  /** Create (or resume) the AudioContext and preload all buffers. */
  async unlock(): Promise<void> {
    if (this.unlocked && this.ctx?.state === 'running') return;

    try {
      if (!this.ctx) {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) {
          console.error('[AudioManager] Web Audio API not supported');
          return;
        }
        const ctx = new AC();
        this.ctx = ctx;
        const masterGain = ctx.createGain();
        this.masterGain = masterGain;
        masterGain.gain.value = this.muted ? 0 : 1;
        masterGain.connect(ctx.destination);
        console.log('[AudioManager] Context created');
      }

      const ctx = this.ctx;
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
        console.log('[AudioManager] Context resumed');
      }

      this.unlocked = true;

      if (!this.loading && this.buffers.size === 0) {
        this.loading = true;
        this.preload(); // Start loading in background
      }
    } catch (err) {
      console.error('[AudioManager] Unlock failed:', err);
    }
  }

  private async preload(): Promise<void> {
    if (!this.ctx) return;
    console.log('[AudioManager] Preloading sounds...');

    const entries = Object.entries(SOUNDS) as [SoundName, SoundDef][];
    await Promise.allSettled(
      entries.map(async ([name, def]) => {
        try {
          const res = await fetch(def.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await this.ctx!.decodeAudioData(arrayBuf);
          this.buffers.set(name, audioBuf);
        } catch (err) {
          console.warn(`[AudioManager] Failed to load "${name}":`, err);
        }
      }),
    );
    this.loading = false;
    console.log(`[AudioManager] Preload complete. Loaded ${this.buffers.size}/${entries.length} sounds.`);
  }

  /** Play a named sound.  Options override the default offset/duration/volume. */
  play(name: SoundName, options?: PlayOptions): void {
    if (!this.ctx || !this.masterGain) {
      // Try to unlock if context is missing (might fail if not called from gesture)
      this.unlock();
      return;
    }

    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`[AudioManager] Sound "${name}" requested but not loaded yet.`);
      return;
    }

    const def = SOUNDS[name];
    const volume = options?.volume ?? def.volume;
    const offset = options?.offset ?? def.offset;
    const duration = options?.duration ?? def.duration;
    const rate = options?.playbackRate ?? 1.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(gainNode);

    source.start(0, offset, duration);

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
  }

  /** Toggle master mute.  true = muted (gain 0), false = unmuted (gain 1). */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.01);
    }
  }
}

const audioManager = new AudioManager();
export default audioManager;
