/**
 * AI 서비스 유틸리티
 * 백엔드 API를 통해 AI 응답 생성
 */

import { apiPost } from './apiClient.js';

/**
 * 6대 도메인(사주, 심리상담, MBTI, 타로, 버크만, 다크 심리학) 소스 기반 파이프라인 응답 생성
 * @param {object} params
 * @param {string} params.userQuery - 사용자 질문
 * @param {string} [params.language='ko'] - ko|en|ja
 * @param {string[]} [params.domainIds] - 적용할 도메인. 미지정 시 전 도메인
 * @param {object} [params.userContext] - birthDate, birthTime, timezone, mbti, userSaju, interests
 * @returns {Promise<{ response: string, sourcesUsed: string[], timestamp: string }>}
 */
export async function generatePipelineResponse({
  userQuery,
  language = 'ko',
  domainIds,
  userContext = {},
}) {
  const res = await apiPost('/pipeline', {
    userQuery,
    language,
    domainIds,
    userContext,
  });
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.error?.message || '파이프라인 응답 생성 실패');
}

/**
 * 백엔드 API를 통해 AI 코칭 응답 생성
 * 보안을 위해 AI API 키는 백엔드에서만 사용됩니다.
 */

/**
 * AI 코칭 응답 생성
 * 백엔드 API를 통해 호출
 */
export async function generateCoachingResponse({
  userQuery,
  queryType,
  userSaju,
  language = 'ko',
  mbti,
  interests,
}) {
  try {
    const response = await apiPost('/coaching', {
      userQuery,
      queryType,
      userSaju,
      language,
      mbti,
      interests,
    });

    if (response.success && response.data) {
      return response.data.response;
    }

    const err = new Error(response.error?.message || 'AI 응답 생성 실패');
    if (response.error?.code) err.code = response.error.code;
    err.userMessage = response.error?.message || err.message;
    throw err;
  } catch (error) {
    if (error.userMessage !== undefined) throw error;
    console.error('AI 응답 생성 실패:', error);
    return getFallbackResponse(queryType, language);
  }
}


/**
 * 폴백 응답 (API 실패 시)
 */
function getFallbackResponse(queryType, language) {
  const responses = {
    ko: {
      today: '오늘은 당신에게 새로운 기회가 찾아올 날입니다. 긍정적인 에너지를 받아들이고, 주변 사람들과의 소통을 소중히 하세요.',
      career: '당신의 진로에 대해 생각해보니, 현재의 노력이 곧 결실을 맺을 것 같습니다. 새로운 도전을 두려워하지 마세요.',
      love: '연애 운을 보니, 솔직한 대화가 관계를 개선하는 열쇠가 될 것 같습니다. 마음을 열어두세요.',
    },
    en: {
      today: 'Today is a day when new opportunities will come to you. Embrace positive energy and cherish communication with those around you.',
      career: 'Looking at your career path, your current efforts will soon bear fruit. Don\'t be afraid of new challenges.',
      love: 'Looking at your love fortune, honest communication seems to be the key to improving relationships. Keep your heart open.',
    },
    ja: {
      today: '今日はあなたに新しい機会が訪れる日です。ポジティブなエネルギーを受け入れ、周りの人々とのコミュニケーションを大切にしてください。',
      career: 'あなたのキャリアについて考えると、現在の努力がすぐに実を結ぶようです。新しい挑戦を恐れないでください。',
      love: '恋愛運を見ると、正直な会話が関係を改善する鍵のようです。心を開いてください。',
    },
  };

  return responses[language]?.[queryType] || responses.ko.today;
}

/**
 * 동적 프롬프트 튜닝 (자가 발전)
 */
export async function tunePromptWithFeedback(queryType, positiveExamples, negativeExamples) {
  // 피드백 기반으로 프롬프트 가중치 조정
  // 실제 구현은 더 복잡한 알고리즘이 필요하지만, 기본 구조 제공
  
  const analysis = {
    positivePatterns: extractPatterns(positiveExamples),
    negativePatterns: extractPatterns(negativeExamples),
    recommendations: generateRecommendations(positiveExamples, negativeExamples),
  };

  return analysis;
}

function extractPatterns(examples) {
  // 예제에서 패턴 추출 (간단한 버전)
  return {
    commonWords: [],
    responseLength: 0,
    tone: 'neutral',
  };
}

function generateRecommendations(positive, negative) {
  return {
    useMore: [],
    avoidUsing: [],
    adjustTone: 'neutral',
  };
}
