/**
 * 자가 발전 서비스
 * 사용자 피드백을 기반으로 AI 프롬프트 자동 튜닝
 */

import { db } from '../config/firebase-admin.js';

/**
 * 피드백 분석 및 패턴 추출
 */
export async function analyzeFeedback() {
  try {
    const logsRef = db.collection('saju_logs');
    
    // 긍정 피드백 로그
    const positiveSnapshot = await logsRef
      .where('user_feedback', '==', 'positive')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    // 부정 피드백 로그
    const negativeSnapshot = await logsRef
      .where('user_feedback', '==', 'negative')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const positiveLogs = positiveSnapshot.docs.map(doc => doc.data());
    const negativeLogs = negativeSnapshot.docs.map(doc => doc.data());

    // 패턴 분석
    const patterns = {
      positive: extractPatterns(positiveLogs),
      negative: extractPatterns(negativeLogs),
    };

    // 프롬프트 튜닝 권장사항 생성
    const recommendations = generateRecommendations(patterns);

    // 분석 결과를 Firestore에 저장
    await saveAnalysisResults(patterns, recommendations);

    return { patterns, recommendations };
  } catch (error) {
    console.error('피드백 분석 실패:', error);
    throw error;
  }
}

/**
 * 로그에서 패턴 추출
 */
function extractPatterns(logs) {
  const patterns = {
    commonWords: {},
    responseLength: [],
    queryTypes: {},
    avgResponseTime: 0,
  };

  logs.forEach(log => {
    // 응답 길이
    if (log.ai_response) {
      patterns.responseLength.push(log.ai_response.length);
    }

    // 질문 유형 분포
    if (log.query_type) {
      patterns.queryTypes[log.query_type] = (patterns.queryTypes[log.query_type] || 0) + 1;
    }

    // 공통 단어 추출 (간단한 버전)
    if (log.ai_response) {
      const words = log.ai_response.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          patterns.commonWords[word] = (patterns.commonWords[word] || 0) + 1;
        }
      });
    }
  });

  // 평균 응답 길이
  if (patterns.responseLength.length > 0) {
    patterns.avgResponseLength = Math.round(
      patterns.responseLength.reduce((a, b) => a + b, 0) / patterns.responseLength.length
    );
  }

  // 상위 10개 단어
  patterns.topWords = Object.entries(patterns.commonWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return patterns;
}

/**
 * 권장사항 생성
 */
function generateRecommendations(patterns) {
  const recommendations = {
    useMore: [],
    avoidUsing: [],
    adjustTone: 'neutral',
    targetLength: 500,
  };

  // 긍정 피드백에서 자주 사용된 단어
  const positiveTopWords = patterns.positive.topWords || [];
  recommendations.useMore = positiveTopWords.slice(0, 5).map(w => w.word);

  // 부정 피드백에서 자주 사용된 단어는 피하기
  const negativeTopWords = patterns.negative.topWords || [];
  recommendations.avoidUsing = negativeTopWords.slice(0, 5).map(w => w.word);

  // 응답 길이 조정
  if (patterns.positive.avgResponseLength) {
    recommendations.targetLength = patterns.positive.avgResponseLength;
  }

  return recommendations;
}

/**
 * 분석 결과 저장
 */
async function saveAnalysisResults(patterns, recommendations) {
  try {
    const analysisRef = db.collection('ai_analysis').doc('latest');
    await analysisRef.set({
      patterns,
      recommendations,
      analyzedAt: new Date(),
      positiveCount: patterns.positive.topWords?.length || 0,
      negativeCount: patterns.negative.topWords?.length || 0,
    });

    console.log('분석 결과 저장 완료');
  } catch (error) {
    console.error('분석 결과 저장 실패:', error);
  }
}

/**
 * 프롬프트 가중치 업데이트
 */
export async function updatePromptWeights(recommendations) {
  try {
    const configRef = db.collection('ai_config').doc('prompt_weights');
    const currentWeights = (await configRef.get()).data() || {};

    // 권장사항을 기반으로 가중치 조정
    const updatedWeights = {
      ...currentWeights,
      preferredWords: recommendations.useMore,
      avoidedWords: recommendations.avoidUsing,
      targetResponseLength: recommendations.targetLength,
      lastUpdated: new Date(),
    };

    await configRef.set(updatedWeights);
    console.log('프롬프트 가중치 업데이트 완료');
  } catch (error) {
    console.error('프롬프트 가중치 업데이트 실패:', error);
  }
}

/**
 * 주기적으로 자가 발전 실행
 */
export async function runSelfEvolution() {
  console.log('자가 발전 알고리즘 실행 시작...');

  try {
    const { patterns, recommendations } = await analyzeFeedback();
    await updatePromptWeights(recommendations);

    console.log('자가 발전 알고리즘 실행 완료');
    return { success: true, patterns, recommendations };
  } catch (error) {
    console.error('자가 발전 알고리즘 실행 실패:', error);
    return { success: false, error: error.message };
  }
}
