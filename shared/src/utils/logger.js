/**
 * 공유 로거 유틸리티
 * 간단한 로깅 시스템 (프로덕션에서는 Winston 등 사용 권장)
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
};

class Logger {
  constructor(level = 'info') {
    this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  _shouldLog(level) {
    return level <= this.level;
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${levelName}] ${message}${metaStr}`;
  }

  error(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.info(this._formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(this._formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
}

// 싱글톤 인스턴스 생성
let loggerInstance = null;

export function createLogger(level = 'info') {
  return new Logger(level);
}

export function getLogger(level = process.env.LOG_LEVEL || 'info') {
  if (!loggerInstance) {
    loggerInstance = createLogger(level);
  }
  return loggerInstance;
}

// 기본 로거 export
export const logger = getLogger();
