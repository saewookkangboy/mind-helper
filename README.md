# Mind Helper - AI 퍼스널 사주 코칭 서비스

## 프로젝트 개요

사용자의 사주 명리학 정보와 개인의 페르소나를 결합하여, 생성형 AI가 "나만의 영적 라이프 코치"가 되어주는 모바일 웹/앱 서비스입니다.

## 기술 스택

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion (애니메이션)
- React Router (라우팅)
- i18next (다국어 지원)
- Zustand (상태 관리)
- Firebase (인증, Firestore)
- PWA (Progressive Web App)

### Backend
- Node.js + Express
- Firebase Admin SDK
- Cheerio (웹 크롤링)
- Puppeteer (고급 크롤링)
- Node-cron (스케줄링)

### Admin Dashboard
- React 19
- Tremor (차트 라이브러리)
- Recharts (데이터 시각화)

## 프로젝트 구조

```
mind-helper/
├── frontend/          # 메인 프론트엔드 앱
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # UI 컴포넌트
│   │   │   ├── layout/   # 레이아웃 컴포넌트
│   │   │   ├── auth/     # 인증 관련 컴포넌트
│   │   │   └── coaching/ # AI 코칭 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── utils/        # 유틸리티 함수
│   │   │   ├── aiService.js      # AI API 연동
│   │   │   ├── sajuCalculator.js # 사주 계산
│   │   │   └── firestoreLogger.js # 데이터 로깅
│   │   ├── store/        # Zustand 스토어
│   │   ├── config/       # 설정 파일
│   │   └── i18n/         # 다국어 번역 파일
│   └── public/           # 정적 파일
├── admin/            # 관리자 대시보드
│   └── src/
│       ├── pages/    # 대시보드 페이지
│       └── config/   # Firebase 설정
├── backend/          # 백엔드 API 서버
│   └── src/
│       ├── routes/   # API 라우터 (v1)
│       ├── controllers/ # 컨트롤러
│       ├── middleware/  # 미들웨어 (인증, 에러 핸들링 등)
│       ├── services/    # 비즈니스 로직
│       ├── crawler/     # 트렌드 크롤러
│       └── config/      # Firebase Admin 설정
├── shared/           # 공유 코드 패키지
│   └── src/
│       ├── types/    # 타입 정의
│       ├── utils/    # 유틸리티 함수
│       └── constants/ # 상수 정의
└── docs/             # 문서
    ├── ARCHITECTURE_ANALYSIS.md  # 구조 분석
    ├── IMPROVEMENT_PROPOSAL.md  # 개선 제안
    └── QUICK_START.md           # 빠른 시작 가이드

```

## 시작하기

### 전체 프로젝트 실행 (권장)

```bash
# 루트에서 모든 의존성 설치
npm install

# 개발 서버 동시 실행 (Frontend + Backend)
npm run dev

# 또는 각각 실행
npm run dev:frontend  # Frontend만
npm run dev:backend   # Backend만
npm run dev:admin     # Admin만
```

### 개별 실행

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

> 📚 더 자세한 내용은 [QUICK_START.md](./docs/QUICK_START.md)를 참고하세요.

## 환경 변수 설정

각 프로젝트의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

### Frontend
```bash
cd frontend
cp .env.example .env
```

필요한 환경 변수:
- Firebase 설정 (VITE_FIREBASE_*)
- API Base URL (VITE_API_BASE_URL)
- AI Provider 설정 (선택)

### Backend
```bash
cd backend
cp .env.example .env
```

필요한 환경 변수:
- Firebase Admin 설정
- AI Provider API 키 (OPENAI_API_KEY 또는 GEMINI_API_KEY)
- 서버 설정 (PORT, CORS_ORIGIN 등)

### Admin
```bash
cd admin
cp .env.example .env
```

필요한 환경 변수:
- Firebase 설정
- API Base URL

## 주요 기능

### Phase 1 (MVP) - ✅ 완료
- ✅ 프로젝트 구조 구축
- ✅ Liquid Glass 디자인 시스템
- ✅ 다국어 지원 (KO, EN, JA)
- ✅ 반응형 네비게이션
- ✅ 온보딩 페이지
- ✅ 기본 대시보드
- ✅ Firebase 인증 연동
- ✅ 사주 계산 기본 로직

### Phase 1.5 - ✅ 완료
- ✅ AI 코칭 페이지 (채팅 UI)
- ✅ 음성 입력 기능 (Web Speech API)
- ✅ Firestore 데이터 로깅 시스템
- ✅ 사용자 피드백 시스템

### Phase 2.0 - ✅ 완료
- ✅ **AI API 연동** (OpenAI GPT-4o / Gemini Pro)
  - 동적 프롬프트 생성
  - 트렌드 키워드 주입
  - 고품질 예제 기반 학습
