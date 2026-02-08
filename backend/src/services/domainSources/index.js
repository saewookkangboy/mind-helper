/**
 * 도메인별 소스 로더
 * 6대 도메인(사주, 심리상담, MBTI, 타로, 버크만, 다크 심리학)의 결과 출력용 데이터 수집
 */

import { DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { calculateSajuWithManseryeok } from '../saju.service.js';
import { PSYCHOLOGY_GUIDELINES } from './sources/psychologyGuidelines.js';
import { TAROT_MAJOR_MEANINGS } from './sources/tarotReference.js';
import { BIRKMAN_DIMENSIONS } from './sources/birkmanReference.js';
import { DARK_PSYCHOLOGY_GUIDELINES } from './sources/darkPsychologyGuidelines.js';
import { logger } from '../../../shared/src/utils/logger.js';

const LANG_KEYS = ['ko', 'en', 'ja'];

/**
 * 사용자 문맥에서 적용 가능한 도메인별 소스 텍스트 수집
 * @param {string[]} domainIds - 적용할 도메인 ID (DOMAIN_IDS 값)
 * @param {object} userContext - { birthDate, birthTime, timezone, mbti, language, userSaju(선택) }
 * @returns {Promise<{ contexts: Record<string, string>, sourcesUsed: string[] }>}
 */
export async function loadDomainContexts(domainIds, userContext = {}) {
  const language = LANG_KEYS.includes(userContext.language) ? userContext.language : 'ko';
  const contexts = {};
  const sourcesUsed = [];

  for (const id of domainIds) {
    try {
      if (id === DOMAIN_IDS.SAJU) {
        const sajuContext = await loadSajuContext(userContext);
        if (sajuContext) {
          contexts[id] = sajuContext;
          sourcesUsed.push(id);
        }
      } else if (id === DOMAIN_IDS.PSYCHOLOGY) {
        contexts[id] = PSYCHOLOGY_GUIDELINES[language] || PSYCHOLOGY_GUIDELINES.ko;
        sourcesUsed.push(id);
      } else if (id === DOMAIN_IDS.MBTI) {
        const mbtiContext = loadMbtiContext(userContext);
        if (mbtiContext) {
          contexts[id] = mbtiContext;
          sourcesUsed.push(id);
        }
      } else if (id === DOMAIN_IDS.TAROT) {
        const list = TAROT_MAJOR_MEANINGS[language] || TAROT_MAJOR_MEANINGS.ko;
        contexts[id] = `[타로 메이저 아르카나 참조]\n${list.join('\n')}`;
        sourcesUsed.push(id);
      } else if (id === DOMAIN_IDS.BIRKMAN) {
        contexts[id] = BIRKMAN_DIMENSIONS[language] || BIRKMAN_DIMENSIONS.ko;
        sourcesUsed.push(id);
      } else if (id === DOMAIN_IDS.DARK_PSYCHOLOGY) {
        contexts[id] = DARK_PSYCHOLOGY_GUIDELINES[language] || DARK_PSYCHOLOGY_GUIDELINES.ko;
        sourcesUsed.push(id);
      }
    } catch (err) {
      logger.warn('도메인 소스 로드 실패', { domainId: id, error: err.message });
    }
  }

  return { contexts, sourcesUsed };
}

async function loadSajuContext(userContext) {
  const { userSaju, birthDate, birthTime, timezone } = userContext;
  if (userSaju?.interpretation) {
    const oheng = userSaju.ohengAnalysis;
    return [
      '[사주(만세력) 소스]',
      `일간 오행: ${oheng?.dayOheng ?? '-'}`,
      `오행 분포: ${oheng?.distribution ? JSON.stringify(oheng.distribution) : '-'}`,
      `기본 해석: ${userSaju.interpretation}`,
    ].join('\n');
  }
  if (birthDate && birthTime) {
    const result = await calculateSajuWithManseryeok(birthDate, birthTime, timezone || 'Asia/Seoul');
    if (result.error) return null;
    const oheng = result.ohengAnalysis;
    return [
      '[사주(만세력) 소스]',
      `일간 오행: ${oheng?.dayOheng ?? '-'}`,
      `오행 분포: ${oheng?.distribution ? JSON.stringify(oheng.distribution) : '-'}`,
      `기본 해석: ${result.interpretation || '-'}`,
    ].join('\n');
  }
  return null;
}

function loadMbtiContext(userContext) {
  const mbti = userContext.mbti?.toUpperCase?.()?.replace(/\s/g, '');
  if (!mbti || mbti.length !== 4) return null;
  const desc = getMbtiShortDesc(mbti);
  return `[MBTI 소스]\n사용자 유형: ${mbti}\n${desc}`;
}

function getMbtiShortDesc(type) {
  const map = {
    INTJ: '전략가·체계·독립적 목표 지향',
    INTP: '분석·논리·아이디어 탐구',
    ENTJ: '리더·결단·효율 추구',
    ENTP: '도전·논쟁·새로운 가능성',
    INFJ: '비전·공감·깊은 통찰',
    INFP: '가치·이상·창의적 표현',
    ENFJ: '영감·조화·타인 성장 돕기',
    ENFP: '열정·가능성·자유로운 탐험',
    ISTJ: '책임·질서·사실 기반',
    ISFJ: '보호·배려·안정 제공',
    ESTJ: '조직·규칙·실행력',
    ESFJ: '협력·배려·공동체',
    ISTP: '분석·실용·현장 대응',
    ISFP: '감성·유연·현재 경험',
    ESTP: '행동·현실·즉각 대응',
    ESFP: '열정·사교·즐거움 나눔',
  };
  return map[type] || '성격 유형 기반 인사이트 참고';
}
