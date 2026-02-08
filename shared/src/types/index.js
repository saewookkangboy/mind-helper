/**
 * 공유 타입 정의
 */

export const QueryTypes = {
  TODAY: 'today',
  CAREER: 'career',
  LOVE: 'love',
};

export const FeedbackTypes = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
};

export const InputTypes = {
  TEXT: 'text',
  VOICE: 'voice',
};

export const Languages = {
  KO: 'ko',
  EN: 'en',
  JA: 'ja',
};

export const TrendCategories = {
  MEME: 'meme',
  SLANG: 'slang',
  GENERAL: 'general',
};

/** 파이프라인: 사용자 요청 시 적용할 도메인(측정 소스) */
export const DomainIds = {
  SAJU: 'saju',
  PSYCHOLOGY: 'psychology',
  MBTI: 'mbti',
  TAROT: 'tarot',
  BIRKMAN: 'birkman',
  DARK_PSYCHOLOGY: 'dark_psychology',
};
