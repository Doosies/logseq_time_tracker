---
name: subagent-communication
description: 서브에이전트와의 효과적인 소통 방법
---

# 서브에이전트 커뮤니케이션

이 Skill은 메인 에이전트가 서브에이전트와 효과적으로 소통하는 방법을 제공합니다.

## 커뮤니케이션 원칙

### 1. 명확성
- 애매한 지시 금지
- 구체적인 작업 범위
- 명확한 완료 조건

### 2. 컨텍스트 제공
- 필요한 정보 모두 제공
- 관련 파일 경로 명시
- 참고할 문서 지정

### 3. 독립성 보장
- 서브에이전트가 독립적으로 작업 가능하도록
- 추가 질문 최소화
- 자율성 존중

---

## 에이전트별 소통 방법

### 기획 에이전트와 소통

#### 호출 시점
- Feature 워크플로우 시작
- Refactor 영향 분석 필요 시
- 아키텍처 변경 검토 시

#### 전달할 정보

```markdown
작업: [구체적인 기획 작업]

**사용자 요청**:
[원본 요청 그대로 전달]

**목표**:
[달성하고자 하는 목표]

**제약사항**:
- 기술적 제약: [예: Node.js 18+, PostgreSQL 필수]
- 비즈니스 제약: [예: GDPR 준수]
- 시간 제약: [예: MVP 2주 내]

**기존 시스템**:
- 관련 파일: [파일 경로들]
- 아키텍처: [현재 아키텍처 설명 또는 참고 문서]

**참고 문서**:
- AGENTS.md (필수)
- .cursor/skills/planner/references/requirement-analysis.md
- .cursor/skills/planner/references/api-design.md

**완료 조건**:
- [ ] 요구사항 문서 작성
- [ ] API 설계 (필요 시)
- [ ] 데이터 모델 설계 (필요 시)
- [ ] 아키텍처 다이어그램 (복잡한 경우)
```

#### 좋은 예시

```markdown
✅ 좋은 예:

작업: 사용자 인증 API 설계

**사용자 요청**:
"로그인/로그아웃 기능 추가해줘"

**목표**:
JWT 기반 사용자 인증 시스템 구축

**제약사항**:
- JWT 토큰 사용 (필수)
- 세션 타임아웃: 1시간
- HTTPS 필수

**기존 시스템**:
- 사용자 DB: PostgreSQL
- 관련 파일: src/models/user.ts
- 기존 API: REST, JSON 응답

**참고 문서**:
- AGENTS.md의 "API 설계" 섹션
- .cursor/skills/planner/references/api-design.md

**완료 조건**:
- [ ] 요구사항 문서 (FR, NFR)
- [ ] API 엔드포인트 설계 (POST /api/auth/login, /logout)
- [ ] 데이터 모델 (User, Session)
- [ ] 에러 응답 정의 (401, 403)
```

#### 나쁜 예시

```markdown
❌ 나쁜 예:

작업: 인증 API 설계

[컨텍스트 부족, 제약사항 없음, 완료 조건 불명확]
```

---

### 구현 에이전트와 소통

#### 호출 시점
- 기획 완료 후 코드 작성
- 버그 수정 구현
- 리팩토링 실행

#### 전달할 정보

```markdown
작업: [구체적인 구현 작업]

**입력**:
- 기획 문서: [문서 경로 또는 내용]
- 기존 코드: [관련 파일 경로]
- API 스펙: [API 설계]

**구현 요구사항**:
- 파일 위치: [어디에 구현할지]
- 함수/클래스명: [명명 규칙에 따라]
- 의존성: [필요한 패키지]

**코딩 컨벤션** (필수):
- 변수명: snake_case
- 함수명: camelCase
- 클래스명: PascalCase
- 상수: UPPER_SNAKE_CASE

**참고 문서**:
- AGENTS.md (필수)
- .cursor/skills/developer/references/code-implementation.md
- .cursor/skills/developer/references/testable-code.md

**완료 조건**:
- [ ] Linter 오류 0개 (필수)
- [ ] 코딩 컨벤션 준수
- [ ] 에러 처리 포함
- [ ] 테스트 가능하게 작성 (의존성 분리)
```

#### 좋은 예시

```markdown
✅ 좋은 예:

작업: 사용자 로그인 API 구현

**입력**:
- API 스펙: POST /api/auth/login
  - Request: { email: string, password: string }
  - Response: { token: string, user: User }
  - Errors: 400, 401
- 기존 코드: src/models/user.ts (User 모델)

**구현 요구사항**:
- 파일: src/api/controllers/auth-controller.ts
- 함수명: loginUser (camelCase)
- 의존성: bcrypt, jsonwebtoken
- DB: PostgreSQL (TypeORM)

**비즈니스 로직**:
1. 이메일로 사용자 조회
2. 비밀번호 검증 (bcrypt)
3. JWT 토큰 생성 (1시간 유효)
4. 토큰 반환

**코딩 컨벤션**:
- 변수명: user_email, password_hash, jwt_token
- 함수명: loginUser, generateToken, validatePassword
- 에러 클래스: AuthenticationError

**참고 문서**:
- AGENTS.md
- .cursor/skills/developer/references/code-implementation.md
- .cursor/skills/error-handling.md

**완료 조건**:
- [ ] Linter 오류 0개
- [ ] 변수명 snake_case, 함수명 camelCase
- [ ] 에러 처리 (try-catch, 커스텀 에러)
- [ ] 의존성 주입 (테스트 가능)
```

