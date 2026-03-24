# RESTful API 엔드포인트 추가 워크플로우

이 문서는 RESTful API 엔드포인트를 추가할 때 사용하는 도메인 특화 워크플로우입니다.
프로젝트의 API 설계 가이드 및 보안 체크를 따릅니다.

---

## 0. 사전 확인

워크플로우 시작 전 확인:

- [ ] API 대상 서버/프레임워크 확정 (Express, Fastify 등)
- [ ] `plan-execution` 워크플로우 0단계(사이클 메트릭) 적용 여부 확인 (Feature 시)
- [ ] 기존 API 라우터 구조 파악

---

## 1. API 설계

**담당**: planner

### 1.1 엔드포인트 정의

- [ ] **경로**: REST 규칙 준수 (리소스 중심, 소문자, 하이픈, 복수형)
- [ ] **HTTP 메서드**: GET / POST / PUT / PATCH / DELETE
- [ ] **인증/인가**: 필요 여부 명시

**예시**:

```markdown
GET    /api/users          목록 조회
GET    /api/users/:id      상세 조회
POST   /api/users          생성
PUT    /api/users/:id      전체 수정
PATCH  /api/users/:id      부분 수정
DELETE /api/users/:id      삭제
```

### 1.2 Request/Response 스키마

- [ ] Request Body (JSON) 스키마 정의
- [ ] Response Body (JSON) 스키마 정의
- [ ] Query Parameters 정의
- [ ] Path Parameters 정의

**예시**:

```json
// POST /api/users Request
{
  "email": "new@example.com",
  "password": "password123",
  "name": "New User"
}

// POST /api/users Response (201 Created)
{
  "data": {
    "id": "124",
    "email": "new@example.com",
    "name": "New User",
    "created_at": "2024-01-28T10:30:00Z"
  }
}
```

### 1.3 에러 코드 정의

- [ ] 400 Bad Request: Validation Error
- [ ] 401 Unauthorized: 인증 필요
- [ ] 403 Forbidden: 권한 없음
- [ ] 404 Not Found: 리소스 없음
- [ ] 500 Internal Server Error: 서버 오류

**에러 응답 형식**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Email already exists" }
    ]
  }
}
```

---

## 2. 구현

**담당**: developer

### 2.1 라우터 추가

- [ ] 기존 라우터 구조에 맞게 추가
- [ ] URL 네이밍: snake_case 또는 project-conventions 준수

**코드 예시** (Express):

```typescript
// router.ts
router.get('/api/users', listUsersHandler);
router.get('/api/users/:id', getUserByIdHandler);
router.post('/api/users', createUserHandler);
router.patch('/api/users/:id', updateUserHandler);
router.delete('/api/users/:id', deleteUserHandler);
```

### 2.2 핸들러 함수 작성

- [ ] 변수명 `snake_case`
- [ ] 함수명 `camelCase`
- [ ] 에러 처리 포함 (try-catch, 적절한 상태 코드)

**코드 예시**:

```typescript
async function createUserHandler(req: Request, res: Response) {
    try {
        const body = createUserSchema.parse(req.body);
        const user = await createUser(body);
        res.status(201).json({ data: user });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: error.errors,
                },
            });
        } else {
            res.status(500).json();
        }
    }
}
```

### 2.3 입력 검증

- [ ] Zod 또는 유사 라이브러리로 스키마 정의
- [ ] Request Body 검증
- [ ] Query Parameters 검증

**코드 예시** (Zod):

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
});
```

### 2.4 에러 처리

- [ ] 커스텀 에러 클래스 또는 `Error` 활용
- [ ] 에러 로깅
- [ ] 사용자에게 노출할 메시지와 내부 메시지 구분

---

## 3. 테스트

**담당**: qa

### 3.1 단위 테스트 (핸들러)

- [ ] 핸들러 함수 단위 테스트
- [ ] Mock Request/Response 사용
- [ ] 성공 케이스
- [ ] 에러 케이스 (Validation, 404, 500 등)

**코드 예시**:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createUserHandler } from './user-handler';

describe('createUserHandler', () => {
    it('유효한 요청 시 201과 사용자 데이터를 반환한다', async () => {
        const req = { body: { email: 'test@test.com', password: '12345678', name: 'Test' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        await createUserHandler(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Object) }));
    });

    it('잘못된 이메일 시 400을 반환한다', async () => {
        const req = { body: { email: 'invalid', password: '12345678', name: 'Test' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        await createUserHandler(req as any, res as any);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
```

### 3.2 통합 테스트 (E2E)

- [ ] 실제 HTTP 요청으로 서버 호출
- [ ] 요청/응답 형식 검증
- [ ] 에러 케이스 테스트

### 3.3 테스트 설명

- [ ] 모든 테스트 설명 한글로 작성

---

## 4. 문서화

**담당**: docs

- [ ] OpenAPI/Swagger 스펙
- [ ] 예제 Request/Response
- [ ] 에러 코드 문서

**예시** (OpenAPI 스펙):

```yaml
paths:
  /api/users:
    post:
      summary: 사용자 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
                name: { type: string }
      responses:
        '201':
          description: 생성 성공
        '400':
          description: Validation Error
```

---

## 5. 보안 검증

**담당**: security

- [ ] 입력 검증 (SQL Injection, XSS 등)
- [ ] 인증/인가 검증
- [ ] 민감 정보 노출 여부
- [ ] Rate Limiting 검토

---

## 6. 품질 검증

**담당**: qa

**실행 순서**:

1. [ ] **ReadLints** (변경된 파일 경로 지정)
2. [ ] **format** (프로젝트 스크립트)
3. [ ] **test** (프로젝트 스크립트)
4. [ ] **lint** (프로젝트 스크립트)
5. [ ] **type-check** (프로젝트 스크립트)
6. [ ] **build** (프로젝트 스크립트)

---

## 7. 후속 단계 (plan-execution 워크플로우 연동)

- [ ] Docs: CHANGELOG, API 문서 업데이트
- [ ] git-workflow: 커밋 메시지 생성, 커밋

---

## 체크리스트 요약

| 단계 | 항목 | 상태 |
|------|------|------|
| 1 | API 설계 (경로, 메서드, 스키마, 에러) | ☐ |
| 2 | 구현 (라우터, 핸들러, 검증, 에러 처리) | ☐ |
| 3 | 테스트 (단위, 통합, 에러 케이스) | ☐ |
| 4 | 문서화 (OpenAPI, 예제) | ☐ |
| 5 | 보안 검증 | ☐ |
| 6 | 품질 검증 | ☐ |

---

## 참고

- [플랜 실행 워크플로우](../plan-execution-workflow.md)
- [API 설계 가이드](../../skills/planner/references/api-design.md)
- [API 보안 체크](../../skills/security/references/api-security-check.md)
- [에러 처리 SKILL](../../skills/error-handling/SKILL.md)
