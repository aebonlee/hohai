import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

async function incrementViewCount(tableName: string, id: string) {
  await supabase.rpc('hohai_increment_view', {
    p_table: tableName,
    p_id: id,
  });
}

/**
 * 페이지 마운트 시 조회수를 1 증가시키는 훅.
 * sessionStorage 기반으로 세션당 1회만 증가.
 */
export function useViewCount(tableName: string, id: string | undefined) {
  useEffect(() => {
    if (!id) return;
    const key = `viewed_${tableName}_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    incrementViewCount(tableName, id);
  }, [tableName, id]);
}

/**
 * 이벤트(클릭 등) 시 조회수를 증가시키는 함수를 반환.
 * sessionStorage 기반으로 세션당 1회만 증가.
 */
export function useIncrementView(tableName: string) {
  return (id: string) => {
    const key = `viewed_${tableName}_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    incrementViewCount(tableName, id);
  };
}
