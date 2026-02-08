/**
 * API v1 라우터
 */

import express from 'express';
import coachingRoutes from './coaching.routes.js';
import pipelineRoutes from './pipeline.routes.js';
import tarotRoutes from './tarot.routes.js';
import feedbackRoutes from './feedback.routes.js';
import crawlerRoutes from './crawler.routes.js';
import selfEvolutionRoutes from './selfEvolution.routes.js';
import adminRoutes from './admin.routes.js';
import sajuRoutes from './saju.routes.js';

const router = express.Router();

// 라우트 등록
router.use('/saju', sajuRoutes);
router.use('/coaching', coachingRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/tarot', tarotRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/crawler', crawlerRoutes);
router.use('/self-evolution', selfEvolutionRoutes);
router.use('/admin', adminRoutes);

export default router;
