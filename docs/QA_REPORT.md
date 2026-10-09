# 최종 QA — 세연이의 냠냠 동물식당

검증일: 2026-10-09 (KST). 독립 저장소 `C:\dev\seyeon-animal-restaurant`, 브랜치 `codex/animal-restaurant`. 실제 제공된 기획서 v1.0과 사용자의 구현 요청을 기준으로 검증했다.

## 자동 검증

| 검사 | 결과 | 확인 범위 / 근거 |
|---|---|---|
| 의존성 설치 | PASS | `npm install --no-fund --no-audit`; lockfile 저장 |
| 타입 검사·프로덕션 빌드 | PASS | `npm run build`; React/Vite, Service Worker 및 manifest 생성 |
| Vitest | PASS — 11개 | 순서/매핑, 배치 불변식, 오답/힌트 초기화, 중복 진행 잠금, 6회 종료·재시작, 드래그 취소·드롭 경계, 전체/음악 개별 음소거 분리 저장, 저장/오디오 접근 실패 |
| Playwright Chromium | PASS — 17개 | 아래 모바일·입력·오프라인·업데이트·음악 시나리오; 실제 Chromium 156, 터치 에뮬레이션 |
| 콘솔·실행 오류 | PASS | 게임 E2E의 console error/pageerror 수집 결과 빈 배열, 업데이트 E2E의 pageerror 빈 배열 |
| 스크린샷 | PASS | 최종 실행에서 38개 PNG 생성; 등장 완료 후 기본 화면 캡처, 반응 화면은 실제 애니메이션 프레임 캡처. 이전 `desktop-drag.png`는 과거 증거로 보존하며 현재 수에 포함하지 않음 |
| 독립 리뷰 | PASS | 2개 결함 수정 후 재리뷰; 지연된 SW 활성화 독립 재현에서도 놀이 유지·종료 후 갱신 확인 |
| 기존 게임 보호 | PASS | `C:\dev\sons-game`의 tracked diff 없음; 시작 때 존재하던 untracked 항목 유지 |

최종 전체 검사 명령은 `npm run check`이며 실행 기록은 [`qa/final-check.log`](../qa/final-check.log), 브라우저 상세 보고서는 로컬 `playwright-report/index.html`에 있다. 반복 실행은 새로운 독립 사례 수로 합산하지 않았다. PNG는 Git에 포함하고 빌드·node_modules·실행 로그·트레이스는 제외한다.

## 화면·조작 QA

| 시나리오 | 결과 |
|---|---|
| 360×800 / 390×844 / 412×915 / 320×568 / 800×1280 | 모두 시작 → 6회 탭 → 합동 축하 → 재시작 통과; 세 카드의 최소 72×88px, 본체 드롭 영역 120×120px 이상, 가로·세로 스크롤 및 카드 겹침 없음 |
| 데스크톱 1280×900 / 1615×1248 | 비모바일 Chromium 컨텍스트에서 안내 오버레이 숨김, 시작 버튼·마우스 드래그·다음 라운드 클릭 통과 |
| 가로 844×390 | 세로 사용 안내 표시; 페이지 손상 없음 |
| 두 번 오답 및 8초 무입력 | 라운드/꽃 그대로 유지, 정답 카드 힌트, 다음 라운드에서 초기화 |
| 실제 touchStart/Move/End/Cancel | 정답 드롭, 영역 밖 복귀, 취소, 오답 복귀 확인; 고스트가 손가락 위 42px에 위치 |
| 12px 미만 움직임, 빠른 연속 탭, 연출 건너뛰기 | 탭 판정, 꽃/다음 라운드 중복 증가 없음; 오래된 타이머로 추가 진행 없음 |
| 드래그 도중 blur | 고스트·드래그 상태 정리 후 다음 탭 정상 |
| 음소거 저장·복원 | 첫 입력 전 AudioContext 생성 없음, 입력 후 tone 생성, gain 상한 0.055, 음소거 후 추가 tone 없음 |
| 음악 및 음소거 분리 | 제공 MP3를 오프라인 캐시에서 fetch하고 시작 탭 후 재생; 음표 버튼은 음소거·복원, 스피커 버튼은 효과음까지 함께 음소거; 두 선택을 각각 저장·복원 |
| 저장/Web Audio 차단 | 무음 기본값으로 6회 완주; 런타임 오류 없음 |
| reduced-motion / 키보드 | 장식 애니메이션 꺼짐, Enter로 음식 주기 성공 |
| 초기 캐시 후 오프라인 reload | 전체 6회 및 축하 화면 통과, 외부 요청 없음 |
| 놀이 중 새로운 SW 설치 | 대기 상태 유지; 종료 화면에서 안전하게 활성화 |
| 시작 버튼 직후 늦은 SW 활성화 | 놀이 도중 reload 없음; 6회 완료 후 새 버전 적용 |

