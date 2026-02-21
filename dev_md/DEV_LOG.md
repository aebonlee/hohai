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
- [x] GitHub Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가 ✅
- [x] Supabase 한글 데이터 인코딩 수정 (UTF-8 파일 방식으로 재삽입) ✅
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드
- [ ] YouTube 노래 영상의 실제 youtube_id로 교체

---

## 2026-02-20 (Day 1, 12차) — www 로그인 시스템 통합

### 배경
- `aebonlee/www` (www.dreamitbiz.com)과 동일한 Supabase 인스턴스를 공유
- 로그인, 결제 등 공통 기능을 양 사이트에서 동일하게 사용하기 위해 www의 인증 시스템을 hohai에 이식

### 변경 내역

#### 1. AuthContext 기반 인증 시스템 구축 (www와 동일)

**새 파일들**:
- `src/contexts/AuthContext.tsx` — AuthProvider + useAuth hook (TypeScript 변환)
  - user, profile, loading, isLoggedIn, isAdmin 상태 관리
  - Supabase auth 세션 리스너
  - user_profiles 테이블에서 프로필 로드
  - ADMIN_EMAILS: `aebon@kakao.com`, `aebon@kyonggi.ac.kr`
- `src/lib/auth.ts` — Auth 유틸리티 함수 (www auth.js → TypeScript)
  - signInWithGoogle(), signInWithKakao() — OAuth 로그인
  - signInWithEmail() — 이메일/비밀번호 로그인
  - signUp() — 회원가입
  - signOut() — 로그아웃
  - getProfile() / updateProfile() — user_profiles CRUD
  - resetPassword() — 비밀번호 재설정 메일

#### 2. 인증 페이지 (www와 동일한 2단계 로그인 플로우)

- `src/pages/LoginPage.tsx` — 로그인 페이지
  - Step 1: 방법 선택 (Google, Kakao, Email 버튼)
  - Step 2: 이메일/비밀번호 입력 폼
  - 로그인 후 원래 페이지로 리다이렉트
- `src/pages/RegisterPage.tsx` — 회원가입 페이지
  - 이름, 이메일, 비밀번호, 비밀번호 확인
  - 비밀번호 검증 (6자 이상, 확인 일치)
  - 성공 시 이메일 인증 안내
- `src/pages/ForgotPasswordPage.tsx` — 비밀번호 찾기
  - 이메일 입력 → 재설정 링크 전송
- `src/pages/MyPagePage.tsx` — 마이페이지
  - 아바타, 이름, 이메일 표시
  - 프로필 수정 (이름 변경)
  - 관리자 배지, 로그아웃
- `src/styles/auth.css` — 인증 관련 스타일 (好海 딥블루 테마 적용)

#### 3. 라우트 가드 (www와 동일)

- `src/components/layout/AuthGuard.tsx` — 로그인 필요 페이지 보호
- `src/components/layout/AdminGuard.tsx` — 관리자 전용 페이지 보호

#### 4. 기존 파일 수정

- **`src/main.tsx`** — `AuthProvider` 래핑 추가
- **`src/App.tsx`** — 라우팅 전면 변경:
  - `/login`, `/register`, `/forgot-password` 추가
  - `/mypage` (AuthGuard 적용)
  - `/admin` (AdminGuard로 변경, 기존 ProtectedRoute 대체)
  - `/admin/login` 경로 제거 (통합 로그인 사용)
- **`src/components/layout/Header.tsx`** — 유저 메뉴 추가:
  - 로그인 상태: 아바타 버튼 + 드롭다운 (마이페이지, 관리자, 로그아웃)
  - 미로그인 상태: "로그인" 버튼
  - 모바일 메뉴에도 로그인/마이페이지/관리자 메뉴 추가
- **`src/components/layout/Header.module.css`** — 유저 메뉴 스타일 추가
- **`src/hooks/useAuth.ts`** — AuthContext에서 re-export (하위 호환)
- `AdminLoginPage.tsx`, `AdminLoginPage.module.css` 삭제 (LoginPage로 대체)

### 인증 플로우 (www와 동일)

```
[사용자] → /login → [Google/Kakao/Email 선택]
  → OAuth: Supabase → 제공자 → 콜백 → 세션 설정
  → Email: 이메일/PW 입력 → signInWithPassword → 세션 설정
→ AuthContext가 세션 감지 → user/profile 로드
→ Header 유저 아바타 표시

[관리자 접근]
→ /admin → AdminGuard → isAdmin 확인 → AdminPage
→ 미로그인 시 /login으로 리다이렉트 (referrer 보존)
```

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공 (11.26s)
- CSS: 46.27 kB (gzip 9.60 kB), JS: 612.54 kB (gzip 182.10 kB)

### 남은 작업
- [ ] Supabase에 Google/Kakao OAuth 프로바이더 설정 (대시보드에서 활성화 필요)
- [ ] user_profiles 테이블이 없으면 생성 필요 (www와 공유)
- [ ] 실제 시/노래 콘텐츠 입력
- [ ] 프로필 사진 업로드
- [ ] YouTube 노래 영상의 실제 youtube_id로 교체

---

## 2026-02-20 (Day 1, 13차) — 5테마 히어로 캐러셀

### 배경
- 기존: 바다/파도 단일 배경
- 시인의 다양한 시 세계관을 반영하여 5가지 테마 배경으로 확장 요청

### 변경 내역

#### 1. HomePage.tsx — 캐러셀 구조 전면 개편

**5개 슬라이드 구성**:
1. **바다/파도 (Ocean)** — 파란 하늘 그라데이션, 구름 레이어, 등대 실루엣, 갈매기, 넘실거리는 파도
2. **석양/노을 (Sunset)** — 보라→주황→노랑 그라데이션, 맥동하는 태양, 3중 산 실루엣
3. **숲 (Forest)** — 녹색 그라데이션, 원근 3중 나무 실루엣(뒤/중간/앞), 떠다니는 안개
4. **비 오는 도시 (Cyberpunk City)** — 짙은 보라 그라데이션, 네온 창문 빌딩 스카이라인, 비 애니메이션
5. **고속도로 불빛 (Highway)** — 어두운 밤 그라데이션, 도로/가로등, 빛줄기 스트림 애니메이션

