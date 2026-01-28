---
name: quality-gate
description: 각 단계 품질 검증 기준 및 방법
---

# 품질 게이트

이 Skill은 메인 에이전트가 각 단계를 검증하는 구체적인 방법을 제공합니다.

## 품질 게이트란?

각 워크플로우 단계 완료 후 **다음 단계로 진행하기 전** 수행하는 검증입니다.

**목적**:
- 품질 저하 방지
- 조기 오류 발견
- 재작업 최소화

---

## Gate 1: 기획 단계 후

### 체크리스트

#### 1. 요구사항 명확성
- [ ] 기능 요구사항이 구체적인가?
- [ ] 비기능 요구사항이 정의되었는가?
- [ ] 수락 기준이 명확한가?
- [ ] 제약사항이 명시되었는가?

**검증 방법**:
```markdown
요구사항 문서 읽기
→ 각 요구사항이 "무엇을", "어떻게", "왜"를 포함하는지 확인
→ 애매한 표현 ("적절히", "가능하면") 없는지 확인
```

**통과 예시**:
```markdown
✅ 명확:
"사용자는 이메일과 비밀번호로 로그인할 수 있다.
- 로그인 성공 시: JWT 토큰 발급, 대시보드로 리다이렉트
- 로그인 실패 시: "이메일 또는 비밀번호가 잘못되었습니다" 표시"

❌ 불명확:
"사용자 로그인 기능"
```

#### 2. 아키텍처 일관성
- [ ] 기존 시스템 아키텍처와 일치하는가?
- [ ] 레이어 구조를 따르는가?
- [ ] 의존성 방향이 올바른가?

**검증 방법**:
```markdown
설계 다이어그램 확인
→ 기존 코드베이스 구조와 비교
→ 불일치 시 수정 요청
```

#### 3. API 설계 품질
- [ ] RESTful 원칙을 따르는가?
- [ ] URL이 리소스 중심인가?
- [ ] HTTP 메서드가 적절한가?
- [ ] 상태 코드가 명확한가?

**검증 방법**:
```markdown
API 스펙 검토
→ AGENTS.md의 API 설계 섹션과 비교
→ 위반 사항 확인
```

**실패 예시 및 피드백**:
```markdown
❌ 실패:
API: GET /createUser

피드백:
"API 설계가 RESTful 원칙을 따르지 않습니다.
- URL에 동사(createUser) 사용 금지
- 사용자 생성은 POST 메서드 사용
→ 수정: POST /api/users"
```

### 승인/거부 결정

**승인 조건**:
- 모든 체크리스트 항목 통과

**거부 시 행동**:
1. 구체적인 피드백 작성
2. 기획 에이전트에게 수정 요청
3. 수정 완료 후 재검증

---

## Gate 2: 구현 단계 후

### 체크리스트

#### 1. Linter 검증 (필수)
- [ ] **Linter 오류 0개** (절대 조건)

**검증 방법**:
```bash
npm run lint
```

**결과 분석**:
```markdown
✅ 통과:
No linting errors found.

❌ 실패:
3 errors found:
1. src/user.ts:15 - Unused variable 'userCount'
2. src/auth.ts:32 - Function name 'create_user' should be camelCase
3. src/api.ts:45 - Missing semicolon

→ 즉시 수정 요청
```

#### 2. 코딩 컨벤션
- [ ] 변수명: `snake_case`
- [ ] 함수명: `camelCase`
- [ ] 클래스명: `PascalCase`
- [ ] 상수: `UPPER_SNAKE_CASE`

**검증 방법**:
```markdown
코드 읽기
→ 변수/함수/클래스명 확인
→ AGENTS.md 컨벤션과 비교
```

**실패 예시**:
```typescript
// ❌ 실패
const userCount = 10;  // snake_case여야 함
function create_user() {}  // camelCase여야 함

// ✅ 통과
const user_count = 10;
function createUser() {}
```

#### 3. 설계 일치성
- [ ] 기획 문서와 일치하는가?
- [ ] API 시그니처가 동일한가?
- [ ] 데이터 구조가 동일한가?

**검증 방법**:
```markdown
기획 문서와 구현 코드 비교
→ 차이점 확인
→ 불일치 시 이유 확인 (개선인지, 실수인지)
```

#### 4. 에러 처리
- [ ] 모든 에러 케이스 처리되었는가?
- [ ] 에러 메시지가 명확한가?
- [ ] 에러 로깅이 포함되었는가?

**검증 방법**:
```markdown
코드 리뷰
→ try-catch 블록 확인
→ 에러 처리 누락 확인
```

### 승인/거부 결정

**승인 조건**:
- Linter 오류 0개 (필수)
- 코딩 컨벤션 준수
- 설계와 일치

