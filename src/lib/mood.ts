import { CATEGORY_NAMES } from './constants';

export type MoodKey =
  | '사랑' | '그리움' | '작별' | '추억' | '인생'
  | '가족' | '자연' | '세상' | '의지' | 'default';

/** tags 배열에서 첫 매칭 카테고리를 반환, 없으면 'default' */
export function detectMood(tags: string[]): MoodKey {
  for (const tag of tags) {
    for (const cat of CATEGORY_NAMES) {
      if (tag === cat || tag.includes(cat)) return cat as MoodKey;
    }
  }
  return 'default';
}

/** 무드별 4색 그라디언트 (어두운 톤, 흰 텍스트 가독성 확보) */
export const MOOD_GRADIENTS: Record<MoodKey, { c1: string; c2: string; c3: string; c4: string }> = {
  사랑:    { c1: '#2A0F0D', c2: '#5C1F1A', c3: '#8B3A30', c4: '#6A2820' },
  그리움:  { c1: '#071A33', c2: '#0E2E55', c3: '#1A5276', c4: '#0F3A5C' },
  작별:    { c1: '#1F0F1A', c2: '#3D1E35', c3: '#6B3060', c4: '#4A2040' },
  추억:    { c1: '#2A1A0A', c2: '#4D3018', c3: '#7A4C28', c4: '#5C3A1C' },
  인생:    { c1: '#051525', c2: '#0B2840', c3: '#104575', c4: '#0C3458' },
  가족:    { c1: '#0A1F10', c2: '#163820', c3: '#2A6040', c4: '#1E4A30' },
  자연:    { c1: '#081A1C', c2: '#103838', c3: '#1A5858', c4: '#124545' },
  세상:    { c1: '#1A101A', c2: '#302040', c3: '#503060', c4: '#3C2248' },
  의지:    { c1: '#1F1808', c2: '#3D3010', c3: '#705020', c4: '#584018' },
  default: { c1: '#071A33', c2: '#0A3D7A', c3: '#1466A8', c4: '#0D5699' },
};

/** 무드별 밝은 톤 4색 그라디언트 (시 상세 페이지 배경용) */
export const MOOD_LIGHT_GRADIENTS: Record<MoodKey, { c1: string; c2: string; c3: string; c4: string }> = {
  사랑:    { c1: '#FFF0ED', c2: '#FCDDD7', c3: '#F8D5CF', c4: '#FDE6E1' },
  그리움:  { c1: '#EEF4FC', c2: '#DFE9F6', c3: '#D4E4F4', c4: '#E5EEF8' },
  작별:    { c1: '#F6EEF4', c2: '#EDE0E9', c3: '#E6D2E2', c4: '#EFE4EC' },
  추억:    { c1: '#FFF6EE', c2: '#FAE8D9', c3: '#F4DECA', c4: '#FCEEE0' },
  인생:    { c1: '#ECF1FA', c2: '#DDE6F4', c3: '#D0DCF0', c4: '#E2EAF6' },
  가족:    { c1: '#EDF8F0', c2: '#DDF0E3', c3: '#D0ECD8', c4: '#E3F2E8' },
  자연:    { c1: '#EEF8F7', c2: '#DDF0ED', c3: '#D0ECE8', c4: '#E2F2EF' },
  세상:    { c1: '#F2EEF6', c2: '#E8E0EE', c3: '#DED4E8', c4: '#EBE4F0' },
  의지:    { c1: '#FBF6EC', c2: '#F5EBD5', c3: '#F0E0C0', c4: '#F7EDD8' },
  default: { c1: '#F3F7FD', c2: '#ECF1F8', c3: '#E5EDF8', c4: '#EEF3FA' },
};

/** 무드별 카드 그라디언트 (시 카드 배경용) */
export const MOOD_CARD_GRADIENTS: Record<MoodKey, { gradient: string }> = {
  사랑:    { gradient: 'linear-gradient(135deg, #F0C8C0, #D4847A)' },
  그리움:  { gradient: 'linear-gradient(135deg, #B8D4F0, #7BAFD4)' },
  작별:    { gradient: 'linear-gradient(135deg, #E0C4D8, #C88FA8)' },
  추억:    { gradient: 'linear-gradient(135deg, #F0D4B8, #E8A87C)' },
  인생:    { gradient: 'linear-gradient(135deg, #A8C8E8, #4A90B8)' },
  가족:    { gradient: 'linear-gradient(135deg, #B8E0C4, #8FC49A)' },
  자연:    { gradient: 'linear-gradient(135deg, #A8DCD4, #5ABAC4)' },
  세상:    { gradient: 'linear-gradient(135deg, #CCC0D8, #A0889C)' },
  의지:    { gradient: 'linear-gradient(135deg, #E8D4A0, #D4A85A)' },
  default: { gradient: 'linear-gradient(135deg, #B8D4F0, #6A9ED4)' },
};

/** 무드별 장식 색상 (장식선, 태그 배경 등) */
export const MOOD_ACCENT_COLORS: Record<MoodKey, string> = {
  사랑:    '#D4847A',
  그리움:  '#7BAFD4',
  작별:    '#C88FA8',
  추억:    '#E8A87C',
  인생:    '#4A90B8',
  가족:    '#8FC49A',
  자연:    '#5ABAC4',
  세상:    '#A0889C',
  의지:    '#D4A85A',
  default: '#0A3D7A',
};

/** 무드별 파티클 RGB 색상 (primary + secondary) */
export const MOOD_PARTICLE_COLORS: Record<MoodKey, { primary: [number, number, number]; secondary: [number, number, number] }> = {
  사랑:    { primary: [255, 160, 140], secondary: [255, 200, 200] },
  그리움:  { primary: [140, 180, 255], secondary: [180, 210, 255] },
  작별:    { primary: [220, 160, 200], secondary: [255, 200, 230] },
  추억:    { primary: [255, 210, 150], secondary: [255, 230, 180] },
  인생:    { primary: [100, 180, 255], secondary: [150, 200, 255] },
  가족:    { primary: [140, 220, 160], secondary: [180, 240, 190] },
  자연:    { primary: [100, 210, 200], secondary: [160, 230, 220] },
  세상:    { primary: [180, 140, 220], secondary: [200, 170, 240] },
  의지:    { primary: [255, 200, 80],  secondary: [255, 220, 130] },
  default: { primary: [200, 220, 255], secondary: [255, 240, 180] },
};
