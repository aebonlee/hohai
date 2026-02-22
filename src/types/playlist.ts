export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  song_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistInsert {
  user_id: string;
  name?: string;
  song_ids?: string[];
}

export type PlaylistUpdate = Partial<Omit<PlaylistInsert, 'user_id'>>;
