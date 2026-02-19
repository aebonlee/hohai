-- ============================================================
-- 호해(hohai) 웹사이트 Supabase DB 마이그레이션
-- 기존 dreamitbiz 프로젝트에 hohai_ prefix 테이블 추가
-- ============================================================

-- 1. hohai_poems 테이블
CREATE TABLE IF NOT EXISTS hohai_poems (
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

-- 2. hohai_songs 테이블
CREATE TABLE IF NOT EXISTS hohai_songs (
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

-- 3. hohai_categories 테이블
CREATE TABLE IF NOT EXISTS hohai_categories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. hohai_site_config 테이블
CREATE TABLE IF NOT EXISTS hohai_site_config (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

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
-- 샘플 시 데이터
-- ============================================================
INSERT INTO hohai_poems (title, content, excerpt, category, bg_theme, is_featured, written_date) VALUES
(
  '봄바람',
  '봄바람이 불어오면
꽃잎이 흩날리고

그 향기 따라
마음도 함께 피어납니다

겨울을 견딘 가지 위에
새순이 돋아나듯

우리의 마음에도
새로운 봄이 찾아옵니다',
  '봄바람이 불어오면\n꽃잎이 흩날리고\n그 향기 따라\n마음도 함께 피어납니다',
  '계절',
  0,
  TRUE,
  '2024-03-15'
),
(
  '강물처럼',
  '강물은 쉬지 않고 흐르며
바위를 만나면 돌아가고
절벽을 만나면 폭포가 됩니다

인생도 그러하니
막힐 때 쉬어가고
떨어질 때 웅장해지는 것

멈추지 않으면
결국 바다에 이르듯
우리도 언젠가
꿈꾸던 곳에 닿을 것입니다',
  '강물은 쉬지 않고 흐르며\n바위를 만나면 돌아가고\n절벽을 만나면 폭포가 됩니다',
  '인생',
  3,
  FALSE,
  '2024-05-20'
),
(
  '그대에게',
  '별이 빛나는 밤이면
그대 생각에 잠 못 이루고

바람이 부는 날이면
그대 향기를 찾아 헤맵니다

언제쯤 다시 만날까
이 그리움이 닿을까

꿈에서라도 좋으니
한번만 더 웃어주오',
  '별이 빛나는 밤이면\n그대 생각에 잠 못 이루고\n바람이 부는 날이면\n그대 향기를 찾아 헤맵니다',
  '그리움',
  7,
  FALSE,
  '2024-08-10'
);

-- ============================================================
-- 샘플 노래 데이터 (YouTube ID는 실제 영상으로 교체 필요)
-- ============================================================
-- INSERT INTO hohai_songs (title, description, youtube_id, is_featured) VALUES
-- ('노래 제목', '노래 설명', 'YOUTUBE_VIDEO_ID', TRUE);
