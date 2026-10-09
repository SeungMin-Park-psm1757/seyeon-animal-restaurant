export const MUTE_KEY = 'seyeon-restaurant-muted';
export function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return true; }
}
export function saveMuted(muted: boolean) {
  try { localStorage.setItem(MUTE_KEY, String(muted)); } catch { /* Storage is optional. */ }
}
let context: AudioContext | undefined;
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
  } catch { /* Silent play works without Web Audio. */ }
}
const melodies = { tap: [660], enter: [440, 550], success: [660, 880], joy: [784, 1046], finish: [523, 659, 784, 1046] };
export function sound(kind: keyof typeof melodies, muted: boolean) {
  if (muted || !context || context.state !== 'running') return;
  try {
    melodies[kind].forEach((frequency, index) => {
      const start = context!.currentTime + index * .13;
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.055, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + .16);
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.start(start); oscillator.stop(start + .18);
    });
  } catch { /* Audio failure never blocks a round. */ }
}
