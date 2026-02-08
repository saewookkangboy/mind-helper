/**
 * 피드백 컨트롤러
 */

import { db } from '../config/firebase-admin.js';
import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { FeedbackTypes } from '../../../shared/src/types/index.js';

/**
 * 피드백 생성
 */
export async function createFeedback(req, res, next) {
  try {
    const { logId, feedback } = req.body;

    // 입력 검증
    if (!logId || !feedback) {
      throw new AppError(
        'logId and feedback are required',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!Object.values(FeedbackTypes).includes(feedback)) {
      throw new AppError(
        `Invalid feedback. Must be one of: ${Object.values(FeedbackTypes).join(', ')}`,
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Firestore에 피드백 업데이트
    const logRef = db.collection('saju_logs').doc(logId);
    await logRef.update({
      user_feedback: feedback,
      feedback_updated_at: new Date(),
    });

    res.json({
      success: true,
      data: {
        logId,
        feedback,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}
