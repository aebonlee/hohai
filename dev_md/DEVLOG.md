# 호해 웹사이트 개발일지

---

## 2026-03-01 — 전체 사이트 점검 + 미커밋 auth.ts 반영

### 배경

조회수 기능 배포 후 전체 사이트 점검 수행. 23개 페이지, 24개 컴포넌트, 14개 훅 전수 검사.
점검 과정에서 이전 커밋(가입 사이트 추적)에서 누락된 `auth.ts` 변경사항 발견.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `dev_md/SITE_REPORT_20260301.md` | **새 파일** — 전체 사이트 점검 보고서 |
| `src/lib/auth.ts` | signUp 시 `signup_domain: window.location.hostname` 추가 (이전 커밋 누락분) |

### 점검 결과 요약

- TypeScript 에러: 0건
- 미사용 import / 데드 코드: 0건
- TODO/FIXME 마커: 0건
- 빌드: 통과 (4.41s)
- 배포: GitHub Pages 정상
- 모든 기능(인증, 콘텐츠, 커뮤니티, 미디어, 조회수) 정상 동작 확인

---

## 2026-03-01 — 모든 콘텐츠에 조회수(view_count) 기능 추가

### 배경

시, 노래, 소식, 갤러리, 감상후기 5개 콘텐츠 타입에 좋아요/즐겨찾기/댓글은 있지만 조회수가 없었음.
사용자 요청으로 전체 콘텐츠에 조회수 추적 + 표시 기능을 일괄 추가.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `dev_md/migration.sql` | `hohai_news`, `hohai_gallery` 테이블 생성 + 5개 테이블 `view_count` 컬럼 + `hohai_increment_view` RPC 함수 |
| `src/types/poem.ts` | `Poem` 인터페이스에 `view_count: number` 추가 |
| `src/types/song.ts` | `Song` 인터페이스에 `view_count: number` 추가 |
| `src/types/news.ts` | `NewsItem` 인터페이스에 `view_count: number` 추가 |
| `src/types/gallery.ts` | `GalleryItem` 인터페이스에 `view_count: number` 추가 |
| `src/types/review.ts` | `Review` 인터페이스에 `view_count: number` 추가 |
| `src/hooks/useViewCount.ts` | **새 파일** — `useViewCount` 훅(자동 증가) + `useIncrementView` 함수(이벤트 기반 증가) |
| `src/pages/PoemDetailPage.tsx` | 마운트 시 조회수 증가 + 제목 아래 `조회 N` 표시 |
| `src/components/ui/PoemCard.tsx` | 카드 footer에 조회수 표시 |
| `src/components/ui/SongCard.tsx` | 재생 버튼 클릭 시 조회수 증가 + `▶ N` 표시 |
| `src/pages/FeaturedPoemsPage.tsx` | 게시판 보기에 "조회" 컬럼 + 블로그 보기에 `조회 N` 표시 |
| `src/pages/PoemSeriesPage.tsx` | 게시판/블로그 보기에 조회수 표시 |
| `src/pages/NewsPage.tsx` | 뉴스 카드 헤더에 `조회 N` 표시 |
| `src/pages/GalleryPage.tsx` | 이미지 클릭 시 조회수 증가 + 갤러리 메타에 표시 |
| `src/pages/ReviewsPage.tsx` | 후기 헤더에 `조회 N` 표시 |
| `*.module.css` (7개) | 조회수 표시 관련 CSS 클래스 추가 |

### 구현 상세

1. **DB 스키마** — 각 테이블에 `view_count INTEGER DEFAULT 0` 컬럼 추가. `hohai_increment_view(p_table, p_id)` RPC 함수로 원자적 +1 증가 (SECURITY DEFINER로 RLS 우회)
2. **useViewCount 훅** — 페이지 마운트 시 자동 호출. `sessionStorage`에 `viewed_{table}_{id}` 키로 세션당 1회만 증가
3. **useIncrementView** — 재생/클릭 등 이벤트 기반 증가용. 동일하게 sessionStorage 중복 방지
4. **조회수 증가 시점** — 시(상세 페이지 마운트), 노래(재생 클릭), 갤러리(이미지 클릭)
5. **조회수 표시** — 0이어도 항상 표시. `?? 0` fallback으로 null 안전 처리

