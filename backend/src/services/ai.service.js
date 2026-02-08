/**
 * AI 서비스
 * 백엔드에서 AI API를 호출하는 서비스
 */

import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { getLanguageEmbedding, LANGUAGE_LABELS, normalizeLanguageCode } from './languageEmbedding.js';

const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'groq',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  },
  // Groq: 무료 티어 제공, OpenAI 호환 채팅 API (https://console.groq.com)
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    baseURL: 'https://api.groq.com/openai/v1',
  },
  // xAI Grok: Gemini 보완용 (https://api.x.ai)
  grok: {
    apiKey: process.env.GROK_API_KEY,
    model: process.env.GROK_MODEL || 'grok-4-latest',
    baseURL: 'https://api.x.ai/v1',
  },
  // Upstage Solar: OpenAI 호환 채팅 API (https://api.upstage.ai/v2)
  upstage: {
    apiKey: process.env.UPSTAGE_API_KEY,
    model: process.env.UPSTAGE_MODEL || 'solar-1-pro',
    baseURL: 'https://api.upstage.ai/v2',
  },
};

/**
 * 트렌드 키워드 가져오기
 */
async function getTrendKeywords() {
  try {
    const { db } = await import('../config/firebase-admin.js');
    
    const trendsSnapshot = await db.collection('trends')
      .where('is_active', '==', true)
      .get();
    
    return trendsSnapshot.docs.map(doc => ({
      keyword: doc.data().keyword,
      category: doc.data().category,
    }));
  } catch (error) {
    console.error('트렌드 키워드 가져오기 실패:', error);
    return [];
  }
}

/**
 * 고품질 예제 가져오기
 */
