---
name: api-design
description: RESTful API 설계 가이드
---

# API 설계 가이드

이 Skill은 기획 에이전트가 RESTful API를 설계하는 방법을 제공합니다.

## REST 원칙

### 1. 리소스 중심
URL은 리소스를 나타냄 (동사 아님)

```
✅ /users
✅ /users/123
✅ /users/123/posts

❌ /getUsers
❌ /createUser
❌ /deleteUserById
```

### 2. HTTP 메서드 활용

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | `GET /users` |
| POST | 생성 | `POST /users` |
| PUT | 전체 수정 | `PUT /users/123` |
| PATCH | 부분 수정 | `PATCH /users/123` |
| DELETE | 삭제 | `DELETE /users/123` |

### 3. 상태 코드

| 코드 | 의미 | 사용 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 없음 |
| 500 | Server Error | 서버 오류 |

---

## API 설계 예시

### 사용자 관리 API

```markdown
## 1. 사용자 목록 조회
**GET** `/api/users`

Query Parameters:
- `page`: 페이지 번호 (기본: 1)
- `limit`: 개수 (기본: 10)
- `sort`: 정렬 (`created_at`, `-created_at`)

Response: 200 OK
```json
{
  "data": [
    {
      "id": "123",
      "email": "user@example.com",
      "name": "User Name",
      "created_at": "2024-01-28T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## 2. 사용자 상세 조회
**GET** `/api/users/:id`

Response: 200 OK
```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2024-01-28T10:00:00Z",
    "updated_at": "2024-01-28T10:00:00Z"
  }
}
```

Error: 404 Not Found
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

## 3. 사용자 생성
**POST** `/api/users`

Request Body:
```json
{
  "email": "new@example.com",
  "password": "password123",
  "name": "New User"
}
```

Response: 201 Created
```json
{
  "data": {
    "id": "124",
    "email": "new@example.com",
    "name": "New User",
    "created_at": "2024-01-28T10:30:00Z"
  }
}
```

Error: 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  }
}
```

## 4. 사용자 수정
**PATCH** `/api/users/:id`

Request Body:
```json
{
  "name": "Updated Name"
}
```

Response: 200 OK
```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "Updated Name",
    "updated_at": "2024-01-28T11:00:00Z"
  }
}
```

## 5. 사용자 삭제
**DELETE** `/api/users/:id`

Response: 204 No Content
```

---

## 네이밍 컨벤션

### URL
- 소문자 사용
- 하이픈(`-`) 사용 (언더스코어 `_` 지양)
- 복수형 사용

```
✅ /api/users
✅ /api/blog-posts
✅ /api/order-items

❌ /api/User
❌ /api/blog_posts
❌ /api/user (단수)
```

### 필드명
- camelCase 또는 snake_case 일관성 유지
- 프로젝트 전체 동일한 규칙

```json
// snake_case (프로젝트 컨벤션)
{
  "user_id": "123",
  "created_at": "2024-01-28"
}
```

---

## API 문서 템플릿

```markdown
# API 문서: [기능명]

## 기본 정보
- Base URL: `https://api.example.com`
- Version: `v1`
- Authentication: Bearer Token

## 엔드포인트 목록

### 1. [엔드포인트명]

**Method** `Path`

#### Description
...

#### Authentication
Required / Not Required

#### Request

**Path Parameters:**
- `id` (string, required): ...

**Query Parameters:**
- `page` (number, optional): ...

**Request Body:**
```json
{
  "field": "value"
}
```

#### Response

**Success (200 OK):**
```json
{
  "data": {}
}
```

**Errors:**
- 400: Validation Error
- 404: Not Found

#### Example

Request:
```bash
curl -X GET https://api.example.com/users/123 \
  -H "Authorization: Bearer token"
```

Response:
```json
{
  "data": {
    "id": "123"
  }
}
```
```

---

## 체크리스트

- [ ] REST 원칙 준수
- [ ] 리소스 중심 URL
- [ ] HTTP 메서드 적절히 사용
- [ ] 상태 코드 명확
- [ ] 에러 응답 정의
- [ ] 페이지네이션 설계
- [ ] 인증/인가 명시

## 완료 기준

- [ ] API 문서 작성
- [ ] 모든 엔드포인트 정의
- [ ] 요청/응답 형식 명시
- [ ] 에러 케이스 정의
