/** suno_url에서 song ID를 추출하여 embed URL 반환 */
export function getSunoEmbedUrl(sunoUrl: string): string {
  const match = sunoUrl.match(/suno\.com\/(?:song|s)\/([a-zA-Z0-9-]+)/);
  if (match) return `https://suno.com/embed/${match[1]}`;
  return sunoUrl;
}
