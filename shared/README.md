# @mind-helper/shared

Mind Helper 프로젝트의 공유 코드 패키지입니다.

## 구조

```
shared/
├── src/
│   ├── types/        # 타입 정의
│   ├── utils/        # 유틸리티 함수
│   ├── constants/    # 상수
│   └── index.js      # 메인 엔트리
└── package.json
```

## 사용법

### 다른 패키지에서 import

```javascript
// 타입 사용
import { QueryTypes, FeedbackTypes } from '@mind-helper/shared/types';

// 유틸리티 사용
import { validateEnv, retry } from '@mind-helper/shared/utils';

// 에러 클래스 사용
import { AppError, ErrorCodes } from '@mind-helper/shared/utils/errors';

// 상수 사용
import { API_ENDPOINTS, HTTP_STATUS } from '@mind-helper/shared/constants';
```

## 개발

이 패키지는 모노레포의 다른 패키지들(frontend, backend, admin)에서 공유하여 사용됩니다.
