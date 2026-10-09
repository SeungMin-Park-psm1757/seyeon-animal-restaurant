import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { AnimalArt } from '../assets/characters';
import { FoodArt } from '../assets/foods';
import { PlayArt } from '../assets/play';
import { LeafMark, MusicMark, PlayMark, ProgressFlowers, SoundMark } from '../components/Decor';
import { PlayEvent } from '../components/PlayEvent';
import { StickerBook, StickerButton } from '../components/StickerBook';
import { MOTIONS, nextIdleMotion, type IdleMotion } from '../game/idleMotions';
import { PLAY_BY_ID, initialPlayState, playReducer } from '../game/playEvents';
import { ANIMALS, FOOD_NAMES, PHASE_MS, ROUNDS, makeLayouts, type FoodId } from '../game/data';
import { initialState, reducer } from '../game/reducer';
import { useFeedingGesture } from '../game/useFeedingGesture';
import { readMuted, readMusicMuted, saveMuted, saveMusicMuted, sound, unlockAudio } from '../audio/audioEngine';
import { giveSticker, readStickerBook, type StickerGift } from '../game/stickers';

type Flight = { food: FoodId; fromX: number; fromY: number; toX: number; toY: number };
export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [play, playDispatch] = useReducer(playReducer, initialPlayState);
  const [idleMotion, setIdleMotion] = useState<IdleMotion | null>(null);
  const previousMotion = useRef<IdleMotion | null>(null);
  const [layouts, setLayouts] = useState(makeLayouts);
  const [muted, setMuted] = useState(readMuted);
  const [musicMuted, setMusicMuted] = useState(readMusicMuted);
  const [stickers, setStickers] = useState(readStickerBook);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [lastGift, setLastGift] = useState<StickerGift | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [reloadPending, setReloadPending] = useState(false);
  const updateWorker = useRef<((reload?: boolean) => Promise<void>) | undefined>(undefined);
  const zone = useRef<HTMLDivElement>(null);
  const music = useRef<HTMLAudioElement>(null);
  const feedbackStarted = useRef(0);
  const lastInteractionAt = useRef(Date.now());
  const animalId = ROUNDS[state.roundIndex];
  const animal = ANIMALS[animalId];
  const hint = state.mistakesInRound >= 2 || state.idleHint;
  const playing = state.phase !== 'welcome' && state.phase !== 'finished';
  const locked = !['ready', 'dragging'].includes(state.phase) || play.mode !== 'idle';

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    updateWorker.current = registerSW({
      onOfflineReady: () => setOfflineReady(true),
      onNeedRefresh: () => setUpdatePending(true),
      onNeedReload: () => setReloadPending(true),
      onRegisterError: () => {} // Online play still works if caching is unavailable.
    });
  }, []);
  useEffect(() => {
    if (reloadPending && (state.phase === 'welcome' || state.phase === 'finished')) {
      window.location.reload();
    } else if (updatePending && (state.phase === 'welcome' || state.phase === 'finished')) {
      void updateWorker.current?.(true).catch(() => {});
    }
  }, [state.phase, updatePending, reloadPending]);
  useEffect(() => {
    if (play.mode !== 'reward') return;
    const timer = setTimeout(() => playDispatch({ type: 'close' }), 1200);
    return () => clearTimeout(timer);
  }, [play.mode, play.id]);
  useEffect(() => {
    if (state.phase !== 'ready' || play.mode !== 'idle') return;
    let active = true;
    let motionTimer: ReturnType<typeof setTimeout>;
    let restTimer: ReturnType<typeof setTimeout>;
    function schedule() {
      motionTimer = setTimeout(() => {
        if (!active) return;
        const next = nextIdleMotion(animalId, previousMotion.current, Math.random());
        previousMotion.current = next;
        setIdleMotion(next);
        restTimer = setTimeout(() => {
          if (!active) return;
          setIdleMotion(null);
          schedule();
        }, 1000);
      }, 5200 + Math.random() * 5500);
    }
    schedule();
    return () => { active = false; clearTimeout(motionTimer); clearTimeout(restTimer); };
  }, [animalId, state.phase, play.mode]);
  useEffect(() => {
    // Invite after 20 seconds without real input, not 20 seconds after entering ready.
    // A child may be touching a wrong food repeatedly; that is still active play.
    if (state.phase !== 'ready' || play.mode !== 'idle') return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const remaining = Math.max(1, 20000 - (Date.now() - lastInteractionAt.current));
      timer = setTimeout(() => {
        if (document.hidden) return; // Foreground handler restarts the clock.
        if (Date.now() - lastInteractionAt.current < 20000) { schedule(); return; }
        setIdleMotion(null);
        dispatch({ type: 'activity' });
        playDispatch({ type: 'open', animal: animalId, roll: Math.random() });
      }, remaining);
    };
    const onVisibility = () => {
      clearTimeout(timer);
      if (!document.hidden) { lastInteractionAt.current = Date.now(); if (!albumOpen) schedule(); }
    };
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden && !albumOpen) schedule();
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, [animalId, state.phase, play.mode, albumOpen]);
  useEffect(() => {
    if (state.phase === 'ready' && play.mode !== 'idle') return;
    if (state.phase === 'ready') {
      const timer = setTimeout(() => { if (!document.hidden) dispatch({ type: 'idle' }); }, 8000);
      return () => clearTimeout(timer);
    }
    const duration = PHASE_MS[state.phase as keyof typeof PHASE_MS];
    if (!duration) return;
    const action = state.phase === 'feeding' ? 'chewed' : state.phase === 'celebrating' ? 'next' : 'arrived';
    const timer = setTimeout(() => dispatch({ type: action }), duration);
    return () => clearTimeout(timer);
  }, [state.phase, state.roundIndex, state.mistakesInRound, play.mode]);
  useEffect(() => {
    if (state.phase === 'feeding') { feedbackStarted.current = performance.now(); sound('success', muted); }
    if (state.phase === 'celebrating') sound('joy', muted);
    if (state.phase === 'finished') sound('finish', muted);
    if (state.phase === 'ready' && state.mistakesInRound === 0) sound('enter', muted);
  }, [state.phase, state.roundIndex]);

  function choose(food: FoodId, x: number, y: number) {
    if (locked) return false;
    sound('tap', muted);
    if (food === animal.food) {
      const mouth = zone.current?.querySelector('[data-mouth]')?.getBoundingClientRect();
      if (mouth) setFlight({ food, fromX: x, fromY: y, toX: mouth.left + mouth.width / 2, toY: mouth.top + mouth.height / 2 });
    } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      zone.current?.closest('main')?.querySelector(`[data-food="${food}"]`)?.animate([
        { transform: 'translateY(0)' }, { transform: 'translateY(-7px)' }, { transform: 'translateY(0)' }
      ], { duration: 300, easing: 'ease-out' });
    }
    dispatch({ type: 'choose', food });
    return food === animal.food;
  }
  const gesture = useFeedingGesture({ phase: play.mode === 'idle' ? state.phase : 'celebrating', zone, choose,
    dragging: () => dispatch({ type: 'drag' }), cancel: () => dispatch({ type: 'cancel' }), unlock: unlockAudio });

  function openPlay() {
    if (state.phase !== 'ready' || play.mode !== 'idle') return;
    lastInteractionAt.current = Date.now();
    dispatch({ type: 'activity' });
    unlockAudio();
    setIdleMotion(null);
    playDispatch({ type: 'open', animal: animalId, roll: Math.random() });
    sound('tap', muted);
  }
  function tapPlay() {
    if (play.mode !== 'active' || !play.id) return;
    lastInteractionAt.current = Date.now();
    sound(play.id, muted);
    if (play.steps + 1 >= PLAY_BY_ID[play.id].taps) {
      sound('joy', muted);
      if (play.id === 'gift') {
        const gift = giveSticker();
        setLastGift(gift); setStickers(gift.book);
      }
    }
    playDispatch({ type: 'tap' });
  }
  function openAlbum() {
    lastInteractionAt.current = Date.now();
    setAlbumOpen(true);
  }
  function start(restart = false, continuePlay = false) {
    unlockAudio();
    if (!muted && !musicMuted) void music.current?.play().catch(() => {});
    setFlight(null); setLayouts(makeLayouts()); setIdleMotion(null);
    if (!continuePlay) { playDispatch({ type: 'reset' }); previousMotion.current = null; }
    dispatch({ type: restart ? 'restart' : 'start' });
  }
  function toggleSound() {
    lastInteractionAt.current = Date.now();
    unlockAudio();
    const next = !muted;
    saveMuted(next); setMuted(next);
    if (next || musicMuted) music.current?.pause();
    else void music.current?.play().catch(() => {});
  }
  function toggleMusic() {
    lastInteractionAt.current = Date.now();
    unlockAudio();
    const next = !musicMuted;
    saveMusicMuted(next); setMusicMuted(next);
    if (next || muted) music.current?.pause();
    else void music.current?.play().catch(() => {});
  }
  function skipFeedback() {
    if (performance.now() - feedbackStarted.current < 350) return;
    if (state.phase === 'feeding') dispatch({ type: 'chewed' });
    if (state.phase === 'feeding' || state.phase === 'celebrating') dispatch({ type: 'next' });
  }
  const mood = state.phase === 'feeding' ? 'chewing' : state.phase === 'celebrating' ? 'delighted' : hint ? 'curious' : 'idle';
  const playMotion = play.mode !== 'idle' ? play.id : null;

  return <main className={`restaurant screen-${state.phase}`} data-phase={state.phase} data-round={state.roundIndex} onPointerDown={() => { lastInteractionAt.current = Date.now(); skipFeedback(); }} onKeyDown={() => { lastInteractionAt.current = Date.now(); }}>
    <header className="topbar">
      <div className="brand"><LeafMark /><div><span>세연이의</span><strong>냠냠 동물식당</strong></div></div>
      <div className="sound-controls" role="group" aria-label="소리 설정">
        <StickerButton count={stickers.ids.length} onClick={openAlbum} />
        <button className="sound-button" aria-label={muted ? '효과음과 배경음악 켜기' : '효과음과 배경음악 끄기'} aria-pressed={muted} title="효과음과 배경음악" onPointerDown={event => event.stopPropagation()} onClick={toggleSound}><SoundMark muted={muted} /></button>
        <button className="sound-button music-button" aria-label={musicMuted ? '배경음악 켜기' : '배경음악 끄기'} aria-pressed={musicMuted} title="배경음악만" onPointerDown={event => event.stopPropagation()} onClick={toggleMusic}><MusicMark muted={musicMuted} /></button>
      </div>
    </header>
    <div className="awning" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>

    {state.phase === 'welcome' && <section className="welcome">
      <div className="welcome-copy"><span className="eyebrow">작은 숲속 식당에 오신 걸 환영해요</span><h1>친구들아,<br />밥 먹자!</h1><div className="tiny-flourish" aria-hidden="true">✦ <span>냠냠, 맛있는 마음</span> ✦</div></div>
      <div className="welcome-art"><div className="welcome-halo" /><span className="float-food left"><FoodArt id="carrot" /></span><AnimalArt id="rabbit" /><span className="float-food right"><FoodArt id="banana" /></span></div>
      <div className="welcome-action"><button className="primary-button" aria-label="놀이 시작" onClick={() => start()}><PlayMark /></button><p>톡! 누르면 문이 열려요</p></div>
      <div className="welcome-bottom"><span className="mini-leaf"><LeafMark /></span><span>{offlineReady ? '인터넷 없이도 놀 수 있어요' : '오늘도 다정한 한 끼'}</span></div>
    </section>}

    {playing && <section className={`play-screen ${play.mode !== 'idle' ? 'has-event' : ''}`}>
      <div className={`order-area ${state.idleHint ? 'idle-hint' : ''}`}>
        <div className="friend-caption"><span className="friend-dot" style={{ background: animal.color }} /><span>{animal.species}</span><span>{animal.name}</span></div>
        <div className={`order-bubble ${state.mistakesInRound > 0 ? 'nudge' : ''}`} key={`${state.roundIndex}-${state.mistakesInRound}`} aria-label={`${animal.name}는 ${FOOD_NAMES[animal.food]}을 먹고 싶어요`}><FoodArt id={animal.food} /><span>{state.phase === 'celebrating' ? '고마워!' : '냠냠 주세요'}</span></div>
        <button type="button" className={`play-launch ${state.roundIndex > 0 ? 'suggest' : ''}`} aria-label="동물과 놀기" onClick={openPlay} disabled={state.phase !== 'ready' || play.mode !== 'idle'}>
          <span className="play-launch-icon" aria-hidden="true"><PlayArt id="bubbles" /></span><strong>놀자!</strong>
        </button>
      </div>
      <div className={`stage ${state.phase === 'transitioning' ? 'entering' : ''}`}>
        <div className="scene-leaves left" aria-hidden="true"><LeafMark /></div><div className="scene-leaves right" aria-hidden="true"><LeafMark /></div>
        <div className={`animal-zone ${state.phase === 'dragging' ? 'drop-active' : ''}`} data-testid="drop-zone" ref={zone} aria-label={`${animal.name}에게 밥 주는 곳`}>
          <AnimalArt key={`${animalId}-${play.id}-${play.steps}-${idleMotion ?? ''}`} id={animalId} mood={play.mode === 'idle' ? mood : play.id === 'bedtime' && play.steps === 1 ? 'sleepy' : play.id === 'wash' && play.mode === 'reward' ? 'delighted' : 'idle'} motion={state.phase === 'ready' && play.mode === 'idle' && idleMotion && MOTIONS[animalId].includes(idleMotion) ? idleMotion : null} play={playMotion} playStep={play.steps} onFaceWash={tapPlay} />
          {state.phase === 'celebrating' && <div className="joy-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>}
        </div>
        {state.phase === 'ready' && <PlayEvent state={play} onTap={tapPlay} onClose={() => playDispatch({ type: 'close' })} onAlbum={openAlbum} gift={lastGift} />}
        <div className="ground" aria-hidden="true" />
      </div>
      <ProgressFlowers count={state.progressFlowers} />
      <div className="food-tray">
        <div className="tray-caption">{state.phase === 'celebrating' ? '맛있게 먹었어요' : '톡! 또는 쏘옥 가져다 주세요'}</div>
        <div className="food-cards">
          {layouts[state.roundIndex].map(food => <button key={food} data-food={food} className={`food-card ${hint && food === animal.food ? 'hint' : ''} ${gesture.ghost?.food === food && !gesture.ghost.returning ? 'lifted' : ''}`} aria-label={`${FOOD_NAMES[food]} 주기`} disabled={locked} {...gesture.handlers(food)}>
            <FoodArt id={food} /><span>{FOOD_NAMES[food]}</span>
          </button>)}
        </div>
      </div>
      <p className="sr-only" role="status">{state.phase === 'celebrating' ? `${animal.name}가 맛있게 먹었어요. 꽃 ${state.progressFlowers}송이!` : hint ? `${FOOD_NAMES[animal.food]}을 주세요` : `${animal.name}에게 밥을 주세요`}</p>
    </section>}

    {state.phase === 'finished' && <section className="finished">
      <div className="finish-copy"><span className="eyebrow">다정한 마음이 활짝</span><h1>모두 배불러요!</h1><p>세연아, 고마워!</p></div>
      <div className="confetti" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</div>
      <div className="friends-together">{(['rabbit', 'monkey', 'panda'] as const).map(id => <div key={id}><AnimalArt id={id} mood="delighted" /><span>{ANIMALS[id].name}</span></div>)}</div>
      <ProgressFlowers count={6} />
      <div className="finish-action"><div className="finish-buttons">
        <button className="primary-button continue-play" aria-label="계속 놀기" onClick={() => start(true, true)}><PlayMark /></button>
        <button className="primary-button" aria-label="다시 놀기" onClick={() => start(true)}><PlayMark restart /></button>
      </div><p>또 놀아요! ♡</p></div>
    </section>}

    {gesture.ghost && <div className={`drag-ghost ${gesture.ghost.returning ? 'returning' : ''}`} style={{ left: gesture.ghost.x, top: gesture.ghost.y - 42 }} aria-hidden="true"><FoodArt id={gesture.ghost.food} /></div>}
    {flight && state.phase === 'feeding' && <div className="flying-food" key={`${state.roundIndex}-${flight.food}`} style={{ '--from-x': `${flight.fromX}px`, '--from-y': `${flight.fromY}px`, '--to-x': `${flight.toX}px`, '--to-y': `${flight.toY}px` } as CSSProperties} aria-hidden="true"><FoodArt id={flight.food} /></div>}
    <audio ref={music} src={`${import.meta.env.BASE_URL}audio/kickoff-bounce.mp3`} loop preload="none" aria-hidden="true" />
    {albumOpen && <StickerBook ids={stickers.ids} onClose={() => setAlbumOpen(false)} />}
    <div className="rotate-overlay" role="status"><div className="rotate-phone" aria-hidden="true" /><strong>세로로 세워 주세요</strong><span>친구들이 기다리고 있어요</span></div>
  </main>;
}
