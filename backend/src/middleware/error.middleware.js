/**
 * 에러 핸들링 미들웨어
 */

import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 에러 핸들링 미들웨어
 */
export function errorHandler(err, req, res, next) {
  // AppError 인스턴스인 경우
  if (err instanceof AppError) {
    logger.warn('API 에러 발생', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
    
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 알 수 없는 에러인 경우 (프로덕션에서는 스택 트레이스 미포함 — 정보 노출 방지)
  const logPayload = {
    error: err.message,
    path: req.path,
    method: req.method,
  };
  if (process.env.NODE_ENV !== 'production') {
    logPayload.stack = err.stack;
  }
  logger.error('처리되지 않은 에러 발생', logPayload);
  
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 핸들러
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}
