/**
 * 코칭 컨트롤러
 */

import { generateCoachingResponse } from '../services/ai.service.js';
import { normalizeLanguageCode } from '../services/languageEmbedding.js';
import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { QueryTypes } from '../../../shared/src/types/index.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 코칭 응답 생성
 */
export async function createCoaching(req, res, next) {
  try {
    const { userQuery, queryType, userSaju, language, mbti, interests } = req.body;
    
    logger.info('코칭 요청 수신', {
      queryType,
      language,
      userId: req.user?.uid,
    });

    // 입력 검증
    if (!userQuery || !queryType) {
      throw new AppError(
        'userQuery and queryType are required',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!Object.values(QueryTypes).includes(queryType)) {
      throw new AppError(
        `Invalid queryType. Must be one of: ${Object.values(QueryTypes).join(', ')}`,
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // 언어 코드 정규화 (ko-KR -> ko, en-US -> en 등)
    const normalizedLanguage = normalizeLanguageCode(language || 'ko');

    // AI 서비스를 통해 코칭 응답 생성 (언어 임베딩 반영)
    const response = await generateCoachingResponse({
      userQuery,
      queryType,
      userSaju,
      language: normalizedLanguage,
      mbti,
      interests,
    });

    logger.info('코칭 응답 생성 완료', {
      queryType,
      userId: req.user?.uid,
    });

    res.json({
      success: true,
      data: {
        response,
        queryType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('코칭 응답 생성 실패', {
      error: error.message,
      queryType: req.body.queryType,
      userId: req.user?.uid,
    });
    next(error);
  }
}
