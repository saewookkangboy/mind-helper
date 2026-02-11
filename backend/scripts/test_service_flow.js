
import { loadDomainContexts } from '../src/services/domainSources/index.js';
import { calculateSajuWithManseryeok } from '../src/services/saju.service.js';
import { DOMAIN_IDS } from '../../shared/src/constants/domains.js';

async function testServiceFlow() {
    console.log('=== Service Flow Test ===');
    console.log('Scenario: User inputs Solar Birth Date -> System converts to Lunar -> Extracts 6 Sections Data\n');

    // 1. Input: Solar Date
    const userInput = {
        birthDate: '1990-01-27', // Solar
        birthTime: '12:00',
        timezone: 'Asia/Seoul',
        calendarType: 'solar', // User inputs Solar
        mbti: 'INFJ',
        interests: ['career', 'relationships'],
        language: 'ko'
    };

    console.log(`1. User Input (Solar): ${userInput.birthDate} ${userInput.birthTime} (${userInput.mbti})`);

    // 2. Saju Calculation (Simulating Step 2: Conversion & Analysis)
    console.log('\n2. Processing Saju (Including Lunar Conversion)...');
    const sajuResult = await calculateSajuWithManseryeok(
        userInput.birthDate,
        userInput.birthTime,
        userInput.timezone,
        userInput.calendarType
    );

    if (sajuResult.error) {
        console.error('Saju Calculation Failed:', sajuResult.error);
        return;
    }

    console.log(`   - Solar Date Used: ${sajuResult.solarDateUsed}`);
    console.log(`   - Converted Lunar Date: ${sajuResult.lunarDateConverted} (System internal use)`);
    console.log(`   - Saju Oheng: Year(${sajuResult.oheng.year}) Month(${sajuResult.oheng.month}) Day(${sajuResult.oheng.day}) Hour(${sajuResult.oheng.hour})`);

    // 3. Extracting 6 Sections Data
    console.log('\n3. Extracting Data for 6 Sections...');

    // We need to pass the Saju result to loadDomainContexts to avoid re-calcule (optimization) or just let it handle it.
    // In pipeline.service.js, it passes userContext. 
    // loadDomainContexts internally calls calculateSaju if userSaju is not provided.
    // We will pass the calculated saju as 'userSaju' to simulate efficiency, OR just pass birth info.
    // Let's pass birth info to let it run naturally, but we already ran it above for demonstration.
    // Actually, let's pass the sajuResult to verify efficient context loading if supported.
    // Looking at loadDomainContexts, it checks userSaju?.interpretation.
    // Saju result from manseryeok doesn't have interpretation yet (that might be another layer), 
    // but let's just pass birthDate/Time/calendarType again.

    const domainIds = [
        DOMAIN_IDS.SAJU,
        DOMAIN_IDS.PSYCHOLOGY,
        DOMAIN_IDS.MBTI,
        DOMAIN_IDS.TAROT,
        DOMAIN_IDS.BIRKMAN,
        DOMAIN_IDS.DARK_PSYCHOLOGY
    ];

    const { contexts } = await loadDomainContexts(domainIds, userInput);

    domainIds.forEach(id => {
        console.log(`\n[${id.toUpperCase()} SECTION DATA]`);
        if (contexts[id]) {
            // Truncate long text for display
            const text = contexts[id];
            const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
            console.log(preview);
        } else {
            console.log('(No data extraction)');
        }
    });

    console.log('\n=== Test Complete ===');
}

testServiceFlow();
