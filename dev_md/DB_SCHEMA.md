# Supabase DB 스키마 문서

## 개요
기존 `www.dreamitbiz.com` Supabase 프로젝트를 공유하며, `hohai_` prefix로 테이블을 분리한다.

## 테이블 목록

### 1. hohai_poems (시)
| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| id | UUID | gen_random_uuid() | PK |
| title | TEXT | NOT NULL | 시 제목 |
| content | TEXT | NOT NULL | 시 본문 |
| excerpt | TEXT | NULL | 시 발췌/미리보기 |
| category | TEXT | '기타' | 카테고리 |
| tags | TEXT[] | '{}' | 태그 배열 |
| bg_theme | SMALLINT | 0 | 카드 배경 테마 인덱스 (0~7) |
| display_order | INTEGER | 0 | 표시 순서 |
| is_featured | BOOLEAN | FALSE | 대표 시 여부 |
| is_published | BOOLEAN | TRUE | 공개 여부 |
| written_date | DATE | NULL | 작성일 |
| created_at | TIMESTAMPTZ | NOW() | 생성 시각 |
| updated_at | TIMESTAMPTZ | NOW() | 수정 시각 |

### 2. hohai_songs (노래)
| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| id | UUID | gen_random_uuid() | PK |
| title | TEXT | NOT NULL | 곡 제목 |
| description | TEXT | NULL | 곡 설명 |
| youtube_id | TEXT | NOT NULL | 유튜브 영상 ID |
| lyrics | TEXT | NULL | 가사 |
| display_order | INTEGER | 0 | 표시 순서 |
| is_featured | BOOLEAN | FALSE | 대표곡 여부 |
| is_published | BOOLEAN | TRUE | 공개 여부 |
| recorded_date | DATE | NULL | 녹음/업로드일 |
| created_at | TIMESTAMPTZ | NOW() | 생성 시각 |
| updated_at | TIMESTAMPTZ | NOW() | 수정 시각 |

### 3. hohai_categories (카테고리)
| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| id | UUID | gen_random_uuid() | PK |
| name | TEXT | NOT NULL, UNIQUE | 카테고리 이름 |
| slug | TEXT | NOT NULL, UNIQUE | URL 슬러그 |
| description | TEXT | NULL | 설명 |
| display_order | INTEGER | 0 | 표시 순서 |
| created_at | TIMESTAMPTZ | NOW() | 생성 시각 |

### 4. hohai_site_config (사이트 설정)
| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| key | TEXT | PK | 설정 키 |
| value | JSONB | NOT NULL | 설정 값 (JSON) |
| updated_at | TIMESTAMPTZ | NOW() | 수정 시각 |

## RLS (Row Level Security) 정책
- **공개 읽기**: `is_published = TRUE` 조건으로 모든 사용자 SELECT 가능
- **인증 쓰기**: authenticated 사용자만 INSERT, UPDATE, DELETE 가능
- **site_config**: 공개 읽기, 인증된 사용자만 쓰기

## 트리거
- `updated_at` 자동 갱신: UPDATE 시 `updated_at = NOW()` 자동 설정

## 샘플 카테고리 데이터
- 사랑 (love)
- 자연 (nature)
- 계절 (season)
- 인생 (life)
- 그리움 (longing)
- 기타 (etc)
