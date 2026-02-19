/** 카드 배경 그라데이션 프리셋 (8가지, 진하고 선명한 바다 계열) */
export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #D4ECD6, #8AC4BC)', // 얕은 바다
  'linear-gradient(135deg, #C2D9F5, #7AADE8)', // 푸른 하늘
  'linear-gradient(135deg, #B8E8F0, #6CCCD6)', // 청록 파도
  'linear-gradient(135deg, #C0C8E4, #8B96CC)', // 깊은 바다
  'linear-gradient(135deg, #BAE0F7, #6DB8E8)', // 수평선
  'linear-gradient(135deg, #F2A8BC, #C07CC0)', // 노을빛 바다
  'linear-gradient(135deg, #F5D49A, #E8B060)', // 해변 모래
  'linear-gradient(135deg, #A0D4CC, #88C4E8)', // 파도 거품
] as const;

/** 카테고리별 기본 포인트 색상 */
export const CATEGORY_COLORS: Record<string, string> = {
  사랑: '#D4847A',
  자연: '#5ABAC4',
  계절: '#E8A87C',
  인생: '#4A90B8',
  그리움: '#7BAFD4',
  기타: '#7FA3B8',
};

/** 사이트 기본 정보 */
export const SITE = {
  title: '호해(好海) - 시인 이성헌',
  description: '바다를 사랑하는 시인, 시와 노래로 전하는 마음',
  url: 'https://hohai.dreamitbiz.com',
  author: '호해 이성헌',
} as const;
