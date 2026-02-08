export function getSpeechLang(locale = '') {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('en')) return 'en-US';
  if (normalized.startsWith('ja')) return 'ja-JP';
  if (normalized.startsWith('ko')) return 'ko-KR';
  return 'ko-KR';
}

export function parseTimeFromSpeech(input) {
  if (!input || typeof input !== 'string') return null;

  const text = input.toLowerCase();
  const isPM = text.includes('오후') || text.includes('pm') || text.includes('午後');
  const isAM = text.includes('오전') || text.includes('am') || text.includes('午前');

  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  let hour = 0;
  let minute = 0;

  if (numbers.length === 1) {
    const raw = numbers[0];
    if (raw.length >= 3) {
      const padded = raw.padStart(4, '0');
      hour = Number(padded.slice(0, 2));
      minute = Number(padded.slice(2, 4));
    } else {
      hour = Number(raw);
      minute = 0;
    }
  } else {
    hour = Number(numbers[0]);
    minute = Number(numbers[1]);
  }

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
