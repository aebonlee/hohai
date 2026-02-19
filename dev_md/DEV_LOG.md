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

## 2026-02-20 (Day 1, 4차) — 바다/파도 테마 전면 적용

### 배경
- 호해(好海)의 뜻이 "바다를 사랑하다"이며, 시인이 파도와 바다 배경을 좋아함
- 기존 "한지 위의 먹물과 수채화" 컨셉 → **"바다와 파도의 시"** 컨셉으로 전면 전환

### 변경 내역

#### 색상 팔레트 변경 (`globals.css`)
| 항목 | 기존 (한지) | 변경 (바다) |
|------|------------|------------|
| 배경 | `#FAF6F0` 아이보리 | `#F0F6FA` 바다안개 |
| 보조배경 | `#F3EDE4` 베이지 | `#E4EEF5` 연한 하늘 |
| 텍스트 | `#2C2420` 먹물 | `#1B3A5C` 깊은 바다 |
| 보조텍스트 | `#6B5E54` 갈색 | `#3D6B8A` 바다 중층 |
| 포인트1 | `#C4956A` 황토 | `#2C8E96` 깊은 파도 |
| 포인트2 | `#8FA89A` 세이지 | `#5ABAC4` 밝은 파도 |
| 포인트3 | `#9BB5C9` 하늘 | `#4A90B8` 바다 하늘 |
| 포인트4 | `#B0879B` 자두 | `#D4847A` 노을 |

#### 카드 그라데이션 변경 (`constants.ts`)
- 8가지 프리셋을 모두 바다/파도/하늘/모래 계열로 교체
- 얕은 바다, 푸른 하늘, 청록 파도, 깊은 바다, 수평선, 노을빛 바다, 해변 모래, 파도 거품

#### 히어로 섹션 (`HomePage`)
- 배경 그라데이션: 바다빛 teal/blue 계열로 변경
- **파도 SVG 애니메이션** 추가 (하단에 반복 물결 패턴, 8초 주기)
- 호해 로고 아래 `好海 — 바다를 사랑하다` 부제 추가
- 히어로 시구: "파도가 밀려오듯 / 시가 가슴에 닿고 / 바다가 노래합니다"

#### 시인 소개 (`AboutPage`)
- 호(號) 설명: `호해(好海) — 바다를 사랑하다`
- 시인의 말: 바다/파도 비유로 전면 재작성
- 프로필 소개문도 바다 테마로 수정

#### 텍스처 오버레이
- 한지 질감 → 파도 물결 텍스처 (turbulence 패턴) 변경

#### 파비콘
- 기존: "호" 글자 → 변경: "海" 글자 + 파도 SVG 패턴

#### 전체 UI rgba 색상값
- 모든 CSS Module 파일의 `rgba(163, 148, 133, ...)` (갈색 계열) → `rgba(27, 58, 92, ...)` (바다 계열)로 일괄 변경
- Header, Footer, PoemDetail, About, Admin, CategoryFilter 등 13개 파일 수정

### 빌드 결과
- TypeScript 타입체크 통과, Vite 빌드 성공 (13.78s)

---

---

## 2026-02-20 (Day 1, 5차) — 배포 문제 해결: gh-pages 브랜치 방식

### 문제
- `hohai.dreamitbiz.com`에서 빈 페이지만 표시됨
- **원인**: GitHub Pages가 `main` 브랜치를 소스로 사용 중 → 빌드된 JS/CSS 에셋이 없는 소스코드가 서빙됨
- `dist/assets/index-*.js` 요청 시 404 반환 확인

### 해결
- `actions/deploy-pages` (GitHub Actions 소스) → `peaceiris/actions-gh-pages` (gh-pages 브랜치 소스)로 변경
- `gh-pages` npm 패키지 설치, `npm run deploy` 스크립트 추가
- `npx gh-pages -d dist`로 로컬에서 즉시 배포 실행
- GitHub 레포 Settings → Pages → Source를 `gh-pages` 브랜치로 변경 필요

