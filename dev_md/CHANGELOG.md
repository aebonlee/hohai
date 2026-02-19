# 개발 변경 이력 (CHANGELOG)

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
