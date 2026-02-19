# 호해(이성헌) 시인 웹사이트 기획안

## Context

아버지(호해, 이성헌 시인)의 취미 사이트를 제작하는 프로젝트.
시와 노래를 홍보하는 감성적인 웹사이트를 `hohai.dreamitbiz.com`에 구축한다.
기존 `www.dreamitbiz.com`의 Supabase DB를 공유하여 `hohai_` prefix 테이블을 추가 사용한다.

---

## 1. 기술 스택

| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | React + Vite + TypeScript | www.dreamitbiz.com과 동일 |
| 라우팅 | React Router v7 | 멀티 페이지 구성 |
| DB | Supabase (기존 프로젝트 공유) | `hohai_` prefix 테이블 |
| 애니메이션 | framer-motion | 감성적 페이지 전환/카드 효과 |
| SEO | react-helmet-async | 시 제목/내용 동적 메타 태그 |
| CSS | 순수 CSS (CSS 변수 + CSS Modules) | 감성적 디자인에 커스텀 CSS 적합 |
| 배포 | Vercel (무료 Hobby 플랜) | SPA 라우팅 자동 지원, 환경변수 관리 |

---

## 2. 사이트 구조 (페이지 & 라우팅)

```
/              → 메인 (히어로 + 최신 시 + 노래 하이라이트 + 시인 소개 요약)
/poems         → 시 목록 (카드 갤러리 + 카테고리 필터)
/poems/:id     → 시 상세 (한지 질감 배경, 시적 타이포그래피)
/songs         → 노래 목록 (유튜브 임베드 카드)
/about         → 시인 소개 (프로필, 시 세계관, 약력)
/admin/login   → 관리자 로그인
/admin         → 관리자 대시보드 (시/노래 CRUD)
```

**네비게이션**: 상단 고정바 `[호해 로고] [홈] [시(詩)] [노래] [시인 소개]` + 모바일 햄버거 메뉴

---

## 3. 주요 페이지 기획

### 메인 (`/`)
1. **히어로**: 수채화 그라데이션 배경 + 대표 시 한 구절 + "호해" 캘리그래피풍 로고
2. **최신 시 3편**: 파스텔 그라데이션 카드 가로 배열
3. **노래 하이라이트**: 대표 1곡 유튜브 임베드
4. **시인 소개 요약**: 원형 사진 + 짧은 소개 + "자세히 보기"

### 시 목록 (`/poems`)
- 카테고리 필터 pill (전체/사랑/자연/계절/인생 등)
- **카드 그리드**: 각 카드에 카테고리별 파스텔 수채화 배경, 제목, 첫 3-4행 미리보기
- 호버 시 카드 상승 효과 + 그림자 강화
- 스크롤 시 카드 fade-in 등장

### 시 상세 (`/poems/:id`)
- 한지 질감 배경, 중앙 정렬(max-width 680px)
- Noto Serif KR 명조체, 행간 2.2, 연(stanza) 사이 여백
- 좌측 가느다란 세로 장식선
- 이전/다음 시 네비게이션

### 노래 (`/songs`)
- 2열(모바일 1열) 카드 그리드
- 유튜브 썸네일 → 클릭 시 인라인 iframe 재생 (lite-youtube 패턴)
- 곡 제목, 설명, 가사(선택)

### 시인 소개 (`/about`)
- 프로필 사진 + 호(號): 호해 / 본명: 이성헌
- 시인의 말 (인용 블록), 약력 타임라인(선택)
- 유튜브 채널 링크, 연락처

---

## 4. Supabase DB 스키마

### hohai_poems
```sql
CREATE TABLE hohai_poems (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  category      TEXT DEFAULT '기타',
  tags          TEXT[] DEFAULT '{}',
  bg_theme      SMALLINT DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT TRUE,
  written_date  DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### hohai_songs
```sql
CREATE TABLE hohai_songs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  youtube_id    TEXT NOT NULL,
  lyrics        TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT TRUE,
  recorded_date DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### hohai_categories
```sql
CREATE TABLE hohai_categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### hohai_site_config
```sql
CREATE TABLE hohai_site_config (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS 정책
- 모든 테이블: 공개 읽기 (`is_published = TRUE`), 인증된 사용자만 쓰기/수정/삭제
- `updated_at` 자동 갱신 트리거 적용

---

## 5. 디자인 컨셉

### 색상 팔레트 ("따뜻한 한지 위의 먹물과 수채화")
- 배경: `#FAF6F0` (한지/아이보리), `#F3EDE4`
- 텍스트: `#2C2420` (먹물), `#6B5E54`, `#A39485`
- 포인트: `#C4956A`(황토), `#8FA89A`(세이지), `#9BB5C9`(하늘), `#B0879B`(자두)
- 카드 배경: 8가지 파스텔 그라데이션 프리셋

### 타이포그래피
- 시 제목/본문: **Noto Serif KR** (명조) — 시적이고 전통적
- UI/네비: **Noto Sans KR** (고딕) — 깔끔한 가독성
- 호해 로고: **Nanum Myeongjo Bold** 또는 캘리그래피 이미지

### 시각적 특징
- 한지 질감 텍스처 오버레이 (opacity 0.03~0.05)
- 시 카드 호버: 종이를 집어올리듯 `translateY(-4px)` + 그림자 확대
- 페이지 전환: framer-motion fade + slideUp
- 여백의 미: 넉넉한 패딩/마진

---

## 6. 프로젝트 구조

```
D:/hohai/
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── textures/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── vercel.json
└── CNAME
```

---

## 7. 개발 로드맵

### Phase 1: 프로젝트 초기화 & 기반
### Phase 2: Supabase DB 구축
### Phase 3: 메인 페이지
### Phase 4: 시 목록 + 상세 페이지
### Phase 5: 노래 페이지
### Phase 6: 시인 소개 페이지
### Phase 7: 관리자 기능
### Phase 8: 마무리 & 배포
