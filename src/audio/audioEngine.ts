export const MUTE_KEY = 'seyeon-restaurant-muted';
export const MUSIC_MUTE_KEY = 'seyeon-restaurant-music-muted';
export function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return true; }
}
export function saveMuted(muted: boolean) {
  try { localStorage.setItem(MUTE_KEY, String(muted)); } catch { /* Storage is optional. */ }
}
export function readMusicMuted(): boolean {
  try { return localStorage.getItem(MUSIC_MUTE_KEY) === 'true'; } catch { return true; }
}
export function saveMusicMuted(muted: boolean) {
  try { localStorage.setItem(MUSIC_MUTE_KEY, String(muted)); } catch { /* Storage is optional. */ }
}
let context: AudioContext | undefined;
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
  } catch { /* Silent play works without Web Audio. */ }
}
const melodies = { tap: [660], enter: [440, 550], success: [660, 880], joy: [784, 1046], finish: [523, 659, 784, 1046], bubbles: [1175], pet: [392, 494], hop: [330, 660], clap: [740, 740], roll: [523, 440, 330], peek: [659, 988], wash: [587, 784], balloons: [698, 880], bedtime: [523, 392], gift: [659, 880] };
export function sound(kind: keyof typeof melodies, muted: boolean) {
  if (muted || !context || context.state !== 'running') return;
  try {
    melodies[kind].forEach((frequency, index) => {
      const start = context!.currentTime + index * .13;
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      if (kind === 'bubbles' || kind === 'hop') oscillator.frequency.exponentialRampToValueAtTime(frequency * (kind === 'bubbles' ? .42 : 1.35), start + .12);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.055, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + .16);
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.start(start); oscillator.stop(start + .18);
    });
  } catch { /* Audio failure never blocks a round. */ }
}
