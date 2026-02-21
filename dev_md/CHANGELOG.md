# 개발 변경 이력 (CHANGELOG)

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
