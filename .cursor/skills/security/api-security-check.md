---
name: api-security-check
description: API 보안 (인증, 인가, Rate Limiting 등) 체크 가이드
---

# API 보안 체크 가이드

이 Skill은 Security 에이전트가 API 보안을 검증할 때 사용합니다.

## 보안 체크 영역

### 1. 인증 (Authentication)
### 2. 인가 (Authorization)
### 3. Rate Limiting
### 4. HTTPS 강제
### 5. CORS 설정
### 6. 보안 헤더
### 7. 입력 검증

---

## 1. 인증 (Authentication)

### 인증 방식

#### JWT (JSON Web Token)
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1h';

function generateToken(user_id: string): string {
  return jwt.sign({ user_id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyToken(token: string): { user_id: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { user_id: string };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}
```

#### 인증 미들웨어
```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user_id?: string;
}

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const auth_header = req.headers['authorization'];
  const token = auth_header?.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const payload = verifyToken(token);
    req.user_id = payload.user_id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 사용 예시
app.get('/api/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user_id);
  res.json({ user });
});
```

---

## 2. 인가 (Authorization)

### 역할 기반 접근 제어 (RBAC)

```typescript
type Role = 'user' | 'admin' | 'moderator';

interface User {
  id: string;
  role: Role;
}

function requireRole(...allowed_roles: Role[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user_id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findById(req.user_id);
    
    if (!user || !allowed_roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// 사용 예시
app.delete(
  '/api/users/:id',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    await User.delete(req.params.id);
    res.json({ success: true });
  }
);
```

### 리소스 기반 접근 제어

```typescript
async function canAccessResource(
  user_id: string,
  resource_id: string
): Promise<boolean> {
  const resource = await Resource.findById(resource_id);
  
  if (!resource) {
    return false;
  }
  
  // 소유자만 접근 가능
  if (resource.owner_id !== user_id) {
    return false;
  }
  
  return true;
}

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  const post_id = req.params.id;
  
  // 권한 확인
  const can_access = await canAccessResource(req.user_id!, post_id);
  if (!can_access) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // 수정
  await Post.update(post_id, req.body);
  res.json({ success: true });
});
```

---

## 3. Rate Limiting

### Express Rate Limit

```typescript
import rateLimit from 'express-rate-limit';

// 일반 API: 100 requests / 15 minutes
const api_limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// 로그인 API: 5 requests / 15 minutes
const auth_limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
  skipSuccessfulRequests: true,
});

app.use('/api/', api_limiter);
app.post('/api/auth/login', auth_limiter, async (req, res) => {
  // 로그인 로직
});
```

### 사용자별 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis();

const user_limiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10,
  keyGenerator: (req) => req.user_id || req.ip, // 사용자 ID 기반
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:',
  }),
});

app.use('/api/', authenticateToken, user_limiter);
```

---

## 4. HTTPS 강제

```typescript
function requireHTTPS(req: Request, res: Response, next: NextFunction) {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
}

// Production에서만 적용
if (process.env.NODE_ENV === 'production') {
  app.use(requireHTTPS);
}
```

---

## 5. CORS 설정

```typescript
import cors from 'cors';

// ❌ 위험: 모든 도메인 허용
app.use(cors());

// ✅ 안전: 특정 도메인만 허용
const cors_options = {
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24시간
};

app.use(cors(cors_options));

// 동적 origin 검증
const allowed_origins = ['https://example.com', 'https://app.example.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowed_origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
```

---

## 6. 보안 헤더

### Helmet 사용

```typescript
import helmet from 'helmet';

app.use(helmet());

// 또는 개별 설정
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1년
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })
);
```

### 주요 보안 헤더

```typescript
// X-Content-Type-Options: MIME 스니핑 방지
res.setHeader('X-Content-Type-Options', 'nosniff');

// X-Frame-Options: 클릭재킹 방지
res.setHeader('X-Frame-Options', 'DENY');

// X-XSS-Protection: XSS 필터 활성화
res.setHeader('X-XSS-Protection', '1; mode=block');

// Strict-Transport-Security: HTTPS 강제
res.setHeader(
  'Strict-Transport-Security',
  'max-age=31536000; includeSubDomains; preload'
);

// Content-Security-Policy: XSS 방어
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self'"
);
```

---

## 7. API 설계 보안 체크리스트

### 민감한 작업에 인증 필요

```typescript
// ❌ 위험: 인증 없이 삭제 가능
app.delete('/api/users/:id', async (req, res) => {
  await User.delete(req.params.id);
  res.json({ success: true });
});

// ✅ 안전: 인증 + 인가
app.delete(
  '/api/users/:id',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    await User.delete(req.params.id);
    res.json({ success: true });
  }
);
```

### 민감 정보 응답에서 제외

```typescript
// ❌ 위험: 비밀번호 해시 노출
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ user }); // password_hash 포함
});

// ✅ 안전: 민감 정보 제외
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  
  // password_hash, secret_key 등 제외
  const { password_hash, secret_key, ...safe_user } = user;
  
  res.json({ user: safe_user });
});
```

### IDOR (Insecure Direct Object Reference) 방지

```typescript
// ❌ 위험: 다른 사용자의 데이터 접근 가능
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json({ order });
});

// ✅ 안전: 소유자 확인
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (order.user_id !== req.user_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json({ order });
});
```

---

## 종합 보안 체크 함수

```typescript
interface APISecurityIssue {
  endpoint: string;
  method: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

function checkAPIEndpoint(
  path: string,
  method: string,
  middlewares: string[]
): APISecurityIssue[] {
  const issues: APISecurityIssue[] = [];
  
  // 1. 인증 체크 (민감한 작업)
  const sensitive_methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (sensitive_methods.includes(method)) {
    if (!middlewares.includes('authenticateToken')) {
      issues.push({
        endpoint: path,
        method,
        issue: '인증 미들웨어 없음',
        severity: 'critical',
        recommendation: 'authenticateToken 미들웨어 추가',
      });
    }
  }
  
  // 2. Rate Limiting 체크
  if (!middlewares.includes('rateLimiter')) {
    issues.push({
      endpoint: path,
      method,
      issue: 'Rate Limiting 없음',
      severity: 'medium',
      recommendation: 'Rate Limiting 미들웨어 추가',
    });
  }
  
  // 3. 입력 검증 체크
  if (method === 'POST' || method === 'PUT') {
    if (!middlewares.includes('validateBody')) {
      issues.push({
        endpoint: path,
        method,
        issue: '입력 검증 없음',
        severity: 'high',
        recommendation: 'validateBody 미들웨어 추가',
      });
    }
  }
  
  return issues;
}
```

---

## 체크리스트

API 보안 체크 시:

- [ ] 모든 민감한 엔드포인트에 인증
- [ ] 역할 기반 인가 (필요 시)
- [ ] Rate Limiting 적용
- [ ] HTTPS 강제 (Production)
- [ ] CORS 적절히 설정
- [ ] 보안 헤더 적용 (Helmet)
- [ ] 입력 검증 적용
- [ ] 민감 정보 응답에서 제외
- [ ] IDOR 방지

---

## 완료 기준

- [ ] 모든 API 엔드포인트 보안 검증
- [ ] Critical 이슈 0개
- [ ] High 이슈 해결 또는 위험 수용
- [ ] 보안 설정 문서화
- [ ] 로그 기록 완료
