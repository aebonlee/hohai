/** 카드 배경 그라데이션 프리셋 (8가지 바다/파도 수채화) */
export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #c8e6c9, #80cbc4)', // 얕은 바다
  'linear-gradient(135deg, #bbdefb, #90caf9)', // 푸른 하늘
  'linear-gradient(135deg, #b2ebf2, #80deea)', // 청록 파도
  'linear-gradient(135deg, #c5cae9, #9fa8da)', // 깊은 바다
  'linear-gradient(135deg, #b3e5fc, #81d4fa)', // 수평선
  'linear-gradient(135deg, #f8bbd0, #ce93d8)', // 노을빛 바다
  'linear-gradient(135deg, #ffe0b2, #ffcc80)', // 해변 모래
  'linear-gradient(135deg, #b2dfdb, #b3e5fc)', // 파도 거품
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