async function getHighQualityExamples(queryType) {
  try {
    const { db } = await import('../config/firebase-admin.js');
    
    const logsSnapshot = await db.collection('saju_logs')
      .where('query_type', '==', queryType)
      .where('user_feedback', '==', 'positive')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    
    return logsSnapshot.docs.map(doc => ({
      query: doc.data().user_query,
      response: doc.data().ai_response,
    }));
  } catch (error) {
    const { logger } = await import('../../../shared/src/utils/logger.js');
    logger.error('고품질 예제 가져오기 실패', { error: error.message });
    return [];
  }
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(messages, systemPrompt) {
  const { openai } = AI_CONFIG;
  
  if (!openai.apiKey) {
    throw new AppError(
      'AI service is temporarily unavailable',
      503,
      ErrorCodes.AI_SERVICE_ERROR
    );
  }

  const response = await fetch(`${openai.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openai.apiKey}`,
    },
    body: JSON.stringify({
      model: openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.error?.message || 'OpenAI API 호출 실패';
    const code = error.error?.code;
    // 할당량/결제 초과 시 클라이언트에 안내 메시지 반환
    if (
      code === 'insufficient_quota' ||
      /quota|billing|exceeded your current quota/i.test(message)
    ) {
      throw new AppError(
        '일시적으로 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        503,
        ErrorCodes.AI_QUOTA_EXCEEDED
      );
    }
    throw new AppError(message, response.status >= 500 ? 503 : 502, ErrorCodes.AI_SERVICE_ERROR);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Groq API 호출 (OpenAI 호환: 무료 티어 제공)
 * https://console.groq.com/docs/text-chat
 */
async function callGroq(messages, systemPrompt) {
  const { groq } = AI_CONFIG;

  if (!groq.apiKey) {
    throw new AppError(
      'AI service is temporarily unavailable',
      503,
      ErrorCodes.AI_SERVICE_ERROR
    );
  }

  const response = await fetch(`${groq.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groq.apiKey}`,
    },
    body: JSON.stringify({
      model: groq.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.error?.message || 'Groq API 호출 실패';
    if (response.status === 429 || /rate|quota|limit/i.test(message)) {
      throw new AppError(
        '일시적으로 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        503,
        ErrorCodes.AI_QUOTA_EXCEEDED
      );
    }
    throw new AppError(message, response.status >= 500 ? 503 : 502, ErrorCodes.AI_SERVICE_ERROR);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * xAI Grok API 호출 (OpenAI 호환, Gemini 보완용)
 * https://api.x.ai/v1/chat/completions
 */
async function callGrok(messages, systemPrompt) {
  const { grok } = AI_CONFIG;

  if (!grok.apiKey) {
    throw new AppError(
      'AI service is temporarily unavailable',
      503,
      ErrorCodes.AI_SERVICE_ERROR
    );
  }

  const response = await fetch(`${grok.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${grok.apiKey}`,
    },
    body: JSON.stringify({
      model: grok.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.error?.message || 'Grok API 호출 실패';
    if (response.status === 429 || /rate|quota|limit/i.test(message)) {
      throw new AppError(
        '일시적으로 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        503,
        ErrorCodes.AI_QUOTA_EXCEEDED
      );
    }
    throw new AppError(message, response.status >= 500 ? 503 : 502, ErrorCodes.AI_SERVICE_ERROR);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Upstage Solar API 호출 (OpenAI 호환, https://api.upstage.ai/v2)
 */
async function callUpstage(messages, systemPrompt) {
  const { upstage } = AI_CONFIG;

  if (!upstage.apiKey) {
    throw new AppError(
      'AI service is temporarily unavailable',
      503,
      ErrorCodes.AI_SERVICE_ERROR
    );
  }

  const response = await fetch(`${upstage.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${upstage.apiKey}`,
    },
    body: JSON.stringify({
      model: upstage.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.error?.message || 'Upstage API 호출 실패';
    if (response.status === 429 || /rate|quota|limit/i.test(message)) {
      throw new AppError(
        '일시적으로 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        503,
        ErrorCodes.AI_QUOTA_EXCEEDED
      );
    }
    throw new AppError(message, response.status >= 500 ? 503 : 502, ErrorCodes.AI_SERVICE_ERROR);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Gemini API 호출
 */
async function callGemini(prompt, systemInstruction) {
  const { gemini } = AI_CONFIG;
  
  if (!gemini.apiKey) {
    throw new AppError(
      'AI service is temporarily unavailable',
      503,
      ErrorCodes.AI_SERVICE_ERROR
    );
  }

  const response = await fetch(
    `${gemini.baseURL}/models/${gemini.model}:generateContent?key=${gemini.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemInstruction}\n\n${prompt}`,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API 호출 실패');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * 시스템 프롬프트 구성
 * 언어 임베딩(한국어/영어/일본어 정확성·톤 지침)을 반영합니다.
 */
function buildSystemPrompt(queryType, language, userSaju, mbti, interests, trendText, examplesText) {
  const lang = normalizeLanguageCode(language);
  const languageEmbedding = getLanguageEmbedding(lang);
  const languageLabel = LANGUAGE_LABELS[lang] || LANGUAGE_LABELS.ko;

  const categoryMap = {
    today: '오늘의 운세',
    career: '진로/취업',
    love: '연애',
  };

  const sajuText = userSaju
    ? `\n사용자의 사주 정보:\n- 일간 오행: ${userSaju.ohengAnalysis?.dayOheng}\n- 오행 분포: ${JSON.stringify(userSaju.ohengAnalysis?.distribution)}\n- 기본 해석: ${userSaju.interpretation}`
    : '';

  return `당신은 전문적인 사주 명리학 상담사이자 영적 라이프 코치입니다.

${languageEmbedding}

응답 언어: ${languageLabel} (반드시 위 규칙에 따라 일관되게 답변하세요.)

카테고리: ${categoryMap[queryType] || '일반'}
${sajuText}
${mbti ? `\n사용자 MBTI: ${mbti}` : ''}
${interests ? `\n관심사: ${interests}` : ''}
${trendText}
${examplesText}

답변 시 다음을 고려하세요:
1. 현대적이고 친근한 언어 사용
2. 구체적이고 실용적인 조언 제공
3. 긍정적이지만 현실적인 톤 유지
4. 사주 정보를 자연스럽게 활용
5. 트렌드 키워드를 적절히 활용하여 친근함 표현
6. ${languageLabel}로 위 언어 규칙을 준수하며 자연스럽게 답변`;
}

/**
 * AI 코칭 응답 생성
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
    // 트렌드 키워드 가져오기
    const trends = await getTrendKeywords();
    const trendText = trends.length > 0
      ? `\n현재 유행하는 키워드: ${trends.map(t => t.keyword).join(', ')}`
      : '';

    // 고품질 예제 가져오기
    const examples = await getHighQualityExamples(queryType);
    const examplesText = examples.length > 0
      ? `\n\n참고할 수 있는 좋은 답변 예시:\n${examples.map((e, i) => `${i + 1}. 질문: ${e.query}\n답변: ${e.response}`).join('\n\n')}`
      : '';

    // 시스템 프롬프트 구성
    const systemPrompt = buildSystemPrompt(queryType, language, userSaju, mbti, interests, trendText, examplesText);

    // 사용자 메시지
    const messages = [{
      role: 'user',
      content: userQuery,
    }];

    // AI API 호출
    const provider = AI_CONFIG.provider;
    let response;

    if (provider === 'openai') {
      response = await callOpenAI(messages, systemPrompt);
    } else if (provider === 'groq') {
      response = await callGroq(messages, systemPrompt);
    } else if (provider === 'grok') {
      response = await callGrok(messages, systemPrompt);
    } else if (provider === 'upstage') {
      response = await callUpstage(messages, systemPrompt);
    } else if (provider === 'gemini') {
      response = await callGemini(userQuery, systemPrompt);
    } else {
      throw new Error(`지원하지 않는 AI 제공자: ${provider}. openai | groq | grok | upstage | gemini 중 하나를 사용하세요.`);
    }

    return response;
  } catch (error) {
    const { logger } = await import('../../../shared/src/utils/logger.js');
    logger.error('AI 응답 생성 실패', {
      error: error.message,
      queryType,
      provider: AI_CONFIG.provider,
    });
    throw error;
  }
}

/** 파이프라인 구조화 응답용 섹션 키 (고객 결과 페이지 6개 섹션과 일치) */
const PIPELINE_SECTION_IDS = ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology'];

/**
 * 파이프라인 전용: 도메인 소스 기반 AI 응답 생성
 * 고객 관점·사용성: 종합 인사이트(summary) + 6개 섹션별 Mind Helper 조언(sections) 구조로 반환
 */
export async function generatePipelineResponse({
  userQuery,
  language = 'ko',
  domainContexts = {},
  sourcesUsed = [],
  interests,
}) {
  const languageMap = { ko: '한국어', en: 'English', ja: '日本語' };
  const lang = languageMap[language] || '한국어';

  const sourceBlocks = Object.entries(domainContexts)
    .map(([id, text]) => `[${id}]\n${text}`)
    .join('\n\n');

  const sectionKeys = PIPELINE_SECTION_IDS.join(', ');

  const systemPrompt = `당신은 사주(만세력), 심리상담, MBTI, 타로, 버크만 진단, 다크 심리학을 통합해 상담하는 전문 코치입니다.
아래 "측정 소스"는 사용자에게 적용된 도메인별 참조 데이터입니다. 질문에 맞게 이 소스만 활용해 해석하고 조언하세요. 없는 소스는 만들지 마세요.

${sourceBlocks ? `\n=== 측정 소스 (활용할 참조 데이터) ===\n${sourceBlocks}` : '\n(제공된 소스 없음. 일반적인 코칭 톤으로 답변하세요.)'}

답변 규칙:
1. 반드시 ${lang}로 답변하세요.
2. 활용한 소스가 있으면 그에 기반해 구체적으로 서술하세요.
3. 현대적·친근한 말투, 구체적 행동 제안을 포함하세요.
4. 다크 심리학은 교육·자기보호 관점으로만 서술하세요.

**출력 형식 (반드시 준수)**: 아래 JSON만 출력하고, 그 외 설명·마크다운 없이 한 덩어리로 출력하세요.
{
  "summary": "위 6개 관점의 핵심 결론을 2~4문장으로 요약한 종합 인사이트. 고객이 한눈에 '무엇을 기억하면 좋은지' 알 수 있게 작성.",
  "sections": {
    "saju": "사주(만세력) 관점에서의 Mind Helper 조언 (해당 소스 활용 시에만 구체적으로, 없으면 짧게)",
    "psychology": "심리상담 관점에서의 Mind Helper 조언",
    "mbti": "MBTI 관점에서의 Mind Helper 조언",
    "tarot": "타로 관점에서의 Mind Helper 조언",
    "birkman": "버크만 진단 관점에서의 Mind Helper 조언",
    "dark_psychology": "다크 심리학 관점에서의 Mind Helper 조언 (교육·자기보호만)"
  }
}
각 sections 항목은 1~4문장 분량으로, 해당 도메인만의 인사이트를 명확히 하세요. 키는 반드시 ${sectionKeys} 로만 구성하세요.`;

  const messages = [{ role: 'user', content: userQuery }];
  const provider = AI_CONFIG.provider;

  let rawResponse;
  if (provider === 'openai') {
    rawResponse = await callOpenAI(messages, systemPrompt);
  } else if (provider === 'groq') {
    rawResponse = await callGroq(messages, systemPrompt);
  } else if (provider === 'grok') {
    rawResponse = await callGrok(messages, systemPrompt);
  } else if (provider === 'upstage') {
    rawResponse = await callUpstage(messages, systemPrompt);
  } else if (provider === 'gemini') {
    rawResponse = await callGemini(userQuery, systemPrompt);
  } else {
    throw new Error(`지원하지 않는 AI 제공자: ${provider}. openai | groq | grok | upstage | gemini 중 하나를 사용하세요.`);
  }

  const parsed = parseStructuredPipelineResponse(rawResponse);
  if (parsed) {
    return {
      response: rawResponse,
      responseSummary: parsed.summary || '',
      responseSections: parsed.sections || {},
    };
  }
  return {
    response: rawResponse,
    responseSummary: '',
    responseSections: {},
  };
}

/**
 * AI 파이프라인 응답에서 JSON(summary, sections) 추출. 실패 시 null
 */
function parseStructuredPipelineResponse(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null;
  try {
    const obj = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
    if (obj && typeof obj === 'object') {
      const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
      const sections = obj.sections && typeof obj.sections === 'object' ? obj.sections : {};
      return { summary, sections };
    }
  } catch (_) {}
  return null;
}
