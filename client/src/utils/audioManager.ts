// Web Audio API manager — singleton that precaches AudioBuffers and plays via
// AudioBufferSourceNode.  Works on Android Chrome (which blocks new Audio() in
// non-gesture contexts) because buffers are decoded once, and each play() just
// creates a lightweight source node.

type SoundName = 'car' | 'barrier' | 'jump' | 'death';

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
    volume: 0.015,
  },
  barrier: {
    url: '/assets/olenchic--110065.mp3',
    offset: 4.0,
    duration: 2.0,
    volume: 0.05,
  },
  jump: {
    url: '/assets/freesound_community-female-hurt-2-94301.mp3',
    offset: 0,
    duration: 0.5,
    volume: 0.05,
  },
  death: {
    url: '/assets/alex_jauk-chicken-noise-228106.mp3',
    offset: 0,
    duration: 0.8,
    volume: 0.0875,
  },
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Map<SoundName, AudioBuffer> = new Map();
  private unlocked = false;
  private loading = false;

  /** Create (or resume) the AudioContext and preload all buffers. */
  async unlock(): Promise<void> {
    if (this.unlocked && this.ctx?.state === 'running') return;

    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }

    // Resume if suspended (Android Chrome starts suspended)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.unlocked = true;

    // Preload buffers (only once)
    if (!this.loading && this.buffers.size === 0) {
      this.loading = true;
      await this.preload();
    }
  }

  private async preload(): Promise<void> {
    if (!this.ctx) return;

    const entries = Object.entries(SOUNDS) as [SoundName, SoundDef][];
    const results = await Promise.allSettled(
      entries.map(async ([name, def]) => {
        const res = await fetch(def.url);
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await this.ctx!.decodeAudioData(arrayBuf);
        this.buffers.set(name, audioBuf);
      }),
    );

    // Log failures but don't crash
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`[AudioManager] Failed to load "${entries[i][0]}":`, r.reason);
      }
    });
  }

  /** Play a named sound.  Options override the default offset/duration/volume. */
  play(name: SoundName, options?: PlayOptions): void {
    if (!this.ctx || !this.masterGain) return;

    const buffer = this.buffers.get(name);
    if (!buffer) return; // not loaded yet — fail silently

    const def = SOUNDS[name];
    const volume = options?.volume ?? def.volume;
    const offset = options?.offset ?? def.offset;
    const duration = options?.duration ?? def.duration;
    const rate = options?.playbackRate ?? 1.0;

    // Per-sound gain node (for individual volume control)
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.masterGain);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(gainNode);

    source.start(0, offset, duration);

    // Clean up nodes after playback finishes (avoids leaks)
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
  }

  /** Toggle master mute.  true = muted (gain 0), false = unmuted (gain 1). */
  setMuted(muted: boolean): void {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }
}

const audioManager = new AudioManager();
export default audioManager;
