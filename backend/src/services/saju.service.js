/**
 * 사주 서비스 - 만세력 기반 사주 계산
 * Python korean-lunar-calendar(KARI 음력 데이터) 스크립트를 호출합니다.
 * 사주 산출 근거 명확화: 한국천문연구원 음양력정보 API(LrsrCldInfoService) 결과를 함께 반환합니다.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../../shared/src/utils/logger.js';
import { getLunCalInfoFromDate } from './kariLunar.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 만세력 데이터로 사주 계산 (연·월·일·시주). 모든 산출은 KST 기준.
 * @param {string} birthDate - YYYY-MM-DD
 * @param {string} birthTime - HH:MM 또는 HH:MM:SS
 * @param {string} [timezone] - IANA 타임존 (예: Asia/Seoul, UTC). 미지정 시 Asia/Seoul(KST)로 간주
 * @returns {Promise<{ year, month, day, hour, oheng, kstBirth?, ... }|{ error: string }>}
 */
export async function calculateSajuWithManseryeok(birthDate, birthTime, timezone = 'Asia/Seoul') {
  const scriptPath = path.resolve(__dirname, '../../scripts/saju_manseryeok.py');
  const venvPython = path.resolve(__dirname, '../../venv/bin/python');

  const args = [scriptPath, birthDate, birthTime];
  if (timezone && timezone !== 'Asia/Seoul') {
    args.push(timezone);
  }

  return new Promise((resolve) => {
    const proc = spawn(venvPython, args, {
      cwd: path.resolve(__dirname, '../..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('error', (err) => {
      logger.error('만세력 사주 스크립트 실행 실패', { err: err.message, stderr });
      resolve({ error: '사주 계산 서비스를 일시적으로 사용할 수 없습니다.' });
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.warn('만세력 사주 스크립트 비정상 종료', { code, stderr });
        resolve({ error: stderr || '사주 계산 중 오류가 발생했습니다.' });
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          resolve(result);
          return;
        }
        const solarDate = result.solarDateUsed || birthDate;
        getLunCalInfoFromDate(solarDate)
          .then((kariLunar) => {
            if (kariLunar) {
              result.kariLunarSource = kariLunar;
            }
            resolve(result);
          })
          .catch(() => resolve(result));
      } catch (e) {
        logger.error('만세력 사주 결과 파싱 실패', { stdout: stdout.slice(0, 200), err: e.message });
        resolve({ error: '사주 결과를 처리하는 중 오류가 발생했습니다.' });
      }
    });
  });
}
