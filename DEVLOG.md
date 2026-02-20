# 호해(好海) 시인 웹사이트 개발일지

> **프로젝트**: 호해 이성헌 시인의 시와 노래를 소개하는 감성 웹사이트
> **URL**: https://hohai.dreamitbiz.com
> **저장소**: https://github.com/aebonlee/hohai
> **기술 스택**: React 19 + Vite 6 + TypeScript + Supabase + CSS Modules + framer-motion
> **배포**: GitHub Pages (gh-pages 브랜치)

---

## 2026-02-04 (Day 1) — 프로젝트 생성

- GitHub 저장소 초기 생성
- CNAME 파일 설정 (`hohai.dreamitbiz.com`)
- 초기 index.html 생성

---

## 2026-02-20 (Day 2) — 전체 구현 + 대규모 개선

### Phase 1: 프로젝트 기반 구축

- **Vite + React + TypeScript** 프로젝트 초기화
- 프로젝트 구조 설계 및 전체 페이지 뼈대 생성
- React Router v7 라우팅 설정
- Supabase 클라이언트 초기화 (기존 `www.dreamitbiz.com` DB 공유, `hohai_` prefix 테이블)
- 글로벌 CSS 변수 시스템 (한지/먹물/수채화 컨셉)
- 웹폰트 설정 (Noto Serif KR, Noto Sans KR, Nanum Myeongjo)

### Phase 2: Supabase DB 구축

- 테이블 5개 생성:
  - `hohai_poems` — 시 (제목, 본문, 카테고리, 태그, 배경테마)
  - `hohai_songs` — 노래 (YouTube ID, Suno URL, 가사)
  - `hohai_categories` — 카테고리
  - `hohai_series` — 시리즈/게시판 (시집, 앨범)
  - `hohai_site_config` — 사이트 설정
- RLS 정책 설정 (공개 읽기, 인증 사용자 쓰기)
- `updated_at` 자동 갱신 트리거
- 샘플 데이터 삽입

### Phase 3: 배포 환경

- 초기 Vercel 배포 시도 → **GitHub Pages로 전환** (비용/간편함)
- `gh-pages` npm 패키지로 배포 자동화 (`npx gh-pages -d dist --no-history`)
- `.npmrc` legacy-peer-deps 설정

### Phase 4: 디자인 대규모 개선

- **바다/파도 테마 전면 적용** — 호해(好海) 브랜딩
- 딥블루 컬러 팔레트 도입
- 겹겹이 풍경 배경 + 넘실거리는 파도 CSS 효과
- 고대비 컬러 + 부드러운 파도 곡선 + 등대/방파제 실루엣
- 好海 캘리그래피풍 로고

### Phase 5: 시리즈 게시판 시스템

- **시집 5개 / 앨범 5개** 시리즈 게시판 CRUD 구현
- 시리즈 타입 구분 (`poem` | `song`)
- 관리자 대시보드에서 시/노래/시리즈 CRUD

### Phase 6: 히어로 캐러셀 (5테마 → 6테마)

- **5테마 캐러셀** 구현: 바다/석양/숲/비오는 도시/밤바다
- 6초 간격 자동 슬라이드 + 좌우 화살표 + 도트 네비게이션
- 각 슬라이드별 CSS 그라데이션/SVG 배경 + 오버레이
- 숲 슬라이드 반복 디자인 개선 (자작나무 → 전나무 실루엣 → 레이어드 능선)
- **6번째 슬라이드 추가**: 석양 바다
- 각 슬라이드에 시 한 구절 + "호해 이성헌" 표시

### Phase 7: 메뉴 구조 개편 + Suno.ai 지원

- **7개 메뉴 구조**:
  - 홈 / 추천 시(詩) / 시집 소개 / 추천 노래 / 앨범별 소개 / 감상 후기 / 시인 소개
- **라우팅 재설계**:
  ```
  /         → 홈
  /poems    → 추천 시 (FeaturedPoemsPage)
  /poem-series → 시집 소개 (PoemsPage)
  /songs    → 추천 노래 (FeaturedSongsPage)
  /albums   → 앨범별 소개 (SongsPage)
  /reviews  → 감상 후기 (ReviewsPage)
  /about    → 시인 소개 (AboutPage)
  ```
- **Suno.ai 노래 지원**: Song 타입에 `suno_url` 필드 추가
- **SunoEmbed 컴포넌트**: Suno 노래를 iframe 임베드로 사이트 내 재생 (외부 이탈 방지)
- SongCard에 YouTube + Suno 듀얼 지원
- **감상 후기 페이지**: 리뷰 목록 + 작성 폼 (로그인/비로그인)
- 메뉴 이모지 제거 + 관리자 게시판 카테고리 CRUD 분리

### Phase 8: 로그인 시스템 통합

- www.dreamitbiz.com 로그인 시스템과 통합
- Google / Kakao / Email 인증 지원
- 마이페이지 구현
- 관리자 이메일 설정 (`hohai7115@daum.net`)
- ProtectedRoute / AdminGuard 컴포넌트

### Phase 9: 히어로 사진 배경 + Canvas 효과

