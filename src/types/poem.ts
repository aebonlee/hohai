export interface Poem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  series_id: string | null;
  tags: string[];
  bg_theme: number;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  written_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PoemInsert {
  title: string;
  content: string;
  excerpt?: string | null;
  category?: string;
  series_id?: string | null;
  tags?: string[];
  bg_theme?: number;
  display_order?: number;
  is_featured?: boolean;
  is_published?: boolean;
  written_date?: string | null;
}

export type PoemUpdate = Partial<PoemInsert>;
