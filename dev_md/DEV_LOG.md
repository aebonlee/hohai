# 개발일지

## 2026-02-20 (Day 1) — 프로젝트 전체 구현

### 작업 내용

#### Phase 1: 프로젝트 초기화 & 기반
- Vite 6 + React 19 + TypeScript 프로젝트 수동 설정 (npm create vite가 비대화형 환경에서 동작하지 않아 수동 구성)
- 패키지 설치: react-router-dom v7, framer-motion v11, react-helmet-async v2, @supabase/supabase-js v2
  - `react-helmet-async`는 React 19 peer dep 미지원으로 `--legacy-peer-deps` 사용
- `tsconfig.json`, `vite.config.ts` 설정 완료
- `vite-env.d.ts` 추가 (CSS Module, import.meta.env 타입 선언)

#### Phase 2: DB 스키마
- `dev_md/migration.sql` 작성
  - 4개 테이블: `hohai_poems`, `hohai_songs`, `hohai_categories`, `hohai_site_config`
  - RLS 정책: 공개 읽기 + 인증 사용자 전체 권한
  - `updated_at` 자동 갱신 트리거
  - 샘플 카테고리 6개 + 샘플 시 3편 삽입

#### Phase 3: 디자인 시스템 & 글로벌 스타일
- CSS 변수 기반 디자인 시스템 구축 (`src/styles/globals.css`)
  - 한지/아이보리 배경, 먹물 텍스트, 수채화 포인트 컬러
  - 한지 질감 `body::before` 텍스처 오버레이
- Google Fonts 로드: Noto Serif KR, Noto Sans KR, Nanum Myeongjo

#### Phase 4: 공통 Layout 컴포넌트
- `Header.tsx` — 상단 고정 네비게이션, 스크롤 시 그림자, 모바일 햄버거 메뉴
- `Footer.tsx` — 브랜드/링크/저작권
- `Layout.tsx` — Outlet 기반 페이지 레이아웃
- `PageTransition.tsx` — framer-motion fade+slideUp 전환
- `ProtectedRoute.tsx` — Supabase Auth 기반 관리자 경로 보호

#### Phase 5: UI 컴포넌트
- `PoemCard` — 파스텔 그라데이션 배경, 호버 효과, 스크롤 fade-in
- `SongCard` — YouTube 썸네일, 클릭 시 인라인 iframe 재생 (lite-youtube 패턴)
- `YouTubeEmbed` — lazy loading YouTube 임베드
- `CategoryFilter` — pill 형태 카테고리 필터

#### Phase 6: 페이지 구현
- **HomePage** — 히어로(캘리그래피 로고 + 대표 시구), 최신 시 3편, 노래 하이라이트, 시인 소개 요약
- **PoemsPage** — 카테고리 필터 + 카드 그리드
- **PoemDetailPage** — 한지 질감, 명조체 타이포, 좌측 세로 장식선, 이전/다음 네비게이션
- **SongsPage** — 2열 카드 그리드, YouTube 임베드
- **AboutPage** — 프로필, 시인의 말 인용 블록, 연락처
- **AdminLoginPage** — 이메일/비밀번호 로그인
- **AdminPage** — 탭 기반 시/노래 CRUD 대시보드 (테이블 + 모달 폼)

#### Phase 7: Hooks
- `useAuth` — Supabase Auth 세션 관리, 로그인/로그아웃
- `usePoems`, `usePoemDetail`, `useFeaturedPoems`, `useAllPoems` — 시 CRUD
- `useSongs`, `useFeaturedSong`, `useAllSongs` — 노래 CRUD
- `useCategories` — 카테고리 목록 조회

#### Phase 8: 마무리
- SEO: react-helmet-async로 각 페이지별 동적 메타 태그
- `vercel.json` SPA rewrite 설정
- `.env.example`, `.gitignore` 설정
- `favicon.svg` 생성 ("호" 한글 아이콘)
- TypeScript 타입체크 통과, Vite 빌드 성공

### 빌드 결과
- `dist/index.html`: 0.85 kB
- `dist/assets/*.css`: 26.51 kB (gzip 5.80 kB)
- `dist/assets/*.js`: 570.09 kB (gzip 172.46 kB)
  - framer-motion이 주된 번들 크기 차지 (추후 code-splitting 고려)

### 남은 작업
- [ ] Supabase에 migration.sql 실행 (테이블 생성)
- [ ] `.env.local`에 실제 Supabase URL/Key 설정
- [ ] Vercel에 프로젝트 연결 및 환경변수 설정
- [ ] DNS CNAME `hohai.dreamitbiz.com` → Vercel 도메인
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드
- [ ] 추후 성능 최적화 (code-splitting, lazy loading)

### 기술적 결정 사항
1. **CSS Modules 채택**: 컴포넌트별 스타일 격리 + CSS 변수로 글로벌 테마 유지
2. **lite-youtube 패턴**: YouTube iframe을 썸네일 클릭 시에만 로드하여 초기 로딩 성능 개선
3. **수동 프로젝트 설정**: create-vite CLI가 비대화형 환경에서 동작하지 않아 package.json부터 수동 작성
4. **--legacy-peer-deps**: react-helmet-async가 아직 React 19 peer dep을 선언하지 않음
