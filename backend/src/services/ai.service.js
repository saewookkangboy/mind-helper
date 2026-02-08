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
 * @param {object} [options] - { maxTokens, temperature } 파이프라인: 4096, temperature 0.82 권장
 */
async function callOpenAI(messages, systemPrompt, options = {}) {
  const { openai } = AI_CONFIG;
  const maxTokens = options.maxTokens ?? 1000;
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

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
      temperature,
      max_tokens: maxTokens,
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
 * @param {object} [options] - { maxTokens, temperature } 파이프라인: 4096, temperature 0.82 권장
 */
async function callGroq(messages, systemPrompt, options = {}) {
  const { groq } = AI_CONFIG;
  const maxTokens = options.maxTokens ?? 1000;
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

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
      temperature,
      max_tokens: maxTokens,
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
 * @param {object} [options] - { maxTokens, temperature } 파이프라인: 4096, temperature 0.82 권장
 */
async function callGrok(messages, systemPrompt, options = {}) {
  const { grok } = AI_CONFIG;
  const maxTokens = options.maxTokens ?? 1000;
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

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
      temperature,
      stream: false,
      max_tokens: maxTokens,
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
 * @param {object} [options] - { maxTokens, temperature } 파이프라인: 4096, temperature 0.82 권장
 */
async function callUpstage(messages, systemPrompt, options = {}) {
  const { upstage } = AI_CONFIG;
  const maxTokens = options.maxTokens ?? 1000;
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

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
      temperature,
      stream: false,
      max_tokens: maxTokens,
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
 * @param {object} [options] - { maxTokens, temperature } 파이프라인: 4096, temperature 0.82 권장
 */
async function callGemini(prompt, systemInstruction, options = {}) {
  const { gemini } = AI_CONFIG;
  const maxTokens = options.maxTokens ?? 1000;
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.7;

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
          temperature,
          maxOutputTokens: maxTokens,
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

/** 파이프라인 구조화 응답용 섹션 키 (6개 도메인 + 앞으로 나아갈 길) */
const PIPELINE_SECTION_IDS = ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology', 'path'];

/** 파이프라인 응답은 summary + 7개 섹션 각 4줄 이상이므로 토큰 여유 확보 */
const PIPELINE_MAX_TOKENS = 4096;

/**
 * 파이프라인 전용: 도메인 소스 기반 AI 응답 생성
 * Orchestrator 관점: 종합 인사이트(현실적 진단·조언) + 섹션별 조언 + 앞으로 나아갈 길(구체적 실행안)
 */
export async function generatePipelineResponse({
  userQuery,
  language = 'ko',
  domainContexts = {},
  sourcesUsed = [],
  interests,
  mbti,
}) {
  const languageMap = { ko: '한국어', en: 'English', ja: '日本語' };
  const lang = languageMap[language] || '한국어';

  const sectionOrder = ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology'];
  const sourceBlocks = sectionOrder
    .filter((id) => domainContexts[id])
    .map((id) => `[${id}]\n${domainContexts[id]}`)
    .join('\n\n');

  const audienceHint = [interests && (Array.isArray(interests) ? interests.join(', ') : String(interests).trim()), mbti && String(mbti).trim()].filter(Boolean).join(' · ');
  const audienceLine = audienceHint ? `\n[맞춤 맥락] 관심사·MBTI 등: ${audienceHint}. 이 맥락을 반영해 톤·비유·예시를 구체화하세요.\n` : '';

  const systemPrompt = `당신은 **오케스트레이터이자 Dev Agent**입니다. 6개 도메인(사주·심리·MBTI·타로·버크만·다크 심리학)의 소스를 각각 해당 섹션에만 반영하고, 사용자 질문에 맞춰 **섬세하고 창의적인** 섹션별 조언을 만든 뒤, 종합 인사이트(summary)와 앞으로 나아갈 길(path)을 한 편의 글로 도출합니다.
${audienceLine}

【창의성·섬세함 (Dev Agent 역할)】
- 각 섹션을 **해당 분야 전문가**처럼 씁시다: 사주는 만세력 해석가, 심리는 상담사, MBTI는 성격 해석가, 타로는 직관 리더, 버크만은 행동 코치, 다크 심리는 자기보호 교육자.
- **금지**: 뻔한 클리셰("잘 될 거예요", "마음을 열어보세요"만 반복), 일반론만 나열, 섹션마다 비슷한 문장 구조·표현 반복.
- **권장**: 질문에 담긴 **상황·감정·갈등**을 읽고, 그에 맞는 **구체적 비유·예시·한두 가지 행동 제안**을 넣기. 관심사·MBTI가 있으면 그에 맞는 톤과 예시로 맞춤화.
- **종합 인사이트(summary)**와 **앞으로 나아갈 길(path)**은 6개 섹션을 짜맞춘 **한 편의 글이 되도록** 자연스럽게 연결하고, 사용자가 "내 이야기"라고 느낄 수 있는 문장을 포함하세요.

【필수·최우선 규칙】summary와 sections의 "모든" 항목(saju, psychology, mbti, tarot, birkman, dark_psychology, path)은 각각 "반드시 4문장 이상"으로 작성해야 합니다. 1~3문장만 쓰면 규칙 위반입니다. 문장은 마침표(.)·느낌표(!)·물음표(?)로 끝나는 단위이며, 각 JSON 문자열 값에는 그런 문장이 최소 4개 이상 들어가야 합니다.

【섹션별 소스 매핑 (반드시 준수)】
- **saju**: 아래 [saju] 블록만 참고. 사주·오행·해석을 질문에 맞게 **구체적 비유나 시즌·에너지 표현**을 살려 4문장 이상.
- **psychology**: [psychology] 블록만 참고. 인지·정서·행동을 질문 상황에 **맞춘 구체적 예시**로 4문장 이상.
- **mbti**: [mbti] 블록만 참고. 유형별 강점·주의점을 질문에 **연결한 인사이트**로 4문장 이상.
- **tarot**: [tarot] 블록만 참고. 블록에 "이번 분석에서 참고한 타로 카드"가 있으면 **과거·현재·미래 3장을 각각 카드 이름과 위치를 명시**하며, 역방향이면 역방향 의미를 반영하고, **사용자 질문과 어떻게 연관되는지 구체적으로 상세 해석**할 것. 카드별로 1~2문장 이상 + 질문과의 연계를 포함해 전체 4문장 이상.
- **birkman**: [birkman] 블록만 참고. 행동·욕구·스트레스 반응을 **일상 장면**에 비춰 4문장 이상.
- **dark_psychology**: [dark_psychology] 블록만 참고. 교육·자기보호 관점으로 **구체적 경계·선택 예시**를 넣어 4문장 이상.
- **path**: 위 6개를 종합해, **질문에 딱 맞는** 우선순위·단계·일상 실천을 **한두 가지 구체적 행동**까지 담아 4문장 이상.

아래는 도메인별 측정 소스입니다. 각 블록은 해당 이름의 섹션에서만 사용하세요. 어떤 도메인 블록이 없으면, 그 섹션은 해당 도메인 관점의 **창의적 일반 조언**을 4문장 이상으로 작성하세요.
${sourceBlocks ? `\n=== 도메인별 소스 (섹션과 1:1 대응) ===\n${sourceBlocks}` : '\n(제공된 소스 없음. 각 섹션은 해당 도메인 관점의 창의적 조언을 4문장 이상으로 작성하세요.)'}

기타 규칙:
1. 반드시 ${lang}로 답변하세요.
2. **summary**: 6개 섹션 + path를 요약한 "종합 인사이트" 4문장 이상. 사용자 질문에 대한 **핵심 결론·감정 인정·지금 무엇을 우선할지**를 한 문장씩 담아, 읽는 이가 공감할 수 있게.

**출력 형식 (반드시 준수)**: 아래 JSON만 출력하고, 그 외 설명·마크다운 없이 한 덩어리로 출력하세요. 각 문자열 값은 반드시 4문장 이상이어야 합니다.
{
  "summary": "종합 인사이트(4문장 이상). 질문에 대한 핵심 결론·감정 인정·우선할 일을 공감 가능하게.",
  "sections": {
    "saju": "사주 관점 조언(4문장 이상). [saju] 소스만 사용. 구체적 비유·에너지 표현.",
    "psychology": "심리상담 관점 조언(4문장 이상). [psychology] 소스만 사용. 상황 맞춤 예시.",
    "mbti": "MBTI 관점 조언(4문장 이상). [mbti] 소스만 사용. 유형과 질문 연결.",
    "tarot": "타로 관점 조언(4문장 이상). [tarot]의 3장(과거·현재·미래)을 각각 카드명·위치를 밝히며 상세 해석하고, 질문과 연계. 역방향 반영.",
    "birkman": "버크만 관점 조언(4문장 이상). [birkman] 소스만 사용. 일상 장면.",
    "dark_psychology": "다크 심리학(교육·자기보호) 관점 조언(4문장 이상). [dark_psychology] 소스만 사용. 경계·선택 예시.",
    "path": "앞으로 나아갈 길(4문장 이상). 6개 섹션 종합, 구체적 행동 1~2개 포함."
  }
}
최종 확인: summary, saju, psychology, mbti, tarot, birkman, dark_psychology, path 각각 문장 4개 이상 포함했는지 검증 후 출력하세요.`;

  const pipelineUserMessage = `【필수】summary와 sections의 모든 항목은 각각 4문장 이상으로, 질문에 담긴 상황·감정을 읽어 **창의적·맞춤형**으로 작성해 주세요.\n\n${userQuery}`;
  const messages = [{ role: 'user', content: pipelineUserMessage }];
  const provider = AI_CONFIG.provider;
  const pipelineOptions = { maxTokens: PIPELINE_MAX_TOKENS, temperature: 0.82 };

  let rawResponse;
  if (provider === 'openai') {
    rawResponse = await callOpenAI(messages, systemPrompt, pipelineOptions);
  } else if (provider === 'groq') {
    rawResponse = await callGroq(messages, systemPrompt, pipelineOptions);
  } else if (provider === 'grok') {
    rawResponse = await callGrok(messages, systemPrompt, pipelineOptions);
  } else if (provider === 'upstage') {
    rawResponse = await callUpstage(messages, systemPrompt, pipelineOptions);
  } else if (provider === 'gemini') {
    rawResponse = await callGemini(userQuery, systemPrompt, pipelineOptions);
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

/** 문장 개수 세기 (마침표·느낌표·물음표·한글 구두점 기준) */
function countSentences(text) {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/(?<=[.!?。？！])\s*/).filter((s) => s.trim().length > 0);
  return parts.length;
}

/** 4문장 미만이면 보강 문장을 붙여 최소 4문장으로 맞춤 */
const FALLBACK_SENTENCES = [
  '위 내용을 바탕으로 오늘부터 작은 실천을 시작해 보시길 권합니다.',
  '단계적으로 적용해 보시면 변화를 느끼실 수 있습니다.',
  '궁금한 점이 있으면 하단 챗봇으로 편하게 질문해 주세요.',
];
function ensureMinimumFourSentences(text) {
  if (!text || typeof text !== 'string') return text;
  const t = text.trim();
  if (!t) return t;
  const n = countSentences(t);
  if (n >= 4) return t;
  let out = t;
  let idx = 0;
  while (countSentences(out) < 4 && idx < 5) {
    const extra = FALLBACK_SENTENCES[idx % FALLBACK_SENTENCES.length];
    out = out.endsWith('.') || out.endsWith('!') || out.endsWith('?') || out.endsWith('。') || out.endsWith('！') || out.endsWith('？')
      ? `${out} ${extra}`
      : `${out}. ${extra}`;
    idx += 1;
  }
  return out;
}

/**
 * AI 파이프라인 응답에서 JSON(summary, sections) 추출. 실패 시 null
 * summary·sections 각 값은 4문장 미만이면 서버에서 보강해 최소 4문장으로 맞춤
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
      let summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
      const sections = obj.sections && typeof obj.sections === 'object' ? obj.sections : {};
      summary = ensureMinimumFourSentences(summary);
      const sectionIds = ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology', 'path'];
      for (const id of sectionIds) {
        if (typeof sections[id] === 'string') {
          sections[id] = ensureMinimumFourSentences(sections[id].trim());
        }
      }
      return { summary, sections };
    }
  } catch (_) {}
  return null;
}
