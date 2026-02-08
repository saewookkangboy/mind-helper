/**
 * Firestore 데이터 로깅 유틸리티
 * AI 상담 로그, 사용자 피드백 등을 저장 (db 없으면 무시)
 */

import { db } from '../config/firebase';

/**
 * AI 상담 로그 저장
 * @param {string} userId - 사용자 ID
 * @param {string} queryType - 질문 유형 ('love' | 'career' | 'today')
 * @param {string} inputType - 입력 유형 ('text' | 'voice')
 * @param {string} userQuery - 사용자 질문
 * @param {string} aiResponse - AI 응답
 * @param {string} userFeedback - 사용자 피드백 ('positive' | 'negative' | null)
 */
export async function logSajuConsultation({
  userId,
  queryType,
  inputType,
  userQuery,
  aiResponse,
  userFeedback = null,
}) {
  if (!db) return null;
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const logData = {
      user_id: userId,
      query_type: queryType,
      input_type: inputType,
      user_query: userQuery,
      ai_response: aiResponse,
      user_feedback: userFeedback,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'saju_logs'), logData);
    console.log('로그 저장 완료:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('로그 저장 실패:', error);
    throw error;
  }
}

/**
 * 사용자 피드백 업데이트
 * 백엔드 API를 통해 처리
 * @param {string} logId - 로그 ID
 * @param {string} feedback - 피드백 ('positive' | 'negative')
 * @param {string} comment - 선택적 코멘트
 */
export async function updateUserFeedback(logId, feedback, comment = null) {
  try {
    const { apiPost } = await import('./apiClient.js');
    const response = await apiPost('/feedback', {
      logId,
      feedback,
      comment,
    });
    
    if (response.success) {
      console.log('피드백 업데이트 완료');
      return response.data;
    }
    
    throw new Error(response.error?.message || '피드백 업데이트 실패');
  } catch (error) {
    console.error('피드백 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 트렌드 키워드 사용 로그
 * @param {string} keyword - 키워드
 * @param {string} category - 카테고리 ('meme' | 'slang')
 */
export async function logTrendUsage(keyword, category) {
  if (!db) return;
  try {
    const { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const trendRef = doc(db, 'trends', keyword);
    const trendSnap = await getDoc(trendRef);

    if (trendSnap.exists()) {
      await updateDoc(trendRef, {
        usage_count: increment(1),
        last_used: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'trends'), {
        keyword,
        category,
        usage_count: 1,
        is_active: false,
        created_at: serverTimestamp(),
        last_used: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('트렌드 로그 저장 실패:', error);
  }
}