**각 슬라이드별 고유 시구**:
- 바다: "파도가 밀려오듯 / 시가 가슴에 닿고 / 바다가 노래합니다"
- 석양: "석양이 물드는 하늘 아래 / 하루의 끝에서 / 시가 피어납니다"
- 숲: "숲이 들려주는 이야기 / 나뭇잎 사이로 / 바람이 시를 읊는다"
- 도시: "빗줄기 사이로 / 도시의 불빛이 흐르고 / 밤은 시가 된다"
- 고속도로: "길 위의 불빛들이 / 어둠을 가르며 / 내일을 향해 달린다"

**캐러셀 컨트롤**:
- 6초 자동 전환 (setInterval)
- 좌/우 화살표 버튼 (‹ ›, 글라스모피즘 스타일)
- 5개 도트 인디케이터 (활성 도트: 글로우 효과)
- framer-motion으로 텍스트 fade+slide 전환 (key={active})

#### 2. HomePage.module.css — 캐러셀 전용 CSS 전면 교체

**슬라이드 전환**: opacity 1.2초 ease 크로스페이드
- `.slide` (opacity: 0) ↔ `.slideActive` (opacity: 1)

**각 테마별 CSS 구현**:
- **Ocean**: SVG 구름(60초 루프), 등대+갈매기 실루엣, 파도(9초 swell)
- **Sunset**: 10단 그라데이션, `sunPulse` 키프레임(4초 박동), 3중 산 SVG
- **Forest**: 7단 녹색 그라데이션, 나무 줄기 포함 3중 SVG, `mistDrift` 안개 애니메이션(12초)
- **City**: 14개 빌딩 + 20개 네온 창문 SVG, `rain` 키프레임(0.8초 빗줄기)
- **Highway**: 도로/가로등/중앙선 SVG, `lightStreamLeft`/`lightStreamRight` 빛줄기(3초/4초)

**텍스트 색상**: 모든 배경에서 가독성 확보
- 로고/시구: `#ffffff` + text-shadow
- 부제/작가: `rgba(255,255,255,0.7/0.6)`

**반응형**: 모바일에서 로고/도트/화살표 축소

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공
- 2개 파일 변경: HomePage.tsx (+97줄), HomePage.module.css (+460줄)

---

## 2026-02-20 (Day 1, 14차) — 히어로 캐러셀 반복 개선

### 변경 내역 (13차 이후 ~ 현재)

#### 슬라이드 디자인 수정 이력

**석양 슬라이드 (2번)**:
- SVG 산 실루엣 좌/우 여백 잘려보임 → `left:-5%`, `right:-5%`, viewBox 1600으로 확장
- 산 실루엣 → 노을 바다로 변경: 3중 산 제거 → `sunsetWaves` (2중 파도 + swell 애니메이션)
- 태양 반사 빛 기둥(`sunReflect`) 추가

**바다 슬라이드 (1번)**:
- 등대가 `preserveAspectRatio='none'`으로 가로 퍼짐 → 제거 후 `background-size: cover`로 수정
- 구름이 너무 위에 고정 → height 40%로 확대, 구름 배치를 상/중/하 3단으로 분산

**숲 슬라이드 (3번) — 4차 재디자인**:
1. 삼각형 소나무 → 자작나무 (타원 캐노피) → 유기적 곡선 캐노피 → 깊은 숲(나무 줄기 실루엣+빛줄기)
2. 모두 사용자 피드백으로 거부 ("이해가 안 되는 디자인")
3. **최종**: 레이어드 소나무 능선 실루엣 방식
   - 안개 낀 새벽 숲 그라데이션 (연녹색→짙은 녹색)
   - 4겹 능선 (뒤→앞으로 점점 진해지는 소나무 꼭대기 실루엣)
   - 미니멀 포레스트 일러스트 스타일로 한눈에 "숲" 인식 가능

**고속도로 슬라이드 (5번) → 밤바다로 변경**:
- Highway 테마 전면 삭제
- NightSea: 별 16개(twinkle 4초), 달+글로우, 달빛 반사(moonReflection), 3중 어두운 파도
- 시구: "달빛이 바다 위에 / 은빛 길을 놓으면 / 밤은 고요히 노래한다"

**숲 파티클 효과 추가**:
- `forestParticles` div → `::before`/`::after`로 빛 먼지 입자
- `particleFloat1`(8초), `particleFloat2`(11초) 독립 애니메이션

---

## 2026-02-20 (Day 1, 15차) — 6번 슬라이드 추가 + 숲 최종 재디자인

### 변경 내역

#### 1. 6번 석양 바다 슬라이드 추가

- 2번 석양 바다와 동일한 디자인을 복제하여 6번째 슬라이드로 추가
- **CSS**: `.slideSunset2` 클래스 — 동일한 12단 그라데이션, 태양+반사, 2중 파도 애니메이션
- **TSX**: SLIDES 배열에 6번째 항목 추가
- **시구**: "수평선 너머로 / 붉은 하늘이 물들면 / 바다는 시가 된다"
- 캐러셀이 자동으로 6개 슬라이드를 순환 (SLIDES.length 기반)

#### 2. 숲 슬라이드 재디자인 (5차 — 최종)

이전 디자인(깊은 숲 속 나무 줄기+빛줄기)이 "이해가 잘 안 되는 디자인"이라는 피드백.

