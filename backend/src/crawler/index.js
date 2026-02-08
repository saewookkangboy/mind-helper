/**
 * 트렌드 크롤러 실행 스크립트
 */

import { crawlTrends, scheduleCrawler } from './trendCrawler.js';

// 명령줄 인자 확인
const args = process.argv.slice(2);
const mode = args[0] || 'once'; // 'once' | 'schedule'

if (mode === 'schedule') {
  // 스케줄 모드: 지속적으로 실행
  scheduleCrawler();
  console.log('크롤러가 스케줄 모드로 실행 중입니다...');
} else {
  // 일회성 실행
  crawlTrends()
    .then(() => {
      console.log('크롤링 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('크롤링 오류:', error);
      process.exit(1);
    });
}
