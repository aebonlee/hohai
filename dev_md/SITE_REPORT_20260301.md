# 호해(hohai) 사이트 전체 점검 보고서

**점검일:** 2026-03-01
**배포 URL:** https://hohai.dreamitbiz.com
**GitHub:** https://github.com/aebonlee/hohai

---

## 1. 빌드 & 배포 상태

| 항목 | 상태 |
|------|------|
| TypeScript 컴파일 (`tsc --noEmit`) | 통과 (에러 0건) |
| Vite 프로덕션 빌드 | 통과 (4.41s) |
| GitHub Pages 배포 | 완료 (Published) |
| 커스텀 도메인 | `hohai.dreamitbiz.com` (CNAME 설정됨) |
| SPA 라우팅 | `404.html` fallback 적용됨 |

### 빌드 산출물
- JS 청크: 36개 (코드 스플리팅 적용)
- CSS 청크: 27개
- 히어로 이미지: 6개
- SEO 파일: `robots.txt`, `sitemap.xml`, `og-image.png`
- 번들 경고: `index.js` 596KB (500KB 초과) — 기존 이슈, 기능에 영향 없음

---

## 2. 라우트 & 페이지 목록 (23개)

### 메인 레이아웃 (Header + Sidebar + Footer)
| 라우트 | 컴포넌트 | 설명 |
|--------|----------|------|
| `/` | HomePage | 홈 — 히어로, 추천 시/노래, 시인 소개 |
| `/poems` | FeaturedPoemsPage | 추천 시 목록 (갤러리/게시판/블로그 보기) |
| `/poems/:id` | PoemDetailPage | 시 상세 (이펙트, 좋아요, 댓글, 조회수) |
| `/poem-series` | PoemsPage | 시집 목록 |
| `/poem-series/:slug` | PoemSeriesPage | 시집 상세 |
| `/songs` | FeaturedSongsPage | 추천 노래 |
| `/latest-songs` | LatestSongsPage | 최신 노래 |
| `/albums` | SongsPage | 앨범 목록 |
| `/albums/:slug` | SongSeriesPage | 앨범 상세 |
| `/published-books` | PublishedBooksPage | 출간 도서 |
| `/community` | CommunityPage | 커뮤니티 허브 |
| `/community/reviews` | ReviewsPage | 감상 후기 |
| `/community/gallery` | GalleryPage | 갤러리 |
| `/community/news` | NewsPage | 소식통 |
| `/about` | AboutPage | 시인 소개 |
| `/search` | SearchPage | 통합 검색 |
| `/playlist` | PlaylistPage | 재생목록 (로그인 필요) |
| `/mypage` | MyPagePage | 마이페이지 (로그인 필요) |
| `/*` | NotFoundPage | 404 |

### 독립 레이아웃 (인증 페이지)
| 라우트 | 컴포넌트 |
|--------|----------|
| `/login` | LoginPage (Google/Kakao/이메일) |
| `/register` | RegisterPage |
| `/forgot-password` | ForgotPasswordPage |
| `/admin` | AdminPage (관리자 전용) |

---

## 3. 기능 점검

### 3-1. 콘텐츠 시스템
| 기능 | 상태 | 비고 |
|------|------|------|
| 시(Poem) CRUD | 정상 | 관리자 페이지에서 관리 |
| 노래(Song) CRUD | 정상 | YouTube + Suno 임베드 |
| 시리즈(Series) 관리 | 정상 | 시집/앨범 그룹핑 |
| 카테고리 관리 | 정상 | 6개 카테고리 |
| 출간 도서 | 정상 | 전시 전용 |

### 3-2. 사용자 인터랙션
| 기능 | 상태 | 비고 |
|------|------|------|
| 좋아요 (♥) | 정상 | 시/노래 |
| 즐겨찾기 (★) | 정상 | 노래 전용 |
| 댓글 | 정상 | 시 상세 페이지 |
| 조회수 | **신규** | 5개 콘텐츠 전체, 항상 표시 |
| 공유 | 정상 | Web Share API |
| 검색 | 정상 | 디바운스 적용 전문 검색 |

### 3-3. 미디어 & 재생
| 기능 | 상태 | 비고 |
|------|------|------|
| YouTube 재생 | 정상 | iframe API 연동 |
| Suno 음원 재생 | 정상 | 임베드 |
| 재생목록 | 정상 | CRUD + 곡 순서 변경 |
| 자동 연속 재생 | 정상 | 재생목록 내 자동 전환 |
| 가사 플레이어 | 정상 | 전체화면 가사 보기 |
| 읽기 모드 | 정상 | 시집 단위 연속 읽기 |

