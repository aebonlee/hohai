/** 카드 배경 그라데이션 프리셋 (8가지 바다/파도 수채화) */
export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #e0f2f1, #b2dfdb)', // 얕은 바다
  'linear-gradient(135deg, #e3f2fd, #bbdefb)', // 푸른 하늘
  'linear-gradient(135deg, #e0f7fa, #b2ebf2)', // 청록 파도
  'linear-gradient(135deg, #e8eaf6, #c5cae9)', // 깊은 바다
  'linear-gradient(135deg, #e1f5fe, #b3e5fc)', // 수평선
  'linear-gradient(135deg, #f3e5f5, #e1bee7)', // 노을빛 바다
  'linear-gradient(135deg, #fff3e0, #ffe0b2)', // 해변 모래
  'linear-gradient(135deg, #e0f2f1, #e3f2fd)', // 파도 거품
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
