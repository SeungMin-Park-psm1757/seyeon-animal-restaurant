import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { DRAG_THRESHOLD, inside, type FoodId } from './data';
import type { Phase } from './reducer';

type Drag = { food: FoodId; x: number; y: number; returning?: boolean };
type Active = { pointerId: number; food: FoodId; x: number; y: number; moved: boolean; element: HTMLButtonElement };
export function useFeedingGesture({ phase, zone, choose, dragging, cancel, unlock }: {
  phase: Phase; zone: RefObject<HTMLDivElement | null>;
  choose: (food: FoodId, x: number, y: number) => boolean;
  dragging: () => void; cancel: () => void; unlock: () => void;
}) {
  const active = useRef<Active | null>(null);
  const lastPointer = useRef(-Infinity);
  const [ghost, setGhost] = useState<Drag | null>(null);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelRef = useRef(cancel); cancelRef.current = cancel;
  function clearPointer() {
    const current = active.current;
    active.current = null;
    if (current?.element.hasPointerCapture(current.pointerId)) current.element.releasePointerCapture(current.pointerId);
  }
  function abort() {
    clearPointer(); setGhost(null); cancelRef.current();
  }
  useEffect(() => {
    const hidden = () => { if (document.hidden) abort(); };
    window.addEventListener('blur', abort);
    window.addEventListener('resize', abort);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearPointer(); clearTimeout(returnTimer.current);
      window.removeEventListener('blur', abort); window.removeEventListener('resize', abort);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  function returnHome(current: Active) {
    const rect = current.element.getBoundingClientRect();
    setGhost({ food: current.food, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + 42, returning: true });
    clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(() => setGhost(null), 250);
    cancel();
  }
  return {
    ghost,
    handlers: (food: FoodId) => ({
      onPointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (phase !== 'ready' || active.current || !event.isPrimary || event.button !== 0) return;
        unlock(); event.preventDefault();
        clearTimeout(returnTimer.current); setGhost(null);
        active.current = { pointerId: event.pointerId, food, x: event.clientX, y: event.clientY, moved: false, element: event.currentTarget };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event: PointerEvent<HTMLButtonElement>) {
        const current = active.current;
        if (!current || current.pointerId !== event.pointerId) return;
        if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) > DRAG_THRESHOLD) {
          current.moved = true; dragging();
        }
        if (current.moved) setGhost({ food, x: event.clientX, y: event.clientY });
      },
      onPointerUp(event: PointerEvent<HTMLButtonElement>) {
        const current = active.current;
        if (!current || current.pointerId !== event.pointerId) return;
        lastPointer.current = performance.now();
        clearPointer();
        if (!current.moved) { setGhost(null); choose(food, current.x, current.y); return; }
        const rect = zone.current?.getBoundingClientRect();
        if (rect && inside(event.clientX, event.clientY, rect)) {
          if (choose(food, event.clientX, event.clientY - 42)) setGhost(null);
          else returnHome(current);
        } else returnHome(current);
      },
      onPointerCancel: abort,
      onLostPointerCapture() { if (active.current) abort(); },
      onClick(event: React.MouseEvent<HTMLButtonElement>) {
        // Pointerup owns touch/mouse; keyboard and assistive clicks use this path.
        if (event.detail !== 0 || performance.now() - lastPointer.current < 500 || phase !== 'ready') return;
        unlock(); const rect = event.currentTarget.getBoundingClientRect();
        choose(food, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    })
  };
}
