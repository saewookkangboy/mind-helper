# 에이전트 팀 오케스트레이션 가이드

Mind Helper 프로젝트는 **에이전트 팀(Agent Team)** 중심으로 **오케스트레이션**을 통해 서비스 최적화를 운영합니다. 이 문서는 팀 구성, 위임 규칙, 서비스 최적화 흐름을 정의합니다.

---

## 1. 에이전트 팀 구조

```
                    ┌─────────────────────────────────────┐
                    │         Orchestrator (팀 리드)          │
                    │  · 요청 분해 · 역할 배정 · 종합 · 우선순위  │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   Spec & To-do      │   │   Dev Agent Kit     │   │   (직접 수행)         │
│   · 사양 문서       │   │   · 역할별 개발     │   │   · 코드/설정 변경    │
│   · To-do/마일스톤  │   │   · SEO/GEO/AIO     │   │   · 팀 리드가 역할    │
│   · 검증 체크리스트 │   │   · API 키 관례     │   │     관점으로 실행     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### 1.1 에이전트 명단

| 에이전트 | 파일 | 용도 |
|----------|------|------|
| **Orchestrator** | `.cursor/agents/orchestrator.md` | 팀 리드. 서비스 최적화·전체 개선 시 역할 분해·배정·종합 |
| **Dev Agent Kit** | `.cursor/agents/dev-agent-kit.md` | Spec-kit, To-do, 역할 기반 개발(PM/Frontend/Backend/Security/UI/UX/AI Marketing), SEO/GEO/AIO, API 키 관례 |
| **Spec & To-do** | `.cursor/agents/spec-and-todo.md` | 사양 문서화, To-do·마일스톤 관리, 검증 체크리스트 |

### 1.2 역할 ↔ 에이전트 매핑

| 역할 | 주 담당 | 보조 참조 |
|------|--------|-----------|
| PM | Spec & To-do, Dev Agent Kit | ROLE_BASED_IMPROVEMENTS.md |
| Frontend | Dev Agent Kit (역할 제안) / 직접 수행 | frontend/, shared/ |
| Backend | Dev Agent Kit (역할 제안) / 직접 수행 | backend/, shared/ |
| Server/DB | 직접 수행 (로깅·환경·모니터링) | backend/config, middleware |
| Security | Dev Agent Kit, 직접 수행 | middleware, .env.example |
| UI/UX | Dev Agent Kit (역할 제안) / 직접 수행 | frontend/, index.html |
| AI Marketing | Dev Agent Kit (SEO/GEO/AIO) | 메타·스키마·키워드 |

---

## 2. 오케스트레이션 규칙

### 2.1 언제 Orchestrator를 사용할지

- 사용자 요청에 **"서비스 최적화"**, **"전체 최적화"**, **"agent team"**, **"오케스트레이션"** 등이 포함된 경우
- **여러 역할**이 동시에 필요한 넓은 범위 요청 (예: "품질·보안·UX 전반 점검")
- 사양 정리 + To-do + 역할별 개선을 **한 번에** 진행하고 싶을 때

이 경우 **Orchestrator** 에이전트를 사용하면, 팀 리드가 계획 → 배정 → 실행 → 종합까지 진행합니다.

### 2.2 언제 서브에이전트를 직접 사용할지

- **사양/To-do만** 필요 → **Spec & To-do** 직접 호출
- **SEO/GEO/AIO만** 필요 → **Dev Agent Kit** 직접 호출
- **특정 역할만** 필요 (예: "Backend API만 개선") → Dev Agent Kit 또는 직접 수행

### 2.3 위임 시 전달할 것

서브에이전트를 호출할 때 다음을 명시하면 효과적입니다.

- **목표**: 무엇을 달성할지 (예: "코칭 API 에러 메시지 사용자 친화화")
- **역할/범위**: PM, Frontend, Backend 등
- **산출물**: 문서 경로, To-do 형식, 코드 위치 등
- **제약**: 기존 스타일 유지, 특정 Phase만 등

---

## 3. 서비스 최적화 흐름 (표준 루프)

Orchestrator가 "서비스 최적화" 요청을 처리할 때 따르는 흐름입니다.

| 단계 | 설명 | 참고 문서 |
|------|------|-----------|
| **1. 이해** | 요청·맥락 파악, 최적화 범위 정의 (품질/보안/UX/SEO/성능/운영) | 사용자 입력 |
| **2. 계획** | 역할별 작업 목록 도출, 우선순위·선후 관계 | ROLE_BASED_IMPROVEMENTS.md, IMPROVEMENT_PROPOSAL.md |
| **3. 배정** | 작업 ↔ 역할·에이전트 매핑 | 본 문서 §1.2 |
| **4. 실행** | 배정된 순서대로 실행 (위임 또는 직접 수행) | 각 에이전트 규칙 |
| **5. 검증·종합** | 변경 요약, 다음 단계·미완료 항목 제안, 문서 갱신 | ROLE_BASED_IMPROVEMENTS.md |

---

## 4. Cursor 설정과의 연동

- **규칙**: `.cursor/rules/orchestration.mdc`에서 "서비스 최적화", "agent team", "오케스트레이션" 요청 시 **Orchestrator** 사용을 권장합니다.
- **에이전트 선택**: Cursor에서 에이전트를 수동 선택할 때는 "Orchestrator"를 선택하면 팀 리드 중심으로 진행됩니다.
- **문서 일관성**: 역할별 개선 결과는 `docs/ROLE_BASED_IMPROVEMENTS.md`에 반영하고, 사양·To-do는 `docs/` 또는 `.project-data/`와 맞춥니다.

---

## 5. 운영 체크리스트

- [ ] 넓은 범위 요청 시 Orchestrator(팀 리드) 사용 여부 확인
- [ ] 역할별 작업 시 ROLE_BASED_IMPROVEMENTS.md 상태 반영
- [ ] 서브에이전트 위임 시 목표·역할·산출물 명시
- [ ] 작업 종료 시 요약·다음 단계·우선순위 전달
- [ ] 사양·To-do 변경 시 기존 `docs/` 스타일 유지

---

## 6. 참고 문서

- 역할별 개선 항목·상태: `docs/ROLE_BASED_IMPROVEMENTS.md`
- 구조적 개선 제안: `docs/IMPROVEMENT_PROPOSAL.md`
- 아키텍처·개선 로드맵: `docs/ARCHITECTURE_ANALYSIS.md`
- Dev Agent Kit 연동: `docs/DEV_AGENT_KIT.md`