- **슬라이드 1,6**: 빨간 등대 사진 배경으로 교체 (`hero-lighthouse-1.png`, `hero-lighthouse-2.png`)
- **슬라이드 2**: 석양 사진 배경 (`hero-sunset-a.png`)
- **슬라이드 3**: 어두운 숲 사진 배경 (`hero-forest.png`)
- **HeroEffects.tsx**: Canvas 기반 JavaScript 인터랙티브 효과 시스템 구축
  - `drawLighthouse`: 수면 반짝임 + 떠다니는 빛 입자
  - `drawSunset`: 물결 shimmer + 따뜻한 먼지 입자
  - `drawForest`: 빛줄기 + 반딧불 + 낙엽
  - `drawCity`: 네온 반사 + 빗줄기 + 번개
  - `drawNightSea`: 오로라 + 유성 + 발광 플랑크톤
  - `drawLighthouse2`: 수면 반사 + 빛 기둥
- Float64Array 기반 파티클 시스템 (최대 200개)
- requestAnimationFrame 애니메이션 루프

### Phase 10: 렌즈 플레어 제거

- 슬라이드 1,6 등대 빛 렌즈 효과 (beam, glow) 삭제
- 슬라이드 1,6 카메라 렌즈 줌(slowZoom) 효과 삭제
- 슬라이드 1 등대 이미지 교체 — 렌즈 플레어 없는 깨끗한 사진

---

## 2026-02-21 (Day 3) — 히어로 7슬라이드 확장 + 효과 정리 + 성능 최적화

### 석양 렌즈플레어 제거

- `slideSunset .sunsetWarmGlow`, `.sunsetReflection` → `display: none` 처리

### 히어로 7슬라이드 확장

- **4번째 슬라이드(황혼 등대)** 삽입: `hero-lighthouse-3.png`
- 시 구절 추가: "황혼이 내려앉은 바다 위 / 등대 하나 서서 / 어둠 속 길을 밝힌다"
- 슬라이드 순서: 등대1 → 석양 → 숲 → **황혼 등대** → 비 오는 도시 → 밤바다 → 등대2

### Canvas 효과 전면 정리

| 슬라이드 | 제거된 효과 | 최종 효과 |
|---------|-----------|----------|
| 석양 (2) | god-rays, warm dust halos, horizon glow band | 물결 shimmer + 작은 따뜻한 먼지 입자 |
| 숲 (3) | canvas layered mist + CSS forestMistLayer | 빛줄기, 빛속 먼지, 반딧불, 낙엽 |
| 황혼 등대 (4) | — (신규) | 따뜻한 황혼 물결 shimmer + 황금빛 부유 입자 |
| 비 오는 도시 (5) | 없음 | 네온 반사, 빗줄기+스플래시, 번개 (유지) |
| 밤바다 (6) | 달 box-shadow 글로우, 달빛 반사 기둥(::after) | 오로라, 유성, 발광 플랑크톤 |
| 등대2 (7) | floating mist particles (연기 효과) | 수면 반사 잔물결 + light column + 은은한 빛 입자 |

### 이미지 프리로딩 (성능 최적화)

- **문제**: 히어로 이미지가 모뎀처럼 위에서 줄 단위로 렌더링되는 현상
- **해결책**:
  1. `index.html`에 `<link rel="preload" as="image" href="/images/hero-lighthouse-1.png">` 추가
  2. `Helmet`에 나머지 히어로 이미지 preload 링크 추가
  3. `heroReady` 상태 도입: 첫 번째 이미지 완전 로딩 후 fade-in
  4. 나머지 이미지는 `new Image()` 객체로 백그라운드 프리로드
  5. 2초 후 폴백 (이미지 로딩 실패 시에도 히어로 표시)
- **CSS 처리**: 이미지 로딩 전 `.slide`, `.heroContent` 등 `opacity: 0` → `.heroReady` 클래스 추가 시 fade-in

---

## 프로젝트 구조