대표 캡처:

- [시작](../qa/screenshots/390-welcome.png), [기본 화면](../qa/screenshots/390-rabbit.png), [입 앞 음식 정렬](../qa/screenshots/390-feeding-mouth.png)
- [토토 반응](../qa/screenshots/390-rabbit-delight.png), [몽몽 반응](../qa/screenshots/390-monkey-delight.png), [팡팡 반응](../qa/screenshots/390-panda-delight.png)
- [작은 화면](../qa/screenshots/320-rabbit.png), [작은 화면 점프](../qa/screenshots/320-rabbit-delight.png), [412px 화면](../qa/screenshots/412-rabbit.png)
- [힌트](../qa/screenshots/390-hint.png), [합동 축하](../qa/screenshots/390-finished.png), [태블릿](../qa/screenshots/800-finished.png), [오프라인 축하](../qa/screenshots/390-offline-finished.png)
- [PC 1280px 시작](../qa/screenshots/desktop-1280-welcome.png), [PC 1615px 시작](../qa/screenshots/desktop-1615-welcome.png), [PC 놀이](../qa/screenshots/desktop-1615-play.png)

눈·코·입 정렬, 종별 실루엣, 음식 이동 목표, 작은 화면 하단 여유, 축하 화면 세 친구 비겹침을 실제 이미지로 확인했다. 작은 화면 점프가 말풍선과 겹치지 않도록 공간과 점프 높이를 조정했다. 이모지를 캐릭터/음식 그래픽으로 사용하지 않는다.

## 발견하고 수정한 문제

1. **PWA 활성화 경쟁 조건:** 업데이트를 요청한 뒤 아이가 시작/재시작하면 Workbox의 늦은 controlling 이벤트가 게임을 새로고침할 수 있었다. `onNeedReload`를 상태로 받아 현재 화면이 welcome/finished일 때만 실제 새로고침한다. 지연된 활성화 회귀 테스트 2개 및 독립 브라우저 재현 통과.
2. **오답 드롭 피드백:** 몸에 놓은 오답 음식 고스트가 즉시 사라졌다. 정답 여부를 반환하여 기존 복귀 애니메이션을 재사용하고, 탭 오답에도 카드의 작은 반동을 추가했다.
3. **작은 화면 연출 여유:** 토토의 점프가 말풍선 꼬리 근처에 닿을 여지가 있었다. 낮은 화면에서는 위 여유를 확보하고 12px의 가벼운 점프로 유지했다.
4. **테스트 캡처 타이밍:** 계속 맥동하는 힌트 버튼의 안정 상태를 기다리던 Playwright가 timeout했다. 실제 화면 좌표로 touch tap을 실행해 검증한다. touchMove의 렌더링 완료와 등장 애니메이션 완료를 기다려 고스트/스크린샷을 검사한다.
5. **PC 가로 화면 차단:** `orientation: landscape`만으로 모든 PC 창에도 회전 안내를 띄워 게임을 가렸다. 안내를 가로 1000px 이하·세로 600px 이하의 작은 화면으로 제한했다. 기존 세로형 데스크톱 검사는 이 오류를 발견하지 못했다. 실제 가로형 PC 크기 2개와 비모바일 컨텍스트로 회귀 검사를 교체했고, 모바일 가로 안내도 유지한다.
6. **글자 가독성:** 10–12px 보조 문구를 14–20px로 키우고 대비를 강화했다. 캐릭터 이름은 말풍선 옆으로 옮기고 말풍선·꽃·소리 버튼을 확대했다. 음식 카드에는 커진 이름을 위한 높이를 추가해 그림 크기를 보존했다. 시작/놀이/완료의 글자 잘림과 이름·말풍선 비겹침을 모바일·PC E2E에서 검사한다. 변경 전후 SVG 크기는 `qa/readability-before.json`, `qa/readability-after.json`으로 비교했다. 6개 화면 크기에서 주요 캐릭터의 실제 배율 차이는 0.5px 미만, 음식 그림 높이 차이는 0.5px였다.

환경 설치 중 Windows ESM 경로/Sharp 패키지 진입점 및 Playwright 브라우저 버전 불일치를 확인해 해결했다. 실제 테스트용 Chromium을 설치했다. 최종 빌드의 앱 아이콘 192px/512px/maskable 및 로컬 리소스 캐싱을 확인했다.

## 80% / 90% 품질 게이트