**새 디자인 — 레이어드 소나무 능선 실루엣**:
- **배경**: 안개 낀 새벽 숲 하늘 (7단 그라데이션: `#b8ccc0` → `#1a3c2e`)
- **빛 효과**: 위쪽에서 은은하게 내려오는 radial-gradient + `forestGlow` 10초 애니메이션
- **나무 SVG**: 4겹 소나무 능선이 겹겹이 쌓이는 구조
  - 4층 (가장 먼): `#608878`, 화면 중간부터 시작
  - 3층: `#466e5a`, 조금 아래
  - 2층: `#305040`, 더 아래
  - 1층 (가장 가까운): `#1a3828`, 화면 하단
  - 각 능선 상단이 뾰족한 삼각형 패턴 (소나무 꼭대기)으로 구성
  - 뒤쪽일수록 연하고, 앞쪽일수록 진한 색으로 원근감/깊이감 표현
- **안개**: 능선 사이에 떠도는 3중 radial-gradient 안개 (mistDrift 14초)
- **파티클**: 빛 먼지 입자 (particleFloat 8초/11초)

**디자인 의도**: 미니멀 포레스트 일러스트 (겹겹이 쌓인 산/숲 실루엣)는
누구나 한눈에 "숲"이라고 인식할 수 있는 직관적인 표현 방식.

### 파일 변경
- `HomePage.tsx`: SLIDES 배열 5→6개, 6번 슬라이드 JSX 추가
- `HomePage.module.css`: 숲 CSS 전면 교체, 석양2 CSS 추가

### 빌드 결과
- TypeScript 타입체크 통과
- Vite 빌드 성공
- CSS: 63.17 kB (gzip 12.75 kB), JS: 616.09 kB (gzip 183.14 kB)

---

## 2026-02-21 — 샘플 데이터 제거 + 실제 데이터 전용 전환 + 카테고리 Admin CRUD

### 배경
- Supabase DB 셋업이 완료되어, 더 이상 프론트엔드 내장 샘플 데이터가 필요 없음
- 관리자 페이지(/admin)에서 실제 데이터를 직접 등록·관리할 수 있도록 전환
- 기존에 카테고리 관리 CRUD가 없어서 Admin에 추가 필요

### 변경 내역

#### 1. `src/lib/sampleData.ts` 삭제
- 10편의 샘플 시, 20곡의 샘플 노래, 시리즈 10개, 카테고리 6개, 리뷰 5개 등 모든 하드코딩 데이터 파일 완전 삭제
- **144줄 제거**

#### 2. 모든 Hooks에서 샘플 데이터 fallback 제거

| Hook 파일 | 변경 내용 |
|-----------|----------|
| `usePoems.ts` | `SAMPLE_POEMS` import 제거, `usePoems`/`usePoemDetail`/`useFeaturedPoems`/`useAllPoems` 4개 함수에서 fallback 로직 제거. 에러 시 빈 배열 반환 |
| `useSongs.ts` | `SAMPLE_SONGS` import 제거, `useSongs`/`useFeaturedSong`/`useAllSongs` 3개 함수에서 fallback 제거 |
| `useSeries.ts` | `SAMPLE_POEM_SERIES`/`SAMPLE_SONG_SERIES` import 제거, `usePoemSeries`/`useSongSeries`/`useSeriesDetail`/`useAllSeries` 4개 함수에서 fallback 제거 |
| `useReviews.ts` | `SAMPLE_REVIEWS` import 및 fallback 제거 |
| `useCategories.ts` | `SAMPLE_CATEGORIES` import 및 fallback 제거 + **`useAllCategories` Admin hook 신규 추가** |

**변경 전 동작**: Supabase 응답이 비어있으면 → 샘플 데이터를 화면에 표시
**변경 후 동작**: Supabase 응답이 비어있으면 → 빈 목록 표시 (관리자가 직접 등록 필요)

#### 3. `useCategories.ts` — Admin CRUD 추가

```typescript
// 기존: useCategories() — 읽기 전용
// 추가: useAllCategories() — Admin용 전체 CRUD
export function useAllCategories() {
  // fetchAll, createCategory, updateCategory, deleteCategory
}
export interface CategoryInsert { name, slug, description?, display_order }
export type CategoryUpdate = Partial<CategoryInsert>
```

#### 4. `AdminPage.tsx` — 카테고리 관리 탭 추가

- 기존 4탭(시 관리, 시집 관리, 노래 관리, 앨범 관리) → **5탭** (+카테고리 관리)
- `CategoriesAdmin` 컴포넌트 신규 추가 (약 120줄)
  - 카테고리 목록 테이블 (이름, 슬러그, 설명, 순서)
  - 모달 폼으로 생성/수정
  - 삭제 (확인 다이얼로그)
- **159줄 추가**

### 파일 변경 요약
```
 src/hooks/useCategories.ts |  59 +++++++++++++-   (CRUD 추가)
 src/hooks/usePoems.ts      |  45 ++---------   (fallback 제거)
 src/hooks/useReviews.ts    |   7 +-          (fallback 제거)
 src/hooks/useSeries.ts     |  26 ++------   (fallback 제거)
 src/hooks/useSongs.ts      |  24 +------    (fallback 제거)
 src/lib/sampleData.ts      | 144 ----------  (파일 삭제)
 src/pages/AdminPage.tsx    | 159 ++++++++++  (카테고리 관리 탭)
 7 files changed, 223 insertions(+), 241 deletions(-)
```

### 운영 가이드
1. `/admin` 페이지 접속 (관리자 계정 필요)
2. **카테고리 관리** 탭에서 카테고리 먼저 등록 (사랑, 자연, 계절, 인생, 그리움, 기타 등)
3. **시집 관리** 탭에서 시집(시리즈) 등록
4. **시 관리** 탭에서 시 등록 (시집 선택, 카테고리 지정)
5. **앨범 관리** 탭에서 앨범(시리즈) 등록
6. **노래 관리** 탭에서 노래 등록 (YouTube ID 또는 Suno URL, 앨범 선택)

---

## 2026-02-21 (2차) — DB 초기화 탭 + 시 177편 일괄 등록 기능

### 배경
- Supabase DB에 migration.sql로 삽입된 샘플 시리즈 10개 + 카테고리 6개가 남아있음
- RLS 정책으로 anon key로는 삭제 불가 → Admin 페이지에 초기화 기능 추가 필요
- 사용자가 poem.pdf (178페이지, 好海 이성헌 '3차 퇴고 완성작') 제공 → 실제 시 데이터 등록 요청

