/**
 * 사주 계산 유틸리티
 * 만세력 계산을 위한 기본 로직
 */

// 천간 (天干)
const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (地支)
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 오행 (五行)
const OHENG = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토', 기: '토',
  경: '금', 신: '금', 임: '수', 계: '수',
  자: '수', 축: '토', 인: '목', 묘: '목', 진: '토', 사: '화',
  오: '화', 미: '토', 신: '금', 유: '금', 술: '토', 해: '수',
};

/**
 * 생년월일시를 만세력으로 변환
 * @param {Date} birthDate - 생년월일
 * @param {string} birthTime - 생시 (HH:MM 형식)
 * @returns {Object} 만세력 정보
 */
export function calculateSaju(birthDate, birthTime) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 시간 파싱
  const [hour, minute] = birthTime.split(':').map(Number);
  
  // 간지 계산 (간단한 버전 - 실제로는 더 복잡한 계산 필요)
  const yearGan = CHEONGAN[(year - 4) % 10];
  const yearJi = JIJI[(year - 4) % 12];
  
  const monthGan = CHEONGAN[((year - 4) % 10 * 2 + month) % 10];
  const monthJi = JIJI[(month + 1) % 12];
  
  // 일간 계산 (간단한 버전)
  const baseDate = new Date(1900, 0, 1);
  const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
  const dayGan = CHEONGAN[(daysDiff + 6) % 10];
  const dayJi = JIJI[(daysDiff + 8) % 12];
  
  // 시주 계산
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourGan = CHEONGAN[((daysDiff + 6) % 10 * 2 + hourIndex) % 10];
  const hourJi = JIJI[hourIndex];
  
  return {
    year: { gan: yearGan, ji: yearJi },
    month: { gan: monthGan, ji: monthJi },
    day: { gan: dayGan, ji: dayJi },
    hour: { gan: hourGan, ji: hourJi },
    oheng: {
      year: OHENG[yearGan],
      month: OHENG[monthGan],
      day: OHENG[dayGan],
      hour: OHENG[hourGan],
    },
  };
}

/**
 * 오행 분석
 * @param {Object} saju - 만세력 정보
 * @returns {Object} 오행 분석 결과
 */
export function analyzeOheng(saju) {
  const ohengCount = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };
  
  Object.values(saju.oheng).forEach((oheng) => {
    if (ohengCount[oheng] !== undefined) {
      ohengCount[oheng]++;
    }
  });
  
  // 일간 오행 찾기
  const dayOheng = saju.oheng.day;
  
  return {
    dayOheng,
    distribution: ohengCount,
    balance: calculateBalance(ohengCount),
  };
}

/**
 * 오행 균형 계산
 */
function calculateBalance(ohengCount) {
  const values = Object.values(ohengCount);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const balance = max - min;
  
  if (balance <= 1) return '균형';
  if (balance <= 2) return '약간 불균형';
  return '불균형';
}

/**
 * 사주 해석 생성 (기본 버전)
 */
export function interpretSaju(saju, ohengAnalysis) {
  const interpretations = [];
  
  // 일간 오행에 따른 기본 성향
  const dayOhengTraits = {
    목: '성장과 발전을 추구하는 성향이 강합니다.',
    화: '열정적이고 활동적인 성향이 있습니다.',
    토: '안정적이고 신중한 성향이 강합니다.',
    금: '논리적이고 체계적인 사고를 선호합니다.',
    수: '유연하고 적응력이 뛰어납니다.',
  };
  
  interpretations.push(dayOhengTraits[ohengAnalysis.dayOheng] || '');
  
  // 오행 균형에 따른 조언
  if (ohengAnalysis.balance === '불균형') {
    interpretations.push('오행이 불균형하므로, 부족한 오행을 보완하는 것이 도움이 될 수 있습니다.');
  }
  
  return interpretations.join(' ');
}