### 워크플로우 변경
```
기존: actions/upload-pages-artifact + actions/deploy-pages (Actions 소스 필요)
변경: peaceiris/actions-gh-pages@v4 (gh-pages 브랜치에 push, 전통적 방식)
```

---

### 기술적 결정 사항
1. **CSS Modules 채택**: 컴포넌트별 스타일 격리 + CSS 변수로 글로벌 테마 유지
2. **lite-youtube 패턴**: YouTube iframe을 썸네일 클릭 시에만 로드하여 초기 로딩 성능 개선
3. **수동 프로젝트 설정**: create-vite CLI가 비대화형 환경에서 동작하지 않아 package.json부터 수동 작성
4. **--legacy-peer-deps**: react-helmet-async가 아직 React 19 peer dep을 선언하지 않음
5. **GitHub Pages 배포**: gh-pages 브랜치 방식 (peaceiris/actions-gh-pages)
6. **바다/파도 테마**: 호해(好海)의 의미에 맞춰 전체 색상/분위기를 바다 컨셉으로 전환

---

## 2026-02-20 (Day 1, 6차) — 색상 채도 강화

### 문제
- 바다 테마 적용 후 "컬러가 흐릿하다"는 피드백

### 변경 내역
- 텍스트 색상 명도 낮춤 (더 진하게): `#1B3A5C` → `#0F2B47`, `#3D6B8A` → `#2B5578`
- 포인트 색상 채도 강화: `#2C8E96` → `#1A7A82`, `#5ABAC4` → `#38A8B5`
- 그림자 진하게 조정
- 카드 그라데이션 색상도 더 선명하게 교체

---

## 2026-02-20 (Day 1, 7차) — UI 대폭 개선: 파도 수정, 배경 강화, 샘플 데이터, 메뉴 개선

### 사용자 피드백
1. "배경에 파도가 보이는데 연결되지 않고 잘려보이네" — 파도 애니메이션이 끊김
2. "배경도 밋밋하고" — 전체적으로 시각적 깊이 부족
3. "메뉴도 조금 더 나눠서 만들어야 할 것 같고" — 네비게이션 구조 단순함
4. "내가 처음 개발하라고 한 게시판들은 아직 구현이 안되었네" — 페이지가 빈 상태

### 변경 내역

#### 1. 파도 애니메이션 수정 (`HomePage.module.css`)
- **원인**: `::after` 요소 너비가 110%로, `translateX(-1440px)` 시 화면 밖으로 나가서 빈 공간 발생
- **해결**: 너비를 `calc(100% + 1440px)`으로 확장하여 끊김 없는 무한 루프 구현
- **추가**: 3중 파도 레이어 적용
  - `::before` — 뒤쪽 느린 파도 (12초 주기, 반투명 파란색)
  - `::after` — 앞쪽 빠른 파도 (8초 주기, 메인 파도)
  - `.heroWaveMid` — 중간 파도 (10초 주기, 청록색)
- 각 레이어에 서로 다른 SVG 파형 패턴, 다른 속도로 깊이감 표현

#### 2. 배경 강화
- **히어로 배경**: 그라데이션을 5중 radial-gradient로 강화, 노을빛 포인트 추가
- **글로벌 배경**: 하단 물결 장식 (`body::after`) 추가 — 페이지 전체에 은은한 바다 분위기
- **섹션 배경**: 최신 시, 노래, 시인소개 각 섹션에 gradient 배경과 상단 장식선(accent 색상) 적용
- 텍스처 오버레이 opacity 0.03 → 0.04 미세 강화

#### 3. 메뉴/네비게이션 개선 (`Header.tsx`, `Header.module.css`)
- 각 메뉴 항목에 아이콘 이모지 추가 (🏠 홈, 📝 시, 🎵 노래, 👤 시인 소개)
- 네비게이션 바 스타일 변경: 플랫 텍스트 → pill-style 탭 형태
  - 배경색이 있는 라운드 영역 안에 메뉴 항목 배치
  - 활성 탭: 청록 배경 강조 + 굵은 글씨
  - 호버: 배경색 변화 효과
