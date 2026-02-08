#!/usr/bin/env node
/**
 * 타로 섹션 이미지 출력 성능·접근성 테스트
 * - getTarotContextAndCards로 3장 뽑기
 * - 각 카드 imageUrl HEAD 요청으로 응답 코드·응답 시간 측정
 * - 동일 시드 재요청 시 동일 카드 반환 여부 확인
 */

import { getTarotContextAndCards } from '../src/services/tarot.service.js';

const TEST_QUERIES = [
  '커리어 전환을 고민하고 있어요',
  '오늘 하루 에너지가 궁금해요',
  'Human readable query for tarot',
];

function now() {
  return performance.now();
}

async function headImage(url) {
  const start = now();
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const elapsed = now() - start;
    return { ok: res.ok, status: res.status, elapsedMs: Math.round(elapsed * 100) / 100 };
  } catch (err) {
    const elapsed = now() - start;
    return { ok: false, status: 0, error: err.message, elapsedMs: Math.round(elapsed * 100) / 100 };
  }
}

async function run() {
  console.log('=== 타로 이미지 성능 테스트 ===\n');

  const allTimings = [];
  let totalCards = 0;
  let failedUrls = [];

  for (const query of TEST_QUERIES) {
    const start = now();
    const { contextText, tarotCards } = await getTarotContextAndCards(query);
    const serviceMs = now() - start;

    console.log(`[질문] ${query.slice(0, 40)}...`);
    console.log(`  서비스 응답: ${tarotCards.length}장, ${Math.round(serviceMs * 100) / 100}ms`);
    if (contextText) console.log(`  컨텍스트: ${contextText.split('\n').slice(0, 2).join(' | ')}`);

    if (!tarotCards.length) {
      console.log('  ⚠ 카드 없음\n');
      continue;
    }

    for (const card of tarotCards) {
      totalCards++;
      const url = card.imageUrl || card.image_url;
      if (!url) {
        console.log(`  ❌ 이미지 URL 없음: ${card.name}`);
        failedUrls.push({ name: card.name, reason: 'no url' });
        continue;
      }
      const result = await headImage(url);
      allTimings.push(result.elapsedMs);
      const status = result.ok ? `✅ ${result.status}` : `❌ ${result.status}`;
      console.log(`  ${status} ${card.name} (${result.elapsedMs}ms) ${url.slice(0, 60)}...`);
      if (!result.ok) {
        failedUrls.push({
          name: card.name,
          url,
          reason: result.error || `HTTP ${result.status}`,
        });
      }
    }
    console.log('');
  }

  // 시드 일관성: 같은 질문으로 두 번 호출 시 같은 3장인지
  console.log('--- 시드 일관성 ---');
  const { tarotCards: cards1 } = await getTarotContextAndCards(TEST_QUERIES[0]);
  const { tarotCards: cards2 } = await getTarotContextAndCards(TEST_QUERIES[0]);
  const sameNames =
    cards1.length === cards2.length &&
    cards1.every((c, i) => c.name === cards2[i].name && c.position === cards2[i].position);
  console.log(`동일 질문 재요청 시 동일 카드: ${sameNames ? '✅ 예' : '❌ 아니오'}`);
  if (!sameNames && cards1.length) {
    console.log(`  1회: ${cards1.map((c) => c.name).join(', ')}`);
    console.log(`  2회: ${cards2.map((c) => c.name).join(', ')}`);
  }

  // 요약
  console.log('\n--- 요약 ---');
  const n = allTimings.length;
  if (n) {
    const sum = allTimings.reduce((a, b) => a + b, 0);
    const min = Math.min(...allTimings);
    const max = Math.max(...allTimings);
    console.log(`총 카드: ${totalCards}, 이미지 응답: ${n}회`);
    console.log(`이미지 응답 시간(ms): min=${min.toFixed(2)}, max=${max.toFixed(2)}, avg=${(sum / n).toFixed(2)}`);
  }
  if (failedUrls.length) {
    console.log(`실패: ${failedUrls.length}건`);
    failedUrls.forEach((f) => console.log(`  - ${f.name}: ${f.reason}`));
  } else {
    console.log('모든 이미지 URL 접근 성공 ✅');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
