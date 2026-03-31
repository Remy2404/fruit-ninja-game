import bombOgg from '../../src/soundData/bomb_explode_ogg';
import bombMp3 from '../../src/soundData/bomb_explode_mp3';
import splatterOgg from '../../src/soundData/splatter_ogg';
import splatterMp3 from '../../src/soundData/splatter_mp3';
import throwOgg from '../../src/soundData/throw_fruit_ogg';
import throwMp3 from '../../src/soundData/throw_fruit_mp3';

import { Howl } from 'howler';
import { useGameStore } from '../../store/useGameStore';

type SoundId = 'slice' | 'splat' | 'bomb' | 'combo' | 'miss' | 'gameover' | 'whoosh' | 'start';

type HowlConfig = ConstructorParameters<typeof Howl>[0];

class AudioManager {
  private sounds = new Map<SoundId, Howl>();

  private getSound(id: SoundId): Howl {
    if (!this.sounds.has(id)) {
      this.sounds.set(id, new Howl(this.buildConfig(id)));
    }
    return this.sounds.get(id)!;
  }

  private buildConfig(id: SoundId): HowlConfig {
    switch (id) {
      case 'slice':
        return { src: [splatterOgg, splatterMp3], volume: 0.55, pool: 4 };
      case 'splat':
        return { src: [splatterOgg, splatterMp3], volume: 0.3, rate: 0.85, pool: 3 };
      case 'bomb':
        return { src: [bombOgg, bombMp3], volume: 0.9 };
      case 'whoosh':
        return { src: [throwOgg, throwMp3], volume: 0.3, pool: 2 };
      case 'combo':
        return { src: [this.generateComboDataUri()], volume: 0.5 };
      case 'miss':
        return { src: [this.generateMissDataUri()], volume: 0.4 };
      case 'gameover':
        return { src: [this.generateGameOverDataUri()], volume: 0.5 };
      case 'start':
        return { src: [this.generateStartDataUri()], volume: 0.4 };
    }
  }

  public play(id: SoundId): void {
    if (!useGameStore.getState().soundEnabled) return;
    this.getSound(id).play();
    if (id === 'bomb') {
      this.vibrate();
    }
  }

  public playPitchShifted(id: SoundId, pitchMin = 0.9, pitchMax = 1.1): void {
    if (!useGameStore.getState().soundEnabled) return;
    const sound = this.getSound(id);
    const playId = sound.play();
    sound.rate(pitchMin + Math.random() * (pitchMax - pitchMin), playId);
  }

  public vibrate(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 80]);
    }
  }

  public destroy(): void {
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
