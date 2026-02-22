# 개발 변경 이력 (CHANGELOG)

## 2026-02-22 — 시 해시태그 카테고리 미연결 시 클릭 비활성화

### 변경
- PoemCard: 카테고리에 해당하는 태그만 클릭 가능 (tagLink), 나머지 일반 텍스트 (tag)
- PoemDetailPage: 카테고리 태그만 `<Link>`, 나머지 `<span>` (tagPlain)
- CSS: `.tag` (PoemCard), `.tagPlain` (PoemDetailPage) 비활성 스타일 추가

---

## 2026-02-22 — 재생목록 전체재생/셔플 시 반복 모드 자동 설정

### 변경
- PlaylistPage: 전체재생/셔플 시 `setRepeatMode('all')` 자동 호출 (마지막 곡 후 순환)

---

## 2026-02-22 — 재생목록 곡 클릭 시 이어듣기 연동

### 추가
- SongCard에 `contextPlaylist` prop — 재생 시 자동으로 PlaybackContext playlist 세팅
- PlaylistPage에서 SongCard에 재생목록 곡 배열 전달

### 변경
- SongCard: 재생 핸들러에 `playWithContext()` 래핑 (contextPlaylist → setPlaylist → play)

---

## 2026-02-22 — 즐겨찾기 추가 버그 수정

### 수정
- AddToPlaylist: 재생목록 생성 시 `song_ids: [songId]` 직접 포함 (레이스 컨디션 해결)
- PlaylistContext: 로그인 상태 변경 시 `refetch()` 호출 (로그인 후 재생목록 미표시 해결)

---

## 2026-02-22 — 즐겨찾기 원클릭 추가 UX 개선

### 변경
- AddToPlaylist: "+" 버튼 → ♡ 즐겨찾기 토글 + ▾ 드롭다운 분리
- 즐겨찾기 재생목록 자동 생성 (첫 클릭 시)
- 하트 아이콘 토글 (♡↔♥), busy 상태 중복 클릭 방지
- CSS: `.favBtn`/`.favActive` 하트 스타일, `.moreBtn` 화살표 스타일

---

## 2026-02-22 — 개인 재생목록(Playlist) 기능

### 추가
- `hohai_playlists` Supabase 테이블 — `song_ids TEXT[]` 배열, RLS 4정책, user_id 인덱스
- `Playlist` / `PlaylistInsert` / `PlaylistUpdate` 타입 (`src/types/playlist.ts`)
- `usePlaylists()` 훅 — fetch/create/update/delete/addSong/removeSong/reorder (`src/hooks/usePlaylist.ts`)
- `PlaylistContext` / `PlaylistProvider` — 전역 재생목록 상태 공유, 비로그인 시 빈 값 (`src/contexts/PlaylistContext.tsx`)
- `AddToPlaylist` 컴포넌트 — SongCard "+" 드롭다운, 재생목록 선택/생성 (`src/components/ui/AddToPlaylist.tsx`)
- `PlaylistPage` — 사이드바 + 곡 그리드, 전체재생/셔플/반복/이름변경/삭제 (`src/pages/PlaylistPage.tsx`)
- PlaybackContext에 `repeatMode` ('none'|'all'|'one'), `playShuffled()`, 순환 next/prev 추가

### 변경
- SongCard: `.infoHeader` flex 레이아웃 + AddToPlaylist "+" 버튼 삽입
- Header NAV_ITEMS: "재생목록" 항목 추가 (앨범별 소개와 감상 후기 사이)
- App.tsx: `/playlist` 라우트 (AuthGuard)
- main.tsx: PlaylistProvider 래핑 (AuthProvider > PlaylistProvider > PlaybackProvider)

---

## 2026-02-22 — 해시태그 클릭 네비게이션 + 음악 동시재생 방지

### 추가
- `PlaybackContext` — 전역 음악 재생 상태 Context (currentId, play, stop)
- PoemDetailPage 태그 클릭 → `/poems?tag=태그명` 네비게이션
- PoemCard 태그 개별 클릭 지원 (카드 클릭과 분리)
- FeaturedPoemsPage 태그 필터 배너 CSS 스타일

