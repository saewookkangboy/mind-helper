/**
 * HTTP 요청 로깅 미들웨어 (Server/운영 관점)
 * method, path, statusCode, duration 기록
 */

import { logger } from '../../../shared/src/utils/logger.js';

/**
 * 요청 시작 시각을 req._startAt에 저장하고, 응답 완료 시 로그 출력
 */
export function requestLogger(req, res, next) {
  const startAt = Date.now();
  req._startAt = startAt;

  res.on('finish', () => {
    const duration = Date.now() - startAt;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP 요청', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.get('user-agent')?.slice(0, 80),
    });
  });

  next();
}
