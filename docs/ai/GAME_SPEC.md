# 세연이의 냠냠 동물식당

Source: user-supplied `seyeon_animal_restaurant_plan_v1.md` (v1.0). This new repository is independent of every existing game. No remote repository or deployment is authorized.

## Target and platform
Three-year-olds; nurturing play with no timer, penalty, score, reading requirement, ads, account, backend, or analytics. Android Chrome portrait is the target. Session goal is 2–4 minutes, but actual child play duration and enjoyment are NOT VERIFIED.

## Core loop and controls
Rabbit Toto/carrot → monkey Mongmong/banana → panda Pangpang/bamboo, repeated twice. One tap on a food feeds the current friend. Pointer movement greater than 12 CSS px becomes a drag; release in the generous body zone feeds, elsewhere returns home. Ghost sits 42px above the finger. Only one primary pointer can act. Cancellation, blur, visibility change, and resize clear drag state. Keyboard/assistive button activation also works.

Correct food flies to the SVG mouth, two chews, species-specific delight, one flower, automatic next friend. Feedback can be skipped by tapping after a 350ms debounce; transitions still lock input. Wrong food does not advance; bubble nudges and two mistakes activate a gentle correct-card hint. Eight seconds of idle time adds a hint. Six successes lead to three friends dancing with six flowers and a large restart button. Restart is explicit.

## Assets, sound, persistence
Original 512×512 SVG characters in `src/assets/characters.tsx`: white rabbit with pink ears/mint apron, brown monkey with tail/lavender apron, black-and-white panda/yellow apron. Original 256×256 food SVGs in `src/assets/foods.tsx`. Eyes blink; curious head tilt; rabbit hops twice with ears, monkey claps twice with puffed cheeks, panda rocks with hearts. Quiet locally synthesized Web Audio tones unlock only after interaction. `public/audio/kickoff-bounce.mp3` loops after the child presses Start; the speaker button mutes effects and music together, and the note button mutes just the music. Both preferences persist separately. The MP3 is precached for offline use. Denied storage/audio leaves play functional. No TTS or network audio streaming.

## Mobile and PWA
Readability: header title 22px, friend names 20px, food labels 18px, instructions 17–18px, secondary copy 14–15px; stronger warm text contrast. Friend name sits beside the larger order bubble to preserve the main animal area. Food cards gain label space without shrinking the existing illustrations. Flower progress and sound control are larger. Test visible copy for clipping at welcome, play and finished, including 320×568.

360×800, 390×844, 412×915, 320×568, 800×1280 and desktop QA. Food cards ≥72×88px; body target ≥120×120px; dynamic viewport height and safe areas. Compact landscape viewports (width ≤1000px and height ≤600px) show a portrait prompt; larger desktop/tablet windows remain playable with a centered portrait layout. Desktop regression viewports are 1280×900 and 1615×1248 with non-mobile mouse input. Reduced-motion disables decorative movement and uses a static hint. Local resources are precached by a generated Service Worker. Install/cache requires localhost or HTTPS. A waiting update activates only at welcome or finished, never during play. First visit still requires a network connection.

## Scope / execution plan
1. Data/reducer, gesture hook and safe audio; verify state and input invariants.
2. SVG assets and responsive welcome/play/celebration screens.
3. PWA manifest/cache and safe update policy.
4. Vitest, Playwright touch/drag/cancel/offline/viewport checks and screenshots.
5. Independent review, fixes, full rerun; record 80% and 90% criteria in QA report.

ChatGPT Web/C2C and Game Studio are not callable in this session. Use an independent review agent and repository Playwright tooling as substitutes, with those limitations disclosed. Human assessment of fun and physical Android hardware remains NOT VERIFIED.

## 동물마을 v2 그래픽 보완 범위
PR #1의 여섯 놀이/이벤트/자율 모션 엔진을 재사용한다. SVG 파츠 모션은 기존 1초 자율 모션 표시 시간 안에서 정착한다. 종별 파츠(귀/코, 손/꼬리, 배/눈)의 타이밍과 놀이 반응만 개선한다. 비눗방울은 반투명 SVG, 숨바꼭질은 꽃 덤불의 열림으로 표현한다. 안내는 주문 말풍선 자리에서 표시하고 메인 캐릭터 및 음식 그림 크기를 유지한다. 원래 먹이 주기, 6송이 보상, 계속 놀기, 음소거, 오프라인 캐시와 안전한 SW 업데이트를 보존한다. 이번 요청은 기능 브랜치 변경까지만 승인하며 main 병합/배포는 제외한다. 모바일 320/360/390/412px 및 PC를 검사하고 전후 이미지를 `qa/v2-before`, `qa/v2-after`에 기록한다.

2026-10 v2.1 확장: 기존 6개 놀이를 보존하고 얼굴 닦기(3번 터치), 고정 위치 풍선 3개, 이불 덮고 다시 깨우기(2번), 선물상자(2번)를 더해 10개로 구성한다. 선물은 무료 스티커 6종 중 새 항목을 우선하고 모두 모은 뒤에는 중복을 다정하게 제공한다. localStorage 장애는 게임 입력을 막지 않는다. 먹이 주기·최근 두 이벤트 회피·무제한 계속 놀기·20초 유휴 초대·음소거·PWA 정책은 그대로다. v2.1 캡처는 `qa/v21-after`로 분리해 기존 QA 파일을 덮어쓰지 않는다.