---

### QA 에이전트와 소통

#### 호출 시점
- 버그 재현 필요 시
- 구현 완료 후 테스트 작성
- 리팩토링 후 회귀 테스트

#### 전달할 정보

```markdown
작업: [구체적인 테스트 작업]

**테스트 대상**:
- 파일: [테스트할 파일 경로]
- 함수/클래스: [테스트할 대상]
- 요구사항: [기능 요구사항]

**테스트 유형**:
- [ ] 단위 테스트 (필수)
- [ ] 통합 테스트 (API/DB 연동 시)
- [ ] E2E 테스트 (핵심 플로우)
- [ ] 회귀 테스트 (리팩토링 시)

**커버리지 목표**:
- 전체: 80% 이상
- 비즈니스 로직: 90% 이상

**참고 문서**:
- AGENTS.md
- .cursor/skills/qa/references/test-strategy.md
- .cursor/skills/qa/references/coverage-check.md

**완료 조건**:
- [ ] 모든 테스트 통과 (필수)
- [ ] 커버리지 목표 달성
- [ ] 엣지 케이스 테스트 포함
- [ ] 에러 케이스 테스트 포함
```

#### 버그 재현 시

```markdown
작업: 버그 재현 및 테스트 작성

**버그 설명**:
[사용자가 설명한 버그 내용 그대로]

**재현 방법** (가능하면):
1. [단계 1]
2. [단계 2]
3. [예상 결과 vs 실제 결과]

**관련 코드**:
- [버그 의심 파일 경로]

**완료 조건**:
- [ ] 버그 재현 성공
- [ ] 재현 테스트 작성 (실패하는 테스트)
- [ ] 원인 분석 및 보고
```

---

### 문서화 에이전트와 소통

#### 호출 시점
- Feature 완료 후
- API 변경 후
- 복잡한 로직 작성 후

#### 전달할 정보

```markdown
작업: [구체적인 문서화 작업]

**문서화 대상**:
- 파일: [문서화할 파일 경로]
- 함수/클래스: [문서화할 대상]
- API: [API 엔드포인트]

**문서화 유형**:
- [ ] JSDoc/TSDoc (코드 주석)
- [ ] README 업데이트
- [ ] CHANGELOG 작성
- [ ] API 문서 작성

**참고 문서**:
- AGENTS.md
- .cursor/skills/docs-agent/references/code-documentation.md
- .cursor/skills/docs-agent/references/readme-maintenance.md

**완료 조건**:
- [ ] Public API 100% 문서화
- [ ] 복잡한 로직 주석 추가
- [ ] 문서 형식 일관성
```

---

## 피드백 전달 방법

### 승인 시

```markdown
✅ [단계] 승인

체크리스트:
- ✅ [항목 1]
- ✅ [항목 2]
- ✅ [항목 3]

다음 단계로 진행합니다.
```

### 수정 요청 시

```markdown
❌ [단계] 수정 필요

문제점:
1. [구체적인 문제]
   - 현재: [현재 상태]
   - 기대: [기대 상태]
   - 수정 방법: [어떻게 수정해야 하는지]

2. [구체적인 문제]
   ...

수정 후 재제출해주세요.
```

#### 좋은 피드백 예시

```markdown
✅ 좋은 피드백:

❌ 구현 단계 수정 필요

문제점:
1. Linter 오류 3개
   - src/auth.ts:32: 함수명 'create_user'는 camelCase여야 함
   - 수정: function createUser()

2. 변수명 컨벤션 위반
   - src/user.ts:15: 'userCount'는 snake_case여야 함
   - 수정: const user_count = 10;

3. 에러 처리 누락
   - src/api.ts:45: try-catch 없음
   - 수정: 외부 API 호출 시 try-catch 추가

즉시 수정 후 재제출해주세요.
```

#### 나쁜 피드백 예시

```markdown
❌ 나쁜 피드백:

"코드에 문제가 있어요. 수정해주세요."

[구체적이지 않음, 어떤 문제인지, 어떻게 수정해야 하는지 불명확]
```

---

## 컨텍스트 공유 방법

### 파일 경로 명시

```markdown
✅ 좋은 예:
관련 파일:
- src/models/user.ts (User 모델)
- src/services/auth-service.ts (인증 로직)
- tests/auth.test.ts (기존 테스트)

❌ 나쁜 예:
"user 관련 파일들"
```

### 참고 문서 지정

```markdown
✅ 좋은 예:
참고 문서:
- AGENTS.md의 "API 설계" 섹션 (RESTful 원칙)
- .cursor/skills/developer/references/code-implementation.md (구현 체크리스트)

❌ 나쁜 예:
"문서 참고해서 작업"
```

---

## 완료 기준

- [ ] 명확한 작업 지시
- [ ] 충분한 컨텍스트 제공
- [ ] 구체적인 완료 조건
- [ ] 참고 문서 명시
- [ ] 품질 기준 포함