- 모바일 메뉴에도 아이콘 추가, 활성 시 들여쓰기 효과

#### 4. 샘플 데이터 추가 (`sampleData.ts`)
- Supabase DB 미연결 상태에서도 콘텐츠가 표시되도록 폴백 데이터 구현
- **샘플 시 6편**: 파도에게, 바다의 노래, 그리운 계절, 봄바다, 등대, 바다와 사랑
  - 각각 다른 카테고리 (자연, 그리움, 계절, 인생, 사랑)
  - 실제 시처럼 연 구분, 시적 표현 사용
- **샘플 노래 4곡**: 파도의 노래, 수평선 너머, 갈매기의 꿈, 해변의 추억
- **샘플 카테고리 6개**: 사랑, 자연, 계절, 인생, 그리움, 기타
- Hooks (`usePoems`, `useSongs`, `useCategories`) 수정: Supabase 응답이 비어있으면 자동으로 샘플 데이터 사용

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공 (9.40s)
- CSS: 29.73 kB (gzip 6.58 kB), JS: 576.75 kB (gzip 174.84 kB)

### 남은 작업
- [ ] Supabase에 migration.sql 실행 (테이블 생성) — 테이블 생성 후 실제 데이터로 자동 전환됨
- [ ] GitHub Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드
- [ ] YouTube 노래 영상의 실제 youtube_id로 교체
- [ ] 추후 성능 최적화 (code-splitting, lazy loading)

---

## 2026-02-20 (Day 1, 8차) — 고대비 컬러 + 부드러운 파도 + 등대/방파제 배경

### 사용자 피드백
1. "파도의 모양에 각진 것이 있어서 부드러워 보이지 않고" — SVG 경로가 각진 꺾임
2. "전체 컬러가 파스텔 컬러라 가독성이 떨어져" — 대비 부족
3. "등대 모양도 있고 파도도 있고 방파제도 있는 그런 디자인이 겹겹이 쌓여 보이는 배경" — 풍경 일러스트 요청

### 변경 내역

#### 1. 컬러 팔레트 대폭 강화 (파스텔 → 고대비)

| 항목 | 이전 (파스텔) | 변경 (고대비) |
|------|-------------|-------------|
| 배경 | `#F0F6FA` | `#F8FBFE` (더 밝게) |
| 보조배경 | `#E4EEF5` | `#EEF4FA` |
| 텍스트1 | `#0F2B47` | `#0A1929` (거의 검정) |
| 텍스트2 | `#2B5578` | `#1A3A54` (더 진하게) |
| 텍스트M | `#5E8BA6` | `#3D6E8C` |
| 포인트1 | `#1A7A82` | `#0B5E66` (깊은 청록) |
| 포인트2 | `#38A8B5` | `#1A8E9C` |
| 포인트3 | `#2E7BAD` | `#1565A0` |
| 포인트4 | `#C96B5F` | `#C0453A` (선명한 산호) |

- 배경은 더 밝게(흰색에 가깝게), 텍스트는 더 진하게 → 대비 극대화
- 그림자도 더 뚜렷하게 조정
- 카드 그라데이션 8종 모두 더 진하고 선명한 색상으로 교체
- 모든 CSS 파일의 `rgba(27, 58, 92, ...)` → `rgba(10, 25, 41, ...)`로 일괄 변경

#### 2. 파도 SVG — 각진 경로 → 부드러운 cubic bezier 곡선

기존: `L`(직선)과 `C`(급격한 제어점) 명령어 → 각진 꺾임 발생
변경: 순수 `C`(cubic bezier) 곡선으로 부드러운 사인파 형태

```
기존: M0,64 L48,69.3 C96,75,192,85,288,80 C384,75,480,53... (각진 경로)
변경: M0,60 C180,90 360,30 540,60 C720,90 900,30 1080,60... (부드러운 곡선)
```

3중 파도 레이어 모두 부드러운 곡선으로 교체:
- 뒤쪽 파도: 14초 주기, 넓은 진폭
- 중간 파도: 11초 주기, 중간 진폭
- 앞쪽 파도: 9초 주기, 큰 진폭