### 변경 내역

#### 1. poem.pdf 파싱 (Node.js pdf-parse)
- 178페이지 PDF에서 텍스트 추출
- `- N -` 페이지 번호 패턴으로 각 시의 경계를 파싱
- **177편의 시** 추출 (page 2~178, 가나다순 정렬)
- 5개의 페이지 경계 걸침 시 올바르게 병합 처리
- 결과: `poems_parsed.json` (122KB)

#### 2. `src/data/poems.ts` 생성
- 파싱된 177편의 시를 TypeScript 데이터 파일로 변환
- `POEM_DATA` 배열 export: `{ page, title, content }[]`

#### 3. AdminPage 'DB 초기화' 탭 추가

**DbInitAdmin 컴포넌트** — 2개 기능 버튼 + 실시간 로그:

1. **전체 데이터 삭제** 버튼:
   - `hohai_poems` → `hohai_songs` → `hohai_series` → `hohai_categories` 순서로 삭제
   - FK 참조 순서 고려 (시/노래 먼저 → 시리즈 → 카테고리)
   - 인증된 사용자(admin)만 삭제 가능 (RLS 정책)

2. **시 177편 일괄 등록** 버튼:
   - Step 1: 카테고리 '시' 등록 (upsert)
   - Step 2: 시집 '3차 퇴고 완성작' 시리즈 생성
   - Step 3: 177편의 시를 20편씩 배치 등록 (9 배치)
   - 각 시: title, content, excerpt(첫 4행), category='시', series_id, bg_theme(0-7 순환), display_order=page번호, written_date='2008-08-15'

3. **실시간 로그 패널**: 작업 진행 상황을 시간+메시지로 표시

### 파일 변경 요약
```
 src/data/poems.ts       | 895+ (신규 — 177편 시 데이터)
 src/pages/AdminPage.tsx | 153+ (DB 초기화 탭 + DbInitAdmin 컴포넌트)
 2 files changed, 1048 insertions(+), 1 deletion(-)
```

### 사용 방법
1. `/admin` → 관리자 로그인
2. **DB 초기화** 탭 클릭
3. **전체 데이터 삭제** → 기존 샘플 데이터 제거
4. **시 177편 일괄 등록** → 카테고리 + 시집 + 177편 자동 등록
5. **시 관리** 탭에서 등록된 시 확인 가능

---

## 2026-02-21 (3차) — 시 177편 카테고리 분류 + 해시태그 등록 + Admin 관리 강화

### 배경
- DB에 등록된 177편의 시가 모두 `category: '시'`, `tags: []` 상태
- 사용자 요청: 사랑, 작별, 그리움, 기다림, 추억, 인생, 회한 등으로 분류 + 해시태그 등록
- 기다림은 "그리움"에 통합, 회한은 맥락에 따라 "작별"/"인생"에 분산
- 추가 카테고리: 가족, 자연, 세상, 의지

### 9개 카테고리 체계

| # | 카테고리 | 설명 | 시 수 | 색상 |
|---|---------|------|-------|------|
| 1 | 사랑 | 사랑, 연모, 애정을 노래한 시 | 34 | `#D4847A` |
| 2 | 그리움 | 그리움, 기다림, 보고픔을 담은 시 | 22 | `#7BAFD4` |
| 3 | 작별 | 이별, 작별, 떠남의 슬픔 | 7 | `#C88FA8` |
| 4 | 추억 | 추억, 회상, 옛 시절을 돌아보는 시 | 16 | `#E8A87C` |
| 5 | 인생 | 인생, 삶의 철학, 자아성찰 | 35 | `#4A90B8` |
| 6 | 가족 | 부모, 형제, 가족애를 노래한 시 | 14 | `#8FC49A` |
| 7 | 자연 | 자연, 바다, 계절 풍경 | 13 | `#5ABAC4` |
| 8 | 세상 | 사회, 세태, 풍자, 비판 | 21 | `#A0889C` |
| 9 | 의지 | 희망, 의지, 도전, 극복 | 15 | `#D4A85A` |

### 변경 내역

#### 1. `src/data/poem-categories.ts` (신규 — ~200줄)

- `CATEGORY_LIST`: 9개 카테고리 목록 배열 (name, slug, description, order)
- `PoemClassification` 인터페이스: `{ category: string; tags: string[] }`
- `POEM_CLASSIFICATIONS`: page 번호 → `{ category, tags }` Record
  - 177편 전체를 page 번호 기반으로 매핑 (중복 제목 안전 — "풍경" 2편, "병마" 2편 존재)
  - 각 시마다 카테고리 1개 + 태그 3~5개 할당
  - 분류 기준: 시 본문 내용 + 제목 + 핵심 감정/주제

#### 2. `src/lib/constants.ts` 업데이트

```typescript
// 기존 6개 → 9개 카테고리 색상
export const CATEGORY_COLORS: Record<string, string> = {
  사랑: '#D4847A', 그리움: '#7BAFD4', 작별: '#C88FA8',
  추억: '#E8A87C', 인생: '#4A90B8', 가족: '#8FC49A',
  자연: '#5ABAC4', 세상: '#A0889C', 의지: '#D4A85A',
};
export const CATEGORY_NAMES = Object.keys(CATEGORY_COLORS);
```

#### 3. `src/pages/AdminPage.tsx` — Admin 관리 대폭 강화

**PoemsAdmin (시 관리 탭)**:
- 카테고리 `<input>` → `<select>` 드롭다운 변경 (오타 방지)
- 기본 카테고리: '기타' → '사랑' 변경
- **카테고리별 통계 바 추가**: 각 카테고리별 시 수를 색상 배지로 표시, 클릭 시 필터
- **카테고리 필터**: 드롭다운으로 카테고리 선택 시 해당 카테고리 시만 표시
- **제목/태그 검색**: 텍스트 입력으로 제목 또는 태그 검색
- **태그 컬럼 추가**: 시 목록 테이블에 `#태그1 #태그2` 형태로 표시
- **카테고리 색상 배지**: 카테고리명 옆에 해당 색상 배경의 pill 배지 표시
- 필터 초기화 버튼 + 필터링된 시 수 표시

