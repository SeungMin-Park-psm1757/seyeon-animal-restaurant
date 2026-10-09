import { useId } from 'react';
import type { PlayId } from '../game/playEvents';

export function BubbleArt() {
  const id = useId();
  return <svg className="bubble-art" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-glass`} cx=".3" cy=".25" r=".8"><stop stopColor="#fff" stopOpacity=".65" /><stop offset=".55" stopColor="#c8eee9" stopOpacity=".13" /><stop offset="1" stopColor="#debde9" stopOpacity=".65" /></radialGradient>
      <linearGradient id={`${id}-rim`} x2="1" y2="1"><stop stopColor="#acd9d9" /><stop offset=".45" stopColor="#e3b7d4" /><stop offset=".7" stopColor="#f4dca0" /><stop offset="1" stopColor="#9ccfdb" /></linearGradient>
    </defs>
    <circle cx="50" cy="50" r="43" fill={`url(#${id}-glass)`} stroke={`url(#${id}-rim)`} strokeWidth="3" />
    <path d="M21 42a31 31 0 0 1 22-22" stroke="#fffdf7" strokeWidth="6" strokeLinecap="round" />
    <path d="M68 78a32 32 0 0 0 14-17" stroke="#fff0ce" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="30" cy="28" rx="4" ry="2" fill="#fff" transform="rotate(-40 30 28)" />
  </svg>;
}

export function PlayArt({ id }: { id: PlayId }) {
  if (id === 'bubbles') return <BubbleArt />;
  return <svg className="play-art" viewBox="0 0 64 64" fill="none" stroke="#9a7880" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {id === 'pet' ? <><path d="M32 51C-1 30 10 8 25 15l7 7 7-7c15-7 26 15-7 36Z" fill="#f2bdcd" /><path d="m12 5-2 6M50 8l4 5" stroke="#d4b778" /></>
      : id === 'hop' ? <><path d="M23 32C9 6 16 1 22 9l8 20m6 0 8-20c6-8 13-3-1 23" fill="#fffdf7" /><ellipse cx="32" cy="42" rx="20" ry="15" fill="#fffdf7" /><path d="m24 40 1 1m14-1 1 1m-12 5q4 5 8 0M7 48l-3-3m52 3 4-3" /></>
      : id === 'clap' ? <><path d="M20 50 9 33c-3-5 2-8 6-3l4 4-6-21c-1-5 5-6 6-1l6 17-3-20c-1-5 5-6 6 0l3 20V13c0-5 6-5 6 0v20l4-7c3-4 8 0 5 4L36 51Z" fill="#f7d9b9" /><path d="m45 7 3-4m5 13 6-2m-9 33 6 3" stroke="#d4b778" /></>
      : id === 'roll' ? <><path d="M12 36a22 22 0 1 1 12 20m-12-20-7 4m7-4 5 6" stroke="#9bbda0" /><circle cx="32" cy="31" r="14" fill="#fffdf7" /><circle cx="21" cy="20" r="5" fill="#696771" /><circle cx="43" cy="20" r="5" fill="#696771" /><path d="m25 30 1 1m12-1 1 1m-9 6h4" /></>
      : <><path d="M32 34v24m0-9c-15 0-15-11-15-11 12-1 15 11 15 11" stroke="#87ad88" /><g fill="#f4bfd0"><circle cx="32" cy="15" r="10" /><circle cx="43" cy="26" r="10" /><circle cx="38" cy="39" r="10" /><circle cx="24" cy="39" r="10" /><circle cx="21" cy="26" r="10" /></g><circle cx="32" cy="27" r="8" fill="#ffe7a5" /></>}
  </svg>;
}

export function PeekGarden() {
  return <svg className="peek-garden" viewBox="0 0 512 512" fill="none" stroke="#87ad88" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g className="peek-half peek-left"><path d="M256 483H102c-59-4-63-74-31-95-45-45-6-100 28-95-29-66 25-103 65-82 8-72 85-81 92-10Z" fill="#c1dbaf" /><path d="M123 453c2-104 49-165 101-205m-91 134-38-35m65-8-6-44m30 2 41 7" /><path d="M99 298c-24-40-12-62-12-62 39 15 32 45 12 62m51-60c-18-40 7-58 7-58 22 34 7 54-7 58" fill="#a5c999" /></g>
    <g className="peek-half peek-right"><path d="M256 483h154c59-4 63-74 31-95 45-45 6-100-28-95 29-66-25-103-65-82-8-72-85-81-92-10Z" fill="#b5d4a3" /><path d="M390 453c-2-104-49-165-101-205m91 134 38-35m-65-8 6-44m-30 2-41 7" /><path d="M414 298c24-40 12-62 12-62-39 15-32 45-12 62m-51-60c18-40-7-58-7-58-22 34-7 54 7 58" fill="#d6e7bf" /></g>
    {[145, 360, 254].map((x, i) => <g className="garden-flower" key={x} transform={`translate(${x} ${i === 2 ? 380 : 410})`}><path d="M0 0v50m0-12-18-12" /><g fill={i === 1 ? '#fff4ce' : '#f3bfd0'} stroke="#d6a3ae"><circle cy="-15" r="13" /><circle cx="14" cy="-4" r="13" /><circle cx="9" cy="13" r="13" /><circle cx="-9" cy="13" r="13" /><circle cx="-14" cy="-4" r="13" /></g><circle r="9" fill="#f7d787" stroke="none" /></g>)}
  </svg>;
}
