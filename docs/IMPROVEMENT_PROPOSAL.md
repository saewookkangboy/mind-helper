# Mind Helper 개선 제안 상세 문서

## 📋 개요

이 문서는 Mind Helper 서비스의 구조적 개선을 위한 구체적인 구현 가이드를 제공합니다.

---

## 1. 모노레포 구조 개선

### 1.1 현재 문제점
- `shared/` 폴더가 비어있음
- 각 프로젝트 간 코드 중복
- 의존성 관리가 분리되어 있음

### 1.2 제안 구조

```json
// 루트 package.json
{
  "name": "mind-helper",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=apps/frontend\" \"npm run dev --workspace=apps/backend\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

### 1.3 구현 단계

#### Step 1: 디렉토리 구조 재구성
```
mind-helper/
├── packages/
│   └── shared/
│       ├── package.json
│       ├── src/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── constants/
│       │   └── index.js
│       └── tsconfig.json
├── apps/
│   ├── frontend/  (기존 frontend/)
│   ├── admin/     (기존 admin/)
│   └── backend/   (기존 backend/)
└── package.json
```

#### Step 2: 공유 코드 예시

```javascript
// packages/shared/src/types/index.js
export const QueryTypes = {
  TODAY: 'today',
  CAREER: 'career',
  LOVE: 'love',
};

export const FeedbackTypes = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
};

// packages/shared/src/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

// packages/shared/src/constants/index.js
export const API_ENDPOINTS = {
  COACHING: '/api/v1/coaching',
  FEEDBACK: '/api/v1/feedback',
  TRENDS: '/api/v1/trends',
};
```

---

## 2. 환경 변수 관리 개선

### 2.1 현재 문제점
- `.env.example` 파일 부재
- 환경 변수 검증 없음
- 타입 안전성 부족

### 2.2 제안 구조

#### Frontend 환경 변수
```bash
# frontend/.env.example
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_ENV=development
```

#### Backend 환경 변수
```bash
# backend/.env.example
PORT=3001
NODE_ENV=development

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key

# Crawler
CRAWLER_ENABLED=true
REDDIT_ENABLED=true
NAVER_ENABLED=true
DCINSIDE_ENABLED=true

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000
```

### 2.3 환경 변수 검증

```javascript
// packages/shared/src/config/env.js
const requiredEnvVars = {
  frontend: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
  ],
  backend: [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
  ],
};

