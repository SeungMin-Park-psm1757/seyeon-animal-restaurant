import type { AnimalId } from '../game/data';

export function AnimalArt({ id, mood = 'idle' }: { id: AnimalId; mood?: 'idle' | 'curious' | 'chewing' | 'delighted' }) {
  const rabbit = id === 'rabbit';
  const monkey = id === 'monkey';
  const fur = rabbit ? '#fffdf7' : monkey ? '#c99673' : '#fffdf7';
  return <svg className={`animal-art animal-${id} mood-${mood}`} data-animal={id} viewBox="0 0 512 512" aria-hidden="true" fill="none" stroke="#755c63" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <ellipse className="animal-shadow" cx="256" cy="467" rx="115" ry="15" fill="#755c63" opacity=".12" stroke="none" />
    <g className="animal-body">
      {monkey && <path className="tail" d="M338 389c106 17 118-69 79-83-25-9-45 18-23 32" stroke="#a6755b" strokeWidth="24" />}
      <ellipse cx="256" cy="376" rx={monkey ? 85 : 99} ry="89" fill={fur} />
      {id === 'panda' && <path d="M164 346c37 28 148 28 184 0l-5 37c-52 27-125 27-179-2Z" fill="#595963" stroke="none" />}
      <ellipse cx="197" cy="448" rx="40" ry="22" fill={id === 'panda' ? '#595963' : fur} />
      <ellipse cx="315" cy="448" rx="40" ry="22" fill={id === 'panda' ? '#595963' : fur} />
      <path d="M208 311c15 18 80 18 96 0l25 106c-47 23-96 23-145 0Z" fill={rabbit ? '#bedfd0' : monkey ? '#e4d5f3' : '#ffe6a1'} />
      <path d="M232 381h48v28c-15 10-32 10-48 0Z" fill="#fff8ee" strokeWidth="4" />
      <path d="m248 392 8 8 8-8" stroke="#d8979c" strokeWidth="5" />
      <g className="hand hand-left"><ellipse cx="170" cy="360" rx="24" ry="40" transform="rotate(25 170 360)" fill={id === 'panda' ? '#595963' : fur} /></g>
      <g className="hand hand-right"><ellipse cx="342" cy="360" rx="24" ry="40" transform="rotate(-25 342 360)" fill={id === 'panda' ? '#595963' : fur} /></g>
      <g className="animal-head">
        {rabbit ? <>
          <g className="ear ear-left"><path d="M195 170C135 84 156 19 178 25c27 8 38 75 49 137" fill={fur} /><path d="M193 138c-23-52-23-78-14-80 10 12 19 47 24 74" fill="#f7c4cf" stroke="none" /></g>
          <g className="ear ear-right"><path d="M285 160c7-67 18-129 46-135 23-5 36 67-12 145" fill={fur} /><path d="M304 132c5-34 14-65 23-74 9 6 4 39-13 78" fill="#f7c4cf" stroke="none" /></g>
          <path d="M153 218c-1-75 58-91 102-86 49-8 112 15 106 90 25 56-11 115-106 115-96 0-130-58-102-119Z" fill={fur} />
          <path d="m233 143 13-16 8 12 14-12 7 16" fill={fur} />
        </> : monkey ? <>
          <circle cx="144" cy="219" r="44" fill={fur} /><circle cx="368" cy="219" r="44" fill={fur} />
          <circle cx="144" cy="219" r="26" fill="#eab99c" stroke="none" /><circle cx="368" cy="219" r="26" fill="#eab99c" stroke="none" />
          <path d="M147 206c0-74 47-107 109-107s109 35 109 107c17 76-28 130-109 130s-126-54-109-130Z" fill={fur} />
          <path d="M177 239c-22-61 17-86 43-72 22 12 50 12 72 0 30-14 64 16 43 72 29 47-16 79-79 79-62 0-107-32-79-79Z" fill="#f7d9b9" stroke="none" />
          <path d="M226 115c-8-17 7-35 23-25-4-22 22-29 33-12" fill={fur} />
        </> : <>
          <circle cx="174" cy="141" r="38" fill="#595963" /><circle cx="338" cy="141" r="38" fill="#595963" />
          <path d="M149 223c0-80 51-106 107-106s107 26 107 106c20 73-23 115-107 115s-128-42-107-115Z" fill={fur} />
          <ellipse cx="211" cy="233" rx="30" ry="38" transform="rotate(25 211 233)" fill="#595963" stroke="none" />
          <ellipse cx="301" cy="233" rx="30" ry="38" transform="rotate(-25 301 233)" fill="#595963" stroke="none" />
        </>}
        <g className="cheek cheek-left"><ellipse cx="184" cy="269" rx="20" ry="13" fill="#f4b9bf" stroke="none" opacity=".8" /></g>
        <g className="cheek cheek-right"><ellipse cx="328" cy="269" rx="20" ry="13" fill="#f4b9bf" stroke="none" opacity=".8" /></g>
        <g className="eyes">
          <ellipse cx="219" cy="232" rx="7" ry="10" fill={id === 'panda' ? '#fffdf7' : '#755c63'} stroke="none" />
          <ellipse cx="293" cy="232" rx="7" ry="10" fill={id === 'panda' ? '#fffdf7' : '#755c63'} stroke="none" />
        </g>
        <path d="M248 253q8-6 16 0l-8 7Z" fill="#d38d9d" strokeWidth="3" />
        <g className="mouth"><path d="M241 277q15 20 30 0" strokeWidth="5" /><ellipse className="chew-mouth" cx="256" cy="283" rx="12" ry="9" fill="#bc7c89" strokeWidth="3" /></g>
        <circle data-mouth="true" cx="256" cy="281" r="1" stroke="none" />
      </g>
      <path d="m226 318 30 18 30-18" fill={rabbit ? '#91bea9' : monkey ? '#b7a4cd' : '#edc973'} strokeWidth="4" />
    </g>
    {id === 'panda' && <g className="panda-hearts" fill="#e9a2b4" stroke="none"><path d="M115 168c-26-30-55 7 0 37 55-30 26-67 0-37Z" /><path d="M395 208c-23-27-48 6 0 32 48-26 23-59 0-32Z" /></g>}
  </svg>;
}
