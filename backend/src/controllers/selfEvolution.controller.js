/**
 * 자가 발전 컨트롤러
 */

import { runSelfEvolution } from '../services/selfEvolvingService.js';

/**
 * 자가 발전 알고리즘 실행
 */
export async function runSelfEvolutionController(req, res, next) {
  try {
    const result = await runSelfEvolution();
    
    res.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

// export 이름 충돌 방지를 위해 별도 이름 사용
export { runSelfEvolutionController as runSelfEvolution };
