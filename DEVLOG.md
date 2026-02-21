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

## 2026-02-21 (Day 3, 2차) — 시 177편 카테고리 분류 + 해시태그 등록 + Admin 관리 강화

### 배경

- DB에 등록된 177편의 시가 모두 `category: '시'`, `tags: []` 상태
- 사용자 요청: 사랑, 작별, 그리움, 기다림, 추억, 인생, 회한 등으로 분류 + 해시태그 등록

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

#### 1. `src/data/poem-categories.ts` (신규)
- 177편 전체 시를 page 번호 기반으로 카테고리 + 태그 매핑
- `CATEGORY_LIST`: 9개 카테고리 목록 (name, slug, description, order)
- `POEM_CLASSIFICATIONS`: page → { category, tags } Record (각 시 3~5개 태그)

#### 2. `src/lib/constants.ts` 업데이트
- `CATEGORY_COLORS`: 기존 6개(사랑, 자연, 계절, 인생, 그리움, 기타) → 9개 카테고리 색상으로 교체
- `CATEGORY_NAMES`: 카테고리 이름 배열 추가 (순서 보장)

#### 3. `src/pages/AdminPage.tsx` — 대폭 강화

**PoemsAdmin (시 관리)**:
- 카테고리 `<input>` → `<select>` 드롭다운 변경 (오타 방지)
- 카테고리별 통계 바 추가 (클릭하면 해당 카테고리 필터링)
- 카테고리 필터 + 제목/태그 검색 기능 추가
- 태그 컬럼 추가 (시 목록 테이블에 `#태그` 표시)
- 카테고리 색상 배지 표시

**DbInitAdmin (DB 초기화)**:
- `handleSeedPoems` 수정: 시 등록 시 분류 데이터 자동 반영 (9개 카테고리 + 태그)
- **카테고리/태그 일괄 업데이트** 버튼 추가: 기존 DB 시의 카테고리/태그만 일괄 변경
- **카테고리 현황 보기** 버튼 추가: 카테고리별 시 수 + 인기 태그 TOP 20 통계

#### 4. 프론트엔드 카테고리 색상 적용

| 파일 | 변경 내용 |
|------|----------|
| `CategoryFilter.tsx` | 카테고리별 색상 dot + 활성 시 해당 색상 배경 |
| `CategoryFilter.module.css` | `.dot` 스타일 추가 |
| `PoemCard.tsx` | 카테고리 텍스트에 고유 색상 적용 |
| `PoemDetailPage.tsx` | 카테고리 텍스트에 고유 색상 적용 |

### 파일 변경 요약
```
 src/data/poem-categories.ts        | 200+ (신규 — 177편 분류 매핑)
 src/lib/constants.ts               |  15  (9개 카테고리 색상)
 src/pages/AdminPage.tsx            | 120+ (필터, 통계, 일괄 업데이트)
 src/components/ui/CategoryFilter.tsx   |  18  (색상 dot + 활성 배경)
 src/components/ui/CategoryFilter.module.css | 8 (dot 스타일)
 src/components/ui/PoemCard.tsx     |   4  (카테고리 색상)
 src/pages/PoemDetailPage.tsx       |   4  (카테고리 색상)
 7 files changed, ~370 insertions(+), ~30 deletions(-)
```

### 사용 방법
1. `/admin` → **DB 초기화** 탭
2. (신규 등록 시) **시 177편 일괄 등록**: 자동으로 9개 카테고리 + 태그 포함 등록
3. (기존 데이터 업데이트 시) **카테고리/태그 일괄 업데이트**: 기존 시의 분류만 변경
4. **카테고리 현황 보기**: 분류 결과 통계 확인
5. **시 관리** 탭에서 카테고리 필터/검색으로 확인

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
│   ├── data/
│   │   ├── poems.ts                # 177편 시 원본 데이터
│   │   └── poem-categories.ts      # 177편 카테고리/태그 분류
│   ├── lib/
│   │   ├── supabase.ts             # Supabase 클라이언트
│   │   ├── auth.ts                 # 인증 유틸
│   │   └── constants.ts            # 사이트 상수 (9개 카테고리 색상)
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

---

## 2026-02-22 (Day 4) — LyricsPlayer 무드 기반 배경 + Canvas 시각 효과

### 배경

