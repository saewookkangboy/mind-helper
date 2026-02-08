/**
 * 파이프라인 컨트롤러
 * 6대 도메인 소스 기반 AI 챗봇 요청 처리
 */

import { runPipeline } from '../services/pipeline.service.js';
import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { ALL_DOMAIN_IDS } from '../../../shared/src/constants/domains.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 파이프라인 실행: 사용자 질문 → 도메인 소스 측정 → AI 결과 반환
 */
export async function executePipeline(req, res, next) {
  try {
    const {
      userQuery,
      language = 'ko',
      domainIds,
      userContext = {},
    } = req.body;

    logger.info('파이프라인 요청 수신', {
      language,
      domainCount: domainIds?.length,
      userId: req.user?.uid,
    });

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
      throw new AppError(
        'userQuery is required and must be a non-empty string',
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const invalidDomains = (domainIds || []).filter((id) => !ALL_DOMAIN_IDS.includes(id));
    if (invalidDomains.length > 0) {
      throw new AppError(
        `Invalid domainIds: ${invalidDomains.join(', ')}. Allowed: ${ALL_DOMAIN_IDS.join(', ')}`,
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const result = await runPipeline({
      userQuery: userQuery.trim(),
      language: ['ko', 'en', 'ja'].includes(language) ? language : 'ko',
      domainIds: domainIds?.length ? domainIds : undefined,
      userContext: {
        ...userContext,
        userId: req.user?.uid,
      },
    });

    res.json({
      success: true,
      data: {
        response: result.response,
        responseSummary: result.responseSummary ?? '',
        responseSections: result.responseSections ?? {},
        sourcesUsed: result.sourcesUsed,
        tarotCards: Array.isArray(result.tarotCards) ? result.tarotCards : [],
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    logger.error('파이프라인 실행 실패', {
      error: error.message,
      userId: req.user?.uid,
    });
    next(error);
  }
}
