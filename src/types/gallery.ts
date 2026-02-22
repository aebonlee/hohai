export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string;
  author_name: string;
  user_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemInsert {
  title: string;
  image_url: string;
  description?: string;
  author_name: string;
  user_id?: string | null;
  is_published?: boolean;
}

export type GalleryItemUpdate = Partial<GalleryItemInsert>;
