# Fortune Mate 빠른 시작 가이드

## 📋 개선 사항 적용 후 시작하기

### 1. 의존성 설치

```bash
# 루트에서 모든 워크스페이스 의존성 설치
npm install

# 또는 각각 설치
cd frontend && npm install
cd ../backend && npm install
cd ../admin && npm install
cd ../shared && npm install
```

### 2. 환경 변수 설정

#### Frontend
```bash
cd frontend
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정
```

#### Backend
```bash
cd backend
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정
```

#### Admin
```bash
cd admin
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정
```

### 3. 개발 서버 실행

#### 옵션 1: 루트에서 동시 실행
```bash
npm run dev
```

#### 옵션 2: 각각 실행
```bash
# 터미널 1: Frontend
npm run dev:frontend

# 터미널 2: Backend
npm run dev:backend

# 터미널 3: Admin (선택)
npm run dev:admin
```

### 4. API 엔드포인트

#### 새로운 구조 (v1)
- `POST /api/v1/coaching` - 코칭 응답 생성
- `POST /api/v1/feedback` - 피드백 생성
- `POST /api/v1/crawler/run` - 크롤러 실행 (관리자)
- `POST /api/v1/self-evolution/run` - 자가 발전 실행 (관리자)
- `GET /api/v1/admin/dashboard` - 대시보드 통계 (관리자)

#### Legacy (하위 호환성)
- `POST /api/crawler/run` - 크롤러 실행
- `POST /api/self-evolution/run` - 자가 발전 실행

### 5. 주요 변경 사항

#### ✅ 추가된 기능
1. **공유 패키지 (`shared/`)**
   - 타입 정의
   - 유틸리티 함수
   - 에러 클래스
   - 상수 정의

2. **API 구조 개선**
   - RESTful API 설계
   - API 버저닝 (v1)
   - 인증 미들웨어
   - Rate Limiting
   - 에러 핸들링 표준화

3. **보안 강화**
   - AI API 호출을 백엔드로 이동
   - JWT 토큰 기반 인증
   - Rate Limiting 적용

#### ⚠️ 주의사항
- 프론트엔드에서 AI API를 직접 호출하던 코드는 백엔드 API를 통해 호출하도록 변경 필요
- 인증이 필요한 API는 `Authorization: Bearer <token>` 헤더 필요

### 6. 다음 단계

1. **프론트엔드 AI 서비스 수정**
   - `frontend/src/utils/aiService.js`를 백엔드 API 호출로 변경

2. **테스트**
   - API 엔드포인트 테스트
   - 인증 플로우 테스트

3. **문서화**
   - API 문서 작성 (Swagger)
   - 컴포넌트 문서 작성

## 문제 해결

### 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 환경 변수 오류
- `.env.example` 파일을 참고하여 모든 필수 환경 변수가 설정되었는지 확인

### 포트 충돌
- Frontend: 3000
- Backend: 3001
- Admin: 5173 (기본값)

포트를 변경하려면 각 프로젝트의 설정 파일 수정
