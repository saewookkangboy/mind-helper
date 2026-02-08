/**
 * 사주 API 컨트롤러 - 만세력 기반 사주 계산
 */

import { calculateSajuWithManseryeok } from '../services/saju.service.js';
import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 만세력으로 사주 계산 (KST 기준, 양력/음력·만자시 정교화)
 * POST body: { birthDate: 'YYYY-MM-DD', birthTime: 'HH:MM', timezone?: 'Asia/Seoul'|'UTC'|... }
 * timezone 미지정 시 입력 일시를 KST(Asia/Seoul)로 해석합니다.
 */
export async function calculateSaju(req, res, next) {
  try {
    const { birthDate, birthTime, timezone } = req.body;
    const tz = timezone && typeof timezone === 'string' ? timezone.trim() : 'Asia/Seoul';

    if (!birthDate || !birthTime) {
      throw new AppError(
        'birthDate and birthTime are required (YYYY-MM-DD, HH:MM)',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const result = await calculateSajuWithManseryeok(birthDate, birthTime, tz);

    if (result.error) {
      throw new AppError(result.error, 400, ErrorCodes.VALIDATION_ERROR);
    }

    logger.info('만세력 사주 계산 완료', { birthDate, birthTime });

    res.json({
      success: true,
      data: {
        saju: result,
        birthDate,
        birthTime,
        timezone: tz,
        kstBirth: result.kstBirth,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.error('사주 계산 실패', { error: error.message });
    next(error);
  }
}