### 주요 기술 결정

1. **SECURITY DEFINER** — 비로그인 사용자도 조회수 증가 가능하도록 RLS 우회
2. **sessionStorage 기반 중복 방지** — 같은 세션에서 같은 콘텐츠 재방문 시 조회수 미증가. 탭/브라우저 닫으면 초기화
3. **누락 테이블 생성** — `hohai_news`, `hohai_gallery`가 DB에 미존재하여 마이그레이션에 CREATE TABLE 포함

---

## 2026-02-28 — 가입 사이트 자동 추적 + 차단/탈퇴 유저 강제 로그아웃

### 배경

서브도메인 간 공유 Supabase를 사용하는 구조에서, 사용자가 어느 사이트에서 가입했는지(`signup_domain`)와
방문한 사이트 목록(`visited_sites`)을 자동 추적하는 기능이 필요.
또한 차단/탈퇴 상태의 유저가 로그인을 시도할 경우 강제 로그아웃 처리가 필요.

DB 함수(`check_user_status`)는 공유 Supabase에 이미 설치되어 있으므로,
프론트엔드에서 로그인/세션 복원 시점에 RPC 호출만 추가하면 됨.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/contexts/AuthContext.tsx` | `loadProfile()` 함수 내 프로필 조회 후 `check_user_status` RPC 호출 추가 |

### 구현 상세

`loadProfile` 콜백에서 `getProfile()` 호출 이후 다음 로직 추가:

1. **`supabase.rpc('check_user_status')` 호출** — `target_user_id`(유저 ID)와 `current_domain`(`window.location.hostname`) 전달
2. **차단/탈퇴 유저 감지** — 응답의 `status`가 `active`가 아닌 경우:
   - 콘솔에 계정 상태 및 사유 출력
   - `supabase.auth.signOut()` 강제 로그아웃
   - `setUser(null)` + `setProfile(null)` 상태 초기화
3. **에러 핸들링** — `check_user_status` 함수 미존재 시 `catch`로 무시 (구버전 호환)

### 적용 범위

이 코드는 `loadProfile`이 호출되는 모든 시점에서 자동 실행:

| 시점 | 트리거 |
|------|--------|
| 앱 시작 | `getSession()` 성공 후 `loadProfile()` |
| 로그인 | `onAuthStateChange` → `SIGNED_IN` → `loadProfile()` |
| 프로필 수동 갱신 | `refreshProfile()` → `loadProfile()` |

### 주요 기술 결정

1. **`loadProfile` 내 삽입** — AuthContext에 인증 로직이 중앙 집중되어 있어, 한 곳만 수정하면 모든 인증 시점에서 동작
2. **프로필 조회 후 실행** — `getProfile()` 이후에 RPC를 호출하여, 차단 유저도 프로필 로드까지는 정상 진행 후 판별
3. **try/catch 구버전 호환** — DB 함수가 아직 없는 환경에서도 앱이 정상 동작하도록 에러 무시

---

## 2026-02-23 — 프로젝트 종합 분석 & 현황 정리

### 배경

프로젝트 전체 코드베이스 + GitHub 리포지토리(aebonlee/hohai)를 종합 분석하여 현황을 정리.

### 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 호해(好海) — 시인/음악가 이성헌 포트폴리오 & 스트리밍 |
| 유형 | React SPA (Single Page Application) |
| 배포 | GitHub Pages → `hohai.dreamitbiz.com` |
| 리포지토리 | github.com/aebonlee/hohai (Public, 81 commits) |
| 언어 비율 | TypeScript 85.7% / CSS 12.5% |
| 기여자 | 2명 |

### 기술 스택 현황

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React + TypeScript | 19.0.0 / ~5.7.0 |
| 빌드 | Vite | 6.1.0 |
| 라우팅 | React Router | 7.1.0 |
| 애니메이션 | Framer Motion | 11.18.0 |
| 백엔드/DB | Supabase (PostgreSQL + Auth + RLS) | 2.49.0 |
| 인증 | Email/Password, Google OAuth, Kakao OAuth | — |
| 스타일링 | CSS Modules + CSS 변수 | — |
| SEO | React Helmet Async | 2.0.5 |
| 배포 | gh-pages → GitHub Pages | — |

### 콘텐츠 규모

- **시(詩)**: 177편, 9개 카테고리 (사랑, 그리움, 작별, 추억, 인생, 가족, 자연, 세상, 의지)
- **음악**: 229곡 (Suno AI 생성), 7개 앨범
  - 바다의 노래 / 가슴에 핀 사랑 / 사계의 풍경 / 지나온 길 / Across Borders / 한국의 풍경 / 꿈과 혁신

### 구현 완료 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 시 열람 | ✅ 완료 | 카테고리별 탐색, 시리즈, 추천, 태그 필터링, 무드 배경 |
| 음악 스트리밍 | ✅ 완료 | YouTube/Suno 임베드, 가사 플레이어, 동시재생 방지 |
| 재생목록 | ✅ 완료 | CRUD, 셔플/반복, 즐겨찾기 원클릭, 이어듣기 |
| 커뮤니티 | ✅ 완료 | 리뷰, 갤러리(이미지 업로드), 소식통 |
| 인증 | ✅ 완료 | 이메일/Google/카카오 OAuth, 비밀번호 재설정 |
| 관리자 | ✅ 완료 | 대시보드, 시/노래/카테고리/후기/갤러리/소식통 관리 |
| 반응형 | ✅ 완료 | 모바일/태블릿/데스크톱 3단계 |
| SEO/접근성 | ✅ 완료 | 메타 태그, 풍선 도움말, ErrorBoundary, 404 |

### 페이지 구성 (20+)

```
/                    → HomePage (히어로 캐러셀 + 추천 콘텐츠)
/poems               → PoemsPage (시리즈 목록)
/poems/featured      → FeaturedPoemsPage (추천 시)
/poems/series/:id    → PoemSeriesPage (시리즈 상세)
/poems/:id           → PoemDetailPage (시 읽기 + 무드 배경)
/songs               → SongsPage (앨범 목록)
/songs/featured      → FeaturedSongsPage (추천 노래)
/songs/series/:id    → SongSeriesPage (앨범 상세)
/playlist            → PlaylistPage (개인 재생목록, 로그인 필수)
/community           → CommunityPage (커뮤니티 허브)
/community/reviews   → ReviewsPage (감상 후기)
/community/gallery   → GalleryPage (이미지 갤러리)
/community/news      → NewsPage (소식통)
/about               → AboutPage (시인 소개)
/mypage              → MyPagePage (내 정보)
/admin               → AdminPage (관리자)
/login               → LoginPage
/register            → RegisterPage
/forgot-password     → ForgotPasswordPage
```

### Supabase DB 테이블 (9개)

| 테이블 | 용도 |
|--------|------|
| `hohai_poems` | 시 (제목, 내용, 카테고리, 태그, bg_theme) |
| `hohai_songs` | 노래 (YouTube ID, Suno URL, 가사, 시리즈) |
| `hohai_series` | 시/노래 시리즈(앨범) |
| `hohai_categories` | 카테고리 정의 |
| `hohai_playlists` | 사용자 재생목록 (song_ids 배열) |
| `hohai_reviews` | 사용자 리뷰 |
| `hohai_gallery` | 커뮤니티 이미지 |
| `hohai_news` | 뉴스/공지 |
| `user_profiles` | 사용자 프로필 |

### 디자인 시스템

- **컬러**: 한지 아이보리(#FAF6F0) 기반, 골드/세이지/스카이/플럼 액센트
- **폰트**: Noto Serif KR(시), Noto Sans KR(UI), 나눔명조(로고)
- **타겟 UX**: 40~50대 이상 사용자 고려 (접근성 tooltip)

### 미커밋 파일 현황

```
scripts/bulk-register.mjs    — 시/노래 일괄 등록 스크립트
scripts/suno-extract.js      — Suno AI 데이터 추출
scripts/suno-fetch-test.mjs  — Suno fetch 테스트
scripts/suno_page.txt        — Suno 페이지 캡처
scripts/suno_test.html       — Suno 테스트 HTML
poems_parsed.json             — PDF 파싱 시 데이터
poem.pdf                      — 원본 시 PDF
```

### GitHub 리포지토리 현황

- **Stars**: 0 / **Forks**: 0 / **Issues**: 0 / **PRs**: 0
- **CI/CD**: `.github/workflows` 존재
- **CNAME**: `hohai.dreamitbiz.com`

---

## 2026-02-22 — 사이트 점검 & 안정성 개선

### 배경

전체 사이트 점검 후 발견된 버그, 성능, 안정성 문제를 일괄 수정.

### 버그 수정

| 문제 | 수정 |
|------|------|
| Footer `/reviews` 깨진 링크 | `/community/reviews`로 수정, "앨범별 소개" → "노래모음집" 반영 |
| PoemDetailPage 불필요한 전체 쿼리 | `usePoems`에 `enabled` 파라미터 추가, series_id 없는 시에서 전체 시 fetch 방지 |

### 안정성 개선

| 추가 | 설명 |
|------|------|
| ErrorBoundary 컴포넌트 | 렌더링 에러 시 백지 화면 대신 "문제가 발생했습니다" + 새로고침/홈 버튼 |
| 404 NotFoundPage | 존재하지 않는 경로 접근 시 안내 페이지 (`*` catch-all 라우트) |

### 성능 개선

| 변경 | 효과 |
|------|------|
| React.lazy 라우트 분할 | 18개 페이지 lazy loading. index 번들 717KB → 587KB (−18%), AdminPage 53KB 별도 분리 |

### 관리자 기능 확장

| 추가 | 설명 |
|------|------|
| 갤러리 관리 탭 | 이미지 썸네일 + 공개/비공개 토글 + 삭제 (Storage 동시 삭제) |
| 소식통 관리 탭 | 제목/내용 미리보기 + 공개/비공개 토글 + 삭제 |
| useAllGallery / useAllNews 훅 | Admin용 전체 조회 + update + delete |

### 코드 정리

| 정리 | 설명 |
|------|------|
| ProtectedRoute.tsx 삭제 | AdminGuard로 대체된 미사용 컴포넌트 제거 |
| getSunoEmbedUrl 유틸 추출 | SongCard, LyricsPlayer, SunoEmbed 3곳 중복 → `src/lib/suno.ts`로 통합 |

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (8.84s), 페이지별 청크 분리 확인

---

## 2026-02-22 — 커뮤니티 섹션 추가 + 메뉴 이름 변경

### 배경

상단 메뉴 "앨범별 소개" → "노래모음집" 이름 변경, "감상 후기" → "커뮤니티" 허브 페이지 전환.
커뮤니티 하위에 감상 후기(기존) + 갤러리(이미지 업로드) + 소식통(텍스트 게시판) 3개 게시판 구성.

### DB 마이그레이션 (Supabase SQL Editor)

- `hohai_gallery` 테이블 — title, image_url, description, author_name, user_id, RLS 3정책 (public read / auth insert / auth delete own)
- `hohai_news` 테이블 — title, content, author_name, user_id, RLS 3정책 (동일)
- `gallery` Storage bucket — public, auth upload/delete own 정책

### 신규 파일 (10개)

| 파일 | 설명 |
|------|------|
| `src/types/gallery.ts` | GalleryItem, GalleryItemInsert, GalleryItemUpdate 타입 |
| `src/types/news.ts` | NewsItem, NewsItemInsert, NewsItemUpdate 타입 |
| `src/hooks/useGallery.ts` | useGallery() CRUD + uploadGalleryImage() Storage 업로드, 삭제 시 Storage 파일 동시 삭제 |
| `src/hooks/useNews.ts` | useNews() CRUD 훅 |
| `src/pages/CommunityPage.tsx` | 커뮤니티 허브 — 3개 카드(💬 감상 후기, 🖼️ 갤러리, 📰 소식통) 링크, motion 애니메이션 |
| `src/pages/CommunityPage.module.css` | 3열 그리드, hover translateY(-4px) + gold border, 반응형 1열 |
| `src/pages/GalleryPage.tsx` | 이미지 게시판 — 제목+이미지 드래그/클릭 업로드(5MB)+설명, 3열 카드 그리드(4:3), 삭제 |
| `src/pages/GalleryPage.module.css` | dropzone, previewImg, 3열→2열→1열 반응형 |
| `src/pages/NewsPage.tsx` | 소식통 — 제목+내용 폼, 카드 리스트(제목 강조), 삭제 |
| `src/pages/NewsPage.module.css` | ReviewsPage 기반 + newsTitle 강조 스타일 |

### 수정 파일 (4개)

| 파일 | 변경 |
|------|------|
| `src/components/layout/Header.tsx` | NAV_ITEMS: "앨범별 소개" → "노래모음집", "감상 후기" → "커뮤니티" (`/community`) |
| `src/App.tsx` | `/reviews` 제거, `/community` (허브) + `/community/reviews` + `/community/gallery` + `/community/news` 4개 라우트 추가 |
| `src/pages/ReviewsPage.tsx` | `← 커뮤니티` 뒤로가기 링크 추가 |
| `src/pages/ReviewsPage.module.css` | `.backLink` 스타일 추가 |

### 커뮤니티 허브 구조

```
/community              → CommunityPage (3개 카드)
/community/reviews      → ReviewsPage (기존 감상 후기)
/community/gallery      → GalleryPage (이미지 게시판)
/community/news         → NewsPage (텍스트 게시판)
```

### 주요 기술 결정

1. **라우팅 구조** — `/community` 허브 + 하위 3개 서브 라우트. NavLink가 `end` 없이 `/community` 매칭하므로 하위 페이지에서도 헤더 active 상태 유지
2. **갤러리 이미지 Storage** — `gallery/{userId}/{timestamp}_{random}.{ext}` 경로로 업로드, 삭제 시 DB + Storage 동시 제거
3. **드래그 앤 드롭** — DragEvent + FileReader 미리보기, 5MB 제한 + 이미지 타입 검증
4. **useReviews 패턴 재사용** — useGallery, useNews 모두 동일한 fetch → create → delete 패턴 적용

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (5.22s)

---

## 2026-02-22 — 시 해시태그 카테고리 미연결 시 클릭 비활성화

### 배경

시의 해시태그 중 9개 카테고리(사랑, 그리움, 작별 등)에 해당하지 않는 태그를 클릭하면
의미 없는 필터 결과 페이지로 이동하는 문제.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/components/ui/PoemCard.tsx` | `CATEGORY_NAMES.includes(tag)` 체크 — 카테고리 태그만 `tagLink`(클릭 가능), 나머지 `tag`(일반 텍스트) |
| `src/components/ui/PoemCard.module.css` | `.tag` 스타일 추가 (클릭 불가 일반 태그) |
| `src/pages/PoemDetailPage.tsx` | 동일 로직 — 카테고리 태그만 `<Link>`, 나머지 `<span className={tagPlain}>` |
| `src/pages/PoemDetailPage.module.css` | `.tagPlain` 스타일 추가 (opacity 0.7, cursor 기본) |

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (10.25s)

