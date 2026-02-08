/**
 * Fortune Mate Backend API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { scheduleCrawler } from './crawler/trendCrawler.js';
import { runSelfEvolution } from './services/selfEvolvingService.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import v1Routes from './routes/v1/index.js';
import { API_ENDPOINTS } from '../../shared/src/constants/index.js';
import { logger } from '../../shared/src/utils/logger.js';
import { initEnv } from './config/env.js';
import cron from 'node-cron';

dotenv.config();

// 환경 변수 검증 (선택적)
if (process.env.VALIDATE_ENV === 'true') {
  try {
    initEnv();
  } catch (error) {
    logger.error('환경 변수 검증 실패', { error: error.message });
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 4001;

// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

// Middleware: 보안 헤더(Helmet), 요청 로깅
app.use(helmet({
  contentSecurityPolicy: false, // API 서버; CSP는 프론트에서 관리
}));
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get(API_ENDPOINTS.HEALTH, (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1', v1Routes);

// Legacy routes (하위 호환성 유지)
app.post('/api/crawler/run', async (req, res, next) => {
  try {
    const { crawlTrends } = await import('./crawler/trendCrawler.js');
    const keywords = await crawlTrends();
    res.json({ success: true, keywordsCount: keywords.length });
  } catch (error) {
    next(error);
  }
});

app.post('/api/self-evolution/run', async (req, res, next) => {
  try {
    const result = await runSelfEvolution();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (마지막에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  logger.info(`🚀 Fortune Mate Backend 서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`📚 API 문서: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}${API_ENDPOINTS.HEALTH}`);

  // 크롤러 스케줄링
  if (process.env.CRAWLER_ENABLED === 'true') {
    scheduleCrawler();
    logger.info('크롤러 스케줄링 활성화됨');
  }

  // 자가 발전 알고리즘 스케줄링 (매일 자정에 실행)
  cron.schedule('0 0 * * *', async () => {
    logger.info('자가 발전 알고리즘 실행', { timestamp: new Date().toISOString() });
    try {
      await runSelfEvolution();
    } catch (error) {
      logger.error('자가 발전 알고리즘 실행 실패', { error: error.message });
    }
  });
});
