# Vercel 배포 가이드

Orchestrator(팀 리드) 관점에서 정리한 Mind Helper **프론트엔드** Vercel 배포 프로세스입니다.

---

## 1. 이해 (범위)

| 항목 | 내용 |
|------|------|
| **배포 대상** | `frontend` 워크스페이스 (Vite + React SPA) |
| **배포 플랫폼** | Vercel (정적/SPA 호스팅) |
| **백엔드** | 별도 호스팅 필요. 배포 후 `VITE_API_BASE_URL`에 프로덕션 API URL 설정 |

모노레포이므로 Vercel 프로젝트의 **Root Directory**를 `frontend`로 지정해야 합니다.

---

## 2. 사전 준비

- [ ] GitHub(또는 GitLab 등) 저장소 연결
- [ ] 백엔드 API를 배포할 URL 확보 (선택; 없으면 코칭 등 API 의존 기능만 제한됨)
- [ ] Firebase / AI API 키 등 프로덕션용 환경 변수 준비

---

## 3. Vercel에서 배포하기

### 3.1 프로젝트 연결

1. [vercel.com](https://vercel.com) 로그인 후 **Add New** → **Project**
2. **Import** 할 Git 저장소 선택 (mind-helper)
3. **Root Directory** 설정:
   - **Edit** 클릭 후 `frontend` 입력
   - 저장소 루트가 아닌 **frontend** 폴더를 프로젝트 루트로 사용

### 3.2 빌드 설정 (자동 감지)

- **Framework Preset**: Vite (자동 감지)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `dist` (기본값)
- `frontend/vercel.json`에 SPA 라우팅용 `rewrites`가 설정되어 있어 별도 설정 불필요

### 3.3 환경 변수

**Settings** → **Environment Variables**에서 다음 변수 추가 (필요한 것만):

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `VITE_API_BASE_URL` | 프로덕션 백엔드 API URL (예: `https://api.example.com`) | API 사용 시 |
| `VITE_FIREBASE_*` | Firebase 설정 (프로젝트 ID, API Key 등) | 로그인/Firestore 사용 시 |
| `VITE_AI_PROVIDER`, `VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY` | AI API (클라이언트 노출 주의) | AI 기능 사용 시 |

배포 시점에만 필요한 변수는 **Production** 환경에만 넣으면 됩니다.

### 3.4 배포 실행

- **Deploy** 클릭 후 빌드·배포 완료 대기
- 배포가 끝나면 **Preview URL** / **Production URL**에서 확인

---

## 4. 로컬에서 Vercel CLI로 배포 (선택)

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# frontend 기준 배포 (모노레포)
cd frontend
vercel

# 프로덕션 도메인에 배포
vercel --prod
```

`frontend` 디렉터리에서 실행하면 `frontend/vercel.json`이 자동으로 적용됩니다.

---

## 5. 검증 체크리스트

- [ ] 루트(`/`) 접속 시 앱 로딩
- [ ] 클라이언트 라우팅 (예: `/coaching`, `/dashboard`) 새로고침 시 404 없음 (rewrites 동작)
- [ ] `VITE_API_BASE_URL` 설정 시 API 호출 정상 여부
- [ ] (선택) Firebase 로그인·Firestore 동작

---

## 6. 참고

- **백엔드 배포**: `backend`는 Node 서버이므로 Railway, Render, Fly.io 등 별도 호스팅 후, 프론트엔드 `VITE_API_BASE_URL`에 해당 URL 설정
- **문서**: `docs/AGENT_ORCHESTRATION.md`, `docs/QUICK_START.md`
- **환경 변수 예시**: `frontend/.env.example`
