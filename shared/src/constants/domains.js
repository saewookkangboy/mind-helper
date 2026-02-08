/**
 * 서비스 전역 도메인(측정 소스) 상수
 * AI 챗봇 결과 출력 시 참조하는 6대 소스
 */

export const DOMAIN_IDS = {
  SAJU: 'saju',           // 사주(만세력)
  PSYCHOLOGY: 'psychology', // 심리상담
  MBTI: 'mbti',
  TAROT: 'tarot',
  BIRKMAN: 'birkman',    // 버크만 진단
  DARK_PSYCHOLOGY: 'dark_psychology', // 다크 심리학
};

export const DOMAIN_SOURCES = [
  {
    id: DOMAIN_IDS.SAJU,
    nameKo: '사주(만세력)',
    nameEn: 'Four Pillars (Manseryeok)',
    description: '생년월일시 기반 일간·오행·십성 해석',
  },
  {
    id: DOMAIN_IDS.PSYCHOLOGY,
    nameKo: '심리상담',
    nameEn: 'Psychological Counseling',
    description: '인지·정서·행동 기반 상담 프레임',
  },
  {
    id: DOMAIN_IDS.MBTI,
    nameKo: 'MBTI',
    nameEn: 'MBTI',
    description: '성격 유형(E/I, S/N, T/F, J/P) 기반 인사이트',
  },
  {
    id: DOMAIN_IDS.TAROT,
    nameKo: '타로',
    nameEn: 'Tarot',
    description: '카드 상징과 스프레드 기반 직관 해석',
  },
  {
    id: DOMAIN_IDS.BIRKMAN,
    nameKo: '버크만 진단',
    nameEn: 'Birkman Assessment',
    description: '행동 스타일·욕구·스트레스 반응',
  },
  {
    id: DOMAIN_IDS.DARK_PSYCHOLOGY,
    nameKo: '다크 심리학',
    nameEn: 'Dark Psychology',
    description: '다크 트라이어드·조작·방어 인지',
  },
];

export const ALL_DOMAIN_IDS = Object.values(DOMAIN_IDS);
