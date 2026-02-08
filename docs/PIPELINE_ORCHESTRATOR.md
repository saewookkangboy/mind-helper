# 데이터 파이프라인 및 Orchestrator 역할

6개 섹션(사주·심리·MBTI·타로·버크만·다크 심리학) 결과의 **입력 → 데이터 분석 → 출력** 흐름과, 그 중심의 **Orchestrator** 역할을 정의한 문서입니다.

---

## 1. 전체 흐름

```
[입력] 사용자 질문 + userContext(생년월일시, MBTI, 관심사 등)
    ↓
[도메인 소스 수집] loadDomainContexts() — 6대 도메인별 컨텍스트 텍스트
    ↓
[Orchestrator 맥락 보강] enrichContextsWithQuery() — 각 컨텍스트에 "사용자 질문" 추가
    ↓
[타로 보강] (선택) getTarotContextAndCards() — 타로 컨텍스트·카드 이미지
    ↓
[AI Orchestrator] generatePipelineResponse() — 섹션별 소스 1:1 매핑, 4문장 이상 출력
    ↓
[파싱·보강] parseStructuredPipelineResponse() — JSON 추출, 4문장 미만 시 서버 보강
    ↓
[출력] responseSummary + responseSections(saju, psychology, mbti, tarot, birkman, dark_psychology, path)
```

---

## 2. Orchestrator 및 Dev Agent 역할

- **파이프라인 서비스**  
  - 도메인 소스 수집 후, **각 도메인 컨텍스트에 사용자 질문·관심사(interests)** 를 붙임  
  - 섹션별 답변이 "질문·맥락에 맞는" **창의적·맞춤형** 내용이 되도록 입력 품질을 높임  

- **AI 프롬프트 (오케스트레이터 + Dev Agent)**  
  - 모델을 **오케스트레이터이자 Dev Agent**로 정의  
  - **창의성·섬세함**: 각 섹션을 해당 분야 전문가처럼 작성, 클리셰·일반론 반복 금지, 질문의 상황·감정 반영, 구체적 비유·예시·행동 제안 권장  
  - **맞춤 맥락**: 관심사·MBTI가 있으면 톤·비유·예시를 구체화하도록 안내  
  - **섹션별 소스 1:1 매핑** 유지: `saju`→`[saju]`, `psychology`→`[psychology]`, …  
  - **종합 인사이트·path**: 6개 섹션을 짜맞춘 "한 편의 글"처럼 자연스럽게 연결, 사용자가 "내 이야기"라고 느낄 수 있는 문장 포함  
  - 파이프라인 전용 **temperature 0.82** 로 다양·창의적 표현 유도  

- **검증·로깅**  
  - 파이프라인 완료 후, `sourcesUsed`에 있으나 해당 섹션 결과가 비거나 매우 짧으면 경고 로그  

---

## 3. 관련 파일

| 구분 | 파일 | 역할 |
|------|------|------|
| 파이프라인 진입 | `backend/src/services/pipeline.service.js` | runPipeline, 맥락 보강, 타로 연동, 결과 반환 |
| 도메인 소스 | `backend/src/services/domainSources/index.js` | 6대 도메인별 컨텍스트 수집 |
| AI 오케스트레이터 | `backend/src/services/ai.service.js` | generatePipelineResponse, 섹션별 매핑 프롬프트, 4문장 보강 |
| 상수 | `shared/src/constants/domains.js` | DOMAIN_IDS, ALL_DOMAIN_IDS |

---

## 4. 6개 섹션 결과 품질을 위한 체크리스트

- [ ] `userContext`에 birthDate, birthTime, mbti, userSaju(또는 사주 계산 가능 정보), interests 등이 채워져 전달되는지
- [ ] 도메인 소스가 비어 있지 않은 경우(예: 사주 계산 성공, MBTI 입력됨) 해당 섹션에 구체적 소스가 포함되는지
- [ ] AI 프롬프트의 "섹션별 소스 1:1 매핑"과 "4문장 이상" 규칙이 유지되는지
- [ ] 파이프라인 완료 후 섹션 결과 부족 시 경고 로그가 찍히는지

이 문서는 `docs/AGENT_ORCHESTRATION.md`의 팀 오케스트레이션과 별개로, **데이터 파이프라인 내 오케스트레이터(역할)** 에 초점을 둡니다.
