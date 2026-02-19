import type { Poem } from '../types/poem';
import type { Song } from '../types/song';
import type { Series } from '../types/series';

/** 시집 시리즈 5개 */
export const SAMPLE_POEM_SERIES: Series[] = [
  { id: 'ps-1', name: '파도의 시', slug: 'wave-poems', description: '파도와 바다에서 영감을 받은 시 모음', type: 'poem', display_order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: 'ps-2', name: '바다의 노래', slug: 'sea-songs', description: '바다가 들려주는 선율을 담은 시집', type: 'poem', display_order: 2, is_published: true, created_at: '', updated_at: '' },
  { id: 'ps-3', name: '그리운 계절', slug: 'longing-seasons', description: '계절마다 피어나는 그리움의 시', type: 'poem', display_order: 3, is_published: true, created_at: '', updated_at: '' },
  { id: 'ps-4', name: '등대의 빛', slug: 'lighthouse-light', description: '삶의 이정표가 되는 시 모음', type: 'poem', display_order: 4, is_published: true, created_at: '', updated_at: '' },
  { id: 'ps-5', name: '수평선 너머', slug: 'beyond-horizon', description: '수평선 너머를 꿈꾸는 시', type: 'poem', display_order: 5, is_published: true, created_at: '', updated_at: '' },
];

/** 노래 시리즈 5개 */
export const SAMPLE_SONG_SERIES: Series[] = [
  { id: 'ss-1', name: '바다 노래 1집', slug: 'sea-vol1', description: '바다를 사랑하는 마음을 담은 첫 번째 앨범', type: 'song', display_order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: 'ss-2', name: '바다 노래 2집', slug: 'sea-vol2', description: '파도와 함께하는 두 번째 이야기', type: 'song', display_order: 2, is_published: true, created_at: '', updated_at: '' },
  { id: 'ss-3', name: '바다 노래 3집', slug: 'sea-vol3', description: '수평선을 바라보며 부르는 노래', type: 'song', display_order: 3, is_published: true, created_at: '', updated_at: '' },
  { id: 'ss-4', name: '바다 노래 4집', slug: 'sea-vol4', description: '해변의 추억을 담은 앨범', type: 'song', display_order: 4, is_published: true, created_at: '', updated_at: '' },
  { id: 'ss-5', name: '바다 노래 5집', slug: 'sea-vol5', description: '등대 아래에서 부르는 노래', type: 'song', display_order: 5, is_published: true, created_at: '', updated_at: '' },
];