**DbInitAdmin (DB 초기화 탭)**:
- `handleSeedPoems` 수정: `POEM_CLASSIFICATIONS`에서 카테고리/태그 조회하여 등록
  - 기존: `category: '시'`, `tags: []`
  - 변경: `category: cls?.category ?? '인생'`, `tags: cls?.tags ?? []`
- 카테고리 등록: 기존 단일 카테고리 → `CATEGORY_LIST` 9개 일괄 등록
- **카테고리/태그 일괄 업데이트** 버튼 추가:
  1. 기존 카테고리 전체 삭제 → 9개 새 카테고리 등록
  2. 모든 시 조회 → display_order(=page)로 분류 데이터 매칭 → category/tags UPDATE
  3. 카테고리별 분류 결과 로그 표시
- **카테고리 현황 보기** 버튼 추가:
  - 카테고리별 시 수 + ASCII 막대 그래프
  - 태그 없는 시 수 표시
  - 인기 태그 TOP 20 표시

#### 4. 프론트엔드 카테고리 색상 적용

**`CategoryFilter.tsx` + `.module.css`**:
- 각 카테고리 pill 앞에 `CATEGORY_COLORS`에서 해당 색상 dot (8px 원형) 표시
- 활성(선택된) 카테고리는 해당 색상을 배경으로 사용
- `.dot` CSS 클래스 추가

**`PoemCard.tsx`**:
- 카테고리 텍스트 색상에 `CATEGORY_COLORS[poem.category]` 적용
- 기존 CSS 변수 `var(--text-secondary)` → 동적 카테고리 색상

**`PoemDetailPage.tsx`**:
- 카테고리 텍스트 색상에 `CATEGORY_COLORS[poem.category]` 적용
- 기존 CSS 변수 `var(--accent-gold)` → 동적 카테고리 색상

### 파일 변경 요약
```
 src/data/poem-categories.ts             | 200+ (신규 — 177편 분류 매핑)
 src/lib/constants.ts                    |  15  (9개 카테고리 색상)
 src/pages/AdminPage.tsx                 | 120+ (필터, 통계, 일괄 업데이트)
 src/components/ui/CategoryFilter.tsx    |  18  (색상 dot + 활성 배경)
 src/components/ui/CategoryFilter.module.css | 8 (dot 스타일)
 src/components/ui/PoemCard.tsx          |   4  (카테고리 색상)
 src/pages/PoemDetailPage.tsx            |   4  (카테고리 색상)
 7 files changed, ~370 insertions(+), ~30 deletions(-)
```

### 사용 방법
1. `/admin` → **DB 초기화** 탭
2. (신규 등록 시) **시 177편 일괄 등록**: 자동으로 9개 카테고리 + 태그 포함 등록
3. (기존 데이터 업데이트 시) **카테고리/태그 일괄 업데이트**: 기존 시의 분류만 변경
4. **카테고리 현황 보기**: 분류 결과 통계 확인
5. **시 관리** 탭에서 카테고리 필터/검색으로 확인

---

## 2026-02-21 (5차) — 감상 후기 게시판 시스템 구현

### 배경
- 감상 후기(ReviewsPage) UI는 존재했으나 실제 동작하지 않음
  - `hohai_reviews` 테이블이 DB에 없음 (migration.sql에 미정의)
  - 후기 작성 시 `is_published` 미설정 → 등록해도 목록에 미노출
  - 관리자 Admin 페이지에 후기 관리 탭 없음
  - 비로그인 사용자도 후기 작성 가능 (요구사항: 로그인 필수)

### 변경 내역

#### 1. `dev_md/migration.sql` — hohai_reviews 테이블 추가

```sql
CREATE TABLE hohai_reviews (
  id, author_name, content, user_id, is_published, created_at, updated_at
);
```

- `user_id` → `auth.users(id)` FK (ON DELETE SET NULL)
- `is_published` 기본값 TRUE
- `updated_at` 자동 갱신 트리거
- RLS 정책 3개:
  - `hohai_reviews_public_read`: 공개된 후기만 읽기 가능
  - `hohai_reviews_auth_insert`: 인증된 사용자만 등록 가능
  - `hohai_reviews_auth_manage`: 인증된 사용자 전체 관리

#### 2. `src/hooks/useReviews.ts` — Hook 강화

**기존 `useReviews()`**:
- `createReview`에 `is_published: true` 기본값 추가
- `deleteReview(id)` 함수 추가 (본인 후기 삭제용)

**신규 `useAllReviews()` Admin 훅**:
- `fetchAll()` — 모든 리뷰 조회 (is_published 관계없이)
- `updateReview(id, updates)` — 공개/비공개 토글 등
- `deleteReview(id)` — 삭제

#### 3. `src/pages/ReviewsPage.tsx` — 로그인 필수 게시판

**비로그인 시**:
- 후기 작성 버튼 대신 "로그인 후 감상 후기를 남겨주세요" + 로그인 링크 표시

**로그인 시**:
- 후기 작성 폼 표시 (닉네임 입력 필드 제거 — 프로필 이름 자동 사용)
- `createReview` 호출 시 `is_published: true` 자동 설정

**피드백 메시지**:
- 등록 성공: "감상 후기가 등록되었습니다." (초록)
- 등록 실패: "등록에 실패했습니다. 다시 시도해주세요." (빨강)
- 3초 후 자동 소멸

**본인 삭제**:
- `user_id` 비교로 본인 작성 후기에만 삭제 버튼 표시
- 삭제 확인 다이얼로그

#### 4. `src/pages/ReviewsPage.module.css` — 신규 스타일

