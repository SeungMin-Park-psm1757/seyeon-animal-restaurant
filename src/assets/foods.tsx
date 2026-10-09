import type { FoodId } from '../game/data';

export function FoodArt({ id, className = '' }: { id: FoodId; className?: string }) {
  return <svg className={`food-art ${className}`} viewBox="0 0 256 256" fill="none" aria-hidden="true" stroke="#755c63" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
    {id === 'carrot' && <>
      <path d="M119 83C93 55 100 27 116 22c18 10 24 32 18 58" fill="#84bd89" />
      <path d="M136 82c1-33 22-51 40-47 2 23-12 47-37 56" fill="#acd39c" />
      <path d="M111 79C67 97 75 127 90 156l44 74c6 10 13 8 16-3l25-91c8-34-12-70-64-57Z" fill="#f6a357" />
      <path d="m99 118 25 8m-17 26 26 8m-9 27 15 5" stroke="#d77d49" />
      <path d="M143 104c14 7 19 20 15 37" stroke="#ffce91" strokeWidth="10" />
    </>}
    {id === 'banana' && <>
      <path d="m180 42 15-8 13 20-15 12" fill="#b8ca83" />
      <path d="M190 58c15 65-5 124-59 144-45 18-85-4-90-45 31 25 74 25 102-6 20-22 27-52 30-87Z" fill="#ffdc70" />
      <path d="M45 160c20 26 58 24 88 6 30-19 46-52 49-92" stroke="#e6b94c" />
      <path d="M75 191c39 15 86-11 99-48" stroke="#fff0b5" strokeWidth="11" />
      <path d="m42 155-9-8m94 58-2 7" />
    </>}
    {id === 'bamboo' && <>
      <path d="M118 225V43c0-12 29-12 29 0v182Z" fill="#84bf8c" />
      <path d="M118 83h29m-29 55h29m-29 53h29" stroke="#568e70" strokeWidth="10" />
      <path d="M122 77C77 80 57 55 54 39c33-1 58 12 68 38Z" fill="#b3d59b" />
      <path d="M145 115c8-34 35-47 63-44-10 25-30 43-63 44Z" fill="#a5cf8d" />
      <path d="M120 167c-39 5-56-15-62-32 29-2 50 8 62 32Z" fill="#a5cf8d" />
      <path d="M144 190c11-27 28-34 51-33-7 22-22 32-51 33Z" fill="#b3d59b" />
      <path d="M131 50v23m0 26v25m0 28v25m0 29v11" stroke="#c6e5b5" strokeWidth="6" />
    </>}
  </svg>;
}