/** Supabase DB 미연결 시 표시할 샘플 시 데이터 */
export const SAMPLE_POEMS: Poem[] = [
  {
    id: 'sample-1', title: '파도에게', series_id: 'ps-1',
    content: `밀려왔다 물러가는\n너의 숨결이\n내 발끝에 닿을 때\n\n세상의 모든 시름이\n하얀 거품 되어\n사라지는 것을 보았다\n\n파도야,\n너는 매번 떠나면서도\n매번 돌아오는구나\n\n그것이\n사랑이라는 것을\n나는 바다에서 배웠다`,
    excerpt: '밀려왔다 물러가는\n너의 숨결이\n내 발끝에 닿을 때',
    category: '자연', tags: ['바다', '파도', '사랑'], bg_theme: 0, display_order: 1,
    is_featured: true, is_published: true, written_date: '2025-06-15', created_at: '2025-06-15T00:00:00Z', updated_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 'sample-2', title: '바다의 노래', series_id: 'ps-2',
    content: `새벽이면 바다는\n조용히 노래를 부른다\n\n파도가 만드는 선율 위로\n갈매기가 화음을 얹고\n\n수평선 너머에서\n해가 지휘봉을 들면\n\n온 세상이\n하나의 오케스트라가 된다\n\n나는 오늘도\n바다의 객석에 앉아\n이 장엄한 연주를 듣는다`,
    excerpt: '새벽이면 바다는\n조용히 노래를 부른다',
    category: '자연', tags: ['바다', '새벽', '음악'], bg_theme: 1, display_order: 1,
    is_featured: true, is_published: true, written_date: '2025-07-22', created_at: '2025-07-22T00:00:00Z', updated_at: '2025-07-22T00:00:00Z',
  },
  {
    id: 'sample-3', title: '그리운 계절', series_id: 'ps-3',
    content: `가을바다에 서면\n당신이 생각납니다\n\n파도가 데려온\n소금기 머금은 바람에\n당신의 향기가 실려 옵니다\n\n수평선은\n우리 사이의 거리처럼\n아득하고\n\n석양은\n그때 그 노을처럼\n붉게 타오릅니다\n\n그리운 날이면\n나는 바다로 갑니다`,
    excerpt: '가을바다에 서면\n당신이 생각납니다',
    category: '그리움', tags: ['가을', '바다', '그리움'], bg_theme: 5, display_order: 1,
    is_featured: true, is_published: true, written_date: '2025-09-10', created_at: '2025-09-10T00:00:00Z', updated_at: '2025-09-10T00:00:00Z',
  },
  {
    id: 'sample-4', title: '봄바다', series_id: 'ps-3',
    content: `겨울이 물러가면\n바다도 기지개를 켠다\n\n차가운 물빛 아래\n봄의 색이 스며들고\n\n해안가 바위 위에\n이름 모를 꽃 하나 피어\n\n파도에게\n봄이 왔음을 알린다\n\n바다의 봄은\n육지보다 조금 늦지만\n그래서 더 애틋하다`,
    excerpt: '겨울이 물러가면\n바다도 기지개를 켠다',
    category: '계절', tags: ['봄', '바다', '계절'], bg_theme: 2, display_order: 2,
    is_featured: false, is_published: true, written_date: '2025-03-20', created_at: '2025-03-20T00:00:00Z', updated_at: '2025-03-20T00:00:00Z',
  },
  {
    id: 'sample-5', title: '등대', series_id: 'ps-4',
    content: `어둠 속에서도\n꺼지지 않는 빛이 있다\n\n거센 파도에도\n흔들리지 않는 곳이 있다\n\n등대는 말이 없지만\n길 잃은 배들에게\n가장 따뜻한 말을 건넨다\n\n나도 누군가에게\n그런 등대이고 싶다\n\n어두운 밤\n지친 영혼이\n기댈 수 있는 한 줄기 빛`,
    excerpt: '어둠 속에서도\n꺼지지 않는 빛이 있다',
    category: '인생', tags: ['등대', '희망', '인생'], bg_theme: 3, display_order: 1,
    is_featured: false, is_published: true, written_date: '2025-05-01', created_at: '2025-05-01T00:00:00Z', updated_at: '2025-05-01T00:00:00Z',
  },
  {
    id: 'sample-6', title: '바다와 사랑', series_id: 'ps-1',
    content: `사랑은 바다와 같아서\n깊이를 알 수 없고\n\n사랑은 파도와 같아서\n멈출 수가 없다\n\n밀물처럼 다가왔다\n썰물처럼 물러가도\n\n모래 위에 남긴 자국은\n결코 지워지지 않는다\n\n그래서 바다를 보면\n사랑이 보이고\n\n사랑을 하면\n바다가 들린다`,
    excerpt: '사랑은 바다와 같아서\n깊이를 알 수 없고',
    category: '사랑', tags: ['사랑', '바다'], bg_theme: 4, display_order: 2,
    is_featured: false, is_published: true, written_date: '2025-08-14', created_at: '2025-08-14T00:00:00Z', updated_at: '2025-08-14T00:00:00Z',
  },
  {
    id: 'sample-7', title: '수평선', series_id: 'ps-5',
    content: `하늘과 바다가 만나는 곳\n그곳에 꿈이 있다\n\n손을 뻗으면 닿을 듯\n걸어가면 멀어지는\n\n영원한 약속 같은\n수평선이여\n\n오늘도 나는\n너를 향해 걷는다`,
    excerpt: '하늘과 바다가 만나는 곳\n그곳에 꿈이 있다',
    category: '자연', tags: ['수평선', '꿈', '바다'], bg_theme: 6, display_order: 1,
    is_featured: false, is_published: true, written_date: '2025-10-01', created_at: '2025-10-01T00:00:00Z', updated_at: '2025-10-01T00:00:00Z',
  },
  {
    id: 'sample-8', title: '밤바다', series_id: 'ps-2',
    content: `달빛이 물 위에 부서지면\n바다는 은빛 비단이 된다\n\n파도 소리만이\n세상의 유일한 음악이고\n\n별들이 바다에 내려앉아\n함께 춤을 춘다\n\n이 고요한 밤\n바다만이 아는 비밀이\n내 마음에 스며든다`,
    excerpt: '달빛이 물 위에 부서지면\n바다는 은빛 비단이 된다',
    category: '자연', tags: ['밤', '달', '바다'], bg_theme: 3, display_order: 2,
    is_featured: false, is_published: true, written_date: '2025-11-05', created_at: '2025-11-05T00:00:00Z', updated_at: '2025-11-05T00:00:00Z',
  },
  {
    id: 'sample-9', title: '길 위에서', series_id: 'ps-4',
    content: `때로는 길을 잃어도\n괜찮다고\n바다가 말한다\n\n파도도 방향을 모른 채\n밀려왔다 돌아가지만\n\n결국 어딘가에\n닿게 되는 것이니\n\n길이 보이지 않을 때\n바다를 보라\n\n끝없이 넓은 그곳에\n네 길이 있다`,
    excerpt: '때로는 길을 잃어도\n괜찮다고\n바다가 말한다',
    category: '인생', tags: ['인생', '길', '위로'], bg_theme: 7, display_order: 2,
    is_featured: false, is_published: true, written_date: '2025-12-01', created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'sample-10', title: '그대에게', series_id: 'ps-5',
    content: `먼 바다 건너\n당신에게 보내는 편지\n\n파도에 실어 보내면\n언젠가 닿을까요\n\n소금기 머금은 종이 위에\n그리움을 적어\n\n바람에 날려 보냅니다\n\n당신이 있는 곳까지\n이 마음이 닿기를`,
    excerpt: '먼 바다 건너\n당신에게 보내는 편지',
    category: '사랑', tags: ['사랑', '편지', '그리움'], bg_theme: 5, display_order: 2,
    is_featured: false, is_published: true, written_date: '2026-01-10', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z',
  },
];