#### 3. 등대 & 방파제 실루엣 추가 (`heroScenery`)

히어로 섹션 하단에 SVG 풍경 일러스트 배치:
- **오른쪽 등대**: 몸체 + 상단부 + 불빛(따뜻한 노란색 빛 효과)
- **왼쪽 작은 등대**: 먼 거리 느낌의 작은 등대 실루엣
- **방파제 2중 레이어**: 뒤쪽(높은) + 앞쪽(낮은) 방파제 실루엣
- 반투명도로 겹겹이 쌓인 깊이감 표현
- 파도가 방파제/등대 위로 흐르는 레이어링 구조

#### 4. 기타 CSS 정리
- 전체 13개 CSS 파일의 rgba 색상값 일괄 업데이트
- SongCard 플레이 버튼 색상 바다 테마로 통일
- 하단 물결 장식도 부드러운 곡선으로 교체

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공 (15.69s)
- CSS: 31.11 kB (gzip 6.92 kB), JS: 576.83 kB (gzip 174.87 kB)

---

## 2026-02-20 (Day 1, 9차) — 겹겹이 풍경 배경 + 넘실거리는 파도

### 사용자 피드백
1. "등대 & 방파제 실루엣 배경을 좀 더 크게" — 실루엣이 작음
2. "하늘은 구름 등도 보이는 겹겹 배경이면 좋겠네" — 하늘에 구름 레이어 추가
3. "넘실거리는 파도가 좋아" — 수평 이동만이 아닌 수직 출렁임 효과 요청 (swell animation 참고)

### 변경 내역

#### 1. 등대/방파제 대폭 확대 (220px → 400px)
- **viewBox**: `0 0 1440 220` → `0 0 1440 400` (높이 거의 2배)
- **오른쪽 등대**: 몸체 높이 약 260px, 빨간 줄무늬 3줄, 큰 등대 불빛(3중 글로우)
- **왼쪽 등대**: 높이 약 180px, 빨간 줄무늬 2줄, 불빛
- **방파제**: 2중 레이어, 부드러운 곡선으로 돌 느낌
- **먼 산/섬**: 2중 레이어로 깊이감
- **갈매기 6마리**: 크기/투명도 달리하여 원근감

#### 2. 구름 2중 레이어 추가
- **heroClouds**: 12개 타원형 구름 묶음 (1800px 타일, 60초 주기)
- **heroClouds2**: 9개 구름 (2200px 타일, 90초 주기, 더 느리고 연한)
- 서로 다른 속도로 독립적으로 흘러가며 깊이감 표현
- 매우 연한 투명도 (0.02~0.035)로 은은하게

#### 3. 넘실거리는 파도 (swell animation)
- 기존 `translateX` 단순 수평이동 → `margin-left` + `translate3d` swell 병합
- **앞쪽 파도**: 수평 7초 + 수직 출렁임 7초 (`-15px ↔ +5px`)
- **중간 파도**: 수평 9초 + 수직 출렁임 6초 (`-10px ↔ +8px`)
- **뒤쪽 파도**: 수평 7초만 (안정감)
- `cubic-bezier(0.36, 0.45, 0.63, 0.53)` 타이밍으로 자연스러운 움직임
- 파도 너비 6400px (1600px × 4 타일) — 끊김 없는 무한 루프
- GPU 가속 (`translate3d`)

#### 4. 바다 바닥 추가 (heroOcean)
- 히어로 최하단 5%에 짙은 청록 바다 색상 (`#0B5E66` → `#084D54` 그라데이션)
- 파도 아래로 바다의 깊이감 표현

#### 5. z-index 레이어 구조 정리
```
z-index 0: heroBg (배경 그라데이션), heroClouds, heroScenery
z-index 1-3: 파도 레이어들 (뒤→앞)
z-index 4: heroOcean (바다 바닥), 앞쪽 파도
z-index 5: heroContent (텍스트), scrollHint, 최전면 파도
```

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공 (20.56s)
- CSS: 36.39 kB (gzip 8.07 kB), JS: 577.07 kB (gzip 174.93 kB)

