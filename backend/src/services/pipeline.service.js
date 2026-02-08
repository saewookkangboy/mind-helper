/**
 * 서비스 데이터 파이프라인
 * 사용자 입력 → 적용 도메인 결정 → 도메인 소스 수집 → AI 응답 → 구조화된 결과
 */

import { ALL_DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { loadDomainContexts } from './domainSources/index.js';
import { generatePipelineResponse } from './ai.service.js';
import { getTarotContextAndCards } from './tarot.service.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 파이프라인 실행: 질문 수신 → 도메인 소스 로드 → (타로 시 RoxyAPI 연동) → AI 결과 출력
 * @param {object} params
 * @param {string} params.userQuery - 사용자 질문
 * @param {string} [params.language='ko'] - 응답 언어 (ko|en|ja)
 * @param {string[]} [params.domainIds] - 적용할 도메인 ID. 미지정 시 전 도메인
 * @param {object} [params.userContext] - 도메인 소스 수집용 (birthDate, birthTime, timezone, mbti, userSaju)
 * @returns {Promise<{ response: string, responseSummary?: string, responseSections?: Record<string,string>, sourcesUsed: string[], tarotCards?: array, timestamp: string }>}
 */
export async function runPipeline({ userQuery, language = 'ko', domainIds, userContext = {} }) {
  const effectiveDomains = Array.isArray(domainIds) && domainIds.length > 0
    ? domainIds
    : ALL_DOMAIN_IDS;

  logger.info('파이프라인 시작', {
    domainCount: effectiveDomains.length,
    domains: effectiveDomains,
    userId: userContext.userId,
  });

  const { contexts, sourcesUsed } = await loadDomainContexts(effectiveDomains, {
    ...userContext,
    language,
  });

  let tarotCards = [];
  if (sourcesUsed.includes(DOMAIN_IDS.TAROT)) {
    try {
      const { contextText, tarotCards: drawn } = await getTarotContextAndCards(userQuery);
      if (contextText && contexts[DOMAIN_IDS.TAROT]) {
        contexts[DOMAIN_IDS.TAROT] = `${contexts[DOMAIN_IDS.TAROT]}\n\n${contextText}`;
      }
      if (Array.isArray(drawn) && drawn.length > 0) tarotCards = drawn;
    } catch (e) {
      logger.warn('타로 카드 연동 건너뜀', { error: e.message });
    }
  }

  const result = await generatePipelineResponse({
    userQuery,
    language,
    domainContexts: contexts,
    sourcesUsed,
    interests: userContext.interests,
  });

  const timestamp = new Date().toISOString();
  logger.info('파이프라인 완료', { sourcesUsed, timestamp });

  if (typeof result === 'object' && result !== null && 'response' in result) {
    return {
      response: result.response,
      responseSummary: result.responseSummary ?? '',
      responseSections: result.responseSections ?? {},
      sourcesUsed,
      tarotCards,
      timestamp,
    };
  }
  return {
    response: typeof result === 'string' ? result : '',
    responseSummary: '',
    responseSections: {},
    sourcesUsed,
    tarotCards,
    timestamp,
  };
}
