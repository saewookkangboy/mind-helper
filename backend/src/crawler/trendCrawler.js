/**
 * 트렌드 크롤러
 * SNS/커뮤니티에서 버즈워드 수집
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../config/firebase-admin.js';
import cron from 'node-cron';

// 크롤링 대상 사이트
const CRAWL_TARGETS = {
  twitter: {
    enabled: false, // API 키 필요
    url: 'https://twitter.com/trending',
  },
  reddit: {
    enabled: true,
    url: 'https://www.reddit.com/r/korea/hot.json',
  },
  naverTrends: {
    enabled: true,
    url: 'https://datalab.naver.com/keyword/realtimeList.naver',
  },
  dcInside: {
    enabled: true,
    url: 'https://www.dcinside.com',
  },
};

/**
 * Reddit 트렌드 수집
 */
async function crawlReddit() {
  try {
    const response = await axios.get(CRAWL_TARGETS.reddit.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const posts = response.data?.data?.children || [];
    const keywords = [];

    for (const post of posts.slice(0, 10)) {
      const title = post.data?.title || '';
      // 제목에서 키워드 추출 (간단한 버전)
      const words = title
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);

      keywords.push(...words);
    }

    return [...new Set(keywords)];
  } catch (error) {
    console.error('Reddit 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * 네이버 실시간 검색어 수집
 */
async function crawlNaverTrends() {
  try {
    const response = await axios.get(CRAWL_TARGETS.naverTrends.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const keywords = [];

    // 네이버 실시간 검색어 파싱 (실제 구조에 맞게 수정 필요)
    $('.keyword_item').each((i, elem) => {
      const keyword = $(elem).text().trim();
      if (keyword) {
        keywords.push(keyword);
      }
    });

    return keywords;
  } catch (error) {
    console.error('네이버 트렌드 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * DC Inside 인기 키워드 수집
 */
async function crawlDcInside() {
  try {
    const response = await axios.get(CRAWL_TARGETS.dcInside.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const keywords = [];

    // DC Inside 인기 게시글 제목에서 키워드 추출
    $('.title').each((i, elem) => {
      const title = $(elem).text().trim();
      if (title) {
        keywords.push(title);
      }
    });

    return keywords.slice(0, 20);
  } catch (error) {
    console.error('DC Inside 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * 수집한 키워드를 Firestore에 저장
 */
async function saveTrendsToFirestore(keywords, source) {
  try {
    const trendsRef = db.collection('trends');
    const batch = db.batch();

    for (const keyword of keywords) {
      // 키워드 정제 (특수문자 제거, 소문자 변환 등)
      const cleanedKeyword = keyword
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .trim();

      if (cleanedKeyword.length < 2) continue;

      const keywordRef = trendsRef.doc(cleanedKeyword);
      const keywordDoc = await keywordRef.get();

      if (keywordDoc.exists) {
        // 기존 키워드 업데이트
        batch.update(keywordRef, {
          usage_count: (keywordDoc.data().usage_count || 0) + 1,
          last_crawled: new Date(),
          sources: [...new Set([...(keywordDoc.data().sources || []), source])],
        });
      } else {
        // 새 키워드 생성
        batch.set(keywordRef, {
          keyword: cleanedKeyword,
          category: detectCategory(cleanedKeyword),
          usage_count: 1,
          is_active: false, // 관리자 승인 필요
          created_at: new Date(),
          last_crawled: new Date(),
          sources: [source],
        });
      }
    }

    await batch.commit();
    console.log(`${keywords.length}개의 키워드를 저장했습니다.`);
  } catch (error) {
    console.error('Firestore 저장 실패:', error);
  }
}

/**
 * 키워드 카테고리 자동 감지
 */
function detectCategory(keyword) {
  const memeKeywords = ['밈', '짤', '드립', '개드립', '웃긴', 'ㅋㅋ'];
  const slangKeywords = ['존나', '개', '완전', '진짜', '레전드'];

  if (memeKeywords.some(k => keyword.includes(k))) {
    return 'meme';
  }
  if (slangKeywords.some(k => keyword.includes(k))) {
    return 'slang';
  }

  return 'general';
}

/**
 * 메인 크롤링 함수
 */
export async function crawlTrends() {
  console.log('트렌드 크롤링 시작...');

  const allKeywords = [];

  // Reddit 크롤링
  if (CRAWL_TARGETS.reddit.enabled) {
    const redditKeywords = await crawlReddit();
    allKeywords.push(...redditKeywords);
    await saveTrendsToFirestore(redditKeywords, 'reddit');
  }

  // 네이버 트렌드 크롤링
  if (CRAWL_TARGETS.naverTrends.enabled) {
    const naverKeywords = await crawlNaverTrends();
    allKeywords.push(...naverKeywords);
    await saveTrendsToFirestore(naverKeywords, 'naver');
  }

  // DC Inside 크롤링
  if (CRAWL_TARGETS.dcInside.enabled) {
    const dcKeywords = await crawlDcInside();
    allKeywords.push(...dcKeywords);
    await saveTrendsToFirestore(dcKeywords, 'dcinside');
  }

  console.log(`총 ${allKeywords.length}개의 키워드를 수집했습니다.`);
  return allKeywords;
}

/**
 * 크롤러 스케줄링 (매 시간마다 실행)
 */
export function scheduleCrawler() {
  // 매 시간 정각에 실행
  cron.schedule('0 * * * *', async () => {
    console.log('스케줄된 크롤링 시작:', new Date().toISOString());
    await crawlTrends();
  });

  console.log('트렌드 크롤러가 스케줄링되었습니다. (매 시간마다 실행)');
}