---

## 2026-02-20 (Day 1, 10차) — 딥블루 컬러 + 시리즈 게시판 + CRUD + 好海 로고

### 사용자 피드백
1. "잘려진 듯한 고정 이미지 찾아서 수정하고 조금 더 딥블루한 느낌의 컬러를 사용해줘"
2. "시도 시집별로 시리즈 게시판이 필요해 5개로 늘려주고, 노래도 200여곡이 넘어서 시와 노래 게시판이 각 5개로 나눠줘"
3. "CRUD 기능 다 적용해. 샘플 타입 좋은데 노래는 4×5 배열로 해줘"
4. "호해 글자는 '好海'로 바꿔줘"

### 변경 내역

#### 1. 딥블루 컬러 팔레트 (`globals.css`)

| 항목 | 이전 | 변경 (딥블루) |
|------|------|-------------|
| 배경 | `#F8FBFE` | `#F3F7FD` |
| 보조배경 | `#EEF4FA` | `#E5EDF8` |
| 텍스트1 | `#0A1929` | `#071A33` (딥 네이비) |
| 텍스트2 | `#1A3A54` | `#12334E` |
| 포인트1 | `#0B5E66` (청록) | `#0A3D7A` (딥블루) |
| 포인트2 | `#1A8E9C` | `#1466A8` |
| 포인트3 | `#1565A0` | `#0D5699` |
| 포인트4 | `#C0453A` | `#B83B30` |

- 전체 SVG 색상도 청록 → 딥 네이비로 전환 (`%230B5E66` → `%230A2E5C`)
- heroOcean 그라데이션 상단 투명 처리로 잘린 듯한 경계 해결
- body::after 정적 파도 SVG → 부드러운 그라데이션 페이드로 교체
- 카드 그라데이션 8종 딥블루 톤으로 교체

#### 2. 好海 로고 변경

- 히어로 로고: `호해` → `好海` (한자)
- 부제: `好海 — 바다를 사랑하다` → `호해 — 바다를 사랑하다` (한글 보조)
- Header 로고, Footer 브랜드, About 프로필, Admin 상단 모두 `好海`로 통일
- aboutPhotoPlaceholder: `호` → `海`

#### 3. 시리즈(시집/앨범) 게시판 시스템 구축

**새 타입**: `types/series.ts` — Series, SeriesInsert, SeriesUpdate

**시집 5개**:
1. 파도의 시 2. 바다의 노래 3. 그리운 계절 4. 등대의 빛 5. 수평선 너머

**앨범 5개**:
1. 바다 노래 1집 ~ 5. 바다 노래 5집

**라우팅 변경** (`App.tsx`):
```
/poems                 → 5개 시집 시리즈 카드 보기
/poems/series/:slug    → 시집 내 시 목록 (카테고리 필터 포함)
/poems/:id             → 시 상세 (기존 유지)
/songs                 → 5개 앨범 시리즈 카드 보기
/songs/series/:slug    → 앨범 내 노래 목록 (4열 그리드)
```

**새 페이지**:
- `PoemSeriesPage.tsx` — 시집 내 시 목록, 뒤로가기 링크, 카테고리 필터
- `SongSeriesPage.tsx` — 앨범 내 노래 목록, 4열 그리드 레이아웃

**기존 페이지 변경**:
- `PoemsPage.tsx` — 시 목록 → 시집 시리즈 카드 갤러리
- `SongsPage.tsx` — 노래 목록 → 앨범 시리즈 카드 갤러리

#### 4. 샘플 데이터 대폭 확장 (`sampleData.ts`)

- **시 10편**: 기존 6편 + 수평선, 밤바다, 길 위에서, 그대에게 4편 추가, 각각 시리즈에 배분
- **노래 20곡** (4×5 배열): 5개 앨범 × 4곡씩 = 20곡
  - 1집: 파도의 노래, 수평선 너머, 갈매기의 꿈, 해변의 추억
  - 2집: 바다의 자장가, 모래성, 조개껍데기, 밀물과 썰물
  - 3집: 등대지기, 소금바람, 포구의 아침, 해녀의 노래
  - 4집: 여름바다, 섬으로 가는 길, 파도소리 명상, 겨울바다
  - 5집: 별빛 바다, 돌고래의 춤, 해질녘 산책, 바다의 약속

