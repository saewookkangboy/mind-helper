/**
 * 언어 임베딩
 * 한국어(ko), 영어(en), 일본어(ja)에 대한 정확성·톤·문화 반영 지침
 * AI 시스템 프롬프트에 주입되어 응답 품질을 고도화합니다.
 */

/** 지원 언어 코드 (검증·정규화용) */
export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'];

/** 언어별 표기명 */
export const LANGUAGE_LABELS = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

/**
 * 언어별 임베딩 지침
 * - 정확성: 문법, 맞춤법, 자연스러운 표현
 * - 톤/격식: 친근함·존댓말·비즈니스 톤
 * - 문화: 경어, 호칭, 금기 표현
 */
export const LANGUAGE_EMBEDDING = {
  ko: `
[한국어 응답 규칙]
- 반드시 한국어로만 답변하세요. 영어/일본어 단어는 필요한 경우에만 병기하세요.
- 존댓말(합니다체, 해요체)을 일관되게 사용하세요. "~해요", "~입니다"를 기본으로 하세요.
- 맞춤법·띄어쓰기를 정확히 지키고, 줄임말·비속어는 사용하지 마세요.
- 문장은 짧고 명확하게, 불필요한 반복을 피하세요.
- 사주·운세 용어(일간, 오행, 대운 등)는 한글 위주로 설명하되, 필요 시 한자 병기 가능.
- 친근하되 경계를 지키는 톤을 유지하세요.
`.trim(),

  en: `
[English response rules]
- Respond only in English. Do not mix in Korean or Japanese unless quoting.
- Use clear, grammatically correct sentences. Prefer active voice and concrete advice.
- Maintain a warm but professional tone (e.g., "you might consider...", "it could help to...").
- Avoid slang, excessive casualness, or overly formal jargon.
- When referring to saju/fortune terms, use consistent English equivalents or brief explanations.
- Keep paragraphs short and scannable; use line breaks for readability.
`.trim(),

  ja: `
[日本語応答ルール]
- 必ず日本語のみで回答してください。必要時以外は他言語を混ぜないでください。
- です・ます調で統一し、敬語を自然に使ってください。
- 正しい表記・送り仮名・句読点を守り、俗語や略語は避けてください。
- 一文を短くし、重複を避けて明確に伝えてください。
- 四柱推命・運勢用語（日干、五行、大運など）は日本語で説明し、必要なら漢字を併記してください。
- 親しみやすく、かつ丁寧なトーンを保ってください。
`.trim(),
};

/**
 * 요청 언어에 맞는 임베딩 텍스트 반환
 * @param {string} language - 'ko' | 'en' | 'ja'
 * @returns {string}
 */
export function getLanguageEmbedding(language) {
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'ko';
  return LANGUAGE_EMBEDDING[lang] || LANGUAGE_EMBEDDING.ko;
}

/**
 * 언어 코드 정규화 (예: 'ko-KR' -> 'ko')
 * @param {string} code
 * @returns {string} 'ko' | 'en' | 'ja'
 */
export function normalizeLanguageCode(code) {
  if (!code || typeof code !== 'string') return 'ko';
  const lower = code.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(lower) ? lower : 'ko';
}