---

## 2026-02-22 — 재생목록 전체재생/셔플 시 반복 모드 자동 설정

### 배경

PlaylistPage에서 "전체재생" 또는 "셔플"을 누르면 마지막 곡에서 멈추는 문제.
`repeatMode`가 기본 `'none'`으로 남아있어 이어듣기 후 반복이 안 됨.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/pages/PlaylistPage.tsx` | `handlePlayAll`, `handleShuffle`에서 `setRepeatMode('all')` 자동 호출 |

### 동작

- **전체재생** → `repeatMode` 자동 `'all'` → 마지막 곡 끝나면 첫 곡으로 순환
- **셔플** → `repeatMode` 자동 `'all'` → 셔플 순서대로 반복
- 사용자가 반복 버튼으로 `'one'`(한곡 반복) 또는 `'none'`(반복 끔)으로 변경 가능

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (12.10s)

---

## 2026-02-22 — 재생목록 곡 클릭 시 이어듣기 연동

### 배경

PlaylistPage에서 "전체재생" 버튼은 이어듣기가 작동하지만,
개별 곡 카드를 직접 클릭하면 해당 곡만 단독 재생되고 다음 곡으로 넘어가지 않는 문제.
원인: SongCard의 `play(song.id)` 호출이 PlaybackContext의 playlist를 세팅하지 않음.

### 변경 내용

| 파일 | 변경 |
|------|------|
| `src/components/ui/SongCard.tsx` | `contextPlaylist?: Song[]` prop 추가. 재생 시 `setPlaylist(contextPlaylist)` 호출 후 `play()` |
| `src/pages/PlaylistPage.tsx` | SongCard에 `contextPlaylist={playlistSongs}` 전달 |

### 동작 흐름

1. PlaylistPage에서 곡 카드 재생 버튼 클릭
2. `playWithContext()` → `setPlaylist(재생목록 전체 곡)` → `play(해당 곡 ID)`
3. PlaybackContext에 playlist가 세팅됨 → 곡 끝나면 `onSongEnd()`이 다음 곡 자동 재생
4. SongCard에 ⏮/⏭ 네비게이션 표시, 반복/셔플도 정상 동작

### 주요 기술 결정

- **contextPlaylist prop 방식**: PlaylistPage 외 다른 페이지의 SongCard는 영향 없음 (prop 미전달 시 기존 동작 유지)
- **setPlaylist + play 순서**: setPlaylist이 먼저 호출되어야 currentIndex 계산이 정확함

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (12.28s)

---

## 2026-02-22 — 즐겨찾기 추가 버그 수정 (레이스 컨디션 + 로그인 후 미갱신)

### 배경

♡ 하트 버튼으로 즐겨찾기에 곡을 추가해도 재생목록 페이지에 반영되지 않는 문제.

### 원인 분석

1. **레이스 컨디션**: `createPlaylist()` 후 `addSongToPlaylist()` 호출 시, React 상태(`playlists`)가 아직 갱신 안 됨 → 새 재생목록을 찾지 못해 곡이 추가 안 됨
2. **로그인 후 미갱신**: `usePlaylists`가 컴포넌트 마운트 시 1회만 fetch → 로그인 후에도 Supabase RLS가 빈 결과 반환했던 초기 값 유지

### 수정 내용

| 파일 | 수정 |
|------|------|
| `src/components/ui/AddToPlaylist.tsx` | `createPlaylist` 호출 시 `song_ids: [songId]`를 직접 전달하여 생성과 동시에 곡 포함 (별도 `addSongToPlaylist` 호출 제거) |
| `src/contexts/PlaylistContext.tsx` | `isLoggedIn` 변경 감지 `useEffect` 추가 → 로그인 시 `hook.refetch()` 호출 |

### 검증 결과

- `npx tsc --noEmit` — 통과
- `npx vite build` — 통과 (4.52s)

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
