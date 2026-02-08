/**
 * 한국천문연구원 음양력 정보 API (LrsrCldInfoService)
 * 사주 산출 근거 명확화: 양력일 기준 음력일·간지·율리우스적일 등 조회
 * @see https://www.data.go.kr/data/15012679/openapi.do
 */

import { logger } from '../../../shared/src/utils/logger.js';

const BASE_URL = 'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
const GET_LUN_CAL_INFO = 'getLunCalInfo';

/**
 * 양력일 기준 음력 정보 조회 (getLunCalInfo)
 * @param {string} solYear - 연도 4자리 (예: 2020)
 * @param {string} solMonth - 월 2자리 (예: 01, 09)
 * @param {string} solDay - 일 2자리 (예: 15). 선택
 * @returns {Promise<{ lunYear, lunMonth, lunDay, lunSecha, lunIljin, lunWolgeon, solJd, solWeek, lunLeapmonth, solLeapyear } | null>}
 */
export async function getLunCalInfo(solYear, solMonth, solDay = '01') {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey || !serviceKey.trim()) {
    logger.debug('KARI 음양력 API: DATA_GO_KR_SERVICE_KEY 미설정');
    return null;
  }

  const year = String(solYear).trim();
  const month = String(solMonth).padStart(2, '0');
  const day = String(solDay).padStart(2, '0');

  const params = new URLSearchParams({
    serviceKey: serviceKey.trim(),
    solYear: year,
    solMonth: month,
    solDay: day,
    numOfRows: '1',
    pageNo: '1',
    _type: 'json',
  });

  const url = `${BASE_URL}/${GET_LUN_CAL_INFO}?${params.toString()}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      logger.warn('KARI 음양력 API HTTP 오류', { status: res.status });
      return null;
    }

    const data = await res.json();

    const response = data?.response;
    const header = response?.header;
    const body = response?.body;

    if (header?.resultCode !== '00' && header?.resultCode !== '0') {
      logger.warn('KARI 음양력 API 결과 오류', {
        resultCode: header?.resultCode,
        resultMsg: header?.resultMsg,
      });
      return null;
    }

    const items = body?.items;
    const item = Array.isArray(items) ? items[0] : items;
    if (!item) {
      return null;
    }

    return {
      lunYear: item.lunYear,
      lunMonth: item.lunMonth,
      lunDay: item.lunDay,
      lunSecha: item.lunSecha,
      lunIljin: item.lunIljin,
      lunWolgeon: item.lunWolgeon,
      solJd: item.solJd,
      solWeek: item.solWeek,
      lunLeapmonth: item.lunLeapmonth,
      solLeapyear: item.solLeapyear,
      lunNday: item.lunNday,
      source: '한국천문연구원 음양력정보(LrsrCldInfoService)',
    };
  } catch (err) {
    logger.warn('KARI 음양력 API 호출 실패', { err: err.message });
    return null;
  }
}

/**
 * YYYY-MM-DD 형식 날짜로 getLunCalInfo 호출
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<object|null>}
 */
export async function getLunCalInfoFromDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length < 2) return null;
  const [y, m, d] = parts;
  return getLunCalInfo(y, m, d || '01');
}
