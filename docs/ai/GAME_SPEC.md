# 세연이의 냠냠 동물식당

Source: user-supplied `seyeon_animal_restaurant_plan_v1.md` (v1.0). This new repository is independent of every existing game. No remote repository or deployment is authorized.

## Target and platform
Three-year-olds; nurturing play with no timer, penalty, score, reading requirement, ads, account, backend, or analytics. Android Chrome portrait is the target. Session goal is 2–4 minutes, but actual child play duration and enjoyment are NOT VERIFIED.

## Core loop and controls
Rabbit Toto/carrot → monkey Mongmong/banana → panda Pangpang/bamboo, repeated twice. One tap on a food feeds the current friend. Pointer movement greater than 12 CSS px becomes a drag; release in the generous body zone feeds, elsewhere returns home. Ghost sits 42px above the finger. Only one primary pointer can act. Cancellation, blur, visibility change, and resize clear drag state. Keyboard/assistive button activation also works.

Correct food flies to the SVG mouth, two chews, species-specific delight, one flower, automatic next friend. Feedback can be skipped by tapping after a 350ms debounce; transitions still lock input. Wrong food does not advance; bubble nudges and two mistakes activate a gentle correct-card hint. Eight seconds of idle time adds a hint. Six successes lead to three friends dancing with six flowers and a large restart button. Restart is explicit.

## Assets, sound, persistence
Original 512×512 SVG characters in `src/assets/characters.tsx`: white rabbit with pink ears/mint apron, brown monkey with tail/lavender apron, black-and-white panda/yellow apron. Original 256×256 food SVGs in `src/assets/foods.tsx`. Eyes blink; curious head tilt; rabbit hops twice with ears, monkey claps twice with puffed cheeks, panda rocks with hearts. Quiet locally synthesized Web Audio tones unlock only after interaction. Only mute preference is stored; denied storage/audio leaves play functional. No TTS or music required.

## Mobile and PWA
360×800, 390×844, 412×915, 320×568, 800×1280 and desktop QA. Food cards ≥72×88px; body target ≥120×120px; dynamic viewport height and safe areas. Landscape shows a portrait prompt. Reduced-motion disables decorative movement and uses a static hint. Local resources are precached by a generated Service Worker. Install/cache requires localhost or HTTPS. A waiting update activates only at welcome or finished, never during play. First visit still requires a network connection.

## Scope / execution plan
1. Data/reducer, gesture hook and safe audio; verify state and input invariants.
2. SVG assets and responsive welcome/play/celebration screens.
3. PWA manifest/cache and safe update policy.
4. Vitest, Playwright touch/drag/cancel/offline/viewport checks and screenshots.
5. Independent review, fixes, full rerun; record 80% and 90% criteria in QA report.

ChatGPT Web/C2C and Game Studio are not callable in this session. Use an independent review agent and repository Playwright tooling as substitutes, with those limitations disclosed. Human assessment of fun and physical Android hardware remains NOT VERIFIED.
