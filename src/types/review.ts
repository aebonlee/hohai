export interface Review {
  id: string;
  author_name: string;
  content: string;
  user_id: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewInsert {
  author_name: string;
  content: string;
  user_id?: string | null;
  is_published?: boolean;
}

export type ReviewUpdate = Partial<ReviewInsert>;
