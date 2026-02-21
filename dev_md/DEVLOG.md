# 호해 웹사이트 개발일지

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
