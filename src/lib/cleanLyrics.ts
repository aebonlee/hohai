/**
 * Suno 가사에서 제작 참고 내용(섹션 마커)을 제거하고 순수 가사만 반환
 * [Verse], [Chorus], [Bridge], [Intro], [Outro] 등 제거
 */
export function cleanLyrics(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => !/^\s*\[.*\]\s*$/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
