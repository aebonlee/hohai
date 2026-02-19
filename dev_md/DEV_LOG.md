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

---

## 2026-02-20 (Day 1, 2차) — 커밋/푸시 확인 & 빌드 검증

### Git 상태
- 커밋 `ce72cf3`: 57개 파일, 6,469줄 추가 → `origin/main` 푸시 완료
- 워킹 트리 clean 상태 확인

### 빌드 재검증
- `npx vite build` 성공 (8.61s)
- 출력: index.html 0.85kB, CSS 26.51kB, JS 570.09kB (gzip 172.46kB)

### Vercel 배포 상태
- Vercel CLI 토큰 만료 → CLI 배포 불가
- **해결 방안**: Vercel 대시보드에서 GitHub 레포 연결하여 자동 배포 설정 필요
  1. vercel.com → New Project → Import `aebonlee/hohai`
  2. Framework Preset: Vite
  3. 환경변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
  4. Deploy → 도메인 `hohai.dreamitbiz.com` 연결

### 이슈: 메인 페이지 빈 화면
- `hohai.dreamitbiz.com`에서 아무것도 안 보이는 문제 보고됨
- **원인 추정**: Vercel에 아직 React 앱이 배포되지 않았거나, 환경변수 미설정
- **확인 사항**:
  1. Vercel에 새 프로젝트가 정상 배포되었는지 확인
  2. `.env.local` (또는 Vercel 환경변수)에 Supabase 키가 설정되었는지 확인

---

## 2026-02-20 (Day 1, 3차) — 배포 전환: Vercel → GitHub Pages

### 배포 방식 변경
- **사유**: 사용자가 Vercel 계정 사용을 원치 않음, `www.dreamitbiz.com`과 동일한 방식(GitHub Pages) 요청
- Vercel 프로젝트 삭제 (`npx vercel rm hohai`)
- `vercel.json` 삭제

### GitHub Pages 배포 설정
- `.github/workflows/deploy.yml` 추가 — GitHub Actions 자동 배포
  - `actions/deploy-pages@v4` 사용
  - 빌드 시 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 GitHub Secrets에서 주입
- `package.json` build 스크립트에 `cp dist/index.html dist/404.html` 추가 (SPA 라우팅 지원)
- `public/CNAME` 추가 → 빌드 시 `dist/CNAME`에 자동 포함
- `.npmrc` 추가 (`legacy-peer-deps=true`) → CI 환경에서도 react-helmet-async 설치 가능

### 배포 결과
- GitHub Actions 워크플로우 `Deploy to GitHub Pages #1` — **28초 만에 성공**
- URL: `https://hohai.dreamitbiz.com` (기존 DNS CNAME 그대로 사용)

### 남은 작업 (업데이트)
- [x] ~~Vercel에 프로젝트 연결~~ → GitHub Pages로 전환 완료
- [x] ~~DNS CNAME 변경~~ → 기존 GitHub Pages CNAME 그대로 유지
- [ ] GitHub 레포 Settings → Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
- [ ] Supabase에 migration.sql 실행 (테이블 생성)
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드

---

### 기술적 결정 사항
1. **CSS Modules 채택**: 컴포넌트별 스타일 격리 + CSS 변수로 글로벌 테마 유지
2. **lite-youtube 패턴**: YouTube iframe을 썸네일 클릭 시에만 로드하여 초기 로딩 성능 개선
3. **수동 프로젝트 설정**: create-vite CLI가 비대화형 환경에서 동작하지 않아 package.json부터 수동 작성
4. **--legacy-peer-deps**: react-helmet-async가 아직 React 19 peer dep을 선언하지 않음
5. **GitHub Pages 배포**: Vercel 대신 GitHub Pages + GitHub Actions 사용 (www.dreamitbiz.com과 동일 방식)
