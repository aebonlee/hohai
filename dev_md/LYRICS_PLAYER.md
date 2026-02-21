# 가사 플레이어 오버레이 (LyricsPlayer)

## 개요

SongCard에서 "가사 플레이어" 버튼 클릭 시 **풀스크린 오버레이**로 열리는 몰입형 가사 플레이어.
네이비~바다색 그라디언트 배경 위에 좌우 분할 레이아웃으로 플레이어와 가사를 동시에 표시한다.

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `src/components/ui/LyricsPlayer.tsx` | 풀스크린 가사 플레이어 오버레이 컴포넌트 |
| `src/components/ui/LyricsPlayer.module.css` | 그라디언트 배경 + 좌우 분할 + 글래스모피즘 스타일 |
| `src/components/ui/SongCard.tsx` | "가사 플레이어" 버튼 추가 (LyricsPlayer 호출) |
| `src/components/ui/SongCard.module.css` | `.lyricsPlayerBtn` 스타일 추가 |

---

## 기술 구현

### 포탈 렌더링
- `createPortal`로 `document.body`에 직접 렌더링
- z-index: 1000 (헤더 100, 드롭다운 200 위)

### Props
```typescript
interface Props {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}
```

### 애니메이션 (framer-motion)
- **오버레이**: fade in (0.4s)
- **왼쪽 패널**: slide from left (x: -40 → 0, 0.5s, delay 0.15s)
- **오른쪽 패널**: slide from right (x: 40 → 0, 0.5s, delay 0.25s)
- **닫기 버튼**: fade + scale (0.3s, delay 0.3s)
- `AnimatePresence`로 진입/퇴장 모두 처리

### 접근성
- `role="dialog"`, `aria-modal="true"`, `aria-label`
- ESC 키 → 닫기
- 포커스 트랩: 열릴 때 닫기 버튼에 포커스, Tab 순환
- 닫힐 때 원래 포커스 요소로 복귀

### 스크롤 잠금
- `document.body.style.overflow = 'hidden'`
- 스크롤바 너비 보정: `paddingRight` 추가로 레이아웃 시프트 방지

### 닫기 방법
1. ✕ 버튼 클릭
2. ESC 키
3. 오버레이 배경 클릭

---

## 레이아웃

### Desktop (>768px)
```
┌──────────────────────────────────────────────────┐
│  [네이비~바다색 그라디언트 배경, 12초 애니메이션]   [✕]  │
│ ┌────────────────────┬──────────────────────────┐│
│ │ ▶ YouTube/Suno     │  가사                     ││
│ │   (16:9 iframe)    │─────────────────────────  ││
│ │                    │                           ││
│ │ [Suno 미니 플레이어] │  첫 번째 연                ││
│ │  (둘 다 있을 때만)   │  가사가 여기에              ││
│ │                    │  표시됩니다                 ││
│ │ 노래 제목           │                           ││
│ │ description        │  두 번째 연                ││
│ │ #태그 #태그         │  ...                      ││
│ └────────────────────┴──────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### Mobile (<=768px)
- 상하 스택 (플레이어 위, 가사 아래)
- 가사 패널 `max-height: 50vh`
- 전체 오버레이 스크롤 가능

---

## 스타일 상세

### 배경
- `linear-gradient(135deg, #071A33, #0A3D7A, #1466A8, #0D5699)`
- `background-size: 300% 300%`
- `@keyframes gradientShift` 12초 무한 반복

### 닫기 버튼
- 반투명 원형: `backdrop-filter: blur(8px)`
- 고정 우상단 (top: 16px, right: 16px)
- 호버 시 scale(1.08)

### 콘텐츠 그리드
- `grid-template-columns: 1fr 1fr`
- `max-width: 1200px`
- `gap: 32px`

### 플레이어
- `aspect-ratio: 16/9`
- `border-radius: var(--radius-md)`
- 깊은 그림자: `box-shadow: 0 8px 32px rgba(0,0,0,0.4)`

### 가사 패널
- 글래스모피즘: `backdrop-filter: blur(12px)`, `rgba(255,255,255,0.04)` 배경
- 테두리: `1px solid rgba(255,255,255,0.08)`
- 커스텀 스크롤바: 6px, 반투명 흰색

### 가사 텍스트
- `font-family: var(--font-serif)` (Noto Serif KR)
- `font-size: 1.05rem`
- `color: rgba(255,255,255,0.85)`
- `line-height: 2.2`
- `white-space: pre-line` (줄바꿈 보존)

---

## 플레이어 로직

### YouTube만 있는 경우
- 메인 플레이어에 YouTube embed

### Suno만 있는 경우
- 메인 플레이어에 Suno embed

### YouTube + Suno 둘 다 있는 경우
- 메인 플레이어: YouTube
- 서브 플레이어: Suno 미니 (height: 160px)

---

## SongCard 연동

### "가사 플레이어" 버튼
- 가사가 있는 노래에만 표시
- accent-gold pill 버튼 (border-radius: 999px)
- 기존 "가사 보기 ▼" 버튼 옆에 배치

### 상태 관리
```typescript
const [lyricsPlayerOpen, setLyricsPlayerOpen] = useState(false);
```