- LyricsPlayer 풀스크린 오버레이가 단일 네이비 그라디언트(#071A33→#0A3D7A→#1466A8→#0D5699)만 사용
- 사용자 요청: 노래 태그(무드)에 따라 배경색을 다르게 + JS 시각 효과 추가
- 기존 `HeroEffects.tsx` Canvas 파티클 시스템 아키텍처 재활용

### 무드 분류 체계

기존 9개 카테고리(`CATEGORY_COLORS`)와 `song.tags`를 활용한 무드 감지.

| 무드 | 그라디언트 톤 | Canvas 효과 |
|------|-------------|------------|
| 사랑 | 따뜻한 코랄/레드 (#2A0F0D~#8B3A30) | 떠다니는 하트 + 꽃잎 |
| 그리움 | 쿨 블루 (#071A33~#1A5276) | 느린 비 + 수면 물결 |
| 작별 | 뮤트 모브/핑크 (#1F0F1A~#6B3060) | 흩날리는 꽃잎 (→ fade out) |
| 추억 | 따뜻한 피치/앰버 (#2A1A0A~#7A4C28) | 따뜻한 보케 빛 (radialGradient) |
| 인생 | 딥 오션 블루 (#051525~#104575) | 동심원 물결 파장 |
| 가족 | 소프트 그린 (#0A1F10~#2A6040) | 따뜻한 반딧불 (글로우 헤일로) |
| 자연 | 틸 (#081A1C~#1A5858) | 낙엽 + 반짝이 점 |
| 세상 | 뮤트 퍼플 (#1A101A~#503060) | 기하학적 도형 (삼각형/사각형/육각형) |
| 의지 | 골든 앰버 (#1F1808~#705020) | 상승하는 불꽃/불씨 |
| default | 네이비 (기존 유지) | 부유하는 빛 입자 |

### 변경 내역

#### 1. `src/lib/mood.ts` (신규)

- `MoodKey` 타입: 9개 카테고리 + `'default'`
- `detectMood(tags)`: tags에서 첫 매칭 카테고리 반환, 없으면 `'default'`
- `MOOD_GRADIENTS`: 무드별 4색 그라디언트 (어두운 톤, 흰 텍스트 가독성 확보)
- `MOOD_PARTICLE_COLORS`: 무드별 파티클 RGB 색상 (primary + secondary)

#### 2. `src/components/ui/LyricsEffects.tsx` (신규)

- `HeroEffects.tsx`와 동일 아키텍처: `Float64Array` 파티클, `requestAnimationFrame`, DPR 대응
- 10개 무드별 draw 함수: `drawLove`, `drawLonging`, `drawFarewell`, `drawMemory`, `drawLife`, `drawFamily`, `drawNature`, `drawWorld`, `drawWill`, `drawDefault`
- Props: `{ mood: MoodKey, isActive: boolean }`
- 파티클 수: 40개 (무드 공통)
- `pointer-events: none` — 클릭 가로채지 않음

#### 3. `src/components/ui/LyricsPlayer.module.css` (수정)

- `.overlay` 배경: 하드코딩 → CSS custom properties (`var(--mood-c1)` ~ `var(--mood-c4)`)
- `.content`: `position: relative; z-index: 2` 추가 (canvas 위에 콘텐츠 표시)

#### 4. `src/components/ui/LyricsPlayer.tsx` (수정)

- `detectMood`, `MOOD_GRADIENTS` import
- `LyricsEffects` import
- `const mood = detectMood(song.tags)` → 무드 감지
- overlay div에 `style={{ '--mood-c1': gradient.c1, ... }}` 인라인 설정
- `<LyricsEffects mood={mood} isActive={isOpen} />` — overlay 첫 번째 자식으로 렌더

### 파일 변경 요약

```
 src/lib/mood.ts                          | 50+ (신규)
 src/components/ui/LyricsEffects.tsx      | 380+ (신규)
 src/components/ui/LyricsPlayer.module.css |  8 (CSS 변수 + z-index)
 src/components/ui/LyricsPlayer.tsx       | 12 (mood 통합)
 4 files changed, ~450 insertions(+), ~3 deletions(-)
```

### 기술적 특이사항

- CSS + Canvas 혼합 방식: CSS 그라디언트 애니메이션(배경) + Canvas 파티클 오버레이(시각 효과)
- 무드 전환 시 파티클 자동 재초기화
- 메모리 관리: `cancelAnimationFrame` + `removeEventListener`로 cleanup
- 모바일 대응: DPR 제한(max 2), resize 핸들링
