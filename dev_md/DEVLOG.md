# 호해 웹사이트 개발일지

---

## 2026-02-22 — 즐겨찾기 원클릭 추가 UX 개선

### 배경

앨범에서 노래를 들으며 재생목록에 추가할 때, 드롭다운을 열어 목록을 선택하는 과정이 번거로움.
"+" 버튼 클릭 한 번으로 즉시 "즐겨찾기" 재생목록에 추가되도록 개선.

### 변경 내용

- **AddToPlaylist 버튼 분리**: 기존 "+" 하나 → "♡ 즐겨찾기" + "▾ 드롭다운" 2개 버튼
- **즐겨찾기 원클릭 토글**: ♡ 클릭 → 즐겨찾기에 추가 (♥로 변경), 다시 클릭 → 제거
- **자동 생성**: "즐겨찾기" 재생목록이 없으면 첫 클릭 시 자동 생성 + 곡 추가
- **드롭다운 분리**: ▾ 화살표로 다른 재생목록 선택 드롭다운 접근 가능
- **busy 상태**: 중복 클릭 방지 (비동기 완료 전 재클릭 차단)

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/ui/AddToPlaylist.tsx` | ♡/♥ 즐겨찾기 토글 + ▾ 드롭다운 분리, 자동 생성 로직, busy 상태 |
| `src/components/ui/AddToPlaylist.module.css` | `.favBtn`/`.favActive` 하트 스타일, `.moreBtn` 화살표 스타일 |

### 주요 기술 결정

1. **즐겨찾기 이름 매칭** — `playlists.find(p => p.name === '즐겨찾기')`로 식별, 별도 플래그 없이 이름 기반
2. **하트 아이콘** — ♡(빈)/♥(채움) 유니코드 문자 사용, 추가 라이브러리 불필요
3. **버튼 분리** — 주요 액션(즐겨찾기)과 부가 액션(다른 목록)을 시각적으로 분리하여 UX 개선

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (5.16s)

---

## 2026-02-22 — 개인 재생목록(Playlist) 기능 구현

### 배경

사용자가 음악을 재생목록으로 만들어서 이어듣거나 반복해서 들을 수 있는 기능 요청.
Supabase DB 저장 방식으로 로그인 필수, 기기 간 동기화를 지원하며,
여러 개의 재생목록을 이름 지정하여 생성 가능하고, 반복/셔플 재생을 지원한다.

### DB 설계

- `hohai_playlists` 테이블 — `song_ids TEXT[]` 배열 방식 채택
  - 곡 수가 적은 개인 사이트에 적합, 순서 보존, 단일 행 CRUD로 충분
  - RLS 4개 정책 (SELECT/INSERT/UPDATE/DELETE — `auth.uid() = user_id`)
  - `updated_at` 자동 갱신 트리거, `user_id` 인덱스

### 신규 파일 (7개)

| 파일 | 설명 |
|------|------|
| `src/types/playlist.ts` | `Playlist`, `PlaylistInsert`, `PlaylistUpdate` 타입 정의 |
| `src/hooks/usePlaylist.ts` | Supabase CRUD 훅 — fetch/create/update/delete/addSong/removeSong/reorder |
| `src/contexts/PlaylistContext.tsx` | PlaylistProvider — `usePlaylists()` 1회 호출 후 Context로 공유, 비로그인 시 빈 값 반환 |
| `src/components/ui/AddToPlaylist.tsx` | SongCard 제목 옆 "+" 드롭다운 — 재생목록 선택, 이미 추가된 곡 ✓ 표시, 새 재생목록 인라인 생성 |
| `src/components/ui/AddToPlaylist.module.css` | 드롭다운 스타일 — 바깥 클릭 닫기, 인라인 생성 폼 |
| `src/pages/PlaylistPage.tsx` | 재생목록 관리 페이지 — 사이드바 + 곡 그리드, 전체재생/셔플/반복, 이름변경/삭제 |
| `src/pages/PlaylistPage.module.css` | 반응형 레이아웃 — 모바일(768px 이하)에서 사이드바 상단 스택 |

### 수정 파일 (6개)

| 파일 | 변경 내용 |
|------|----------|
| `src/contexts/PlaybackContext.tsx` | `repeatMode` ('none'\|'all'\|'one'), `playShuffled()`, 순환 next/prev, onSongEnd 반복 로직 추가 |
| `src/components/ui/SongCard.tsx` | AddToPlaylist import + `.infoHeader` flex 레이아웃으로 "+" 버튼 삽입 |
| `src/components/ui/SongCard.module.css` | `.infoHeader` flex 스타일 추가 |
| `src/components/layout/Header.tsx` | NAV_ITEMS에 `{ to: '/playlist', label: '재생목록' }` 추가 (앨범별 소개와 감상 후기 사이) |
| `src/App.tsx` | `/playlist` 라우트 추가 (AuthGuard 적용) |
| `src/main.tsx` | PlaylistProvider 래핑 (AuthProvider 안, PlaybackProvider 바깥) |

### PlaybackContext 확장 상세

```typescript
// 신규 필드
repeatMode: 'none' | 'all' | 'one';
setRepeatMode: (mode) => void;
playShuffled: (songs: Song[]) => void;

// onSongEnd 수정 로직
if (repeatMode === 'one') → 같은 곡 재시작 (id null → requestAnimationFrame → 복원)
else if (hasNext) → 다음 곡
else if (repeatMode === 'all') → 첫 곡으로 돌아감
else → 정지

