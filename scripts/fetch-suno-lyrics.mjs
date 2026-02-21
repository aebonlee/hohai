// ============================================================
// Suno AI 노래 가사 + 스타일 태그 크롤링 스크립트
// 사용법: node scripts/fetch-suno-lyrics.mjs
// 결과: scripts/suno-lyrics-data.json
// ============================================================

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = join(__dirname, 'suno_songs.json');
const OUTPUT_FILE = join(__dirname, 'suno-lyrics-data.json');

// ── 해시태그 키워드 매핑 ────────────────────────────────────
const TAG_RULES = [
  // 바다/자연
  { keywords: ['바다', '해변', '파도', '갯벌', '방파제', '등대', '포구', '항구', '갈매기', '바닷가', '해송', '수평선', '썰물', '조개', '바닷새', '해안', '뱃길'], tag: '바다' },
  { keywords: ['강', '호수', '냇물', '강물', '호숫가', '두물머리', '충주호', '금광호'], tag: '강호수' },
  { keywords: ['산', '숲', '나무', '꽃', '풀', '잎', '열매', '석류', '매실', '단풍', '라일락', '튤립', '유채꽃', '금낭화', '억새', '넝쿨', '장미', '개화', '꽃밭', '꽃길'], tag: '자연' },
  { keywords: ['봄', '여름', '가을', '겨울', '계절', '사계', '눈꽃', '첫눈', '노을', '비', '안개', '물안개', '가을비'], tag: '계절' },
  // 감정
  { keywords: ['사랑', '연모', '키스', '연서', '그대', '당신', '님', '첫사랑', '첫 마음'], tag: '사랑' },
  { keywords: ['그리움', '그리운', '추억', '회상', '회고', '기억', '잔상', '향수'], tag: '그리움' },
  { keywords: ['이별', '떠나', '작별', '헤어', '마지막'], tag: '이별' },
  { keywords: ['인생', '삶', '세월', '시간', '나이', '노년', '회한', '인생길'], tag: '인생' },
  // 장소/지역
  { keywords: ['삼척', '거제', '하조대', '부산', '제주', '순천', '고양', '평택', '충주'], tag: '지역' },
  // 기타 테마
  { keywords: ['AI', '인공지능', '혁신', '혁명', '파이썬', '학습'], tag: 'AI혁신' },
  { keywords: ['학교', '대학', '학생', '졸업', '꿈'], tag: '꿈' },
  { keywords: ['어머니', '어머님', '부모', '사모', '추모', '엄마', '아버지'], tag: '가족' },
  { keywords: ['고향', '동심', '소꿉', '옛날', '어린 시절'], tag: '고향' },
  { keywords: ['커피', '카페', '별다방'], tag: '일상' },
  { keywords: ['피아니스트', '음악', '노래'], tag: '음악' },
  { keywords: ['새벽', '아침', '하루', '퇴근', '출근'], tag: '일상' },
  { keywords: ['동행', '함께', '곁', '나란히'], tag: '동행' },
  { keywords: ['비상', '날개', '하늘', '나비'], tag: '비상' },
];

function generateTags(title, lyrics) {
  const text = `${title} ${lyrics}`;
  const tags = new Set();

  for (const rule of TAG_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        tags.add(rule.tag);
        break;
      }
    }
  }

  // 외국어곡 감지
  if (/^[A-Za-zÀ-ÿ\s',.\-–—!?()]+$/.test(title.trim())) {
    tags.add('번역곡');
  }

  return [...tags].slice(0, 5); // 최대 5개 태그
}

