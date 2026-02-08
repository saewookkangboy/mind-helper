/**
 * 타로 카드 서비스 (krates98/tarotcardapi 기반)
 * https://github.com/krates98/tarotcardapi
 * - API 키 없이 덱 데이터 + GitHub raw 이미지 사용
 * - 시드 기반 세 카드 스프레드, 카드 상세 조회
 */

import { logger } from '../../../shared/src/utils/logger.js';
import { TAROT_DECK, getImageUrl, nameToId } from './tarotcardapiDeck.js';

const POSITIONS = ['Past', 'Present', 'Future'];

/**
 * 단순 해시 (시드 생성용)
 */
function simpleHash(str) {
  if (!str || typeof str !== 'string') return 'mind-helper-default';
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * 시드 기반 의사난수로 0..(n-1) 인덱스 3개 선택 (중복 없이)
 */
function pickThreeIndices(seed, n) {
  if (n < 3) return [0, 1, 2].filter((i) => i < n);
  const indices = [];
  let s = seed;
  while (indices.length < 3) {
    s = (s * 1103515245 + 12345) >>> 0;
    const idx = s % n;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices;
}

/**
 * 덱 카드 한 장을 프론트 형식으로 변환
 */
function toCardPayload(card, options = {}) {
  const id = nameToId(card.name);
  return {
    id,
    name: card.name,
    imageUrl: getImageUrl(card.imageFile),
    reversed: Boolean(options.reversed),
    meaningShort: card.meaningShort || '',
    position: options.position || null,
  };
}

/**
 * 세 카드 스프레드 (과거·현재·미래) — 시드로 재현 가능
 * @param {string} seed - 재현용 시드 (예: userQuery 해시)
 * @returns {Promise<{ cards: Array<{ id, name, imageUrl, reversed, meaningShort, position }>, summary?: string }>}
 */
export async function drawThreeCardSpread(seed) {
  try {
    const deck = TAROT_DECK;
    if (!deck.length) return { cards: [], summary: null };
    const num = deck.length;
    const hash = simpleHash(seed || 'default');
    const indices = pickThreeIndices(hash, num);
    const cards = indices.map((idx, i) => {
      const card = deck[idx];
      const reversed = (hash + idx) % 3 === 0;
      return toCardPayload(card, { position: POSITIONS[i], reversed });
    });
    return { cards, summary: null };
  } catch (err) {
    logger.warn('타로 세 카드 스프레드 실패', { error: err.message });
    return { cards: [], summary: null };
  }
}

/**
 * 카드 한 장 뽑기 — 시드로 재현 가능
 * @param {string} seed
 * @returns {Promise<{ cards: Array<{ id, name, imageUrl, reversed, meaningShort }> }>}
 */
export async function drawSingleCard(seed) {
  try {
    const deck = TAROT_DECK;
    if (!deck.length) return { cards: [] };
    const hash = simpleHash(seed || 'single');
    const idx = hash % deck.length;
    const card = deck[idx];
    const reversed = hash % 2 === 0;
    return { cards: [toCardPayload(card, { reversed })] };
  } catch (err) {
    logger.warn('타로 한 장 뽑기 실패', { error: err.message });
    return { cards: [] };
  }
}

/**
 * 카드 상세 조회 (id 또는 name으로 검색)
 * @param {string} cardId - kebab-case (예: the-fool, ace-of-cups) 또는 카드 이름
 * @returns {Promise<{ id, name, imageUrl, uprightMeaning, reversedMeaning, keywords } | null>}
 */
export async function getCardById(cardId) {
  if (!cardId) return null;
  const id = String(cardId).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const card = TAROT_DECK.find((c) => nameToId(c.name) === id || c.name.toLowerCase().replace(/\s+/g, '-') === id);
  if (!card) return null;
  return {
    id: nameToId(card.name),
    name: card.name,
    imageUrl: getImageUrl(card.imageFile),
    uprightMeaning: card.meaningShort || '',
    reversedMeaning: '',
    keywords: [],
  };
}

/**
 * 파이프라인용: 사용자 질문 기반 시드로 세 카드 뽑고, AI 컨텍스트용 텍스트와 프론트 전달용 카드 목록 반환
 * @param {string} userQuery
 * @returns {Promise<{ contextText: string, tarotCards: Array<{ id, name, imageUrl, reversed, meaningShort, position }> }>}
 */
export async function getTarotContextAndCards(userQuery) {
  const seed = simpleHash(userQuery || '');
  const result = await drawThreeCardSpread(String(seed));
  if (!result?.cards?.length) {
    return { contextText: '', tarotCards: [] };
  }
  const lines = result.cards.map((c, i) => {
    const pos = c.position ? `[${c.position}]` : `[위치${i + 1}]`;
    return `${pos} ${c.name}${c.reversed ? ' (역방향)' : ''}: ${c.meaningShort || '-'}`;
  });
  const contextText = `[이번 분석에서 참고한 타로 카드 — 과거·현재·미래 3장]
${lines.join('\n')}

【타로 섹션 필수】위 3장을 각각 "과거/현재/미래" 위치와 카드 이름을 명시하며, 사용자 질문과 어떻게 연관되는지 상세 해석할 것. 역방향 카드는 역방향 의미를 반영할 것.`;
  return {
    contextText,
    tarotCards: result.cards,
  };
}
