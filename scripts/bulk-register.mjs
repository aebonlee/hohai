import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('환경변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정하세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load poem data from JSON
const poemsRaw = readFileSync(resolve(__dirname, '..', 'poems_parsed.json'), 'utf-8');
const POEM_DATA = JSON.parse(poemsRaw);

async function main() {
  console.log('=== 好海 DB 일괄 등록 스크립트 ===\n');

  // 1. 관리자 로그인
  console.log('[1/5] 관리자 로그인...');
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('환경변수 ADMIN_EMAIL, ADMIN_PASSWORD를 설정하세요.');
    process.exit(1);
  }
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authErr) {
    console.error('로그인 실패:', authErr.message);
    process.exit(1);
  }
  console.log('로그인 성공:', authData.user.email);

  // 2. 전체 데이터 삭제
  console.log('\n[2/5] 기존 데이터 삭제...');

  const { error: e1 } = await supabase.from('hohai_poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(e1 ? `  시 삭제 실패: ${e1.message}` : '  시 삭제 완료');

  const { error: e2 } = await supabase.from('hohai_songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(e2 ? `  노래 삭제 실패: ${e2.message}` : '  노래 삭제 완료');

  const { error: e3 } = await supabase.from('hohai_series').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(e3 ? `  시리즈 삭제 실패: ${e3.message}` : '  시리즈 삭제 완료');

  const { error: e4 } = await supabase.from('hohai_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(e4 ? `  카테고리 삭제 실패: ${e4.message}` : '  카테고리 삭제 완료');

  // 3. 카테고리 등록
  console.log('\n[3/5] 카테고리 등록...');
  const { error: catErr } = await supabase.from('hohai_categories').upsert(
    [{ name: '시', slug: '시', description: '好海 이성헌의 시', display_order: 1 }],
    { onConflict: 'slug' }
  );
  console.log(catErr ? `  카테고리 등록 실패: ${catErr.message}` : '  카테고리 "시" 등록 완료');

  // 4. 시집(시리즈) 등록
  console.log('\n[4/5] 시집 등록...');
  const { data: seriesData, error: serErr } = await supabase.from('hohai_series').insert({
    name: '3차 퇴고 완성작',
    slug: 'final-collection-2008',
    description: '好海 이성헌 — 3차 퇴고 완성작 (2008년 8월 15일, 가나다 순)',
    type: 'poem',
    display_order: 1,
    is_published: true,
  }).select('id').single();

  if (serErr) {
    console.error('  시집 등록 실패:', serErr.message);
    process.exit(1);
  }
  const seriesId = seriesData.id;
  console.log(`  시집 "3차 퇴고 완성작" 등록 완료 (ID: ${seriesId})`);

  // 5. 시 177편 일괄 등록 (배치 20개씩)
  console.log(`\n[5/5] 시 ${POEM_DATA.length}편 일괄 등록...`);
  const BATCH_SIZE = 20;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < POEM_DATA.length; i += BATCH_SIZE) {
    const batch = POEM_DATA.slice(i, i + BATCH_SIZE).map((p, idx) => ({
      title: p.title,
      content: p.content,
      excerpt: p.content.split('\n').slice(0, 4).join('\n'),
      category: '시',
      series_id: seriesId,
      tags: [],
      bg_theme: (i + idx) % 8,
      display_order: p.page,
      is_featured: false,
      is_published: true,
      written_date: '2008-08-15',
    }));

    const { error: batchErr } = await supabase.from('hohai_poems').insert(batch);
    if (batchErr) {
      console.error(`  배치 ${Math.floor(i / BATCH_SIZE) + 1} 실패: ${batchErr.message}`);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
    console.log(`  진행: ${Math.min(i + BATCH_SIZE, POEM_DATA.length)} / ${POEM_DATA.length}`);
  }

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${successCount}편`);
  console.log(`실패: ${errorCount}편`);

  // 검증
  const { count } = await supabase.from('hohai_poems').select('*', { count: 'exact', head: true });
  console.log(`\nDB 확인 — hohai_poems 총 레코드: ${count}`);

  const { count: seriesCount } = await supabase.from('hohai_series').select('*', { count: 'exact', head: true });
  console.log(`DB 확인 — hohai_series 총 레코드: ${seriesCount}`);

  const { count: catCount } = await supabase.from('hohai_categories').select('*', { count: 'exact', head: true });
  console.log(`DB 확인 — hohai_categories 총 레코드: ${catCount}`);

  await supabase.auth.signOut();
  console.log('\n로그아웃 완료.');
}

main().catch(err => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