**거부 시 행동**:
```markdown
피드백 예시:
"❌ 구현 단계 실패

Linter 오류:
1. src/auth.ts:32 - 함수명 'create_user'는 camelCase여야 함
2. src/api.ts:45 - 세미콜론 누락

코딩 컨벤션 위반:
1. src/user.ts:15 - 변수 'userCount'는 snake_case여야 함
   → 수정: user_count

즉시 수정 후 재제출해주세요."
```

---

## Gate 3: QA 단계 후

### 체크리스트

#### 1. 테스트 통과 (필수)
- [ ] **모든 테스트 통과** (절대 조건)

**검증 방법**:
```bash
npm test
```

**결과 분석**:
```markdown
✅ 통과:
Tests: 15 passed, 15 total

❌ 실패:
Tests: 13 passed, 2 failed, 15 total

Failed:
1. calculateTotal › should handle empty array
2. validateEmail › should reject null input

→ 즉시 수정 요청
```

#### 2. 커버리지
- [ ] 전체 커버리지 80% 이상
- [ ] 비즈니스 로직 90% 이상

**검증 방법**:
```bash
npm test -- --coverage
```

**결과 분석**:
```markdown
✅ 통과:
Coverage: 85% (Line), 82% (Branch)

⚠️ 경고:
Coverage: 72% (Line)
→ 추가 테스트 필요

❌ 실패:
Coverage: 45% (Line)
→ 대폭 개선 필요
```

#### 3. 엣지 케이스
- [ ] 빈 입력 테스트
- [ ] null/undefined 테스트
- [ ] 경계값 테스트
- [ ] 에러 케이스 테스트

**검증 방법**:
```markdown
테스트 코드 리뷰
→ describe 블록 확인
→ 엣지 케이스 테스트 있는지 확인
```

#### 4. 회귀 테스트 (리팩토링 시)
- [ ] 기존 테스트 모두 통과

**검증 방법**:
```markdown
전체 테스트 실행
→ 실패한 테스트 있는지 확인
→ 있으면 회귀 발생
```

### 승인/거부 결정

**승인 조건**:
- 모든 테스트 통과 (필수)
- 커버리지 80% 이상
- 엣지 케이스 포함

**거부 시 행동**:
```markdown
피드백 예시:
"❌ QA 단계 실패

테스트 실패:
1. calculateTotal: 빈 배열 처리 실패
   Expected: 0
   Received: undefined

2. validateEmail: null 입력 처리 실패
   Expected: throw Error
   Received: undefined

커버리지:
현재: 72%
목표: 80%
부족: src/utils.ts (45%), src/api.ts (60%)

추가 테스트 작성 후 재제출해주세요."
```

---

## Gate 4: 문서화 단계 후

### 체크리스트

#### 1. Public API 문서화
- [ ] 모든 export 함수/클래스 문서화
- [ ] JSDoc/TSDoc 형식 준수
- [ ] 파라미터/반환값 설명

**검증 방법**:
```markdown
코드 읽기
→ export된 함수/클래스 찾기
→ JSDoc 있는지 확인
```

#### 2. 복잡한 로직 주석
- [ ] 복잡한 알고리즘 설명
- [ ] 비직관적인 코드 설명

**검증 방법**:
```markdown
코드 리뷰
→ 복잡한 로직 찾기
→ 주석 있는지 확인
```

#### 3. 문서 업데이트
- [ ] README 업데이트 (필요 시)
- [ ] CHANGELOG 작성 (버전 변경 시)

### 승인/거부 결정

**승인 조건**:
- Public API 100% 문서화
- 복잡한 로직 주석

**거부 시 행동**:
```markdown
피드백 예시:
"❌ 문서화 단계 실패

누락된 문서:
1. createUser 함수: JSDoc 없음
2. UserService 클래스: JSDoc 없음

Public API는 반드시 문서화해야 합니다.
JSDoc 추가 후 재제출해주세요."
```

---

## 최종 승인 게이트

### 체크리스트

- [ ] 사용자 요청을 완전히 충족하는가?
- [ ] 모든 품질 게이트를 통과했는가?
- [ ] 부작용이 없는가? (기존 기능 정상)
- [ ] 프로젝트 컨벤션을 준수했는가?

### 최종 승인 메시지

```markdown
✅ 작업 완료!

요청: [사용자 요청]

변경 사항:
- src/services/user-service.ts: createUser 함수 추가
- tests/user-service.test.ts: 단위 테스트 10개 추가
- README.md: API 사용법 업데이트

품질 지표:
- Linter 오류: 0개
- 테스트 통과: 100% (10/10)
- 커버리지: 85%
- 문서화: Public API 100%

모든 품질 게이트를 통과했습니다.
```

---

## 완료 기준

- [ ] 모든 품질 게이트 정의 명확
- [ ] 검증 방법 구체적
- [ ] 승인/거부 기준 명확
- [ ] 피드백 예시 포함
