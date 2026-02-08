/**
 * 인증 미들웨어
 */

import { auth, db } from '../config/firebase-admin.js';
import { AppError, ErrorCodes } from '../../../shared/src/utils/errors.js';

/**
 * 선택적 인증: 토큰이 있으면 검증해 req.user 설정, 없으면 req.user = null
 * 로그인 숨김 시 비로그인 사용자도 코칭 등 이용 가능
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      req.user = null;
      return next();
    }
    const decodedToken = await auth.verifyIdToken(token);
    const roles = Array.isArray(decodedToken.roles)
      ? decodedToken.roles
      : typeof decodedToken.roles === 'string'
        ? [decodedToken.roles]
        : [];
    const role = decodedToken.role;
    const isAdmin = decodedToken.admin === true || role === 'admin' || roles.includes('admin');

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role,
      roles,
      isAdmin,
    };
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Firebase Auth 토큰 검증
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authorization token required',
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw new AppError(
        'Invalid authorization format',
        401,
        ErrorCodes.INVALID_TOKEN
      );
    }

    // Firebase 토큰 검증
    const decodedToken = await auth.verifyIdToken(token);
    
    // 요청 객체에 사용자 정보 추가
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    // Firebase 인증 에러 처리
    if (error.code === 'auth/id-token-expired') {
      return next(new AppError(
        'Token expired',
        401,
        ErrorCodes.TOKEN_EXPIRED
      ));
    }

    if (error.code === 'auth/id-token-revoked' || error.code === 'auth/argument-error') {
      return next(new AppError(
        'Invalid token',
        401,
        ErrorCodes.INVALID_TOKEN
      ));
    }

    return next(new AppError(
      'Authentication failed',
      401,
      ErrorCodes.UNAUTHORIZED
    ));
  }
}

/**
 * 관리자 권한 체크
 */
export async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    if (req.user.isAdmin) {
      return next();
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const storedRole = userDoc.exists ? userDoc.data()?.role : null;
    const normalizedRole = typeof storedRole === 'string' ? storedRole.toLowerCase() : null;

    if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin') {
      throw new AppError(
        'Admin access required',
        403,
        ErrorCodes.INSUFFICIENT_PERMISSIONS
      );
    }

    req.user.role = normalizedRole;
    req.user.isAdmin = true;

    next();
  } catch (error) {
    next(error);
  }
}