function cleanLyrics(rawPrompt, title) {
  if (!rawPrompt) return '';

  let lyrics = rawPrompt;

  // 첫 줄이 제목/작가 부분이면 제거 (예: "축복을 빌어야 하는 이유/好海 이성헌\n\n")
  const lines = lyrics.split('\n');
  if (lines.length > 1) {
    const firstLine = lines[0].trim();
    // 제목과 유사하거나 "好海" 또는 "이성헌"이 포함된 첫 줄 제거
    if (firstLine.includes('好海') || firstLine.includes('이성헌') || firstLine.includes('/')) {
      // 첫 줄 + 뒤따르는 빈 줄들 제거
      let startIdx = 1;
      while (startIdx < lines.length && lines[startIdx].trim() === '') {
        startIdx++;
      }
      lyrics = lines.slice(startIdx).join('\n');
    }
  }

  return lyrics.trim();
}

async function fetchSunoPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.text();
}

function extractField(html, fieldName) {
  // Suno embeds data in React Server Components payload with escaped JSON:
  // \"fieldName\":\"value with \\n newlines\"
  const marker = `\\"${fieldName}\\":\\"`;
  let searchFrom = 0;
  let best = '';

  while (true) {
    const startIdx = html.indexOf(marker, searchFrom);
    if (startIdx === -1) break;

    const valueStart = startIdx + marker.length;
    // Scan to find the closing \" (escaped quote that ends the value)
    let i = valueStart;
    while (i < html.length) {
      if (html[i] === '\\' && i + 1 < html.length) {
        if (html[i + 1] === '"') {
          // This is \" — the end of the escaped string value
          break;
        }
        // Skip escaped sequence (\\n, \\t, \\\\, etc.)
        i += 2;
      } else {
        i++;
      }
    }

    const raw = html.substring(valueStart, i);
    // HTML has double-escaped JSON: \\n → newline, \\t → tab, \\\\ → \, \\" → "
    const val = raw
      .replace(/\\\\n/g, '\n')
      .replace(/\\\\t/g, '\t')
      .replace(/\\\\"/g, '"')
      .replace(/\\\\\\\\/g, '\\');

    if (val.length > best.length) {
      best = val;
    }
    searchFrom = i + 1;
  }

  return best || null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── 메인 실행 ───────────────────────────────────────────────
async function main() {
  console.log('Suno 가사 크롤링 시작...\n');

  const songs = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`총 ${songs.length}곡 처리 예정\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const num = `[${String(i + 1).padStart(3)}/${songs.length}]`;

    try {
      const html = await fetchSunoPage(song.url);
      const rawPrompt = extractField(html, 'prompt');
      const rawTags = extractField(html, 'tags');

      const lyrics = cleanLyrics(rawPrompt, song.title);
      const tags = generateTags(song.title, lyrics);

      results.push({
        suno_url: song.url,
        title: song.title,
        lyrics: lyrics || null,
        style: rawTags || null,
        tags,
      });

      successCount++;
      const preview = lyrics ? lyrics.slice(0, 40).replace(/\n/g, ' ') + '...' : '(가사 없음)';
      console.log(`${num} OK  ${song.title.slice(0, 30).padEnd(30)} | ${tags.join(', ').padEnd(20)} | ${preview}`);
    } catch (err) {
      failCount++;
      console.log(`${num} ERR ${song.title.slice(0, 30).padEnd(30)} | ${err.message}`);
      results.push({
        suno_url: song.url,
        title: song.title,
        lyrics: null,
        style: null,
        tags: generateTags(song.title, ''),
      });
    }

    // Rate limiting: 1초 간격
    if (i < songs.length - 1) {
      await sleep(1000);
    }
  }

  // 결과 저장
  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`크롤링 완료!`);
  console.log(`  성공: ${successCount}곡`);
  console.log(`  실패: ${failCount}곡`);
  console.log(`  결과 파일: ${OUTPUT_FILE}`);

  // 태그 통계
  const tagStats = {};
  for (const r of results) {
    for (const t of r.tags) {
      tagStats[t] = (tagStats[t] || 0) + 1;
    }
  }
  console.log(`\n--- 태그 분포 ---`);
  for (const [tag, count] of Object.entries(tagStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  #${tag}: ${count}곡`);
  }
}

main().catch(console.error);
