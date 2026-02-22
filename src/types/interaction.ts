export type TargetType = 'poem' | 'song';

export interface Like {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  user_id: string;
  target_type: TargetType;
  target_id: string;
  content: string;
  author_name: string;
}