### 변경
- SongCard: 재생 버튼에 PlaybackContext 연동, 다른 곡 재생 시 자동 정지 (iframe 언마운트)
- main.tsx: PlaybackProvider 추가
- PoemDetailPage.module.css: `.tag` hover 효과 (색상 진해짐 + translateY)
- PoemCard.module.css: `.tagLink` 스타일 (hover underline)

---

## 2026-02-22 — 시(Poem) 무드 기반 배경 디자인

### 추가
- `MOOD_LIGHT_GRADIENTS` — 무드별 밝은 4색 그라디언트 (시 상세 페이지 배경용)
- `MOOD_CARD_GRADIENTS` — 무드별 2색 그라디언트 (시 카드 배경용)
- `MOOD_ACCENT_COLORS` — 무드별 장식 색상 (장식선, 태그 배경 등)
- PoemEffects 컴포넌트 — 시 상세 페이지 Canvas 배경 효과 (LyricsEffects 재활용, opacity 0.3)

### 변경
- PoemDetailPage: 카테고리 기반 무드 그라디언트 배경 + 무드별 장식선/태그 색상
- PoemCard: `CARD_GRADIENTS[bg_theme]` → `MOOD_CARD_GRADIENTS[category]` (카테고리별 고유 색상)
- LyricsEffects: draw 함수·헬퍼 export (PoemEffects 재활용)

---

## 2026-02-21 (9차) — 관리자 페이지 와이드 레이아웃 (1400px)

### 변경
- `.content`: `max-width: var(--max-width)` (1100px) 제거 → 전체 너비 사용
- `.main`: padding 32px → 40px, `max-width: 1400px` 설정
- `.titleCell`: `max-width` 250px → 400px (넓은 화면에서 제목 표시 확대)

---

## 2026-02-21 (8차) — 관리자 페이지 리디자인: 대시보드 + 사이드바 메뉴

### 추가
- DashboardAdmin 컴포넌트 — 시/노래/시리즈/후기 4개 통계 카드, 클릭 시 해당 탭 이동
- 좌측 사이드바 메뉴 — 5개 그룹(대시보드, 시, 노래, 커뮤니티, 도구)으로 메뉴 정리
- DataManageAdmin 컴포넌트 — 위험 영역(빨간 경고) 데이터 삭제 전용
- 모바일 반응형 — 768px 이하에서 사이드바 → 드롭다운 메뉴 전환

### 변경
- Tab 타입: `'categories'` → `'poem-categories'`, `'db-init'` → `'batch-seed'` + `'data-manage'`
- 기본 탭: `'poems'` → `'dashboard'`
- 수평 탭 7개 → 사이드바 그룹 메뉴 9개로 재구성
- DbInitAdmin → BatchSeedAdmin (일괄 등록) + DataManageAdmin (데이터 관리) 분리
- `.content` 레이아웃: 단일 컬럼 → `flex` (사이드바 240px + 메인)

### 제거
- `.tabs` / `.tab` CSS 클래스 (수평 탭 스타일 제거)

---

## 2026-02-21 (6차) — 추천 시 페이지 is_featured 기반 필터링

### 변경
- `usePoems` 훅에 `featuredOnly` 파라미터 추가 — `is_featured = true` 필터 지원
- FeaturedPoemsPage에서 `featuredOnly=true` 전달하여 추천 시만 표시
- 빈 상태 메시지: "아직 추천 시가 없습니다" / "이 카테고리에 추천 시가 없습니다"
- AdminPage 시 편집 폼 체크박스 라벨: "대표 시" → "추천"
- AdminPage 시 목록 테이블에 "추천" 컬럼 추가 (⭐ 표시)

---

## 2026-02-21 (5차) — 감상 후기 게시판 시스템 구현

### 추가
- `hohai_reviews` 테이블 마이그레이션 SQL (user_id FK, RLS 정책 3개)
- `useAllReviews()` Admin 훅 — 전체 후기 조회/수정/삭제
- ReviewsPage 로그인 필수 작성, 피드백 메시지, 본인 삭제 기능
- AdminPage 후기 관리 탭 — 공개/비공개 토글 + 삭제

---

## 2026-02-21 (4차) — 추천 시 페이지 카테고리별 그룹 표시 + PoemCard 태그 표시

