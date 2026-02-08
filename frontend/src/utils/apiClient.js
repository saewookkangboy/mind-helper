/**
 * API 클라이언트 유틸리티
 * 백엔드 API 호출을 위한 공통 함수
 * - 에러 코드(code) 기반 사용자 친화적 메시지 매핑
 */

// 개발 시 Vite 프록시 사용(같은 origin → CORS 없음). 프로덕션은 VITE_API_BASE_URL 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? '' : 'http://localhost:4001');
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

/** API 에러 코드별 사용자 노출 메시지 (다국어는 i18n 확장 가능) */
export const API_ERROR_USER_MESSAGES = {
  RATE_LIMIT_EXCEEDED: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해 주세요.',
  INVALID_TOKEN: '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.',
  TOKEN_EXPIRED: '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.',
  FORBIDDEN: '이 작업을 수행할 권한이 없습니다.',
  VALIDATION_ERROR: '입력값을 확인해 주세요.',
  INVALID_INPUT: '입력값을 확인해 주세요.',
  NOT_FOUND: '요청한 내용을 찾을 수 없습니다.',
  AI_SERVICE_ERROR: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  AI_QUOTA_EXCEEDED: '일시적으로 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  INTERNAL_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

/**
 * API 에러에서 사용자에게 보여줄 메시지 반환
 * @param {{ code?: string, message?: string } | undefined} errorPayload
 * @param {number} status
 */
export function getUserMessageFromApiError(errorPayload, status) {
  const code = errorPayload?.code;
  const serverMessage = errorPayload?.message;
  if (code && API_ERROR_USER_MESSAGES[code]) {
    return API_ERROR_USER_MESSAGES[code];
  }
  if (serverMessage && typeof serverMessage === 'string') {
    return serverMessage;
  }
  if (status === 401) return API_ERROR_USER_MESSAGES.UNAUTHORIZED;
  if (status === 429) return API_ERROR_USER_MESSAGES.RATE_LIMIT_EXCEEDED;
  if (status >= 500) return API_ERROR_USER_MESSAGES.INTERNAL_ERROR;
  return '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

/** 네트워크/연결 실패 시 사용자 메시지 */
const NETWORK_ERROR_MESSAGE = '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해 주세요. (npm run dev)';

/**
 * Firebase 인증 토큰 가져오기
 */
async function getAuthToken() {
  try {
    const { getAuth } = await import('firebase/auth');
    const { auth } = await import('../config/firebase.js');
    const currentUser = auth.currentUser;

    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('인증 토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * API 요청 함수
 * - 실패 시 에러 객체에 userMessage, status, code 첨부
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const authToken = await getAuthToken();
  if (authToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorBody = errorData?.error;
      const userMessage = getUserMessageFromApiError(errorBody, response.status);
      const err = new Error(userMessage);
      err.status = response.status;
      err.code = errorBody?.code;
      err.userMessage = userMessage;
      throw err;
    }

    return await response.json();
  } catch (error) {
    if (error.userMessage !== undefined) {
      console.error('API 요청 오류:', { code: error.code, status: error.status, message: error.message });
    } else {
      console.error('API 요청 오류:', error);
      // Failed to fetch / 네트워크 오류 시 사용자 안내
      if (error?.name === 'TypeError' && (error?.message === 'Failed to fetch' || error?.message?.includes('fetch'))) {
        error.userMessage = NETWORK_ERROR_MESSAGE;
      }
    }
    throw error;
  }
}

/**
 * GET 요청
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST 요청
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 요청
 */
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 요청
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * 만세력 기반 사주 계산 (KST 기준, 백엔드 KARI 음력 데이터)
 * @param {string} birthDate - YYYY-MM-DD
 * @param {string} birthTime - HH:MM
 * @param {string} [timezone] - IANA 타임존 (예: Asia/Seoul, UTC). 미지정 시 KST(Asia/Seoul)로 간주
 * @returns {Promise<{ data: { saju, kstBirth?, timezone } }>}
 */
export async function apiCalculateSaju(birthDate, birthTime, timezone = 'Asia/Seoul') {
  return apiPost('/saju', { birthDate, birthTime, timezone });
}
