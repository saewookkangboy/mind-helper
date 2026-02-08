/**
 * 크롤러 컨트롤러
 */

import { crawlTrends } from '../crawler/trendCrawler.js';

/**
 * 크롤러 실행
 */
export async function runCrawler(req, res, next) {
  try {
    const keywords = await crawlTrends();
    
    res.json({
      success: true,
      data: {
        keywordsCount: keywords.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}
