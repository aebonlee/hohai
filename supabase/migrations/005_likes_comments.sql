-- Feature 5: 좋아요/댓글 테이블
CREATE TABLE hohai_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('poem', 'song')),
  target_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, target_type, target_id)
);
ALTER TABLE hohai_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read likes" ON hohai_likes FOR SELECT USING (true);
CREATE POLICY "Users insert likes" ON hohai_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete likes" ON hohai_likes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_likes_target ON hohai_likes (target_type, target_id);

CREATE TABLE hohai_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('poem', 'song')),
  target_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  author_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE hohai_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON hohai_comments FOR SELECT USING (true);
CREATE POLICY "Users insert comments" ON hohai_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update comments" ON hohai_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete comments" ON hohai_comments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_comments_target ON hohai_comments (target_type, target_id);
