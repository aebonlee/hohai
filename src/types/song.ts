export interface Song {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  lyrics: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  recorded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SongInsert {
  title: string;
  youtube_id: string;
  description?: string | null;
  lyrics?: string | null;
  display_order?: number;
  is_featured?: boolean;
  is_published?: boolean;
  recorded_date?: string | null;
}

export type SongUpdate = Partial<SongInsert>;