export function validateEnv(platform) {
  const missing = requiredEnvVars[platform]
    .filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## 3. API 구조 개선

### 3.1 현재 문제점
- 단순한 Express 라우팅
- 인증/권한 체크 없음
- 에러 핸들링 미흡

### 3.2 제안 구조

```
backend/src/
├── routes/
│   ├── v1/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── coaching.routes.js
│   │   ├── feedback.routes.js
│   │   └── admin.routes.js
│   └── index.js
├── controllers/
│   ├── coaching.controller.js
│   ├── feedback.controller.js
│   └── admin.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── error.middleware.js
│   └── rateLimit.middleware.js
├── services/
│   ├── ai.service.js
│   ├── feedback.service.js
│   └── trend.service.js
└── utils/
    ├── logger.js
    └── errors.js
```

### 3.3 구현 예시

#### 라우터 구조
```javascript
// backend/src/routes/v1/index.js
import express from 'express';
import coachingRoutes from './coaching.routes.js';
import feedbackRoutes from './feedback.routes.js';
import adminRoutes from './admin.routes.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use('/coaching', authenticate, coachingRoutes);
router.use('/feedback', authenticate, feedbackRoutes);
router.use('/admin', authenticate, adminRoutes);

export default router;
```

#### 인증 미들웨어
```javascript
// backend/src/middleware/auth.middleware.js
import { auth } from '../config/firebase-admin.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### 에러 핸들링 미들웨어
```javascript
// backend/src/middleware/error.middleware.js
import { AppError } from '../../packages/shared/src/utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

---

## 4. 보안 강화

### 4.1 AI API 키 보호

#### 현재 문제
- AI API 키가 프론트엔드에 노출
- 클라이언트에서 직접 AI API 호출

#### 개선 방안
```javascript
// backend/src/controllers/coaching.controller.js
import { generateCoachingResponse } from '../services/ai.service.js';

export async function createCoaching(req, res, next) {
  try {
    const { userQuery, queryType, userSaju, language, mbti, interests } = req.body;
    
    const response = await generateCoachingResponse({
      userQuery,
      queryType,
      userSaju,
      language,
      mbti,
      interests,
    });

    res.json({ response });
  } catch (error) {
    next(error);
  }
}
```

```javascript
// frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function generateCoaching(data) {
  const token = await getAuthToken(); // Firebase Auth token
  
  const response = await fetch(`${API_BASE_URL}/api/v1/coaching`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to generate coaching');
  }

  return response.json();
}
```

### 4.2 Rate Limiting

```javascript
// backend/src/middleware/rateLimit.middleware.js
import rateLimit from 'express-rate-limit';

export const coachingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 최대 20회 요청
  message: 'Too many requests, please try again later',
});

export const crawlerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 5, // 최대 5회 요청
  message: 'Crawler rate limit exceeded',
});
```

---

## 5. 로깅 시스템

### 5.1 Winston 설정

```javascript
// backend/src/utils/logger.js
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 5.2 사용 예시

```javascript
// backend/src/services/ai.service.js
import { logger } from '../utils/logger.js';

export async function generateCoachingResponse(data) {
  logger.info('Generating coaching response', { 
    queryType: data.queryType,
    language: data.language,
  });

  try {
    const response = await callAI(data);
    logger.info('Coaching response generated successfully');
    return response;
  } catch (error) {
    logger.error('Failed to generate coaching response', { 
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
```

---

## 6. 테스트 환경

### 6.1 Jest 설정

```javascript
// frontend/jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
  ],
};
```

### 6.2 테스트 예시

```javascript
// frontend/src/utils/__tests__/aiService.test.js
import { generateCoachingResponse } from '../aiService';

describe('generateCoachingResponse', () => {
  it('should generate a coaching response', async () => {
    const response = await generateCoachingResponse({
      userQuery: '오늘 운세가 어때?',
      queryType: 'today',
      language: 'ko',
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });
});
```

---

## 7. CI/CD 파이프라인

### 7.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
```

---

## 8. 문서화

### 8.1 API 문서 (Swagger)

```javascript
// backend/src/routes/v1/index.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mind Helper API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 8.2 컴포넌트 문서 (Storybook)

```javascript
// frontend/.storybook/main.js
export default {
  stories: ['../src/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-essentials'],
};
```

---

## 구현 체크리스트

### Phase 1: 기반 구조 (1-2주)
- [ ] 모노레포 구조 설정
- [ ] `packages/shared` 생성 및 공유 코드 이동
- [ ] 환경 변수 `.env.example` 파일 생성
- [ ] 환경 변수 검증 로직 추가

### Phase 2: API 개선 (2-3주)
- [ ] API 라우터 구조화
- [ ] 인증/권한 미들웨어 추가
- [ ] 에러 핸들링 미들웨어
- [ ] Rate Limiting 추가

### Phase 3: 보안 강화 (1주)
- [ ] AI API 호출을 백엔드로 이동
- [ ] JWT 토큰 기반 인증
- [ ] 입력 검증 강화

### Phase 4: 품질 향상 (2-3주)
- [ ] 로깅 시스템 구축
- [ ] 테스트 환경 설정
- [ ] 핵심 기능 테스트 작성

### Phase 5: 고도화 (선택)
- [ ] TypeScript 도입
- [ ] CI/CD 파이프라인
- [ ] API 문서화
- [ ] 컴포넌트 문서화

---

## 참고 자료

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Monorepo Guide](https://monorepo.tools/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
