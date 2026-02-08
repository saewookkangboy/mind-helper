/**
 * 서비스 데이터 파이프라인 (Orchestrator 중심)
 * 입력 → 도메인 소스 수집 → 섹션별 맥락 보강 → AI 오케스트레이터 호출 → 구조화된 6개 섹션 + 종합 출력
 */

import { ALL_DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { loadDomainContexts } from './domainSources/index.js';
import { generatePipelineResponse } from './ai.service.js';
import { getTarotContextAndCards } from './tarot.service.js';
import { logger } from '../../../shared/src/utils/logger.js';

/** Orchestrator 단계: 각 도메인 컨텍스트에 사용자 질문을 붙여, 섹션별 답변이 질문에 맞게 나오도록 함 */
function enrichContextsWithQuery(contexts, userQuery) {
  if (!userQuery || typeof userQuery !== 'string') return contexts;
  const trimmed = userQuery.trim();
  if (!trimmed) return contexts;
  const enriched = {};
  for (const [id, text] of Object.entries(contexts)) {
    enriched[id] = `${text}\n\n[사용자 질문]\n${trimmed}`;
  }
  return enriched;
}

/**
 * 파이프라인 실행: 질문 수신 → 도메인 소스 로드 → 맥락 보강 → AI 오케스트레이터 → 결과 출력
 * @param {object} params
 * @param {string} params.userQuery - 사용자 질문
 * @param {string} [params.language='ko'] - 응답 언어 (ko|en|ja)
 * @param {string[]} [params.domainIds] - 적용할 도메인 ID. 미지정 시 전 도메인
 * @param {object} [params.userContext] - 도메인 소스 수집용 (birthDate, birthTime, timezone, mbti, userSaju, interests)
 * @returns {Promise<{ response: string, responseSummary?: string, responseSections?: Record<string,string>, sourcesUsed: string[], tarotCards?: array, timestamp: string }>}
 */
export async function runPipeline({ userQuery, language = 'ko', domainIds, userContext = {} }) {
  const effectiveDomains = Array.isArray(domainIds) && domainIds.length > 0
    ? domainIds
    : ALL_DOMAIN_IDS;

  logger.info('파이프라인 시작(Orchestrator)', {
    domainCount: effectiveDomains.length,
    domains: effectiveDomains,
    userId: userContext.userId,
  });

  const { contexts, sourcesUsed } = await loadDomainContexts(effectiveDomains, {
    ...userContext,
    language,
  });

  const enrichedContexts = enrichContextsWithQuery(contexts, userQuery);

  let tarotCards = [];
  if (sourcesUsed.includes(DOMAIN_IDS.TAROT)) {
    try {
      const { contextText, tarotCards: drawn } = await getTarotContextAndCards(userQuery);
      if (contextText && enrichedContexts[DOMAIN_IDS.TAROT]) {
        enrichedContexts[DOMAIN_IDS.TAROT] = `${enrichedContexts[DOMAIN_IDS.TAROT]}\n\n${contextText}`;
      }
      if (Array.isArray(drawn) && drawn.length > 0) tarotCards = drawn;
    } catch (e) {
      logger.warn('타로 카드 연동 건너뜀', { error: e.message });
    }
  }

  const result = await generatePipelineResponse({
    userQuery,
    language,
    domainContexts: enrichedContexts,
    sourcesUsed,
    interests: userContext.interests,
  });

  const timestamp = new Date().toISOString();

  if (typeof result === 'object' && result !== null && 'response' in result) {
    const sections = result.responseSections ?? {};
    for (const id of sourcesUsed) {
      const sectionText = sections[id];
      if (!sectionText || (typeof sectionText === 'string' && sectionText.trim().length < 10)) {
        logger.warn('파이프라인 섹션 결과 부족', { sectionId: id, hasContext: true });
      }
    }
    logger.info('파이프라인 완료(Orchestrator)', { sourcesUsed, timestamp });
    return {
      response: result.response,
      responseSummary: result.responseSummary ?? '',
      responseSections: sections,
      sourcesUsed,
      tarotCards,
      timestamp,
    };
  }
  logger.info('파이프라인 완료(Orchestrator, 비구조화)', { sourcesUsed, timestamp });
  return {
    response: typeof result === 'string' ? result : '',
    responseSummary: '',
    responseSections: {},
    sourcesUsed,
    tarotCards,
    timestamp,
  };
}
