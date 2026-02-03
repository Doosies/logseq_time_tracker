---
name: input-validation
description: 사용자 입력 및 외부 데이터 검증 가이드
---

# 입력 검증 가이드

이 Skill은 Security 에이전트가 사용자 입력 및 외부 데이터를 검증할 때 사용합니다.

## 검증 원칙

### 1. 허용 목록 (Allowlist) 우선
- 허용할 것을 명시
- 나머지는 모두 거부
- 차단 목록(Blocklist)보다 안전

### 2. 타입 검증
- 예상한 타입인지 확인
- 타입스크립트 타입과 런타임 검증 모두 필요

### 3. 형식 검증
- 이메일, URL, 전화번호 등 형식 확인
- 정규표현식 사용

### 4. 범위 검증
- 최소/최대 길이
- 최소/최대 값
- 허용된 값 목록

---

## 검증 패턴

### 1. 문자열 길이 검증

```typescript
function validateStringLength(
  input: string,
  min: number = 0,
  max: number = 1000
): void {
  if (input.length < min) {
    throw new ValidationError(`Input too short (min: ${min})`);
  }
  
  if (input.length > max) {
    throw new ValidationError(`Input too long (max: ${max})`);
  }
}

// 사용 예시
function createUser(username: string) {
  validateStringLength(username, 3, 20);
  // ...
}
```

---

### 2. 이메일 검증

```typescript
function isValidEmail(email: string): boolean {
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email_pattern.test(email);
}

function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  // 추가: 길이 제한
  validateStringLength(email, 5, 254);
}
```

---

### 3. URL 검증

```typescript
function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // HTTPS만 허용
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // 로컬호스트 거부
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

function validateURL(url: string): void {
  if (!isValidURL(url)) {
    throw new ValidationError('Invalid URL');
  }
}
```

---

### 4. 숫자 범위 검증

```typescript
function validateNumberRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError('Invalid number');
  }
  
  if (value < min) {
    throw new ValidationError(`Value too small (min: ${min})`);
  }
  
  if (value > max) {
    throw new ValidationError(`Value too large (max: ${max})`);
  }
}

// 사용 예시
function setAge(age: number) {
  validateNumberRange(age, 0, 150);
  // ...
}
```

---

### 5. 허용 목록 검증

```typescript
function validateAgainstAllowlist<T>(
  value: T,
  allowlist: T[]
): void {
  if (!allowlist.includes(value)) {
    throw new ValidationError(
      `Value not in allowlist: ${value}. Allowed: ${allowlist.join(', ')}`
    );
  }
}

// 사용 예시
const ALLOWED_ROLES = ['user', 'admin', 'moderator'] as const;

function setUserRole(role: string) {
  validateAgainstAllowlist(role, ALLOWED_ROLES);
  // ...
}
```

---

### 6. 파일 경로 검증

```typescript
import path from 'path';

function validateFilePath(
  file_path: string,
  allowed_dir: string
): void {
  // 1. 상대 경로 금지
  if (file_path.includes('..')) {
    throw new ValidationError('Relative paths not allowed');
  }
  
  // 2. 절대 경로 금지
  if (path.isAbsolute(file_path)) {
    throw new ValidationError('Absolute paths not allowed');
  }
  
  // 3. basename만 추출
  const safe_filename = path.basename(file_path);
  
  // 4. 허용된 디렉토리 내부인지 확인
  const resolved_path = path.resolve(allowed_dir, safe_filename);
  const normalized_allowed = path.resolve(allowed_dir);
  
  if (!resolved_path.startsWith(normalized_allowed)) {
    throw new ValidationError('Path outside allowed directory');
  }
}
```

---

### 7. 전화번호 검증

```typescript
function isValidPhoneNumber(phone: string): boolean {
  // 한국 전화번호 형식
  const phone_pattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phone_pattern.test(phone);
}

function validatePhoneNumber(phone: string): void {
  if (!isValidPhoneNumber(phone)) {
    throw new ValidationError('Invalid phone number format');
  }
}
```

---

## 스키마 기반 검증 (권장)

### Zod 사용

```typescript
import { z } from 'zod';

// 스키마 정의
const UserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['user', 'admin', 'moderator']),
  website: z.string().url().optional(),
});

// 검증
function createUser(data: unknown) {
  try {
    const validated = UserSchema.parse(data);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}
```

---

## 복합 검증 예시

### API 요청 검증

```typescript
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  price: z.number().positive().max(1000000),
  category: z.enum(['electronics', 'clothing', 'food', 'other']),
  tags: z.array(z.string()).max(10),
  image_url: z.string().url().optional(),
});

app.post('/api/products', async (req, res) => {
  try {
    // 1. 스키마 검증
    const validated = CreateProductSchema.parse(req.body);
    
    // 2. 추가 비즈니스 로직 검증
    if (validated.price < 100 && validated.category === 'electronics') {
      throw new ValidationError('Electronics must be priced at least 100');
    }
    
    // 3. 생성
    const product = await Product.create(validated);
    
    res.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

---

## 파일 업로드 검증

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileUpload(file: Express.Multer.File): void {
  // 1. MIME 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }
  
  // 2. 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File too large: ${file.size} bytes (max: ${MAX_FILE_SIZE})`
    );
  }
  
  // 3. 파일 확장자 검증
  const allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed_extensions.includes(ext)) {
    throw new ValidationError(`Invalid file extension: ${ext}`);
  }
  
  // 4. 파일명 검증 (특수문자 제거)
  const safe_filename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (safe_filename !== file.originalname) {
    console.warn('Unsafe filename detected:', file.originalname);
  }
}
```

---

## 종합 검증 함수

```typescript
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

class Validator<T> {
  private rules: ValidationRule<T>[] = [];
  
  add(validate: (value: T) => boolean, message: string): this {
    this.rules.push({ validate, message });
    return this;
  }
  
  validate(value: T): void {
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        throw new ValidationError(rule.message);
      }
    }
  }
}

// 사용 예시
const username_validator = new Validator<string>()
  .add(v => v.length >= 3, 'Username must be at least 3 characters')
  .add(v => v.length <= 20, 'Username must be at most 20 characters')
  .add(v => /^[a-zA-Z0-9_]+$/.test(v), 'Username must be alphanumeric')
  .add(v => !/^[0-9]/.test(v), 'Username cannot start with a number');

function createUser(username: string) {
  username_validator.validate(username);
  // ...
}
```

---

## 검증 미들웨어 (Express)

```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}

// 사용 예시
app.post(
  '/api/users',
  validateBody(UserSchema),
  async (req, res) => {
    // req.body는 이미 검증됨
    const user = await User.create(req.body);
    res.json({ success: true, user });
  }
);
```

---

## 체크리스트

입력 검증 적용 시:

- [ ] 모든 외부 입력 검증
- [ ] 타입 검증
- [ ] 길이/범위 제한
- [ ] 형식 검증 (이메일, URL 등)
- [ ] 허용 목록 사용 (가능 시)
- [ ] 스키마 기반 검증 (권장)
- [ ] 에러 메시지 명확
- [ ] 로그 기록

---

## 완료 기준

- [ ] 모든 API 엔드포인트 입력 검증
- [ ] 모든 파일 업로드 검증
- [ ] 스키마 정의 완료 (Zod 등)
- [ ] 검증 실패 시 적절한 에러 응답
- [ ] 로그 기록 완료