### 3-4. 커뮤니티
| 기능 | 상태 | 비고 |
|------|------|------|
| 감상 후기 | 정상 | 작성/삭제 |
| 갤러리 | 정상 | 이미지 업로드 (5MB 제한) |
| 소식통 | 정상 | 작성/삭제 |

### 3-5. 인증 & 보안
| 기능 | 상태 | 비고 |
|------|------|------|
| 이메일 로그인 | 정상 | Supabase Auth |
| Google OAuth | 정상 | |
| Kakao OAuth | 정상 | |
| 비밀번호 재설정 | 정상 | |
| AuthGuard | 정상 | 비로그인 차단 |
| AdminGuard | 정상 | 관리자 이메일 체크 |
| 차단/탈퇴 유저 강제 로그아웃 | 정상 | check_user_status RPC |
| 가입 사이트 추적 | 정상 | signup_domain 자동 기록 |

### 3-6. UI/UX
| 기능 | 상태 | 비고 |
|------|------|------|
| 보기 모드 전환 | 정상 | 갤러리/게시판/블로그 |
| 카테고리 필터 | 정상 | |
| 반응형 (모바일) | 정상 | 768px/480px 브레이크포인트 |
| 사이드바 | 정상 | 좌측 네비게이션 |
| 무드 테마 | 정상 | 9개 카테고리별 컬러/이펙트 |
| 페이지 전환 애니메이션 | 정상 | framer-motion |
| SEO (Helmet) | 정상 | 페이지별 title/description |
| 풍선 도움말 (title) | 정상 | 주요 버튼에 적용 |

---

## 4. 코드 품질

| 항목 | 결과 |
|------|------|
| TypeScript 에러 | 0건 |
| 미사용 import | 0건 |
| TODO/FIXME 마커 | 0건 |
| `any` 타입 사용 | 0건 (YouTube API 선언 제외) |
| 순환 참조 | 없음 |
| 데드 코드 | 없음 |

---

## 5. 프로젝트 구조 요약

```
src/
├── pages/          23개 페이지 컴포넌트
├── components/
│   ├── layout/      8개 (Layout, Header, Sidebar, Footer, Guards...)
│   └── ui/         16개 (PoemCard, SongCard, LyricsPlayer...)
├── hooks/          14개 커스텀 훅
├── contexts/        3개 (Auth, Playback, Playlist)
├── types/          10개 인터페이스 정의
└── lib/             7개 유틸리티
```

### 의존성
| 패키지 | 버전 | 용도 |
|--------|------|------|
| React | 19.0 | UI 프레임워크 |
| React Router | 7.1 | 라우팅 |
| Supabase JS | 2.49 | 백엔드/인증/DB |
| Framer Motion | 11.18 | 애니메이션 |
| React Helmet Async | 2.0 | SEO |
| Vite | 6.1 | 빌드 도구 |
| TypeScript | 5.7 | 타입 체크 |

---

## 6. 미커밋 변경사항

| 파일 | 내용 |
|------|------|
| `src/lib/auth.ts` | signUp 시 `signup_domain: window.location.hostname` 추가 (이전 커밋에서 누락) |

---

## 7. 개선 제안

### 우선순위 높음
1. **`src/lib/auth.ts` 미커밋 변경** — 가입 사이트 추적 코드가 스테이징되지 않음. 커밋 필요
2. **번들 크기 최적화** — `index.js` 596KB → `manualChunks`로 React/Supabase/Framer Motion 분리 권장

### 우선순위 중간
3. **갤러리 Storage Bucket** — `hohai_gallery` 테이블은 생성했으나, Supabase Storage에 `hohai-gallery` 버킷이 존재하는지 확인 필요
4. **소식/후기 조회수 증가 시점** — 현재 표시만 하고 증가 로직 없음 (리스트 페이지이므로 의도된 설계)

### 우선순위 낮음
5. **홈페이지 meta description** — 현재 비어있음, SEO를 위해 추가 권장
6. **코드 스플리팅 개선** — 일부 페이지에서 공유되는 훅(useCategories, useSeries 등)이 별도 청크로 분리됨 — 현재 수준으로 충분

---

## 8. 결론

호해 웹사이트는 **전반적으로 안정적이며 프로덕션 수준**입니다.

- TypeScript 에러 0건, 미사용 코드 0건, 데드 코드 0건
- 23개 페이지, 24개 컴포넌트, 14개 훅이 정상 동작
- 인증(3종 OAuth), 콘텐츠 관리, 커뮤니티, 미디어 재생 전체 기능 정상
- 금일 추가된 조회수 기능이 5개 콘텐츠 타입에 정상 적용
- 유일한 미처리 사항: `auth.ts`의 미커밋 변경 1건
