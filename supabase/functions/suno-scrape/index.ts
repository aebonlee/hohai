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

          // 가사: "prompt" 필드 (일반 JSON)
          const promptMatch = html.match(/"prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (promptMatch && promptMatch[1].length > 20) {
            try { lyrics = JSON.parse(`"${promptMatch[1]}"`); }
            catch { lyrics = promptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'); }
          }

          // 스타일: "tags" 필드 (일반 JSON)
          const tagsMatch = html.match(/"tags"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (tagsMatch) {
            try { style = JSON.parse(`"${tagsMatch[1]}"`); }
            catch { style = tagsMatch[1]; }
          }

          // RSC 스트리밍 형식 (Next.js App Router) — self.__next_f.push() 데이터 디코딩
          if (!lyrics || !style) {
            const pushRegex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\[\s\S])*)"\]\)/g;
            const decoded: string[] = [];
            let pm;
            while ((pm = pushRegex.exec(html)) !== null) {
              try { decoded.push(JSON.parse(`"${pm[1]}"`)); } catch { /* skip */ }
            }
            const rscData = decoded.join('');

            if (!lyrics) {
              const rscPrompt = rscData.match(/"prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              if (rscPrompt && rscPrompt[1].length > 20) {
                try { lyrics = JSON.parse(`"${rscPrompt[1]}"`); }
                catch { lyrics = rscPrompt[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'); }
              }
            }
            if (!style) {
              const rscTags = rscData.match(/"tags"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              if (rscTags) {
                try { style = JSON.parse(`"${rscTags[1]}"`); }
                catch { style = rscTags[1]; }
              }
            }
            if (!title) {
              const rscTitle = rscData.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              if (rscTitle) {
                try { title = JSON.parse(`"${rscTitle[1]}"`); }
                catch { title = rscTitle[1]; }
              }
            }
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