- `.loginPrompt` — 로그인 유도 박스 (dashed border, 중앙 정렬)
- `.loginLink` — 로그인 버튼 (accent-gold 배경)
- `.feedback` / `.success` / `.error` — 피드백 메시지 (녹/적 배경)
- `.reviewHeaderRight` — 날짜 + 삭제 버튼 그룹
- `.deleteBtn` — 삭제 버튼 (산호색 테두리)

#### 5. `src/pages/AdminPage.tsx` — 후기 관리 탭 추가

- Tab에 `'reviews'` 추가 (카테고리 관리와 DB 초기화 사이)
- **ReviewsAdmin 컴포넌트** (~70줄):
  - 전체 후기 테이블 (작성자, 내용 미리보기(60자), 날짜, 공개 상태)
  - 공개/비공개 토글 버튼
  - 삭제 버튼 (확인 다이얼로그)
  - 전체 후기 수 통계 표시

### 파일 변경 요약
```
 dev_md/migration.sql                    | 28+ (hohai_reviews 테이블 + RLS)
 src/hooks/useReviews.ts                 | 49+ (is_published 설정 + useAllReviews)
 src/pages/ReviewsPage.tsx               | 전면 수정 (로그인 필수 + 피드백 + 삭제)
 src/pages/ReviewsPage.module.css        | 62+ (로그인 프롬프트 + 피드백 + 삭제)
 src/pages/AdminPage.tsx                 | 78+ (후기 관리 탭 + ReviewsAdmin)
 5 files changed
```

### 관리자 수동 작업 (1건)
- Supabase SQL Editor에서 `hohai_reviews` 테이블 생성 SQL 실행 필요
- `dev_md/migration.sql` 하단의 hohai_reviews 관련 SQL 복사-실행

### 검증 시나리오
- 비로그인: 후기 목록만 보이고, 작성 불가 (로그인 유도 표시)
- 로그인: 후기 작성 → 목록에 즉시 표시
- 본인 삭제: 자기가 쓴 후기만 삭제 버튼 표시
- Admin: 후기 관리 탭에서 모든 후기 조회 + 공개/비공개 토글 + 삭제

---

## 2026-02-21 (6차) — 추천 시 페이지 is_featured 기반 필터링 구현

### 배경
- "추천 시(詩)" 페이지(`/poems`, `FeaturedPoemsPage`)가 **모든 공개 시(177편)**를 표시하고 있었음
- `is_featured` 필드가 DB 스키마와 Admin 폼(체크박스)에 존재했지만, 공개 페이지에서 필터로 사용하지 않음
- 시집 소개(`/poem-series`)에서는 시집별 전체 시가 이미 표시되므로, 추천 시 페이지는 관리자가 선별한 시만 노출해야 함

### 변경 내역

#### 1. `src/hooks/usePoems.ts` — `featuredOnly` 파라미터 추가

- `usePoems(categorySlug?, seriesId?, featuredOnly?)` 세 번째 인자 추가
- `featuredOnly === true`이면 Supabase 쿼리에 `.eq('is_featured', true)` 필터 추가
- `useCallback` 의존성 배열에 `featuredOnly` 추가

#### 2. `src/pages/FeaturedPoemsPage.tsx` — 추천 시만 조회

- `usePoems(selectedCategory || undefined, undefined, true)` — `featuredOnly=true` 전달
- 빈 상태 메시지 변경:
  - 카테고리 선택 시: "이 카테고리에 추천 시가 없습니다."
  - 전체 보기: "아직 추천 시가 없습니다."

#### 3. `src/pages/AdminPage.tsx` — Admin UI 개선

- PoemsAdmin 체크박스 라벨: "대표 시" → "추천"
- 시 목록 테이블에 "추천" 컬럼 추가 (추천 시는 ⭐ 표시)

### 파일 변경 요약
```
 src/hooks/usePoems.ts          | 6+ (featuredOnly 파라미터 + 필터 + 의존성)
 src/pages/FeaturedPoemsPage.tsx | 4~ (featuredOnly=true 전달 + 빈 상태 메시지)
 src/pages/AdminPage.tsx         | 6~ (라벨 변경 + 추천 컬럼 추가)
 3 files changed
```

### 검증 시나리오
- Admin에서 시 편집 → "추천" 체크 → 저장
- `/poems` 페이지: 추천 체크된 시만 표시
- `/poem-series/:slug` 페이지: 기존처럼 시집 내 모든 시 표시 (영향 없음)
- 추천 시가 0편일 때 "아직 추천 시가 없습니다" 빈 상태 메시지 확인

---

## 2026-02-21 (7차) — Suno 노래 229곡 앨범 등록 + 추천 노래 필터링

### 배경
- 好海 이성헌 시인이 Suno AI로 만든 229곡이 `scripts/suno_songs.json`에 추출되어 있음
- 노래들을 7개 앨범(시리즈)으로 분류하여 DB에 일괄 등록 필요
- "추천 노래" 페이지가 모든 노래를 표시 중 → `is_featured=true` 필터링 필요
- DB `hohai_songs.youtube_id`가 `NOT NULL` → Suno 전용 곡은 youtube_id 없이 등록해야 함
- 229곡 중 중복(Suno가 2버전 생성)이 26쌍 → 중복 제거 후 ~203곡 등록

### 7개 앨범 구성

| # | 앨범명 | slug | 설명 | 분류 기준 |
|---|--------|------|------|----------|
| 1 | 바다의 노래 | sea-songs-album | 바다, 파도, 해변 관련 곡 | 바다/파도/수평선/갈매기/방파제 등 키워드 |
| 2 | 가슴에 핀 사랑 | love-songs-album | 사랑, 연모, 그리움의 노래 | 사랑/가슴/그대/키스/불나비 등 키워드 |
| 3 | 사계의 풍경 | nature-songs-album | 자연, 계절, 꽃과 나무의 노래 | 꽃/나무/풍경/노을/가을/겨울 등 키워드 |
| 4 | 지나온 길 | life-songs-album | 인생 성찰, 회고, 추억의 노래 | 기본 카테고리 (키워드 미매칭 시) |
| 5 | Across Borders | intl-songs-album | 영어/프랑스어 번역곡 | ID 기반 명시적 분류 (14곡) |
| 6 | 한국의 풍경 | korean-life-album | 지역, 일상, 사회를 노래하다 | 고양시/부산/제주/순천/퇴근/출근 등 키워드 |
| 7 | 꿈과 혁신 | dream-innovation-album | AI, 꿈, 학교, 혁신의 노래 | AI/혁신/꿈/대학/인공지능 등 키워드 |

