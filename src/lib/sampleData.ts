import type { Poem } from '../types/poem';
import type { Song } from '../types/song';

/** Supabase DB 미연결 시 표시할 샘플 시 데이터 */
export const SAMPLE_POEMS: Poem[] = [
  {
    id: 'sample-1',
    title: '파도에게',
    content: `밀려왔다 물러가는
너의 숨결이
내 발끝에 닿을 때

세상의 모든 시름이
하얀 거품 되어
사라지는 것을 보았다

파도야,
너는 매번 떠나면서도
매번 돌아오는구나

그것이
사랑이라는 것을
나는 바다에서 배웠다`,
    excerpt: '밀려왔다 물러가는\n너의 숨결이\n내 발끝에 닿을 때',
    category: '자연',
    tags: ['바다', '파도', '사랑'],
    bg_theme: 0,
    display_order: 1,
    is_featured: true,
    is_published: true,
    written_date: '2025-06-15',
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2025-06-15T00:00:00Z',
  },
  {
    id: 'sample-2',
    title: '바다의 노래',
    content: `새벽이면 바다는
조용히 노래를 부른다

파도가 만드는 선율 위로
갈매기가 화음을 얹고

수평선 너머에서
해가 지휘봉을 들면

온 세상이
하나의 오케스트라가 된다

나는 오늘도
바다의 객석에 앉아
이 장엄한 연주를 듣는다`,
    excerpt: '새벽이면 바다는\n조용히 노래를 부른다',
    category: '자연',
    tags: ['바다', '새벽', '음악'],
    bg_theme: 1,
    display_order: 2,
    is_featured: true,
    is_published: true,
    written_date: '2025-07-22',
    created_at: '2025-07-22T00:00:00Z',
    updated_at: '2025-07-22T00:00:00Z',
  },
  {
    id: 'sample-3',
    title: '그리운 계절',
    content: `가을바다에 서면
당신이 생각납니다

파도가 데려온
소금기 머금은 바람에
당신의 향기가 실려 옵니다

수평선은
우리 사이의 거리처럼
아득하고

석양은
그때 그 노을처럼
붉게 타오릅니다

그리운 날이면
나는 바다로 갑니다`,
    excerpt: '가을바다에 서면\n당신이 생각납니다',
    category: '그리움',
    tags: ['가을', '바다', '그리움'],
    bg_theme: 5,
    display_order: 3,
    is_featured: true,
    is_published: true,
    written_date: '2025-09-10',
    created_at: '2025-09-10T00:00:00Z',
    updated_at: '2025-09-10T00:00:00Z',
  },
  {
    id: 'sample-4',
    title: '봄바다',
    content: `겨울이 물러가면
바다도 기지개를 켠다

차가운 물빛 아래
봄의 색이 스며들고

해안가 바위 위에
이름 모를 꽃 하나 피어

파도에게
봄이 왔음을 알린다

바다의 봄은
육지보다 조금 늦지만
그래서 더 애틋하다`,
    excerpt: '겨울이 물러가면\n바다도 기지개를 켠다',
    category: '계절',
    tags: ['봄', '바다', '계절'],
    bg_theme: 2,
    display_order: 4,
    is_featured: false,
    is_published: true,
    written_date: '2025-03-20',
    created_at: '2025-03-20T00:00:00Z',
    updated_at: '2025-03-20T00:00:00Z',
  },
  {
    id: 'sample-5',
    title: '등대',
    content: `어둠 속에서도
꺼지지 않는 빛이 있다

거센 파도에도
흔들리지 않는 곳이 있다

등대는 말이 없지만
길 잃은 배들에게
가장 따뜻한 말을 건넨다

나도 누군가에게
그런 등대이고 싶다

어두운 밤
지친 영혼이
기댈 수 있는 한 줄기 빛`,
    excerpt: '어둠 속에서도\n꺼지지 않는 빛이 있다',
    category: '인생',
    tags: ['등대', '희망', '인생'],
    bg_theme: 3,
    display_order: 5,
    is_featured: false,
    is_published: true,
    written_date: '2025-05-01',
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2025-05-01T00:00:00Z',
  },
  {
    id: 'sample-6',
    title: '바다와 사랑',
    content: `사랑은 바다와 같아서
깊이를 알 수 없고

사랑은 파도와 같아서
멈출 수가 없다

밀물처럼 다가왔다
썰물처럼 물러가도

모래 위에 남긴 자국은
결코 지워지지 않는다

그래서 바다를 보면
사랑이 보이고

사랑을 하면
바다가 들린다`,
    excerpt: '사랑은 바다와 같아서\n깊이를 알 수 없고',
    category: '사랑',
    tags: ['사랑', '바다'],
    bg_theme: 4,
    display_order: 6,
    is_featured: false,
    is_published: true,
    written_date: '2025-08-14',
    created_at: '2025-08-14T00:00:00Z',
    updated_at: '2025-08-14T00:00:00Z',
  },
];

/** Supabase DB 미연결 시 표시할 샘플 노래 데이터 */
export const SAMPLE_SONGS: Song[] = [
  {
    id: 'sample-song-1',
    title: '파도의 노래',
    description: '바다를 사랑하는 마음을 담은 노래입니다. 파도 소리와 함께 잔잔한 멜로디로 전하는 이야기.',
    youtube_id: 'dQw4w9WgXcQ',
    lyrics: null,
    display_order: 1,
    is_featured: true,
    is_published: true,
    recorded_date: '2025-04-10',
    created_at: '2025-04-10T00:00:00Z',
    updated_at: '2025-04-10T00:00:00Z',
  },
  {
    id: 'sample-song-2',
    title: '수평선 너머',
    description: '수평선 저편에 있을 그대를 그리며 부르는 노래.',
    youtube_id: 'dQw4w9WgXcQ',
    lyrics: null,
    display_order: 2,
    is_featured: false,
    is_published: true,
    recorded_date: '2025-06-20',
    created_at: '2025-06-20T00:00:00Z',
    updated_at: '2025-06-20T00:00:00Z',
  },
  {
    id: 'sample-song-3',
    title: '갈매기의 꿈',
    description: '자유로운 갈매기처럼, 꿈을 향해 날아가는 우리 모두에게 보내는 응원의 노래.',
    youtube_id: 'dQw4w9WgXcQ',
    lyrics: null,
    display_order: 3,
    is_featured: false,
    is_published: true,
    recorded_date: '2025-08-05',
    created_at: '2025-08-05T00:00:00Z',
    updated_at: '2025-08-05T00:00:00Z',
  },
  {
    id: 'sample-song-4',
    title: '해변의 추억',
    description: '여름날 해변에서의 소중한 기억을 떠올리며 만든 곡입니다.',
    youtube_id: 'dQw4w9WgXcQ',
    lyrics: null,
    display_order: 4,
    is_featured: false,
    is_published: true,
    recorded_date: '2025-09-15',
    created_at: '2025-09-15T00:00:00Z',
    updated_at: '2025-09-15T00:00:00Z',
  },
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
