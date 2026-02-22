// Test: Extract lyrics + tags from Suno page
const SONG_ID = 'b852ac26-b9bd-4f1a-885c-439fd5215388';

const res = await fetch(`https://suno.com/song/${SONG_ID}`);
const html = await res.text();

// The RSC data uses escaped quotes: \"prompt\":\"...\"
// Search for the escaped pattern
const patterns = [
  '\\"prompt\\":\\"',   // RSC escaped format
  '"prompt":"',          // normal JSON format
];

for (const pat of patterns) {
  let si = 0;
  let count = 0;
  while (true) {
    si = html.indexOf(pat, si);
    if (si === -1) break;
    count++;
    const valStart = si + pat.length;
    // Find closing: either \" (escaped) or " (normal)
    const closer = pat.startsWith('\\"') ? '\\"' : '"';
    let end = valStart;
    while (end < html.length) {
      if (html.substring(end, end + closer.length) === closer) {
        // Make sure it's not \\\" (escaped backslash before quote)
        if (end > 0 && html[end - 1] === '\\' && html[end - 2] !== '\\') {
          end++;
          continue;
        }
        break;
      }
      end++;
    }
    const val = html.substring(valStart, end);
    if (val.length > 30) {
      console.log(`\n=== "${pat}" #${count} at ${si} (${val.length} chars) ===`);
      console.log(val.replace(/\\n/g, '\n').replace(/\\"/g, '"').substring(0, 600));
    }
    si = end + 1;
  }
  if (count > 0) console.log(`\nTotal "${pat}" matches: ${count}`);
}

// Also search for "tags"
const tagPats = ['\\"tags\\":\\"', '"tags":"'];
for (const pat of tagPats) {
  let si = 0;
  while (true) {
    si = html.indexOf(pat, si);
    if (si === -1) break;
    const valStart = si + pat.length;
    const closer = pat.startsWith('\\"') ? '\\"' : '"';
    let end = valStart;
    while (end < html.length) {
      if (html.substring(end, end + closer.length) === closer) {
        if (end > 0 && html[end - 1] === '\\' && html[end - 2] !== '\\') {
          end++;
          continue;
        }
        break;
      }
      end++;
    }
    const val = html.substring(valStart, end);
    if (val.length > 20) {
      console.log(`\n=== TAGS (${val.length} chars) ===`);
      console.log(val.replace(/\\n/g, '\n').substring(0, 400));
    }
    si = end + 1;
  }
}
