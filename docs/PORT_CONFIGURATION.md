# 포트 설정 가이드

## 현재 포트 설정

### 개발 환경 기본 포트

| 서비스 | 포트 | 설정 파일 |
|--------|------|-----------|
| **Frontend** | `5173` | `frontend/vite.config.js` |
| **Backend** | `4001` | `backend/src/index.js` |
| **Admin** | `3002` | `admin/vite.config.js` |

### 포트 변경 방법

#### 1. Frontend 포트 변경

`frontend/vite.config.js` 파일 수정:

```javascript
export default defineConfig({
  // ...
  server: {
    port: 5173, // 원하는 포트로 변경
    open: true,
  },
});
```

#### 2. Backend 포트 변경

**방법 1: 환경 변수 사용 (권장)**

`.env` 파일에 추가:
```bash
PORT=4001
```

**방법 2: 코드에서 직접 변경**

`backend/src/index.js` 파일 수정:
```javascript
const PORT = process.env.PORT || 4001; // 기본값 변경
```

#### 3. Admin 포트 변경

`admin/vite.config.js` 파일 수정:

```javascript
export default defineConfig({
  // ...
  server: {
    port: 3002, // 원하는 포트로 변경
    open: true,
  },
});
```

### 환경 변수 설정

프론트엔드에서 백엔드 API를 호출할 때 올바른 포트를 사용하도록 환경 변수를 설정하세요.

#### Frontend `.env` 파일

```bash
VITE_API_BASE_URL=http://localhost:4001
```

#### Backend `.env` 파일

```bash
PORT=4001
CORS_ORIGIN=http://localhost:5173
```

### 포트 충돌 해결

포트가 이미 사용 중인 경우:

1. **포트 사용 확인**
   ```bash
   # macOS/Linux
   lsof -i :5173
   lsof -i :4001
   
   # Windows
   netstat -ano | findstr :5173
   netstat -ano | findstr :4001
   ```

2. **프로세스 종료**
   ```bash
   # macOS/Linux
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. **다른 포트 사용**
   - 위의 설정 파일에서 포트 번호를 변경

### 개발 서버 실행

```bash
# 전체 서비스 실행
npm run dev

# 개별 실행
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:4001
npm run dev:admin     # http://localhost:3002
```

### 프로덕션 배포

프로덕션 환경에서는 환경 변수를 통해 포트를 설정하는 것을 권장합니다:

```bash
# Frontend (Vercel, Netlify 등)
VITE_API_BASE_URL=https://api.yourdomain.com

# Backend (Railway, Heroku 등)
PORT=4001
CORS_ORIGIN=https://yourdomain.com
```

## 참고

- Vite 기본 포트: `5173`
- Express 기본 포트: `3000` (일반적으로 백엔드는 `3001` 이상 사용)
- 포트 범위: `1024-65535` (일반 사용자 권한으로는 `1024-49151` 권장)
