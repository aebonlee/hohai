import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GalleryItem, GalleryItemInsert, GalleryItemUpdate } from '../types/gallery';

export async function uploadGalleryImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const path = `${userId}/${timestamp}_${random}.${ext}`;

  const { error } = await supabase.storage.from('gallery').upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_gallery')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    setItems((data as GalleryItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (item: GalleryItemInsert) => {
    const { error } = await supabase.from('hohai_gallery').insert({
      ...item,
      is_published: true,
    });
    if (!error) await fetchItems();
    return { error };
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    // Storage 파일도 삭제
    try {
      const url = new URL(imageUrl);
      const parts = url.pathname.split('/gallery/');
      if (parts[1]) {
        await supabase.storage.from('gallery').remove([decodeURIComponent(parts[1])]);
      }
    } catch {
      // storage 삭제 실패해도 DB 삭제는 진행
    }

    const { error } = await supabase.from('hohai_gallery').delete().eq('id', id);
    if (!error) await fetchItems();
    return { error };
  };

  return { items, loading, createItem, deleteItem, refetch: fetchItems };
}

/** Admin hook: 전체 갤러리 조회 + 공개/비공개 토글 + 삭제 */
export function useAllGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from('hohai_gallery')
      .select('*')
      .order('created_at', { ascending: false });

    setItems((data as GalleryItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateItem = async (id: string, updates: GalleryItemUpdate) => {
    const { error } = await supabase.from('hohai_gallery').update(updates).eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    try {
      const url = new URL(imageUrl);
      const parts = url.pathname.split('/gallery/');
      if (parts[1]) {
        await supabase.storage.from('gallery').remove([decodeURIComponent(parts[1])]);
      }
    } catch {
      // storage 삭제 실패해도 DB 삭제는 진행
    }

    const { error } = await supabase.from('hohai_gallery').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  return { items, loading, updateItem, deleteItem, refetch: fetchAll };
}
