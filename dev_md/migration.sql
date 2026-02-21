-- ============================================================
-- 호해(hohai) 웹사이트 Supabase DB 마이그레이션 v2
-- 기존 dreamitbiz 프로젝트에 hohai_ prefix 테이블 추가
-- v2: 시리즈(시집/앨범) 테이블 추가, series_id 필드 추가
-- ============================================================

-- 1. hohai_series 테이블 (시집/앨범 공통)
CREATE TABLE IF NOT EXISTS hohai_series (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('poem', 'song')),
  display_order INTEGER DEFAULT 0,
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. hohai_poems 테이블
CREATE TABLE IF NOT EXISTS hohai_poems (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  category      TEXT DEFAULT '기타',
  series_id     UUID REFERENCES hohai_series(id) ON DELETE SET NULL,
  tags          TEXT[] DEFAULT '{}',
  bg_theme      SMALLINT DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT TRUE,
  written_date  DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. hohai_songs 테이블
CREATE TABLE IF NOT EXISTS hohai_songs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  youtube_id    TEXT DEFAULT '',
  suno_url      TEXT,
  lyrics        TEXT,
  series_id     UUID REFERENCES hohai_series(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT TRUE,
  recorded_date DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. hohai_categories 테이블
CREATE TABLE IF NOT EXISTS hohai_categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. hohai_site_config 테이블
CREATE TABLE IF NOT EXISTS hohai_site_config (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hohai_poems_series ON hohai_poems(series_id);
CREATE INDEX IF NOT EXISTS idx_hohai_songs_series ON hohai_songs(series_id);
CREATE INDEX IF NOT EXISTS idx_hohai_series_type ON hohai_series(type);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION hohai_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hohai_series_updated_at
  BEFORE UPDATE ON hohai_series
  FOR EACH ROW EXECUTE FUNCTION hohai_update_updated_at();

CREATE TRIGGER hohai_poems_updated_at
  BEFORE UPDATE ON hohai_poems
  FOR EACH ROW EXECUTE FUNCTION hohai_update_updated_at();

CREATE TRIGGER hohai_songs_updated_at
  BEFORE UPDATE ON hohai_songs
  FOR EACH ROW EXECUTE FUNCTION hohai_update_updated_at();

CREATE TRIGGER hohai_site_config_updated_at
  BEFORE UPDATE ON hohai_site_config
  FOR EACH ROW EXECUTE FUNCTION hohai_update_updated_at();

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

-- hohai_series
ALTER TABLE hohai_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_series_public_read" ON hohai_series
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "hohai_series_auth_all" ON hohai_series
  FOR ALL USING (auth.role() = 'authenticated');

-- hohai_poems
ALTER TABLE hohai_poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_poems_public_read" ON hohai_poems
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "hohai_poems_auth_all" ON hohai_poems
  FOR ALL USING (auth.role() = 'authenticated');

-- hohai_songs
ALTER TABLE hohai_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_songs_public_read" ON hohai_songs
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "hohai_songs_auth_all" ON hohai_songs
  FOR ALL USING (auth.role() = 'authenticated');

-- hohai_categories
ALTER TABLE hohai_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_categories_public_read" ON hohai_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "hohai_categories_auth_all" ON hohai_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- hohai_site_config
ALTER TABLE hohai_site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_site_config_public_read" ON hohai_site_config
  FOR SELECT USING (TRUE);

CREATE POLICY "hohai_site_config_auth_all" ON hohai_site_config
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 샘플 시리즈 데이터 (시집 5개 + 앨범 5개)
-- ============================================================
INSERT INTO hohai_series (name, slug, description, type, display_order) VALUES
  ('파도의 시', 'wave-poems', '파도와 바다에서 영감을 받은 시 모음', 'poem', 1),
  ('바다의 노래', 'sea-songs', '바다가 들려주는 선율을 담은 시집', 'poem', 2),
  ('그리운 계절', 'longing-seasons', '계절마다 피어나는 그리움의 시', 'poem', 3),
  ('등대의 빛', 'lighthouse-light', '삶의 이정표가 되는 시 모음', 'poem', 4),
  ('수평선 너머', 'beyond-horizon', '수평선 너머를 꿈꾸는 시', 'poem', 5),
  ('바다 노래 1집', 'sea-vol1', '바다를 사랑하는 마음을 담은 첫 번째 앨범', 'song', 1),
  ('바다 노래 2집', 'sea-vol2', '파도와 함께하는 두 번째 이야기', 'song', 2),
  ('바다 노래 3집', 'sea-vol3', '수평선을 바라보며 부르는 노래', 'song', 3),
  ('바다 노래 4집', 'sea-vol4', '해변의 추억을 담은 앨범', 'song', 4),
  ('바다 노래 5집', 'sea-vol5', '등대 아래에서 부르는 노래', 'song', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 샘플 카테고리 데이터
-- ============================================================
INSERT INTO hohai_categories (name, slug, description, display_order) VALUES
  ('사랑', 'love', '사랑에 대한 시', 1),
  ('자연', 'nature', '자연을 노래하는 시', 2),
  ('계절', 'season', '계절의 변화를 담은 시', 3),
  ('인생', 'life', '삶과 인생에 대한 시', 4),
  ('그리움', 'longing', '그리움을 노래하는 시', 5),
  ('기타', 'etc', '기타 주제의 시', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 기존 테이블에 series_id 추가 (업그레이드용)
-- 이미 위에서 새로 생성했으면 이 부분은 무시됩니다.
-- ============================================================
-- ALTER TABLE hohai_poems ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES hohai_series(id) ON DELETE SET NULL;
-- ALTER TABLE hohai_songs ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES hohai_series(id) ON DELETE SET NULL;

-- ============================================================
-- 6. hohai_reviews 테이블 (감상 후기 게시판)
-- ============================================================
CREATE TABLE IF NOT EXISTS hohai_reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER hohai_reviews_updated_at
  BEFORE UPDATE ON hohai_reviews
  FOR EACH ROW EXECUTE FUNCTION hohai_update_updated_at();

-- RLS
ALTER TABLE hohai_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hohai_reviews_public_read" ON hohai_reviews
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "hohai_reviews_auth_insert" ON hohai_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "hohai_reviews_auth_manage" ON hohai_reviews
  FOR ALL USING (auth.role() = 'authenticated');
