
import { calculateSajuWithManseryeok } from '../src/services/saju.service.js';
import { logger } from '../../shared/src/utils/logger.js';

// Mock logger to avoid cluttering actual logs if needed, but using real logger is fine for manual run.

async function runTest() {
    console.log('--- Testing Solar Date (1990-01-27) ---');
    // 1990-01-27 (Solar) -> Should be Year: 기사, Month: 정축, Day: 무진
    const solarResult = await calculateSajuWithManseryeok('1990-01-27', '12:00:00', 'Asia/Seoul', 'solar');
    console.log('Solar Result:', JSON.stringify(solarResult, null, 2));

    console.log('\n--- Testing Lunar Date (1990-01-01) ---');
    // 1990-01-01 (Lunar) -> Should equivalent to 1990-01-27 (Solar)
    // Therefore should have same Year: 기사, Month: 정축, Day: 무진
    const lunarResult = await calculateSajuWithManseryeok('1990-01-01', '12:00:00', 'Asia/Seoul', 'lunar');
    console.log('Lunar Result:', JSON.stringify(lunarResult, null, 2));

    if (lunarResult.solarDateUsed === '1990-01-27') {
        console.log('\nSUCCESS: Lunar 1990-01-01 correctly converted to Solar 1990-01-27');
    } else {
        console.log('\nFAILURE: Lunar conversion failed.');
    }

    if (lunarResult.day && lunarResult.day.gan === solarResult.day.gan) {
        console.log('SUCCESS: Ganji matches between Solar and Lunar input.');
    } else {
        console.log('FAILURE: Ganji mismatch.');
    }
}

runTest();