#### 5. CRUD 전면 적용

**Hooks**:
- `useSeries.ts` 신규 — usePoemSeries, useSongSeries, useSeriesDetail, useAllSeries
- `usePoems.ts` — seriesId 필터 추가, admin useAllPoems에 샘플 데이터 폴백
- `useSongs.ts` — seriesId 필터 추가, admin useAllSongs에 샘플 데이터 폴백

**Admin 페이지** (3탭):
1. **시 관리** — 시집(시리즈) 드롭다운 추가, CRUD 완전 동작
2. **노래 관리** — 앨범(시리즈) 드롭다운 추가, CRUD 완전 동작
3. **시리즈 관리** (NEW) — 시집/앨범 생성·수정·삭제, 유형(poem/song) 선택

#### 6. Supabase 마이그레이션 업데이트 (`migration.sql` v2)

- `hohai_series` 테이블 신규 (시집/앨범 공통, type 칼럼으로 구분)
- `hohai_poems.series_id`, `hohai_songs.series_id` FK 칼럼 추가
- 인덱스 3개 추가 (series_id, type)
- RLS 정책: 공개 읽기 + 인증 쓰기
- 시리즈 샘플 데이터 10개 자동 삽입 (시집 5 + 앨범 5)

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공
- CSS: 40.51 kB (gzip 8.63 kB), JS: 597.72 kB (gzip 178.72 kB)

---

## 2026-02-20 (Day 1, 11차) — 방파제 제거 + Supabase DB 셋업

### 변경 내역

#### 1. 방파제 실루엣 제거
- 히어로 섹션의 등대 앞 방파제(breakwater) SVG 경로 2개 제거
- **사유**: 오른쪽 여백보다 짧아서 잘려보이는 문제
- 등대, 산, 갈매기, 구름 레이어는 유지

#### 2. Supabase DB 완전 셋업

**프로젝트 정보**:
- Supabase 프로젝트: `aebonlee's Project` (ID: `hcmgdztsgjvzcyxyayaj`)
- 리전: `ap-south-1` (Mumbai)
- PostgreSQL 17.6

**테이블 생성 (5개)**:
| 테이블 | 설명 |
|--------|------|
| `hohai_series` | 시집/앨범 시리즈 (type: poem/song) |
| `hohai_poems` | 시 (series_id FK) |
| `hohai_songs` | 노래 (series_id FK, youtube_id) |
| `hohai_categories` | 카테고리 (사랑/자연/계절/인생/그리움/기타) |
| `hohai_site_config` | 사이트 설정 (key-value JSONB) |

**인덱스 (3개)**:
- `idx_hohai_poems_series` — poems.series_id
- `idx_hohai_songs_series` — songs.series_id
- `idx_hohai_series_type` — series.type

**RLS 정책 (10개)**:
- 모든 테이블에 공개 읽기(`is_published = TRUE` 또는 `TRUE`) + 인증된 사용자 전체 권한

**트리거 (4개)**:
- hohai_series, hohai_poems, hohai_songs, hohai_site_config — `updated_at` 자동 갱신

**샘플 데이터 삽입**:
- 시리즈 10개 (시집 5개 + 앨범 5개)
- 카테고리 6개

**환경변수 설정**:
- `.env.local` 생성 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- REST API (anon key) 접근 정상 확인

### 남은 작업
- [x] Supabase에 migration.sql 실행 (테이블 생성) ✅
- [x] `.env.local`에 실제 Supabase URL/Key 설정 ✅
- [ ] GitHub Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가 (gh CLI 미설치 → GitHub 웹에서 수동 설정 필요)
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드
- [ ] YouTube 노래 영상의 실제 youtube_id로 교체
