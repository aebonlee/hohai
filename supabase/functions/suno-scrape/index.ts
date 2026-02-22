// Supabase Edge Function: Suno 페이지에서 곡 정보 스크래핑
// 배포: supabase functions deploy suno-scrape --no-verify-jwt

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { urls } = await req.json() as { urls: string[] };
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'urls 배열이 필요합니다' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const url of urls.slice(0, 20)) {
      let title = '';
      let lyrics = '';
      let style = '';

      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          },
        });

        if (res.ok) {
          const html = await res.text();

          // 제목: og:title → <title> → JSON "title"
          const ogTitle = html.match(/<meta\s[^>]*property="og:title"\s[^>]*content="([^"]+)"/i)
            || html.match(/<meta\s[^>]*content="([^"]+)"\s[^>]*property="og:title"/i);
          if (ogTitle) {
            title = ogTitle[1].replace(/\s*[|–—]\s*Suno.*$/i, '').trim();
          }
          if (!title) {
            const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleTag) title = titleTag[1].replace(/\s*[|–—]\s*Suno.*$/i, '').trim();
          }
          if (!title) {
            const jsonTitle = html.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (jsonTitle) {
              try { title = JSON.parse(`"${jsonTitle[1]}"`); } catch { title = jsonTitle[1]; }
            }
          }

          // 가사: "prompt" 필드
          const promptMatch = html.match(/"prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (promptMatch) {
            try { lyrics = JSON.parse(`"${promptMatch[1]}"`); }
            catch { lyrics = promptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'); }
          }
          if (!lyrics) {
            const textMatch = html.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*(?:\\n)(?:[^"\\]|\\.)*)"/);
            if (textMatch) {
              try { lyrics = JSON.parse(`"${textMatch[1]}"`); }
              catch { lyrics = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'); }
            }
          }

          // 스타일: "tags" 필드
          const tagsMatch = html.match(/"tags"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (tagsMatch) {
            try { style = JSON.parse(`"${tagsMatch[1]}"`); }
            catch { style = tagsMatch[1]; }
          }
        }
      } catch {
        // fetch 실패 시 빈 값 유지
      }

      results.push({ url, title, lyrics, style });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
