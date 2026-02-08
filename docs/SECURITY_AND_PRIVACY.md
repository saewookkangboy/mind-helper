# 보안 및 정보 보호 가이드

Orchestrator·에이전트 팀이 **보안(Security)** 및 **정보 보호(Privacy)** 를 강화할 때 참고하는 정책·체크리스트입니다.

---

## 1. 원칙

- **최소 수집**: 서비스에 필요한 최소한의 개인·민감 정보만 수집·저장·전달
- **비노출**: API 키·토큰·스택 트레이스·내부 경로는 클라이언트·로그에 노출하지 않음 (프로덕션)
- **입력 검증**: 모든 사용자 입력은 검증·정제(trim, 길이, 타입, 기본 XSS 방지) 후 처리
- **접근 제어**: 인증·Rate Limit·CORS·Helmet로 무단 접근·남용 억제

---

## 2. 환경 변수·API 키

| 구분 | 규칙 |
|------|------|
| **백엔드** | AI API 키, Firebase Admin(서비스 계정), 데이터 API 키는 **환경 변수**로만 로드. `.env`는 **절대 커밋 금지** (`.gitignore`에 포함됨) |
| **프론트엔드** | Firebase Client 설정만 환경 변수(`VITE_*`). **서버용 API 키(OpenAI, Gemini 등)는 프론트에 두지 않음** — AI 호출은 백엔드 경유 |
| **.env.example** | 실제 값 없이 키 이름·설명만 기재. 배포 시 별도 채움 |

---

## 3. 로그·에러 응답

| 구분 | 규칙 |
|------|------|
| **에러 응답** | 프로덕션에서는 `message`를 일반화된 문구로만 반환. 스택 트레이스·내부 경로·환경 정보 미포함 |
| **서버 로그** | 프로덕션에서 스택 트레이스는 보안이 확보된 로그 채널에만 기록(또는 미기록). 요청 로그에는 **본문(body)·쿼리·토큰·비밀번호 미포함** |
| **사용자 식별** | 로그에 사용자 이메일·UID를 남길 경우 접근 제어·보존 기간 정책 적용 |

---

## 4. 입력 검증·정제

- **문자열**: `trim`, `maxLength` 적용 (coaching 1000자, pipeline 2000자 등)
- **XSS 완화**: 사용자 입력을 HTML로 렌더링할 경우 이스케이프 또는 허용 태그만 사용. API에서는 필요 시 `<script>` 등 위험 패턴 제거 후 저장·AI 전달
- **타입·enum**: 쿼리 타입, 언어, domainIds 등은 화이트리스트로만 허용

---

## 5. 인증·Rate Limit·CORS·Helmet

| 항목 | 상태 |
|------|------|
| **인증** | Firebase ID 토큰 검증 (`auth.middleware.js`). 선택적 인증 라우트는 `optionalAuthenticate` |
| **Rate Limit** | 코칭·파이프라인·피드백·크롤러에 적용. `shared/constants`의 RATE_LIMITS 사용 |
| **CORS** | 허용 origin을 환경 변수로 제한. 개발 시 localhost 다수 포트 허용 가능 |
| **Helmet** | 백엔드 적용. CSP는 프론트에서 관리 |

---

## 6. Firestore·클라이언트 저장

- **Firestore** | `saju_logs` 등에 사용자 질문·응답·user_id 저장 시 **Firestore 보안 규칙**으로 읽기/쓰기 제한. 관리자만 전체 조회 가능하도록 구성 권장
- **localStorage** | `userSaju`, `auth-storage`, `language` 등은 기기 내 저장. 서버 전송 시 HTTPS·최소 필드만 전송. 민감 정보는 필요 시 암호화·단기 보존 정책 검토

---

## 7. 역할별 보안 담당 (에이전트 팀)

| 역할 | 보안·정보보호 관련 담당 |
|------|--------------------------|
| **Security** | Helmet, Rate Limit, 인증·권한, API 키 노출 방지, 로그·에러 비노출 |
| **Backend** | env 검증, 입력 검증·정제, 에러 미들웨어, Firestore 접근 |
| **Frontend** | API 키 미포함, 사용자 메시지만 노출, localStorage 사용 최소화 |
| **PM** | 사양에 보안·개인정보 요구사항 반영, To-do에 보안 작업 포함 |

---

## 8. 체크리스트 (서비스 최적화 시)

- [ ] `.env`·`.env.local` 등이 `.gitignore`에 포함되어 있는지
- [ ] 프로덕션 에러 응답에 스택·내부 메시지가 포함되지 않는지
- [ ] 프로덕션 서버 로그에 스택·본문·토큰이 남지 않도록 설정했는지
- [ ] 코칭·파이프라인·피드백 등 사용자 입력 경로에 Rate Limit이 적용되어 있는지
- [ ] 사용자 입력에 trim·maxLength·기본 XSS 완화가 적용되어 있는지
- [ ] Firestore 보안 규칙이 배포 환경에 적용되어 있는지
- [ ] 프론트엔드에 서버 전용 API 키가 없는지

---

## 9. 참고 문서

- 역할별 개선: [ROLE_BASED_IMPROVEMENTS.md](./ROLE_BASED_IMPROVEMENTS.md)
- 에이전트 오케스트레이션: [AGENT_ORCHESTRATION.md](./AGENT_ORCHESTRATION.md)
- 구조·개선 제안: [IMPROVEMENT_PROPOSAL.md](./IMPROVEMENT_PROPOSAL.md)
