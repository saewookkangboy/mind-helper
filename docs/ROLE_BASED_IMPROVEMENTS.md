# 역할별 기능 개선 및 고도화 (Dev Agent Kit)

이 문서는 dev-agent-kit 워크플로에 따라 **역할(PM, Frontend, Backend, Server/DB, Security, UI/UX, AI Marketing)**별로 정리한 개선·고도화 항목과 수행 결과를 담습니다.

**에이전트 팀 오케스트레이션**: 서비스 전반 최적화·전체 개선은 **Orchestrator(팀 리드)** 가 역할을 배정하고 조율합니다. 팀 구성·위임 규칙은 [AGENT_ORCHESTRATION.md](./AGENT_ORCHESTRATION.md)를 참고하세요.

---

## 1. PM (Spec-kit / To-do)

### 담당
- 요구사항·사양 문서 정리
- To-do·마일스톤 목록 관리
- 역할별 작업 우선순위 정리

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| 역할별 개선 사양 문서 작성 | ✅ 완료 | 본 문서 (ROLE_BASED_IMPROVEMENTS.md) |
| IMPROVEMENT_PROPOSAL.md Phase와 역할 매핑 | ✅ 반영 | 아래 역할별 체크리스트 참고 |
| To-do 중앙 관리 (선택) | 권장 | `.project-data/todos.json` 또는 이슈 트래커 |

### Phase–역할 매핑 (참고)

- **Phase 1 기반 구조**: PM 기획, Backend/Frontend 공유 코드
- **Phase 2 API 개선**: Backend, Security
- **Phase 3 보안 강화**: Security, Backend
- **Phase 4 품질 향상**: Frontend, Backend, Server/DB(로깅)
- **Phase 5 고도화**: PM 문서화, UI/UX, AI Marketing(SEO)

---

## 2. Frontend

### 담당
- UI 컴포넌트, 상태 관리, API 연동
- 사용자 경험(에러 메시지, 로딩 상태)

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| apiClient: API 에러 코드(code) 파싱 및 사용자 메시지 매핑 | ✅ 적용 | RATE_LIMIT_EXCEEDED, UNAUTHORIZED 등 |
| 코칭 페이지: Rate Limit/인증 실패 시 안내 메시지 표시 | ✅ 적용 | aiService 연동 |
| 공유 패키지(shared) 타입/상수 활용 확대 | 권장 | ErrorCodes, API_ENDPOINTS 등 |

---

## 3. Backend

### 담당
- API 라우팅, 컨트롤러, 서비스 로직
- 인증·검증·에러 처리

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| v1 라우터 구조화 | ✅ 이미 적용 | coaching, feedback, saju, admin 등 |
| 인증/검증/에러/레이트리밋 미들웨어 | ✅ 이미 적용 | auth, validation, error, rateLimit |
| 공유 errors/logger/constants 사용 | ✅ 이미 적용 | shared 패키지 참조 |

---

## 4. Server / DB (운영·인프라)

### 담당
- 로깅, 모니터링, 환경 설정
- (현재 DB: Firestore)

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| HTTP 요청 로깅 미들웨어 추가 | ✅ 적용 | method, path, statusCode, duration |
| 환경 변수 검증 (initEnv) | ✅ 이미 적용 | config/env.js, VALIDATE_ENV |
| .env.example 유지 | ✅ 이미 적용 | frontend, backend |

---

## 5. Security

### 담당
- 인증·권한, API 키 보호, Rate Limit
- 보안 헤더, CORS, 입력 검증

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| AI API 호출 백엔드 이전 | ✅ 이미 적용 | 프론트는 apiClient로 백엔드만 호출 |
| Firebase 토큰 인증 (authenticate) | ✅ 이미 적용 | coaching 등 인증 필요 라우트 |
| Rate Limiting (coaching, crawler, feedback) | ✅ 이미 적용 | shared RATE_LIMITS 상수 사용 |
| 보안 헤더 (Helmet) | ✅ 적용 | X-Content-Type-Options, X-Frame-Options 등 |

---

## 6. UI/UX

### 담당
- 접근성, 반응형, 일관된 디자인
- 메타 정보(문서 제목, 설명)

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| index.html 제목·설명·viewport | ✅ 적용 | Fortune Mate, 서비스 설명, viewport |
| lang 속성 (다국어 대응) | ✅ 적용 | html lang 동적 또는 기본 ko |
| PWA manifest 연동 | ✅ 이미 적용 | public/manifest.json |

---

## 7. AI Marketing (SEO / GEO / AIO)

### 담당
- 검색 엔진·AI 검색 대응
- 메타 태그, OG, 스키마

### 개선 항목

| 항목 | 상태 | 비고 |
|------|------|------|
| 메타 description | ✅ 적용 | index.html |
| Open Graph (og:title, og:description, og:type) | ✅ 적용 | 기본값 설정 |
| 트위터 카드 (twitter:card, title, description) | ✅ 적용 | 기본값 설정 |
| 구조화 데이터(JSON-LD) 스키마 | 권장 | WebSite / SoftwareApplication 등 필요 시 추가 |

---

## 구현 요약

- **PM**: 본 사양 문서로 역할별 개선 항목 및 Phase 매핑 정리.
- **Frontend**: apiClient 에러 코드 기반 사용자 메시지, 코칭 페이지 에러 안내.
- **Backend**: 기존 구조 유지, 요청 로깅 미들웨어 추가.
- **Server/DB**: 요청 로깅으로 운영·디버깅 용이성 확보.
- **Security**: Helmet 도입으로 보안 헤더 강화.
- **UI/UX**: index.html 제목·설명·viewport·lang 개선.
- **AI Marketing**: 메타·OG·트위터 카드 기본 설정.

---

## 다음 권장 단계

1. **To-do**: `dev-agent todo add/list` 또는 이슈 트래커로 남은 항목 관리.
2. **SEO**: 프로덕션 도메인 확정 후 og:image, canonical URL 반영.
3. **스키마**: WebSite/FAQ/HowTo 등 JSON-LD 추가 검토.
4. **테스트**: 역할별 수동/자동 테스트로 회귀 방지.
