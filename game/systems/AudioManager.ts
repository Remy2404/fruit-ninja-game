import { Howl } from 'howler';
import { useGameStore } from '../../store/useGameStore';

type SoundId = 'slice' | 'splat' | 'bomb' | 'combo' | 'miss' | 'gameover' | 'whoosh' | 'start';

const SOUND_POOL_SIZES: Partial<Record<SoundId, number>> = {
  slice: 4,
  splat: 3,
  whoosh: 2,
};

class AudioManager {
  private sounds = new Map<SoundId, Howl>();
  private isUnlocked = false;

  constructor() {
    this.createSounds();
    this.setupUnlock();
  }

  private createSounds() {
    this.sounds.set(
      'slice',
      new Howl({
        src: [this.generateSliceDataUri()],
        volume: 0.5,
        pool: SOUND_POOL_SIZES.slice,
      }),
    );

    this.sounds.set(
      'splat',
      new Howl({
        src: [this.generateSplatDataUri()],
        volume: 0.35,
        pool: SOUND_POOL_SIZES.splat,
      }),
    );

    this.sounds.set(
      'bomb',
      new Howl({
        src: [this.generateBombDataUri()],
        volume: 0.6,
      }),
    );

    this.sounds.set(
      'combo',
      new Howl({
        src: [this.generateComboDataUri()],
        volume: 0.5,
      }),
    );

    this.sounds.set(
      'miss',
      new Howl({
        src: [this.generateMissDataUri()],
        volume: 0.4,
      }),
    );

    this.sounds.set(
      'gameover',
      new Howl({
        src: [this.generateGameOverDataUri()],
        volume: 0.5,
      }),
    );

    this.sounds.set(
      'whoosh',
      new Howl({
        src: [this.generateWhooshDataUri()],
        volume: 0.25,
        pool: SOUND_POOL_SIZES.whoosh,
      }),
    );

    this.sounds.set(
      'start',
      new Howl({
        src: [this.generateStartDataUri()],
        volume: 0.4,
      }),
    );
  }

  private setupUnlock() {
    const unlock = () => {
      if (this.isUnlocked) return;
      this.isUnlocked = true;
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  public play(id: SoundId) {
    if (!useGameStore.getState().soundEnabled) return;
    const sound = this.sounds.get(id);
    if (sound) {
      sound.play();
    }
  }

  public playPitchShifted(id: SoundId, pitchMin = 0.9, pitchMax = 1.1) {
    if (!useGameStore.getState().soundEnabled) return;
    const sound = this.sounds.get(id);
    if (sound) {
      const playId = sound.play();
      sound.rate(pitchMin + Math.random() * (pitchMax - pitchMin), playId);
    }
  }

  public destroy() {
    this.sounds.forEach((s) => s.unload());
    this.sounds.clear();
  }

  private renderTone(
    sampleRate: number,
    durationSec: number,
    generator: (t: number, i: number, totalSamples: number) => number,
  ): string {
    const totalSamples = Math.floor(sampleRate * durationSec);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = totalSamples * blockAlign;
    const headerSize = 44;
    const buffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(buffer);

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      let sample = generator(t, i, totalSamples);
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(headerSize + i * 2, sample * 0x7fff, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let j = 0; j < bytes.length; j++) {
      binary += String.fromCharCode(bytes[j]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  private generateSliceDataUri(): string {
    return this.renderTone(22050, 0.12, (t, _i, total) => {
      const env = 1 - (_i / total);
      const freq = 800 + t * 4000;
      return Math.sin(2 * Math.PI * freq * t) * env * 0.6 +
        (Math.random() * 2 - 1) * env * 0.3;
    });
  }

  private generateSplatDataUri(): string {
    return this.renderTone(22050, 0.18, (t, _i, total) => {
      const env = Math.pow(1 - _i / total, 1.5);
      return (Math.random() * 2 - 1) * env * 0.7 +
        Math.sin(2 * Math.PI * 120 * t) * env * 0.3;
    });
  }

  private generateBombDataUri(): string {
    return this.renderTone(22050, 0.5, (t, _i, total) => {
      const env = Math.pow(1 - _i / total, 2);
      const rumble = Math.sin(2 * Math.PI * 60 * t) * 0.5;
      const crack = Math.sin(2 * Math.PI * 200 * t * (1 - t * 2)) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.4;
      return (rumble + crack + noise) * env;
    });
  }

  private generateComboDataUri(): string {
    return this.renderTone(22050, 0.3, (t, _i, total) => {
      const env = 1 - _i / total;
      const f1 = Math.sin(2 * Math.PI * 880 * t);
      const f2 = Math.sin(2 * Math.PI * 1320 * t);
      const f3 = Math.sin(2 * Math.PI * 1760 * t) * (t > 0.1 ? 1 : 0);
      return (f1 + f2 + f3) * env * 0.25;
    });
  }

  private generateMissDataUri(): string {
    return this.renderTone(22050, 0.25, (t, _i, total) => {
      const env = Math.pow(1 - _i / total, 1.5);
      const freq = 400 - t * 600;
      return Math.sin(2 * Math.PI * Math.max(50, freq) * t) * env * 0.5;
    });
  }

  private generateGameOverDataUri(): string {
    return this.renderTone(22050, 0.8, (t, _i, total) => {
      const env = Math.pow(1 - _i / total, 1.2);
      const f1 = Math.sin(2 * Math.PI * 220 * t);
      const f2 = Math.sin(2 * Math.PI * 165 * t);
      const f3 = Math.sin(2 * Math.PI * 110 * t) * (t > 0.3 ? 1 : 0);
      return (f1 * 0.3 + f2 * 0.3 + f3 * 0.4) * env * 0.6;
    });
  }

  private generateWhooshDataUri(): string {
    return this.renderTone(22050, 0.15, (t, _i, total) => {
      const env = Math.sin(Math.PI * _i / total);
      return (Math.random() * 2 - 1) * env * 0.3;
    });
  }

  private generateStartDataUri(): string {
    return this.renderTone(22050, 0.4, (t, _i, total) => {
      const env = 1 - _i / total;
      const f1 = Math.sin(2 * Math.PI * 440 * t);
      const f2 = Math.sin(2 * Math.PI * 660 * t) * (t > 0.1 ? 1 : 0);
      const f3 = Math.sin(2 * Math.PI * 880 * t) * (t > 0.2 ? 1 : 0);
      return (f1 + f2 + f3) * env * 0.2;
    });
  }
}

export const audioManager = new AudioManager();
