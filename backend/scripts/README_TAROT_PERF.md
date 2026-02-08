# 타로 이미지 성능 테스트

## 실행 방법

```bash
cd backend
node scripts/tarot-image-perf-test.mjs
```

## 검증 항목

| 항목 | 설명 |
|------|------|
| **서비스 응답** | `getTarotContextAndCards(query)` 호출 시 3장 반환, 응답 시간 |
| **이미지 URL 접근** | 각 카드 `imageUrl`(GitHub raw) HEAD 요청 → 200 여부 |
| **응답 시간** | 이미지 URL당 응답 시간(ms) 수집, min/max/avg 출력 |
| **시드 일관성** | 동일 질문으로 재요청 시 동일 3장·동일 순서 반환 |

## 최근 실행 예시

- **총 카드**: 9 (질문 3개 × 3장)
- **이미지 응답**: 9/9 성공 (HTTP 200)
- **이미지 응답 시간**: min ≈ 21ms, max ≈ 428ms, avg ≈ 246ms (GitHub raw 변동)
- **시드 일관성**: 동일 질문 시 동일 카드 ✅

## 프론트엔드 확인

1. `npm run dev` 로 프론트·백엔드 기동
2. 코칭 플로우 진행 후 결과 페이지 이동
3. 타로 섹션에서 **상세** 클릭 → Layer Modal에서 카드 이미지 3장 노출 확인
