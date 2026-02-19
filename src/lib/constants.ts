/** 카드 배경 그라데이션 프리셋 (8가지, 딥블루 바다 계열) */
export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #B8D4F0, #6A9ED4)', // 잔잔한 바다
  'linear-gradient(135deg, #A8C8E8, #5B8CC0)', // 푸른 하늘
  'linear-gradient(135deg, #9DC4E0, #4A82B8)', // 깊은 파도
  'linear-gradient(135deg, #8BAED0, #3D6EA8)', // 깊은 바다
  'linear-gradient(135deg, #A0CCF0, #5690D0)', // 수평선
  'linear-gradient(135deg, #C8A8C0, #8C5E90)', // 노을빛 바다
  'linear-gradient(135deg, #D4C4A0, #B89858)', // 해변 모래
  'linear-gradient(135deg, #90C0D0, #5A98B8)', // 파도 거품
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