### 추가
- FeaturedPoemsPage 카테고리별 그룹 섹션 표시 (전체 보기 시)
- FeaturedPoemsPage 카테고리 통계 바 (카테고리별 시 수 칩)
- PoemCard 태그 표시 (해시태그 목록)

---

## 2026-02-21 (3차) — 시 177편 카테고리 분류 + 해시태그 등록 + Admin 관리 강화

### 추가
- `src/data/poem-categories.ts` — 177편 전체 시 카테고리(9개) + 태그(3~5개) 분류 데이터
- AdminPage 카테고리/태그 일괄 업데이트 버튼 — 기존 시의 분류만 일괄 변경
- AdminPage 카테고리 현황 보기 — 카테고리별 시 수 통계 + 인기 태그 TOP 20
- PoemsAdmin 카테고리 필터 + 제목/태그 검색 기능
- PoemsAdmin 카테고리별 통계 바 (색상 배지, 클릭 필터)
- PoemsAdmin 태그 컬럼 (시 목록에 해시태그 표시)
- CategoryFilter 카테고리별 색상 dot + 활성 배경 색상
- PoemCard, PoemDetailPage 카테고리 색상 적용

### 변경
- `CATEGORY_COLORS` 6개 → 9개 카테고리 (사랑, 그리움, 작별, 추억, 인생, 가족, 자연, 세상, 의지)
- PoemsAdmin 카테고리 input → select 드롭다운 (오타 방지)
- handleSeedPoems 시 등록 시 분류 데이터 자동 반영

---

## 2026-02-21 (2차) — DB 초기화 + 시 177편 일괄 등록

### 추가
- AdminPage 'DB 초기화' 탭 — 전체 삭제 / 시 일괄 등록 기능
- `src/data/poems.ts` — poem.pdf에서 파싱한 好海 이성헌 '3차 퇴고 완성작' 177편 시 데이터
- DbInitAdmin 컴포넌트 — 실시간 로그 패널 포함

---

## 2026-02-21 — 샘플 데이터 제거 + 실제 데이터 전용 전환

### 제거
- `src/lib/sampleData.ts` 삭제 (하드코딩 샘플 시 10편, 노래 20곡, 시리즈 10개, 카테고리 6개, 리뷰 5개)
- 모든 Hooks (usePoems, useSongs, useSeries, useReviews, useCategories)에서 샘플 데이터 fallback 로직 제거

### 추가
- `useAllCategories()` Admin hook — 카테고리 CRUD (생성/수정/삭제)
- AdminPage 카테고리 관리 탭 — 5번째 탭으로 카테고리 등록/수정/삭제 UI

### 변경
- Supabase 데이터가 없을 때 빈 목록을 표시하도록 변경 (기존: 샘플 데이터 표시)

---

## 2026-02-20 — 프로젝트 초기화 (Phase 1)

### 추가
- Vite + React + TypeScript 프로젝트 초기화
- React Router v7 라우팅 설정
- Supabase 클라이언트 초기화 (`src/lib/supabase.ts`)
- 글로벌 CSS 변수 및 디자인 시스템 (`src/styles/globals.css`, `src/styles/fonts.css`)
- 공통 Layout 컴포넌트 (Header, Footer, MobileMenu)
- 모든 페이지 뼈대: HomePage, PoemsPage, PoemDetailPage, SongsPage, AboutPage, AdminPage, AdminLoginPage
- UI 컴포넌트: PoemCard, SongCard, YouTubeEmbed, CategoryFilter
- Custom Hooks: usePoems, useSongs, useCategories, useAuth
- 관리자 CRUD 대시보드 + ProtectedRoute
- Supabase DB 마이그레이션 SQL 파일
- SEO 메타 태그 (react-helmet-async)
- Vercel 배포 설정 (vercel.json)
- 개발 문서 (dev_md/ 폴더)

### 기술 스택
- React 19 + Vite 6 + TypeScript
- React Router v7
- Supabase (공유 DB, hohai_ prefix 테이블)
- framer-motion (애니메이션)
- react-helmet-async (SEO)
- 순수 CSS (CSS 변수 + CSS Modules)
