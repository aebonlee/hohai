export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  user_id: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItemInsert {
  title: string;
  content: string;
  author_name: string;
  user_id?: string | null;
  is_published?: boolean;
}

export type NewsItemUpdate = Partial<NewsItemInsert>;
