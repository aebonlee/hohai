export interface Series {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'poem' | 'song';
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeriesInsert {
  name: string;
  slug: string;
  type: 'poem' | 'song';
  description?: string | null;
  display_order?: number;
  is_published?: boolean;
}

export type SeriesUpdate = Partial<SeriesInsert>;