// next/prev 래핑
repeatMode === 'all' → 마지막↔첫곡 순환
```

### PlaylistPage 레이아웃

```
┌──────────────────────────────────────────────┐
│  내 재생목록                                  │
│  나만의 음악 재생목록을 만들어 보세요          │
├────────────┬─────────────────────────────────┤
│ 사이드바    │  선택된 재생목록                 │
│            │  ▶전체재생 🔀셔플 🔁반복         │
│ ♫ 드라이브 │  이름변경  삭제                  │
│ ♫ 밤에듣기 │  ┌────────┐ ┌────────┐         │
│            │  │SongCard│ │SongCard│  ...     │
│ + 새 목록  │  │   ✕    │ │   ✕    │         │
│            │  └────────┘ └────────┘         │
└────────────┴─────────────────────────────────┘
모바일(<768px): 사이드바가 위에 가로 pill 형태로 스택
```

### 주요 기술 결정

1. **song_ids TEXT[] 배열** — 별도 조인 테이블 없이 단일 행으로 곡 순서 관리. 개인 사이트 규모에 최적
2. **PlaylistContext 분리** — usePlaylist 훅을 1회만 호출하고 Context로 공유하여 N+1 쿼리 방지
3. **Provider 순서** — AuthProvider > PlaylistProvider > PlaybackProvider (PlaylistContext가 Auth를 의존)
4. **repeat 'one' 모드** — 같은 곡 ID를 null → requestAnimationFrame → 복원하여 useEffect 재트리거
5. **Fisher-Yates 셔플** — playShuffled에서 배열 복사 후 셔플, 원본 불변
6. **비로그인 처리** — AddToPlaylist "+" 클릭 시 `/login`으로 이동, `/playlist` 페이지는 AuthGuard로 보호

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (8.22s)

---

## 2026-02-22 — 해시태그 클릭 네비게이션 + 음악 동시재생 방지

### 배경

1. 시를 보다가 해시태그를 클릭하면 해당 태그의 시 목록을 바로 볼 수 있도록 개선 필요.
   기존에는 태그가 단순 텍스트로만 표시되어 상호작용 불가했음.
2. 모바일에서 노래 카드를 연속 클릭하면 여러 곡이 동시에 재생되는 문제 발견.
   YouTube/Suno iframe이 각 SongCard 내 독립 state로 관리되어 글로벌 제어 불가했음.

### 기능 1: 해시태그 클릭 → 관련 시 목록

- **PoemDetailPage** — `<span>` 태그를 `<Link to="/poems?tag=태그명">`으로 교체
- **PoemCard** — 카드 전체 클릭(상세 이동)과 태그 클릭(필터 이동) 분리. `stopPropagation()`으로 이벤트 버블링 방지
- **CSS** — 태그 hover 시 색상 진해짐 + 살짝 올라감 (PoemDetailPage), underline (PoemCard)
- **FeaturedPoemsPage CSS** — 태그 필터 배너(`.tagFilter`) 스타일 추가. 기존 JS 로직은 이미 `?tag=` URL 파라미터 지원하고 있었으나 CSS가 빠져 있었음

### 기능 2: 음악 동시재생 방지 (싱글 플레이백)

- **PlaybackContext** (신규) — `currentId`로 현재 재생 곡 ID를 전역 추적. `play(songId)` 호출 시 자동으로 이전 곡 대체
- **main.tsx** — `PlaybackProvider`로 앱 전체 감싸기
- **SongCard** — 모든 재생 버튼(YouTube 재생, Suno 재생, 가사 플레이어 열기)에서 `play(song.id)` 호출. `useEffect`로 `currentId`가 다른 곡으로 변경되면 해당 카드의 iframe 자동 언마운트(정지)

### 변경 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/contexts/PlaybackContext.tsx` | 신규 | 전역 재생 상태 Context (currentId, play, stop) |
| `src/main.tsx` | 수정 | PlaybackProvider 추가 |
| `src/components/ui/SongCard.tsx` | 수정 | usePlayback 훅 연동, 재생 핸들러 분리, useEffect로 타 곡 재생 시 자동 정지 |
| `src/pages/PoemDetailPage.tsx` | 수정 | 태그 `<span>` → `<Link>` 교체 |
| `src/pages/PoemDetailPage.module.css` | 수정 | `.tag` hover 스타일 추가 |
| `src/components/ui/PoemCard.tsx` | 수정 | 태그 개별 클릭 + stopPropagation 처리 |
| `src/components/ui/PoemCard.module.css` | 수정 | `.tagLink` 스타일 추가 |
| `src/pages/FeaturedPoemsPage.module.css` | 수정 | `.tagFilter`, `.tagFilterLabel`, `.tagFilterClear` 스타일 추가 |

### 주요 기술 결정

1. **React Context 패턴** — 음악 재생 상태를 props drilling 없이 전역 관리. 각 SongCard가 독립적으로 구독
2. **iframe 언마운트 방식** — YouTube/Suno iframe은 postMessage API가 불안정하므로, state를 false로 전환하여 iframe 자체를 DOM에서 제거하는 방식으로 정지 처리
3. **encodeURIComponent** — 한글 태그명을 URL 파라미터로 안전하게 전달
4. **stopPropagation** — PoemCard 전체 클릭(navigate to detail)과 태그 클릭(navigate to filter)의 이벤트 충돌 방지

### 검증 결과

- `npx tsc --noEmit` — 통과

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