- ✅ **자가 발전 알고리즘**
  - 피드백 기반 패턴 분석
  - 프롬프트 가중치 자동 조정
  - 주기적 자동 실행
- ✅ **트렌드 크롤러**
  - Reddit, 네이버, DC Inside 크롤링
  - Firestore 자동 저장
  - 스케줄링 (매 시간마다)
- ✅ **관리자 대시보드**
  - 실시간 메트릭
  - 만족도 차트 (Tremor)
  - 인기 키워드 분석
- ✅ **PWA 고도화**
  - Service Worker
  - 오프라인 지원
  - 자동 업데이트

## 주요 기능 상세

### 1. AI 코칭 시스템
- **실제 AI API 연동**: OpenAI GPT-4o 또는 Google Gemini Pro
- **동적 프롬프트**: 사용자 사주, MBTI, 관심사 기반 맞춤 프롬프트
- **트렌드 반영**: 크롤러가 수집한 최신 키워드 자동 주입
- **자가 발전**: 긍정 피드백 기반 예제 학습

### 2. 자가 발전 알고리즘
- 피드백 분석 및 패턴 추출
- 프롬프트 가중치 자동 조정
- 매일 자정 자동 실행
- Firestore에 분석 결과 저장

### 3. 트렌드 크롤러
- Reddit, 네이버, DC Inside에서 키워드 수집
- Firestore에 자동 저장
- 관리자 승인 후 AI 응답에 활용
- 매 시간마다 자동 실행

### 4. 관리자 대시보드
- 실시간 사용자 통계
- AI 응답 만족도 시각화
- 인기 키워드 분석
- Tremor 차트 라이브러리 활용

### 5. PWA 기능
- 오프라인 지원
- 홈 화면에 추가 가능
- 자동 업데이트
- Service Worker 캐싱

## 디자인 가이드

### Liquid Glass 컨셉
- **Translucent**: 반투명 효과
- **Fluid**: 유동적인 애니메이션
- **Iridescent**: 무지개 빛 효과
- **Depth**: 깊이감 있는 레이어

### 색상 팔레트
- Aurora Purple: `#8B5CF6`
- Aurora Pink: `#EC4899`
- Aurora Blue: `#3B82F6`
- Aurora Cyan: `#06B6D4`

## API 사용법

### AI 코칭 응답 생성 (v1 API)
```javascript
// Frontend에서
const response = await fetch('http://localhost:3001/api/v1/coaching', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    userQuery: '오늘 운세가 어때?',
    queryType: 'today',
    userSaju: sajuData,
    language: 'ko',
    mbti: 'INTJ',
    interests: '음악, 영화',
  }),
});
```

### API 엔드포인트

#### v1 API (권장)
- `POST /api/v1/coaching` - 코칭 응답 생성 (인증 필요)
- `POST /api/v1/feedback` - 피드백 생성 (인증 필요)
- `POST /api/v1/crawler/run` - 크롤러 실행 (관리자)
- `POST /api/v1/self-evolution/run` - 자가 발전 실행 (관리자)
- `GET /api/v1/admin/dashboard` - 대시보드 통계 (관리자)

#### Legacy API (하위 호환성)
- `POST /api/crawler/run` - 크롤러 실행
- `POST /api/self-evolution/run` - 자가 발전 실행

### Health Check
```bash
GET /health
```

## 배포

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# dist 폴더를 배포
```

### Backend (Railway/Heroku)
```bash
cd backend
npm start
```

## 문서

- [구조 분석 및 개선 제안](./docs/ARCHITECTURE_ANALYSIS.md)
- [개선 제안 상세 문서](./docs/IMPROVEMENT_PROPOSAL.md)
- [빠른 시작 가이드](./docs/QUICK_START.md)
- [Dev Agent Kit 연동](./docs/DEV_AGENT_KIT.md) — Spec-kit, To-do, Agent Roles, SEO/GEO 및 Cursor 서브에이전트

## 최근 개선 사항 (v2.0)

### ✅ 완료된 개선
1. **모노레포 구조 개선**
   - Workspace 설정
   - 공유 패키지 (`shared/`) 생성

2. **API 구조 개선**
   - RESTful API 설계
   - API 버저닝 (v1)
   - 인증/권한 미들웨어
   - Rate Limiting
   - 에러 핸들링 표준화

3. **보안 강화**
   - AI API 호출을 백엔드로 이동
   - JWT 토큰 기반 인증
   - 입력 검증 강화

4. **환경 변수 관리**
   - `.env.example` 파일 추가
   - 환경별 설정 분리

### 🔄 진행 중
- 프론트엔드 AI 서비스 백엔드 API 연동
- 테스트 환경 구축
- 로깅 시스템 고도화

### 📋 계획 중
- TypeScript 도입
- CI/CD 파이프라인
- API 문서화 (Swagger)

## 라이선스

MIT
