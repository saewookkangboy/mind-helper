/**
 * AI 서비스
 * 백엔드에서 AI API를 호출하는 서비스
 */

import { getLanguageEmbedding, LANGUAGE_LABELS, normalizeLanguageCode } from './languageEmbedding.js';

const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
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
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
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
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API 호출 실패');
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
    throw new Error('Gemini API 키가 설정되지 않았습니다');
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
    } else if (provider === 'gemini') {
      response = await callGemini(userQuery, systemPrompt);
    } else {
      throw new Error(`지원하지 않는 AI 제공자: ${provider}`);
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

/**
 * 파이프라인 전용: 도메인 소스 기반 AI 응답 생성
 * 6대 도메인(사주, 심리상담, MBTI, 타로, 버크만, 다크 심리학) 컨텍스트를 반영한 답변
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

  const systemPrompt = `당신은 사주(만세력), 심리상담, MBTI, 타로, 버크만 진단, 다크 심리학을 통합해 상담하는 전문 코치입니다.
아래 "측정 소스"는 사용자에게 적용된 도메인별 참조 데이터입니다. 질문에 맞게 이 소스만 활용해 해석하고 조언하세요. 없는 소스는 만들지 마세요.

${sourceBlocks ? `\n=== 측정 소스 (활용할 참조 데이터) ===\n${sourceBlocks}` : '\n(제공된 소스 없음. 일반적인 코칭 톤으로 답변하세요.)'}

답변 규칙:
1. 반드시 ${lang}로 답변하세요.
2. 활용한 소스가 있으면 그에 기반해 구체적으로 서술하세요.
3. 현대적·친근한 말투, 구체적 행동 제안을 포함하세요.
4. 다크 심리학은 교육·자기보호 관점으로만 서술하세요.`;

  const messages = [{ role: 'user', content: userQuery }];
  const provider = AI_CONFIG.provider;

  let response;
  if (provider === 'openai') {
    response = await callOpenAI(messages, systemPrompt);
  } else if (provider === 'gemini') {
    response = await callGemini(userQuery, systemPrompt);
  } else {
    throw new Error(`지원하지 않는 AI 제공자: ${provider}`);
  }

  return response;
}
