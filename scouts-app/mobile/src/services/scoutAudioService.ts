import { Platform } from 'react-native';

/**
 * Scout Audio & Notification Chime Service
 * Synthesizes a distinctive Scout Bugle / Horn alert chime tone.
 */

export function playScoutAlertSound() {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();

      // Note 1: 587.33 Hz (D5) - Scout Horn Start
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      // Note 2: 880 Hz (A5) - Scout Horn Call
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.5);

      // Note 3: 1174.66 Hz (D6) - High Crest
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.35);
      gain3.gain.setValueAtTime(0.5, ctx.currentTime + 0.35);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime + 0.35);
      osc3.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    console.warn('Scout alert audio chime note:', e);
  }
}