```
D:/hohai/
├── public/
│   ├── images/
│   │   ├── hero-lighthouse-1.png   # 슬라이드 1: 밤바다 등대
│   │   ├── hero-sunset-a.png       # 슬라이드 2: 석양
│   │   ├── hero-forest.png         # 슬라이드 3: 숲
│   │   ├── hero-lighthouse-3.png   # 슬라이드 4: 황혼 등대
│   │   └── hero-lighthouse-2.png   # 슬라이드 7: 블루아워 등대
│   └── favicon.svg
├── src/
│   ├── main.tsx                    # 앱 진입점
│   ├── App.tsx                     # 라우터 설정
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 7개 메뉴 네비게이션
│   │   │   ├── Footer.tsx          # 푸터
│   │   │   ├── Layout.tsx          # 공통 레이아웃
│   │   │   ├── PageTransition.tsx  # framer-motion 페이지 전환
│   │   │   ├── ProtectedRoute.tsx  # 인증 필요 라우트
│   │   │   ├── AuthGuard.tsx       # 인증 가드
│   │   │   └── AdminGuard.tsx      # 관리자 가드
│   │   └── ui/
│   │       ├── PoemCard.tsx        # 시 카드 컴포넌트
│   │       ├── SongCard.tsx        # 노래 카드 (YouTube + Suno)
│   │       ├── YouTubeEmbed.tsx    # YouTube lazy embed
│   │       ├── SunoEmbed.tsx       # Suno AI lazy embed
│   │       ├── HeroEffects.tsx     # Canvas 기반 히어로 효과
│   │       └── CategoryFilter.tsx  # 카테고리 필터 pill
│   ├── pages/
│   │   ├── HomePage.tsx            # 메인 (히어로 + 최신 시 + 노래)
│   │   ├── FeaturedPoemsPage.tsx   # 추천 시 목록
│   │   ├── PoemsPage.tsx           # 시집 소개
│   │   ├── PoemSeriesPage.tsx      # 시집 상세
│   │   ├── PoemDetailPage.tsx      # 시 상세
│   │   ├── FeaturedSongsPage.tsx   # 추천 노래 목록
│   │   ├── SongsPage.tsx           # 앨범별 소개
│   │   ├── SongSeriesPage.tsx      # 앨범 상세
│   │   ├── ReviewsPage.tsx         # 감상 후기
│   │   ├── AboutPage.tsx           # 시인 소개
│   │   ├── AdminPage.tsx           # 관리자 대시보드
│   │   ├── LoginPage.tsx           # 로그인
│   │   ├── RegisterPage.tsx        # 회원가입
│   │   ├── ForgotPasswordPage.tsx  # 비밀번호 찾기
│   │   └── MyPagePage.tsx          # 마이페이지
│   ├── hooks/
│   │   ├── usePoems.ts             # 시 데이터 훅
│   │   ├── useSongs.ts             # 노래 데이터 훅
│   │   ├── useCategories.ts        # 카테고리 훅
│   │   ├── useSeries.ts            # 시리즈 훅
│   │   ├── useReviews.ts           # 감상 후기 훅
│   │   └── useAuth.ts              # 인증 훅
│   ├── contexts/
│   │   └── AuthContext.tsx          # 인증 컨텍스트
│   ├── lib/
│   │   ├── supabase.ts             # Supabase 클라이언트
│   │   ├── auth.ts                 # 인증 유틸
│   │   ├── constants.ts            # 사이트 상수
│   │   └── sampleData.ts           # 샘플 데이터
│   ├── types/
│   │   ├── poem.ts                 # 시 타입
│   │   ├── song.ts                 # 노래 타입 (YouTube + Suno)
│   │   ├── category.ts             # 카테고리 타입
│   │   ├── series.ts               # 시리즈 타입
│   │   └── review.ts               # 감상 후기 타입
│   └── styles/
│       ├── globals.css             # CSS 변수 + 글로벌 스타일
│       ├── fonts.css               # 웹폰트
│       └── auth.css                # 인증 페이지 스타일
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.local                      # Supabase 환경변수
└── CNAME                           # hohai.dreamitbiz.com
```

---

## 히어로 슬라이드 구성 (최종)

| # | 이름 | 배경 | Canvas 효과 |
|---|------|------|------------|
| 1 | 빨간 등대 (밤) | `hero-lighthouse-1.png` | 수면 반짝임 + 빛 입자 |
| 2 | 석양 바다 | `hero-sunset-a.png` | 물결 shimmer + 따뜻한 먼지 |
| 3 | 숲 | `hero-forest.png` | 빛줄기 + 먼지 + 반딧불 + 낙엽 |
| 4 | 황혼 등대 | `hero-lighthouse-3.png` | 따뜻한 물결 shimmer + 황금빛 입자 |
| 5 | 비 오는 도시 | CSS 그라데이션 + SVG | 네온 반사 + 빗줄기 + 번개 |
| 6 | 밤바다 | CSS 그라데이션 | 오로라 + 유성 + 발광 플랑크톤 |
| 7 | 블루아워 등대 | `hero-lighthouse-2.png` | 수면 반사 + 빛 기둥 + 은은한 입자 |

---

## 기술적 특이사항

### Canvas 파티클 시스템 (HeroEffects.tsx)
- `Float64Array` 기반 파티클 저장 (x, y, size, speed/phase × 파티클 수)
- 슬라이드별 최적화된 파티클 수 (30~200개)
- `requestAnimationFrame` 루프 + DPR(Device Pixel Ratio) 대응
- 슬라이드 전환 시 파티클 + extra 데이터(번개/유성) 자동 초기화

### Suno AI 임베드 패턴
- URL에서 곡 ID 추출: `/song/` 또는 `/s/` 패턴 매칭
- 임베드 URL 변환: `https://suno.com/embed/{songId}`
- 레이지 로딩: 플레이스홀더 클릭 → iframe 로드

### 이미지 프리로딩 전략
- `<link rel="preload">` (index.html): 브라우저 최우선 다운로드
- `new Image()` JS 프리로드: 나머지 이미지 백그라운드 다운로드
- `heroReady` 상태: 첫 이미지 로딩 완료 시 fade-in 트리거
- 2초 폴백 타이머: 네트워크 느린 환경 대응