### 변경 내역

#### 1. DB 스키마 변경 — `youtube_id` nullable + `suno_url` 컬럼

**`dev_md/migration.sql`**:
- `youtube_id TEXT NOT NULL` → `youtube_id TEXT DEFAULT ''`
- `suno_url TEXT` 컬럼 추가

**수동 실행 필요** (Supabase Dashboard SQL):
```sql
ALTER TABLE hohai_songs ALTER COLUMN youtube_id DROP NOT NULL;
ALTER TABLE hohai_songs ALTER COLUMN youtube_id SET DEFAULT '';
ALTER TABLE hohai_songs ADD COLUMN IF NOT EXISTS suno_url TEXT;
```

#### 2. `src/data/suno-songs.ts` (신규 — 229곡 데이터 + 7개 앨범 분류)

**구조**:
- `SUNO_ALBUM_DEFS`: 7개 앨범 정의 배열 (name, slug, description, order)
- `RAW_SONGS`: 229개 원본 곡 데이터 (id, title, url)
- `cleanTitle()`: 제목 정리 (`/好海 이성헌` 접미사 제거, 앞 특수문자 제거, 공백 정리)
- `classifySong()`: 앨범 분류 (명시적 ID 매핑 + 키워드 기반)
- `SUNO_SONGS`: 중복 제거 + 정리된 최종 곡 배열 (SunoSongEntry[])

**중복 제거 방식**:
- 같은 제목의 곡이 여러 개 있을 때 첫 번째 곡만 사용 (Set 기반)
- 229곡 → ~203곡으로 축소

**분류 방식**:
1. 국제곡(intl): Suno ID 기반 명시적 매핑 (14곡)
2. 꿈/혁신: AI/혁신/꿈/대학 키워드 매칭
3. 한국/일상: 지역명/퇴근/출근/별다방 등 키워드 매칭
4. 바다: 바다/파도/수평선/갈매기 등 키워드 매칭
5. 사랑: 사랑/가슴/그대 등 키워드 매칭
6. 자연: 꽃/나무/풍경/노을 등 키워드 매칭
7. 인생(기본): 위 분류에 미매칭된 곡

#### 3. `src/hooks/useSongs.ts` — `featuredOnly` 파라미터 추가

- `useSongs(seriesId?, featuredOnly?)` 두 번째 인자 추가
- `featuredOnly === true`이면 `.eq('is_featured', true)` 필터 추가
- `useCallback` 의존성 배열에 `featuredOnly` 추가

#### 4. `src/pages/FeaturedSongsPage.tsx` — 추천 노래만 조회

- `useSongs()` → `useSongs(undefined, true)` 변경
- 빈 상태 메시지: "아직 등록된 노래가 없습니다" → "아직 추천 노래가 없습니다"

#### 5. `src/pages/AdminPage.tsx` — 대폭 개선

**SongsAdmin 컴포넌트**:
- 노래 목록 테이블에 "추천" 컬럼 추가 (⭐ 표시)

**DbInitAdmin 컴포넌트** — `handleSeedSongs` 함수 추가:
1. 7개 앨범 시리즈 생성 (upsert, onConflict: 'slug')
2. 중복 제거된 ~203곡을 20개씩 배치 insert
3. 각 곡: `title`, `suno_url`, `youtube_id=''`, `series_id=앨범ID`, `is_published=true`, `is_featured=false`
4. 앨범별 등록 현황 + 성공/실패 통계 로그 출력
5. "노래 N곡 일괄 등록" 버튼 (보라색 배경)

**DB_SCHEMA.md** 업데이트:
- `hohai_songs` 테이블에 `suno_url TEXT` 컬럼 추가 반영
- `youtube_id` 기본값 변경 반영

### 파일 변경 요약
```
 dev_md/migration.sql          | 3~ (youtube_id nullable + suno_url 추가)
 dev_md/DB_SCHEMA.md           | 6~ (스키마 문서 업데이트)
 src/data/suno-songs.ts        | 350+ (신규 — 229곡 데이터 + 7개 앨범 분류)
 src/hooks/useSongs.ts         | 6+ (featuredOnly 파라미터 + 필터 + 의존성)
 src/pages/FeaturedSongsPage.tsx | 2~ (featuredOnly=true + 빈 상태 메시지)
 src/pages/AdminPage.tsx       | 80+ (handleSeedSongs + 추천 컬럼)
 6 files changed
```

### 수동 작업 (사용자)
1. Supabase Dashboard에서 SQL 실행:
   ```sql
   ALTER TABLE hohai_songs ALTER COLUMN youtube_id DROP NOT NULL;
   ALTER TABLE hohai_songs ALTER COLUMN youtube_id SET DEFAULT '';
   ALTER TABLE hohai_songs ADD COLUMN IF NOT EXISTS suno_url TEXT;
   ```
2. 코드 배포 후 Admin → DB 초기화 탭 → "노래 N곡 일괄 등록" 클릭
3. Admin → 노래 관리에서 추천할 곡에 ⭐ 체크

### 검증 시나리오
- Admin → DB초기화 → "노래 N곡 일괄 등록" → 7개 앨범 + ~203곡 등록 확인
- Admin → 노래 관리 → 일부 곡 "추천" 체크
- `/songs` 페이지(추천 노래): 추천 체크된 곡만 표시
- `/songs/series/:slug` (앨범 상세): 앨범별 곡 정상 표시
- SongCard에서 Suno embed 재생 확인

---

