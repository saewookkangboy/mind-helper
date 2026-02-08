/**
 * 입력 검증 미들웨어
 */

import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';
import { QueryTypes } from '../../../shared/src/types/index.js';
import { ALL_DOMAIN_IDS } from '../../../shared/src/constants/index.js';
import { SUPPORTED_LANGUAGES } from '../services/languageEmbedding.js';

/**
 * 요청 본문 검증
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const errors = [];

      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];

        // 필수 필드 체크
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} 필드는 필수입니다.`);
          continue;
        }

        // 값이 없으면 다음 필드로
        if (value === undefined || value === null || value === '') {
          continue;
        }

        // 타입 검증
        if (rules.type) {
          const actualType = typeof value;
          if (rules.type === 'array' && !Array.isArray(value)) {
            errors.push(`${field} 필드는 배열이어야 합니다.`);
          } else if (rules.type !== 'array' && actualType !== rules.type) {
            errors.push(`${field} 필드는 ${rules.type} 타입이어야 합니다.`);
          }
        }

        // enum 검증
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} 필드는 다음 중 하나여야 합니다: ${rules.enum.join(', ')}`);
        }

        // 최소/최대 길이 검증
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} 필드는 최소 ${rules.minLength}자 이상이어야 합니다.`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} 필드는 최대 ${rules.maxLength}자 이하여야 합니다.`);
        }

        // 커스텀 검증
        if (rules.validate && !rules.validate(value)) {
          errors.push(rules.message || `${field} 필드 검증에 실패했습니다.`);
        }
      }

      if (errors.length > 0) {
        throw new AppError(
          errors.join('\n'),
          400,
          ErrorCodes.VALIDATION_ERROR
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * 코칭 요청 검증 스키마
 */
export const coachingSchema = {
  userQuery: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 1000,
  },
  queryType: {
    required: true,
    type: 'string',
    enum: Object.values(QueryTypes),
  },
  language: {
    required: false,
    type: 'string',
    enum: SUPPORTED_LANGUAGES,
    default: 'ko',
  },
  userSaju: {
    required: false,
    type: 'object',
  },
  mbti: {
    required: false,
    type: 'string',
  },
  interests: {
    required: false,
    type: 'string',
  },
};

/**
 * 피드백 요청 검증 스키마
 */
export const feedbackSchema = {
  logId: {
    required: true,
    type: 'string',
  },
  feedback: {
    required: true,
    type: 'string',
    enum: ['positive', 'negative'],
  },
  comment: {
    required: false,
    type: 'string',
    maxLength: 500,
  },
};

/**
 * 파이프라인 요청 검증 스키마
 */
export const pipelineSchema = {
  userQuery: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 2000,
  },
  language: {
    required: false,
    type: 'string',
    enum: ['ko', 'en', 'ja'],
  },
  domainIds: {
    required: false,
    type: 'array',
    validate: (arr) => !arr || arr.every((id) => ALL_DOMAIN_IDS.includes(id)),
    message: `domainIds는 다음 중 하나 이상이어야 합니다: ${ALL_DOMAIN_IDS.join(', ')}`,
  },
  userContext: {
    required: false,
    type: 'object',
  },
};
