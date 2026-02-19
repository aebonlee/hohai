/** 카드 배경 그라데이션 프리셋 (8가지 파스텔 수채화) */
export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #fce4ec, #f3e5f5)', // 분홍-라벤더
  'linear-gradient(135deg, #e8f5e9, #e0f2f1)', // 민트-초록
  'linear-gradient(135deg, #fff3e0, #fce4ec)', // 살구-분홍
  'linear-gradient(135deg, #e3f2fd, #e8eaf6)', // 하늘-남색
  'linear-gradient(135deg, #f3e5f5, #ede7f6)', // 라벤더-보라
  'linear-gradient(135deg, #e0f7fa, #e8f5e9)', // 청록-민트
  'linear-gradient(135deg, #fff8e1, #fff3e0)', // 크림-살구
  'linear-gradient(135deg, #fce4ec, #e3f2fd)', // 분홍-하늘
] as const;

/** 카테고리별 기본 포인트 색상 */
export const CATEGORY_COLORS: Record<string, string> = {
  사랑: '#e57373',
  자연: '#81c784',
  계절: '#ffb74d',
  인생: '#9575cd',
  그리움: '#4fc3f7',
  기타: '#a1887f',
};

/** 사이트 기본 정보 */
export const SITE = {
  title: '호해 - 시인 이성헌',
  description: '시와 노래로 전하는 마음',
  url: 'https://hohai.dreamitbiz.com',
  author: '호해 이성헌',
} as const;
