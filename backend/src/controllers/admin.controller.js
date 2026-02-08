/**
 * 관리자 컨트롤러
 */

import { db } from '../config/firebase-admin.js';

/**
 * 대시보드 통계 조회
 */
export async function getDashboardStats(req, res, next) {
  try {
    // 사용자 통계
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // 로그 통계
    const logsSnapshot = await db.collection('saju_logs').get();
    const totalLogs = logsSnapshot.size;

    // 피드백 통계
    const positiveFeedback = logsSnapshot.docs.filter(
      doc => doc.data().user_feedback === 'positive'
    ).length;
    const negativeFeedback = logsSnapshot.docs.filter(
      doc => doc.data().user_feedback === 'negative'
    ).length;

    // 트렌드 통계
    const trendsSnapshot = await db.collection('trends').get();
    const activeTrends = trendsSnapshot.docs.filter(
      doc => doc.data().is_active === true
    ).length;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
        },
        logs: {
          total: totalLogs,
          feedback: {
            positive: positiveFeedback,
            negative: negativeFeedback,
            satisfactionRate: totalLogs > 0 
              ? ((positiveFeedback / totalLogs) * 100).toFixed(2)
              : 0,
          },
        },
        trends: {
          total: trendsSnapshot.size,
          active: activeTrends,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}
