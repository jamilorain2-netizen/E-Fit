/**
 * Web Audio API synthesizer for stepping cadence metronome
 * DepEd 3-Minute Step Test cadence is 96 beats per minute (24 complete 4-beat step cycles per minute).
 * Beat 1 (Up right): 880 Hz accent beep
 * Beat 2 (Up left): 600 Hz tick
 * Beat 3 (Down right): 600 Hz tick
 * Beat 4 (Down left): 440 Hz low tick
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBeatSound(beatIndex: number, muted = false): void {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Beat 1 gets high accent, beats 2 and 3 get mid tone, beat 4 gets lower tone
    let freq = 600;
    let volume = 0.25;

    if (beatIndex === 0) {
      freq = 880; // High accent on first step up
      volume = 0.35;
    } else if (beatIndex === 3) {
      freq = 480; // Low cadence return
      volume = 0.22;
    }

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export function playCompletionChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {
    // Ignore
  }
}
