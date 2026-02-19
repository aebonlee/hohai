# 디자인 시스템 문서

## 컨셉: "따뜻한 한지 위의 먹물과 수채화"

---

## 색상 팔레트

### 배경색
- `--bg-primary: #FAF6F0` — 한지/아이보리 (메인 배경)
- `--bg-secondary: #F3EDE4` — 따뜻한 베이지 (카드/섹션)
- `--bg-warm: #F8F0E5` — 따뜻한 크림

### 텍스트색
- `--text-primary: #2C2420` — 먹물 (제목, 본문)
- `--text-secondary: #6B5E54` — 부드러운 갈색 (부제목)
- `--text-muted: #A39485` — 옅은 갈색 (보조 텍스트)

### 포인트 컬러
- `--accent-gold: #C4956A` — 황토/골드 (CTA, 강조)
- `--accent-sage: #8FA89A` — 세이지 그린 (자연/평화)
- `--accent-sky: #9BB5C9` — 하늘색 (링크, 정보)
- `--accent-plum: #B0879B` — 자두색 (시적 분위기)

### 카드 배경 그라데이션 프리셋 (8가지)
```
0: linear-gradient(135deg, #fce4ec, #f3e5f5)  — 분홍-라벤더
1: linear-gradient(135deg, #e8f5e9, #e0f2f1)  — 민트-초록
2: linear-gradient(135deg, #fff3e0, #fce4ec)  — 살구-분홍
3: linear-gradient(135deg, #e3f2fd, #e8eaf6)  — 하늘-남색
4: linear-gradient(135deg, #f3e5f5, #ede7f6)  — 라벤더-보라
5: linear-gradient(135deg, #e0f7fa, #e8f5e9)  — 청록-민트
6: linear-gradient(135deg, #fff8e1, #fff3e0)  — 크림-살구
7: linear-gradient(135deg, #fce4ec, #e3f2fd)  — 분홍-하늘
```

---

## 타이포그래피

### 폰트 패밀리
- **시 제목/본문**: `'Noto Serif KR', serif` — 명조체, 시적이고 전통적
- **UI/네비게이션**: `'Noto Sans KR', sans-serif` — 고딕체, 깔끔한 가독성
- **호해 로고**: `'Nanum Myeongjo', serif` — 캘리그래피풍 (Bold)

### 시 타이포그래피 규칙
- 행간 (line-height): `2.2`
- 연(stanza) 간격: `2em`
- 최대 폭: `680px`
- 정렬: 중앙 정렬 컨테이너, 텍스트는 좌측 정렬
- 들여쓰기: 없음 (시의 자유로운 줄바꿈 존중)

---

## 시각적 특징

### 한지 질감
- 배경에 텍스처 오버레이 적용 (opacity 0.03~0.05)
- `background-image` + `mix-blend-mode: multiply`

### 카드 호버 효과
```css
transform: translateY(-4px);
box-shadow: 0 12px 32px rgba(44, 36, 32, 0.12);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### 페이지 전환 (framer-motion)
- fade + slideUp: `opacity 0→1`, `y: 20→0`
- duration: `0.5s`
- ease: `easeOut`

### 여백의 미
- 섹션 간격: `80px` (모바일 `48px`)
- 콘텐츠 최대 폭: `1100px`
- 시 상세 최대 폭: `680px`

---

## 반응형 브레이크포인트
- Desktop: `> 1024px`
- Tablet: `768px ~ 1024px`
- Mobile: `< 768px`
