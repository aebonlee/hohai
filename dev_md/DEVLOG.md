# 호해 웹사이트 개발일지

---

## 2026-02-22 — 시(Poem) 무드 기반 배경 디자인

### 배경

LyricsPlayer(노래)에 무드 기반 배경 + Canvas 시각 효과를 구현한 데 이어,
시(Poem) 페이지에도 카테고리/무드에 어울리는 배경을 적용.
기존에는 일반 밝은 배경(`#F3F7FD`)에 골드 장식선만 있었고,
PoemCard는 바다 톤 8개 그라디언트(`CARD_GRADIENTS`)로 카테고리와 무관한 색상 사용.

### 핵심 방향

- **PoemDetailPage**: 밝은 톤 무드 그라디언트 배경 + 은은한 Canvas 효과 + 무드별 장식선
- **PoemCard**: 카테고리 기반 무드 그라디언트로 교체 (시각적 구분 강화)
- **가독성 최우선**: 시는 읽는 콘텐츠 → 어두운 텍스트 + 밝은 배경 유지

### 변경 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/lib/mood.ts` | 수정 | `MOOD_LIGHT_GRADIENTS` (밝은 4색), `MOOD_CARD_GRADIENTS` (카드 2색), `MOOD_ACCENT_COLORS` (장식색) 추가 |
| `src/components/ui/PoemEffects.tsx` | 신규 | 시 상세 페이지용 은은한 Canvas 효과 (LyricsEffects draw 함수 재활용, opacity 0.3) |
| `src/components/ui/LyricsEffects.tsx` | 수정 | `DRAW_FNS`, `initParticles`, `rand`, `PARTICLE_COUNT` export 추가 (PoemEffects 재활용용) |
| `src/pages/PoemDetailPage.module.css` | 수정 | CSS 변수 기반 그라디언트 배경 + 장식선 `var(--mood-accent)` + 태그 `color-mix()` |
| `src/pages/PoemDetailPage.tsx` | 수정 | 카테고리→MoodKey 감지, CSS 변수 설정, `<PoemEffects>` 렌더 |
| `src/components/ui/PoemCard.tsx` | 수정 | `CARD_GRADIENTS[bg_theme]` → `MOOD_CARD_GRADIENTS[category]` 교체 (fallback 유지) |

### 무드별 색상 설계

| 무드 | 페이지 배경 톤 | 카드 그라디언트 | 장식색 |
|------|---------------|----------------|--------|
| 사랑 | 소프트 코랄/피치 | #F0C8C0 → #D4847A | #D4847A |
| 그리움 | 쿨 라이트 블루 | #B8D4F0 → #7BAFD4 | #7BAFD4 |
| 작별 | 소프트 라벤더 | #E0C4D8 → #C88FA8 | #C88FA8 |
| 추억 | 소프트 피치/앰버 | #F0D4B8 → #E8A87C | #E8A87C |
| 인생 | 소프트 딥블루 | #A8C8E8 → #4A90B8 | #4A90B8 |
| 가족 | 소프트 그린 | #B8E0C4 → #8FC49A | #8FC49A |
| 자연 | 소프트 틸 | #A8DCD4 → #5ABAC4 | #5ABAC4 |
| 세상 | 소프트 퍼플 | #CCC0D8 → #A0889C | #A0889C |
| 의지 | 소프트 앰버/골드 | #E8D4A0 → #D4A85A | #D4A85A |

### 주요 기술 결정

1. **LyricsEffects draw 함수 재활용** — 10개 무드별 draw 함수를 export하여 PoemEffects에서 import, 코드 중복 제거
2. **Canvas opacity 0.3** — 밝은 배경 위에서 시 텍스트 가독성 보장하면서 은은한 시각 효과 제공
3. **CSS custom properties** — `--poem-bg1`~`--poem-bg4`, `--mood-accent`를 인라인으로 설정하여 무드별 동적 스타일링
4. **`color-mix(in srgb)`** — 태그 배경에 무드 강조색 10%만 혼합하여 미묘한 색상 구분
5. **카테고리 직접 매핑** — `poem.category`가 9개 카테고리 중 하나이므로 `detectMood(tags)` 대신 직접 MoodKey로 사용

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (6.80s)

---

## 2026-02-22 — 가사 플레이어 오버레이 (LyricsPlayer) 구현

### 작업 내용

SongCard에서 노래 재생 시 **풀스크린 오버레이**로 열리는 몰입형 가사 플레이어를 구현.
네이비~바다색 그라디언트 배경 + 좌우 분할 레이아웃(왼쪽 플레이어, 오른쪽 가사).

### 변경 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/components/ui/LyricsPlayer.tsx` | 신규 | 풀스크린 오버레이 컴포넌트 (createPortal, framer-motion) |
| `src/components/ui/LyricsPlayer.module.css` | 신규 | 그라디언트 배경 애니메이션 + 글래스모피즘 + 반응형 |
| `src/components/ui/SongCard.tsx` | 수정 | "가사 플레이어" 버튼 + LyricsPlayer 렌더 추가 |
| `src/components/ui/SongCard.module.css` | 수정 | `.lyricsActions`, `.lyricsPlayerBtn` 스타일 추가 |
| `dev_md/LYRICS_PLAYER.md` | 신규 | LyricsPlayer 기술 문서 |

### 주요 기술 결정

1. **createPortal** — 프로젝트에 모달/포탈 시스템이 없었으므로 `document.body`에 직접 포탈 렌더
2. **가사 표시 방식** — 타임스탬프 없는 순수 텍스트이므로 싱크 없이 정적 표시 + 사용자 스크롤
3. **배경 디자인** — 프로젝트 디자인 시스템의 네이비 계열(#071A33, #0A3D7A, #1466A8, #0D5699) 활용
4. **접근성** — role="dialog", aria-modal, ESC 닫기, 포커스 트랩, 스크롤 잠금 구현
5. **레이아웃** — CSS Grid 1fr 1fr, 모바일(<=768px)에서 1fr 상하 스택

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (15.75s)
