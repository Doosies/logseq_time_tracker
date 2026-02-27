---
name: error-handling
description: "Error handling patterns for TypeScript/Node.js. Use when implementing try-catch, creating custom error classes (ValidationError, NotFoundError, AuthError), writing Express error middleware, handling async/Promise errors, or setting up structured error logging. Includes error response formats and unhandled rejection handling."
---

# 에러 처리 가이드

이 Skill은 모든 에이전트가 일관된 에러 처리를 하도록 돕습니다.

## 에러 처리 원칙

### 1. 에러는 즉시 해결
- 에러 발생 시 즉시 처리
- "나중에" 는 없음
- 다시 돌아오지 않음

### 2. 명확한 에러 메시지
- 사용자가 이해할 수 있는 메시지
- 개발자가 디버깅할 수 있는 정보 포함

### 3. 적절한 에러 레벨
- Critical: 시스템 중단
- Error: 기능 실패
- Warning: 잠재적 문제
- Info: 정보성

---

## 커스텀 에러 클래스

### 기본 에러 클래스

```typescript
/**
 * 애플리케이션 기본 에러
 */
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 구체적인 에러 클래스

```typescript
/**
 * 검증 에러 (400)
 */
class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * 인증 에러 (401)
 */
class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 권한 에러 (403)
 */
class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * 리소스 없음 (404)
 */
class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 중복 에러 (409)
 */
class DuplicateError extends AppError {
  constructor(resource: string, field: string) {
    super(
      `${resource} with this ${field} already exists`,
      'DUPLICATE_ERROR',
      409
    );
    this.name = 'DuplicateError';
  }
}

/**
 * 외부 서비스 에러 (502)
 */
class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service '${service}' failed`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { originalError }
    );
    this.name = 'ExternalServiceError';
  }
}
```

---

## 에러 사용 예시

### ValidationError

```typescript
function validateEmail(email: string) {
  if (!email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
}
```

### NotFoundError

```typescript
async function getUserById(id: string): Promise<User> {
  const user = await db.users.findOne({ id });
  
  if (!user) {
    throw new NotFoundError('User', id);
  }
  
  return user;
}
```

### AuthenticationError

```typescript
async function login(email: string, password: string) {
  const user = await db.users.findOne({ email });
  
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  const is_valid = await bcrypt.compare(password, user.password_hash);
  
  if (!is_valid) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  return generateToken(user);
}
```

### DuplicateError

```typescript
async function createUser(email: string, name: string) {
  const existing = await db.users.findOne({ email });
  
  if (existing) {
    throw new DuplicateError('User', 'email');
  }
  
  return db.users.create({ email, name });
}
```

---

## Try-Catch 패턴

### 기본 패턴

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  // 1. 로깅
  logger.error('Operation failed', { error, context: { user_id } });
  
  // 2. 에러 변환 또는 재던지기
  if (error instanceof DatabaseError) {
    throw new ExternalServiceError('Database', error);
  }
  
  throw error;
}
```

### 특정 에러 처리

```typescript
try {
  await fetchData();
} catch (error) {
  if (error instanceof NotFoundError) {
    // 404는 기본값 반환
    return getDefaultData();
  }
  
  if (error instanceof ValidationError) {
    // 검증 에러는 사용자에게 표시
    throw error;
  }
  
  // 그 외는 서버 에러로 처리
  throw new AppError('Unexpected error', 'INTERNAL_ERROR', 500);
}
```

---

## 에러 로깅

### 로거 사용

```typescript
import { logger } from './logger';

try {
  await processPayment(order);
} catch (error) {
  logger.error('Payment processing failed', {
    error,
    context: {
      order_id: order.id,
      user_id: order.user_id,
      amount: order.total,
      timestamp: new Date().toISOString()
    }
  });
  
  throw new AppError(
    'Payment processing failed',
    'PAYMENT_ERROR',
    500
  );
}
```

### Console.log 지양

```typescript
// ❌ 나쁜 예
try {
  await operation();
} catch (error) {
  console.log(error); // 프로덕션에서 추적 어려움
}

// ✅ 좋은 예
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error });
}
```

---

## API 에러 응답

### Express 미들웨어

```typescript
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // 1. 로깅
  logger.error('Request failed', {
    error,
    path: req.path,
    method: req.method,
    user_id: req.user?.id
  });
  
  // 2. AppError 처리
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }
  
  // 3. 알 수 없는 에러
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

### 에러 응답 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 비동기 에러 처리

### Async/Await

```typescript
// ✅ 좋은 예
async function fetchUserData(id: string) {
  try {
    const user = await api.getUser(id);
    return user;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new ExternalServiceError('UserAPI', error);
    }
    throw error;
  }
}
```

### Promise Rejection

```typescript
// ✅ 좋은 예: Unhandled rejection 방지
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  // 프로덕션에서는 graceful shutdown
  process.exit(1);
});
```

---

## 체크리스트

에러 처리 구현 후:

- [ ] 모든 에러 케이스 처리
- [ ] 커스텀 에러 클래스 사용
- [ ] 명확한 에러 메시지
- [ ] 에러 로깅 포함
- [ ] API 에러 응답 일관성
- [ ] Try-catch로 감쌈
- [ ] Console.log 제거

---

## 완료 기준

- [ ] 커스텀 에러 클래스 정의
- [ ] 모든 에러 케이스 처리
- [ ] 에러 로깅 설정
- [ ] API 에러 미들웨어 구현
- [ ] Unhandled rejection 처리