80% 체크 항목은 모두 PASS: 오류 없이 시작, 큰 재생 버튼으로 첫 조작 도달, 완전한 핵심 루프, 탭/드래그 피드백, 6회 종료, 재시작, 실행 오류 없음, viewport 내 UI, 모바일 조작, 필수 SVG 표시, 긴 설명 없이 그림으로 시작.

90% 체크 항목은 모두 PASS(자동 검증 가능한 범위): 알려진 P0/P1 없음, 대표 E2E, 모바일/데스크톱 검사, 스크린샷 검토, HUD 가림 없음, 실루엣/좌표/스케일 정합, 주요 문구 잘림 없음, 입력 피드백, 무벌점·큰 목표·단일 탭 난이도, 기본 효과음 코드 경로, 재시작 초기화, 빌드/테스트, 독립 저장소의 의도한 변경만 포함.

이는 완성률 측정값이 아니라 공유 스킬의 체크리스트 이름이다. 3세 아이의 실제 반응·체감 난이도·즐거움은 자동 PASS에 포함하지 않는다.

## 남은 문제 / 미검증

- 현재 재현되는 기능 오류는 없다.
- 실제 Android 기기에서의 홈 화면 설치, 주소창/홈 제스처 safe area, 시스템 오디오의 청감·볼륨, 앱 전환 하드웨어 이벤트는 NOT VERIFIED. 브라우저 에뮬레이션과 Web Audio 호출을 검증했다.
- 실제 3세 플레이, 목표 2–4분의 지속 시간, 반복 놀이의 즐거움은 NOT VERIFIED.
- ChatGPT Web/C2C 및 Game Studio가 이 세션에서 호출 불가하여 독립 리뷰 에이전트/Playwright로 대체했다.
- 사용자가 GitHub 연동과 게임 링크 제공을 요청하여 독립 공개 저장소·GitHub Pages 배포를 완료했다. 인터넷 없이 첫 설치는 불가능하며, 미리 캐시한 localhost/HTTPS 환경에서 오프라인 놀이가 가능하다.

## GitHub / 공개 배포 검증

- 저장소: [SeungMin-Park-psm1757/seyeon-animal-restaurant](https://github.com/SeungMin-Park-psm1757/seyeon-animal-restaurant), 공개, 기본 브랜치 `main`.
- 게임: [세연이의 냠냠 동물식당](https://seungmin-park-psm1757.github.io/seyeon-animal-restaurant/), HTTPS.
- 배포 버전: `ae2333441822b3fd9b18dc412ba9c59b69b98206`. 공개 `build-info.json`과 일치했다. 개발 브랜치와 `main`에 같은 커밋을 푸시했다.
- [GitHub Actions 음악 버전 실행](https://github.com/SeungMin-Park-psm1757/seyeon-animal-restaurant/actions/runs/37904418783)과 [최종 저장소 상태 검증 실행](https://github.com/SeungMin-Park-psm1757/seyeon-animal-restaurant/actions/runs/37904468580): 두 번 모두 단위 11개와 E2E 17개를 통과하고 Pages 배포 성공.
- 2026-10-09 17:30 KST 공개 주소에서 Chromium 390×844: HTTP 200, 상단 제목 22px, BGM 재생·음악만 음소거·음소거 복원, 온라인 6회·재시작·오프라인 reload 후 6회와 BGM 재생 통과. Service Worker scope가 게임 하위 경로와 일치하고 console error/pageerror는 빈 배열이었다. 별도 1280×900 PC에서도 시작했다.
- 사용자 제공 `Kickoff Bounce.mp3` (2분50초, 2.79 MB)는 PWA 프리캐시 상한 4 MiB 안에 포함한다. 앱 본체와 함께 최초 온라인 방문 때 저장되면 이후 오프라인 재생이 가능하다.
- 공개 주소의 1280×900 PC에서 회전 안내 없이 시작 통과. Codex 내장 브라우저에서도 공개 시작 화면과 오프라인 준비 안내를 확인했다.
- 근거: [`qa/live-result.json`](../qa/live-result.json), [모바일 놀이](../qa/screenshots/live-390-play.png), [오프라인 완료](../qa/screenshots/live-390-offline-finished.png), [PC 놀이](../qa/screenshots/live-desktop-play.png).
- 재현: `node qa/verify-live.mjs https://seungmin-park-psm1757.github.io/seyeon-animal-restaurant/ ae2333441822b3fd9b18dc412ba9c59b69b98206`.

재현: `npm run check`. 수동 확인: `npm run build` → `npm run preview` → `http://127.0.0.1:4173` → 시작 → 말풍선 음식 탭/드래그 → 꽃 6송이 → 다시 놀기.