/** Supabase DB 미연결 시 표시할 샘플 노래 데이터 (4×5 = 20곡) */
export const SAMPLE_SONGS: Song[] = [
  // 1집 - 바다 노래 1집 (4곡)
  { id: 'ss1-1', title: '파도의 노래', description: '바다를 사랑하는 마음을 담은 노래', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-1', display_order: 1, is_featured: true, is_published: true, recorded_date: '2025-01-10', created_at: '2025-01-10T00:00:00Z', updated_at: '2025-01-10T00:00:00Z' },
  { id: 'ss1-2', title: '수평선 너머', description: '수평선 저편에 있을 그대를 그리며', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-1', display_order: 2, is_featured: false, is_published: true, recorded_date: '2025-01-15', created_at: '2025-01-15T00:00:00Z', updated_at: '2025-01-15T00:00:00Z' },
  { id: 'ss1-3', title: '갈매기의 꿈', description: '자유를 향해 날아가는 갈매기처럼', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-1', display_order: 3, is_featured: false, is_published: true, recorded_date: '2025-01-20', created_at: '2025-01-20T00:00:00Z', updated_at: '2025-01-20T00:00:00Z' },
  { id: 'ss1-4', title: '해변의 추억', description: '여름날 해변에서의 소중한 기억', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-1', display_order: 4, is_featured: false, is_published: true, recorded_date: '2025-01-25', created_at: '2025-01-25T00:00:00Z', updated_at: '2025-01-25T00:00:00Z' },
  // 2집 - 바다 노래 2집 (4곡)
  { id: 'ss2-1', title: '바다의 자장가', description: '잔잔한 파도가 불러주는 자장가', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-2', display_order: 1, is_featured: false, is_published: true, recorded_date: '2025-03-10', created_at: '2025-03-10T00:00:00Z', updated_at: '2025-03-10T00:00:00Z' },
  { id: 'ss2-2', title: '모래성', description: '함께 쌓던 모래성처럼 아름다운 시간', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-2', display_order: 2, is_featured: false, is_published: true, recorded_date: '2025-03-15', created_at: '2025-03-15T00:00:00Z', updated_at: '2025-03-15T00:00:00Z' },
  { id: 'ss2-3', title: '조개껍데기', description: '바다가 선물한 작은 보석', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-2', display_order: 3, is_featured: false, is_published: true, recorded_date: '2025-03-20', created_at: '2025-03-20T00:00:00Z', updated_at: '2025-03-20T00:00:00Z' },
  { id: 'ss2-4', title: '밀물과 썰물', description: '왔다 가는 것이 사랑이라면', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-2', display_order: 4, is_featured: false, is_published: true, recorded_date: '2025-03-25', created_at: '2025-03-25T00:00:00Z', updated_at: '2025-03-25T00:00:00Z' },
  // 3집 - 바다 노래 3집 (4곡)
  { id: 'ss3-1', title: '등대지기', description: '외로운 등대지기의 마음을 노래합니다', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-3', display_order: 1, is_featured: false, is_published: true, recorded_date: '2025-05-10', created_at: '2025-05-10T00:00:00Z', updated_at: '2025-05-10T00:00:00Z' },
  { id: 'ss3-2', title: '소금바람', description: '짠 바람에 실려오는 추억', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-3', display_order: 2, is_featured: false, is_published: true, recorded_date: '2025-05-15', created_at: '2025-05-15T00:00:00Z', updated_at: '2025-05-15T00:00:00Z' },
  { id: 'ss3-3', title: '포구의 아침', description: '어촌 포구에서 맞이하는 새벽', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-3', display_order: 3, is_featured: false, is_published: true, recorded_date: '2025-05-20', created_at: '2025-05-20T00:00:00Z', updated_at: '2025-05-20T00:00:00Z' },
  { id: 'ss3-4', title: '해녀의 노래', description: '바다와 함께 살아가는 해녀의 삶', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-3', display_order: 4, is_featured: false, is_published: true, recorded_date: '2025-05-25', created_at: '2025-05-25T00:00:00Z', updated_at: '2025-05-25T00:00:00Z' },
  // 4집 - 바다 노래 4집 (4곡)
  { id: 'ss4-1', title: '여름바다', description: '뜨거운 여름, 시원한 바다', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-4', display_order: 1, is_featured: false, is_published: true, recorded_date: '2025-07-10', created_at: '2025-07-10T00:00:00Z', updated_at: '2025-07-10T00:00:00Z' },
  { id: 'ss4-2', title: '섬으로 가는 길', description: '작은 섬으로 떠나는 여행', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-4', display_order: 2, is_featured: false, is_published: true, recorded_date: '2025-07-15', created_at: '2025-07-15T00:00:00Z', updated_at: '2025-07-15T00:00:00Z' },
  { id: 'ss4-3', title: '파도소리 명상', description: '파도 소리와 함께하는 고요한 시간', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-4', display_order: 3, is_featured: false, is_published: true, recorded_date: '2025-07-20', created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
  { id: 'ss4-4', title: '겨울바다', description: '차갑지만 따뜻한 겨울 바다의 풍경', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-4', display_order: 4, is_featured: false, is_published: true, recorded_date: '2025-07-25', created_at: '2025-07-25T00:00:00Z', updated_at: '2025-07-25T00:00:00Z' },
  // 5집 - 바다 노래 5집 (4곡)
  { id: 'ss5-1', title: '별빛 바다', description: '별빛이 내려앉는 밤바다', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-5', display_order: 1, is_featured: false, is_published: true, recorded_date: '2025-09-10', created_at: '2025-09-10T00:00:00Z', updated_at: '2025-09-10T00:00:00Z' },
  { id: 'ss5-2', title: '돌고래의 춤', description: '자유롭게 뛰노는 돌고래처럼', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-5', display_order: 2, is_featured: false, is_published: true, recorded_date: '2025-09-15', created_at: '2025-09-15T00:00:00Z', updated_at: '2025-09-15T00:00:00Z' },
  { id: 'ss5-3', title: '해질녘 산책', description: '노을이 물드는 해변을 걸으며', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-5', display_order: 3, is_featured: false, is_published: true, recorded_date: '2025-09-20', created_at: '2025-09-20T00:00:00Z', updated_at: '2025-09-20T00:00:00Z' },
  { id: 'ss5-4', title: '바다의 약속', description: '다시 만날 그날을 기약하며', youtube_id: 'dQw4w9WgXcQ', lyrics: null, series_id: 'ss-5', display_order: 4, is_featured: false, is_published: true, recorded_date: '2025-09-25', created_at: '2025-09-25T00:00:00Z', updated_at: '2025-09-25T00:00:00Z' },
];

/** 샘플 카테고리 데이터 */
export const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: '사랑', slug: '사랑', description: null, display_order: 1, created_at: '' },
  { id: 'cat-2', name: '자연', slug: '자연', description: null, display_order: 2, created_at: '' },
  { id: 'cat-3', name: '계절', slug: '계절', description: null, display_order: 3, created_at: '' },
  { id: 'cat-4', name: '인생', slug: '인생', description: null, display_order: 4, created_at: '' },
  { id: 'cat-5', name: '그리움', slug: '그리움', description: null, display_order: 5, created_at: '' },
  { id: 'cat-6', name: '기타', slug: '기타', description: null, display_order: 6, created_at: '' },
];