## 2026-02-21 (8차) — 관리자 페이지 리디자인: 대시보드 + 사이드바 메뉴

### 배경
- 기존 AdminPage는 수평 탭 7개로 구성 — 메뉴가 길고 역할 불명확
- "카테고리 관리"가 시 카테고리인지 노래 카테고리인지 구분 불가
- "DB 초기화" 탭에 일괄 등록/삭제/통계 등 성격이 다른 작업 혼재
- 대시보드(통계 요약)가 없어 관리 현황 파악 어려움

### 변경 내역

#### 1. Tab 타입 변경 + 대시보드 추가

**Tab 타입**:
- 기존: `'poems' | 'poem-boards' | 'songs' | 'song-boards' | 'categories' | 'reviews' | 'db-init'`
- 변경: `'dashboard' | 'poems' | 'poem-boards' | 'songs' | 'song-boards' | 'poem-categories' | 'reviews' | 'batch-seed' | 'data-manage'`

**변경 포인트**:
- `'categories'` → `'poem-categories'` (시 카테고리 명확화)
- `'db-init'` → `'batch-seed'` + `'data-manage'` (기능별 분리)
- `'dashboard'` 추가 (기본 탭)

**DashboardAdmin 컴포넌트** (신규):
- 4개 통계 카드: 시 총 수, 노래 총 수, 시리즈 수, 후기 수
- 각 카드 클릭 시 해당 관리 탭으로 이동 (`onNavigate` 콜백)
- 기존 hooks (`useAllPoems`, `useAllSongs`, `useAllSeries`, `useAllReviews`)의 count 활용
- 카드 hover 효과: 그림자 + 약간의 translateY

#### 2. 사이드바 레이아웃 변경

**기존**: 수평 `.tabs` → 7개 탭 버튼 나열
**변경**: 좌측 사이드바 240px 고정 + 우측 `.main` 영역

**사이드바 메뉴 그룹 구조** (`MENU_ITEMS` 배열):
```
[대시보드]

시 ───────────
  시 관리
  시집 관리
  시 카테고리

노래 ──────────
  노래 관리
  앨범 관리

커뮤니티 ──────
  후기 관리

도구 ──────────
  일괄 등록
  데이터 관리
```

**CSS 변경**:
- `.tabs` / `.tab` → `.sidebar` / `.sidebarItem` / `.sidebarGroup`
- `.content`: `padding` 기반 → `display: flex` (사이드바 + 메인)
- `.sidebarItem.active`: 좌측 3px 골드 border + 배경 하이라이트
- `.sidebar`: `position: sticky`, `top: 60px`, `height: calc(100vh - 60px)`

#### 3. DbInitAdmin 분리

**BatchSeedAdmin** (일괄 등록):
- 시 177편 일괄 등록
- 노래 N곡 일괄 등록
- 카테고리/태그 일괄 업데이트
- 작성일 일괄 변경
- 카테고리 현황 보기

**DataManageAdmin** (데이터 관리):
- 전체 데이터 삭제 — `.dangerZone` 빨간 경고 영역으로 감싸기
- `border: 2px solid rgba(229, 115, 115, 0.4)` + 빨간 배경
- "위험 영역" 제목 + 경고 메시지 표시
- 로그는 실행 후에만 표시

#### 4. 모바일 반응형 처리

- 768px 이하: `.sidebar` 숨김 → `.mobileMenuBar` 표시
- `.mobileMenuToggle`: 현재 선택된 메뉴명 + ▾ 토글 버튼
- `.mobileDropdown`: 전체 메뉴 드롭다운 (그룹별 구분)
- `.mobileMenuItem.active`: 활성 메뉴 하이라이트
- 대시보드 그리드: 4열 → 2열

### 파일 변경 요약
```
 src/pages/AdminPage.tsx        | Tab 타입 변경, DashboardAdmin 추가, 사이드바 메뉴 구조, DbInitAdmin 분리
 src/pages/AdminPage.module.css | 사이드바 레이아웃, 대시보드 카드, 위험 영역, 모바일 드롭다운
 dev_md/CHANGELOG.md            | 8차 변경 이력 추가
 dev_md/DEV_LOG.md              | 8차 개발일지 추가
 4 files changed
```

### 빌드 결과
- `npx tsc --noEmit` 통과
- `npx vite build` 성공
  - `dist/assets/index-*.css`: 67.79 kB (gzip 12.68 kB)
  - `dist/assets/index-*.js`: 700.95 kB (gzip 208.76 kB)

### 검증 시나리오
- 대시보드: 시/노래/시리즈/후기 숫자 표시, 카드 클릭 시 탭 전환
- 사이드바: 그룹별 메뉴 표시, 클릭 시 탭 전환, active 표시
- "시 카테고리" 탭: 기존 CategoriesAdmin 동작 확인
- "일괄 등록" 탭: 시/노래 일괄 등록 + 카테고리 업데이트 + 통계 보기
- "데이터 관리" 탭: 전체 삭제 버튼 + 빨간 경고 표시
- 모바일 뷰: 사이드바 → 드롭다운 전환, 메뉴 선택 시 닫힘

---

## 2026-02-21 (9차) — 관리자 페이지 와이드 레이아웃 (1400px)

### 배경
- 관리자 페이지는 PC에서만 사용하므로 기존 `--max-width: 1100px` 제한이 불필요
- 넓은 화면에서 테이블과 콘텐츠 영역을 더 넓게 활용하도록 요청

### 변경 내역

**`src/pages/AdminPage.module.css`**:
- `.content`: `max-width: var(--max-width)` + `margin: 0 auto` 제거 → 사이드바+메인이 전체 너비 사용
- `.main`: padding `32px` → `40px`, `max-width: 1400px` 추가 (콘텐츠 영역 최대 폭 제한)
- `.titleCell`: `max-width` 250px → 400px (넓은 화면에서 제목이 잘리지 않도록)

### 빌드 결과
- `npx tsc --noEmit` 통과
- `npx vite build` 성공 (8.75s)
