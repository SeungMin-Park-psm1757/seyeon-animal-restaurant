export function Flower({ grown = true }: { grown?: boolean }) {
  return <svg viewBox="0 0 64 80" className={`flower ${grown ? 'grown' : 'seed'}`} fill="none" aria-hidden="true">
    <path d="M32 46v25m0-8c-17 0-19-11-19-11 15-2 19 11 19 11m0 3c15-1 17-12 17-12-13-1-17 12-17 12" stroke={grown ? '#82ab88' : '#bccbb7'} strokeWidth="4" strokeLinecap="round" />
    {grown ? <g className="petals" fill="#edb2bf" stroke="#d393a2" strokeWidth="1.5"><circle cx="32" cy="22" r="12" /><circle cx="44" cy="31" r="12" /><circle cx="39" cy="45" r="12" /><circle cx="25" cy="45" r="12" /><circle cx="20" cy="31" r="12" /><circle cx="32" cy="34" r="9" fill="#ffe5a0" stroke="none" /></g> : <circle cx="32" cy="40" r="8" fill="#d2ddc9" />}
  </svg>;
}
export function ProgressFlowers({ count }: { count: number }) {
  return <div className="progress-flowers" role="img" aria-label={`꽃 ${count}송이, 모두 6송이`} data-count={count}>
    {Array.from({ length: 6 }, (_, i) => <span key={i} className={i < count ? `bloomed ${i === count - 1 ? 'latest' : ''}` : ''}><Flower grown={i < count} /></span>)}
  </div>;
}
export function LeafMark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true" fill="none"><path d="M20 32V16M20 23C6 24 5 9 5 9c13-1 15 14 15 14m0-5C20 5 34 5 34 5c2 13-14 13-14 13" stroke="#7eaa88" strokeWidth="3" strokeLinecap="round" fill="#c5ddba" /></svg>;
}
export function PlayMark({ restart = false }: { restart?: boolean }) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">{restart ? <><path d="M48 20a23 23 0 1 0 6 21" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /><path d="M49 7v16H33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></> : <path d="m24 14 27 18-27 18Z" fill="currentColor" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />}</svg>;
}
export function SoundMark({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5Z" />{muted ? <path d="m22 12 7 8m0-8-7 8" /> : <><path d="M22 11q6 5 0 10m4-15q10 10 0 20" /></>}</svg>;
}
