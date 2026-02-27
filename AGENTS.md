# 프로젝트 에이전트 시스템 가이드

이 문서는 모든 에이전트가 참조하는 공통 가이드입니다. 서브에이전트는 User Rules를 받지 못하므로, 모든 공통 규칙이 이 문서에 포함됩니다.

---

## 공통 코딩 컨벤션

### 네이밍 규칙

#### 변수명: snake_case
```typescript
// ✅ 올바른 예
const user_count = 10;
const max_retry_count = 3;
const is_authenticated = true;
const api_response_data = {};

// ❌ 잘못된 예
const userCount = 10;
const maxRetryCount = 3;
```

#### 함수명: camelCase
```typescript
// ✅ 올바른 예
function calculateTotal() {}
function fetchUserData() {}
function isValidEmail() {}
async function processPayment() {}

// ❌ 잘못된 예
function calculate_total() {}
function FetchUserData() {}
```

#### 클래스명: PascalCase
```typescript
// ✅ 올바른 예
class UserManager {}
class PaymentProcessor {}
class ApiClient {}

// ❌ 잘못된 예
class userManager {}
class payment_processor {}
```

#### 상수: UPPER_SNAKE_CASE
```typescript
// ✅ 올바른 예
const MAX_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

// ❌ 잘못된 예
const maxAttempts = 3;
const apiBaseUrl = 'https://api.example.com';
```

### 품질 기준

#### Linter 오류: 0개 (필수)
- 모든 코드는 linter 오류가 없어야 합니다
- 코드 작성 후 즉시 linter 실행
- 오류 발견 시 즉시 수정
- 다시 돌아오지 않습니다

#### 테스트 커버리지: 80% 이상
- 새로운 함수/모듈 작성 시 테스트 필수
- 단위 테스트 우선
- 핵심 로직은 90%+ 목표

#### 모든 테스트 통과: 필수
- 테스트 실패 시 배포 불가
- 회귀 테스트 통과 확인
- 새 코드가 기존 테스트를 깨뜨리지 않음

#### 성능 저하: 10% 이내 허용
- 리팩토링 시 성능 측정
- 새 기능 추가 시 벤치마크
- 10% 이상 저하 시 최적화 필요

### 개발 원칙

#### 1. 가정 금지
- 모든 판단은 실제 코드 분석 기반
- 추측하지 않고 확인합니다
- 코드를 직접 읽고 분석합니다

```typescript
// ❌ 나쁜 예: 가정
// "아마 이 함수는 배열을 반환할 것 같아요"

// ✅ 좋은 예: 확인
// 파일을 읽고 함수 시그니처 확인
// function getUsers(): User[] { ... }
```

#### 2. 코드 직접 읽기
- 주석이 아닌 실제 코드 확인
- 주석은 최신이 아닐 수 있습니다
- 구현을 직접 읽고 이해합니다

```typescript
// ❌ 나쁜 예
// 주석: "이 함수는 사용자를 삭제합니다"
// → 주석만 믿고 진행

// ✅ 좋은 예
// 함수 본문을 읽고 실제로 soft delete인지 hard delete인지 확인
function deleteUser(id: string) {
  return db.update({ deleted_at: new Date() }); // soft delete
}
```

#### 3. 에러 즉시 해결
- 에러 발견 시 즉시 해결하고 넘어갑니다
- "나중에 고치자"는 없습니다
- 다시 돌아오지 않습니다

#### 4. 현재 목표 집중
- 현재 수행 중인 목표와 관련 없는 코드는 수정하지 않습니다
- 발견한 문제는 별도 이슈로 기록
- 범위 확장을 피합니다

### 교훈 기반 원칙 (실전에서 도출)

다음 원칙은 실제 발생한 문제에서 도출되었으며, 해당 에이전트 정의 파일에 상세 규칙으로 반영되어 있습니다:

| 교훈 | 적용 에이전트 | 핵심 규칙 |
|------|----------------|-----------|
| 외부 라이브러리 API 추측 금지 | Developer | `.d.ts` 파일 직접 확인, 메서드/프로퍼티명 추측 금지 |
| 라이브러리 마이그레이션 시 UI/UX 보존 | Developer, Planner | 기존 variant/시각 요소 문서화 후 동일 구현 |
| 테스트 setup에서 prototype 오염 금지 | QA | `Object.prototype` 등 built-in 수정 절대 금지 |
| 에러 억제 금지 | QA | `process.on('uncaughtException')` 등 에러 숨기기 금지, 근본 원인 분석 |
| 서브에이전트 결과 즉시 검증 | 메인 | 코드 반환 시 ReadLints, 위험 패턴 grep 필수 |

---

## 에이전트 역할 정의

### 메인 에이전트 (시니어 개발자)

**역할:**
- 사용자 요청 분석 및 목표 정의
- 워크플로우 패턴 선택
- 품질 기준 설정
- 각 단계 검증
- 최종 승인

**책임:**
- 전체 품질 보증
- 워크플로우 제어
- 서브에이전트 조율

**권한:**
- 모든 워크플로우 제어
- 품질 게이트 통과/거부
- 서브에이전트 호출/중단

**출력:**
- 작업 목표 정의
- 선택된 워크플로우
- 각 단계 검증 결과
- 최종 승인/거부

---

### 워크플로우 관리자 (조건부 호출)

**역할:**
- 복잡한 멀티 태스크 분해
- 서브에이전트 선택 및 조율
- 의존성 관리
- 병렬 실행 최적화
- 진행 상황 모니터링

**호출 조건:**
- 5개 이상 파일 동시 작업
- 3개 이상 서브에이전트 병렬 실행
- 복잡한 의존성 관리 필요
- 예상 시간 30분 이상

**입력:**
- 메인 에이전트의 목표 정의
- 프로젝트 컨텍스트
- 사용 가능한 서브에이전트 목록

**출력:**
- 작업 분해 계획
- 에이전트 할당 및 순서
- 진행 상황 리포트

---

### 기획/설계 에이전트

**역할:**
- 요구사항 분석 및 문서화
- 시스템 아키텍처 설계
- API 설계 (RESTful/GraphQL)
- 기술 스택 선정 및 정당화
- 데이터 모델 설계

**입력:**
- 사용자 요청 또는 목표 정의
- 기존 시스템 구조
- 기술적 제약사항

**출력:**
- 요구사항 문서
- 아키텍처 다이어그램
- API 스펙
- 기술 스택 선정 이유
- 데이터 모델
- 구현 가이드라인

**특징:**
- 구현 전 설계 단계 담당
- 기술적 의사결정 문서화
- 아키텍처 일관성 보장

---

### 구현 에이전트

**역할:**
- 설계에 따른 코드 작성
- 리팩토링 수행
- 의존성 관리
- 코드 컨벤션 준수
- 테스트 가능한 코드 작성

**입력:**
- 설계 문서
- 구현 가이드라인
- 기존 코드베이스

**출력:**
- 작성된 코드
- 리팩토링된 코드
- 업데이트된 의존성

**필수 준수 사항:**
- 변수명: `snake_case`
- 함수명: `camelCase`
- 모든 linter 오류 즉시 해결
- 에러 처리 포함
- 테스트 가능하게 작성 (의존성 분리)

**특징:**
- 가장 많은 코드 변경 수행
- QA 에이전트와 긴밀한 협업
- 설계 문서 엄격히 준수

---

### 품질 보증 (QA) 에이전트

**역할:**
- 코드 리뷰 수행
- 단위 테스트 작성 및 실행
- 통합 테스트 작성 및 실행
- E2E 테스트 작성 및 실행 (선택적)
- 커버리지 체크 (80% 목표)
- 성능 검증

**입력:**
- 구현된 코드
- 테스트 요구사항
- 품질 기준

**출력:**
- 코드 리뷰 결과
- 테스트 코드
- 테스트 결과 리포트
- 커버리지 리포트
- 성능 측정 결과

**품질 게이트:**
- Linter 오류: 0개
- 테스트 커버리지: 80% 이상
- 모든 테스트 통과
- 성능 저하: 10% 이내

**특징:**
- 품질 게이트 역할
- 구현 에이전트에게 피드백
- 가장 많은 재시도 발생 가능

---

### 문서화 에이전트

**역할:**
- 코드 문서 작성 (JSDoc/TSDoc)
- API 문서 생성 (OpenAPI/Swagger)
- README 업데이트
- CHANGELOG 작성
- 사용자 가이드 작성
- 아키텍처 문서 업데이트

**입력:**
- 구현된 코드
- API 엔드포인트
- 변경사항 목록
- 기존 문서

**출력:**
- 코드 주석 (JSDoc/TSDoc)
- API 문서
- README.md 업데이트
- CHANGELOG.md 항목
- 사용자 가이드

**문서화 대상:**
- Public API (필수)
- 복잡한 알고리즘 (필수)
- 설정 파일 (필수)
- Private 함수 (복잡한 경우만)

**특징:**
- 워크플로우의 마지막 단계
- 향후 유지보수를 위한 핵심 자산 생성
- 간단한 코드는 문서화 생략 가능

---

### 보안 (Security) 에이전트

**역할:**
- 프롬프트 인젝션 공격 탐지 및 방어
- 민감 정보 (API 키, 비밀번호, 토큰) 탐지 및 보호
- 코드 보안 취약점 스캔 (SQL Injection, XSS, CSRF 등)
- 외부 API 호출 및 사용자 입력 검증
- 파일 접근 권한 검증
- 의존성 보안 취약점 체크

**입력:**
- 설계 문서 (API 설계, 데이터 모델)
- 구현된 코드
- 외부 API 응답
- 사용자 입력 데이터
- 파일 경로 및 접근 요청

**출력:**
- 보안 검증 결과 (통과/차단)
- 발견된 취약점 목록 (Critical/High/Medium)
- 보안 권장 사항
- 샌드박싱 처리 결과
- 민감 정보 탐지 리포트

**품질 게이트:**
- 보안 취약점: 0개 (Critical/High 필수)
- 민감 정보 노출: 0건
- 프롬프트 인젝션 차단율: 100%
- 안전하지 않은 코드 패턴: 0개

**특징:**
- 예방 우선, 다층 방어
- 자율 에이전트 시스템에 필수적
- 외부 자원 접근 시 게이트키퍼 역할
- 설계/구현/배포 전 각 단계에서 검증

**호출 시점:**
- **설계 단계 후**: API 설계, 데이터 모델 보안 검토
- **구현 단계 후**: 코드 보안 취약점 스캔
- **외부 접근 시**: API 호출, 파일 읽기, 사용자 입력 처리 전
- **배포 전**: 최종 종합 보안 검증

---

## 서브에이전트 호출 규칙

### 메인 에이전트가 서브에이전트 호출 시

#### 1. 명확한 작업 범위 전달
```markdown
✅ 좋은 예:
"사용자 인증 API를 설계해주세요. 
- 엔드포인트: /api/auth/login, /api/auth/logout
- 인증 방식: JWT
- 응답 형식: JSON
- 에러 처리: 401, 403 구분"

❌ 나쁜 예:
"인증 API 설계"
```

#### 2. 필요한 컨텍스트 명시
- 기존 시스템 구조
- 관련 파일 경로
- 제약사항
- 참고할 코드

#### 3. 품질 기준 명시
- 테스트 커버리지 목표
- 성능 기준
- 보안 요구사항
- 코딩 컨벤션

#### 4. 완료 조건 명확화
```markdown
완료 조건:
- [ ] 3개 API 엔드포인트 구현
- [ ] 단위 테스트 10개 이상
- [ ] 커버리지 85% 이상
- [ ] Linter 오류 0개
```

### 서브에이전트가 메인에게 보고 시

#### 1. 작업 결과 요약
- 무엇을 했는지
- 어떤 파일을 수정했는지
- 주요 결정 사항

#### 2. 품질 지표 리포트
- 테스트 통과율
- 커버리지
- Linter 결과
- 성능 측정

#### 3. 발견한 문제 보고
- 예상치 못한 이슈
- 추가 작업 필요 사항
- 제안사항

---

## 워크플로우 패턴

### 패턴 1: 새 기능 개발 (Feature)
```
메인 → 기획 → Security(설계 검증) → 메인 검증 → 구현 → Security(코드 검증) → 메인 검증 → QA → Security(최종 검증) → 메인 검증 → 문서화 → 메인 최종 승인
         ↑                              ↑                           ↑
      설계 단계                      구현 단계                    배포 전
```

**키워드**: "추가", "새로운", "구현", "만들어"

**예상 시간**: 30분 - 2시간

**Security 호출 지점:**
- 설계 후: API 보안, 데이터 모델 검증
- 구현 후: 코드 취약점 스캔, 민감 정보 탐지
- 배포 전: 종합 보안 검증

### 패턴 2: 버그 수정 (Bugfix)
```
메인 → QA (재현) → 구현 → QA (검증) → 메인 최종 승인
```

**키워드**: "버그", "오류", "안됨", "깨짐"

**예상 시간**: 10분 - 30분

**특징**: 기획 및 문서화 생략 가능

### 패턴 3: 리팩토링 (Refactor)
```
메인 → 기획 (영향 분석) → 구현 → QA (회귀 테스트) → 메인 최종 승인
```

**키워드**: "개선", "정리", "리팩토링"

**예상 시간**: 20분 - 1시간

**특징**: QA의 회귀 테스트 매우 중요

### 패턴 4: 문서 작업 (Docs)
```
메인 → 문서화 → 메인 최종 승인
```

**키워드**: "문서", "README", "주석"

**예상 시간**: 5분 - 20분

**특징**: 가장 단순한 워크플로우

### 패턴 5: 긴급 핫픽스 (Hotfix)
```
메인 → 구현 → QA (최소 테스트) → 메인 긴급 승인 → (나중에) 문서화
```

**키워드**: "긴급", "당장", "핫픽스"

**예상 시간**: 5분 - 15분

**특징**: 속도 우선, 문서화는 사후 처리

### 패턴 6: 설정/유지보수 (Chore)
```
메인 → 구현 → 검증 (type-check + test) → 메인 최종 승인
```

**키워드**: "설정", "의존성", "업데이트", "config", "package.json", "tsconfig", "eslint"

**예상 시간**: 10분 - 40분

**특징**: 
- 코드 로직 변경 없이 인프라/설정만 변경
- 기획/설계 단계 생략 (설정 변경은 설계가 불필요)
- QA 대신 type-check + test로 회귀 검증
- 문서화는 변경 범위에 따라 선택적

**대상 작업**:
- package.json 정리 (의존성 추가/제거/업데이트)
- pnpm catalog 관리
- TypeScript 설정 (tsconfig) 최적화
- ESLint/Prettier 설정 통합/개선
- Vite/빌드 도구 설정 변경
- CI/CD 파이프라인 수정

---

## 에러 처리 원칙

### 모든 에러는 즉시 해결

```typescript
// ❌ 나쁜 예: 에러 무시
try {
  await fetchData();
} catch (e) {
  // 무시
}

// ✅ 좋은 예: 적절한 처리
try {
  await fetchData();
} catch (e) {
  logger.error('Failed to fetch data', { error: e });
  throw new DataFetchError('Unable to retrieve data', { cause: e });
}
```

### Linter 오류는 0개 유지

- 코드 작성 후 즉시 linter 실행
- 경고도 가능한 해결
- `eslint-disable` 주석 최소화

### 테스트 실패는 즉시 수정

- 테스트 실패 시 원인 즉시 분석
- 버그면 코드 수정
- 테스트 오류면 테스트 수정
- 넘어가지 않습니다

---

## 품질 검증 체크리스트

### 코드 작성 완료 후

- [ ] 변수명 snake_case 확인
- [ ] 함수명 camelCase 확인
- [ ] Linter 실행: 오류 0개
- [ ] 불필요한 코드 제거
- [ ] 주석 정리 (복잡한 로직만)
- [ ] 에러 처리 포함 확인

### 테스트 작성 완료 후

- [ ] 모든 테스트 통과
- [ ] 커버리지 80% 이상
- [ ] 에지 케이스 테스트
- [ ] 에러 케이스 테스트

### 문서 작성 완료 후

- [ ] Public API 문서화
- [ ] 복잡한 로직 주석
- [ ] README 업데이트 (필요 시)
- [ ] CHANGELOG 작성

---

## 참고사항

### 파일 구조

#### 에이전트 정의 파일
각 서브에이전트는 `.cursor/agents/` 디렉토리의 정의 파일을 참조합니다:

- **기획**: `.cursor/agents/planner.md`
- **구현**: `.cursor/agents/developer.md`
- **QA**: `.cursor/agents/qa.md`
- **보안**: `.cursor/agents/security.md`
- **Git 워크플로우**: `.cursor/agents/git-workflow.md`
- **문서화**: `.cursor/agents/docs.md`
- **MCP 개발**: `.cursor/agents/mcp-development.md`
- **시스템 개선**: `.cursor/agents/system-improvement.md`

**특징**:
- Task tool로 호출되는 서브에이전트는 User Rules를 받지 못함
- 따라서 **agents 파일이 필수이며 모든 정보를 포함**
- Rule 파일 없이 agents 파일만으로 동작

#### 메인 에이전트 Rule
메인 조율 에이전트만 Rule 파일을 사용합니다:

- **메인 조율**: `.cursor/rules/main-orchestrator.mdc` (항상 적용)

**특징**:
- `alwaysApply: true`로 모든 요청에 적용
- 서브에이전트 호출 및 조율 로직 포함
- 메트릭 수집 및 품질 게이트 관리

#### Skill 파일
각 에이전트는 전문 영역의 Skill 파일을 참조합니다:

- **기획**: `.cursor/skills/planner/`
- **구현**: `.cursor/skills/developer/`
- **QA**: `.cursor/skills/qa/`
- **보안**: `.cursor/skills/security/`
- **Git 워크플로우**: `.cursor/skills/git-workflow/`
- **문서화**: `.cursor/skills/docs/`
- **메타 에이전트**: `.cursor/skills/meta/`
- **공유**: `.cursor/skills/shared/`

### 추가 문서

- [AGENT_SYSTEM_DESIGN.md](.cursor/AGENT_SYSTEM_DESIGN.md): 전체 시스템 설계
- [DIRECTORY_STRUCTURE.md](.cursor/DIRECTORY_STRUCTURE.md): 디렉토리 구조
- [IMPLEMENTATION_ROADMAP.md](.cursor/IMPLEMENTATION_ROADMAP.md): 구현 로드맵
- [plan-execution-workflow.md](.cursor/workflows/plan-execution-workflow.md): 플랜 실행 워크플로우 (Planner → 실행 → QA/Security/Docs → Git-Workflow → System-Improvement → 최종 보고)
- [final-report-template.md](.cursor/workflows/final-report-template.md): 작업 완료 보고서 템플릿
- **명령어**: 에이전트 입력창에 `/plan-execution [할 일]` 로 위 워크플로우 실행 가능

---

**마지막 업데이트**: 2026-02-09
**버전**: 1.3.0

## 변경 이력

### v1.3.0 (2026-02-09)
- **파일명 컨벤션 수정**: `kebab-case.ts` → `snake_case.ts` (프로젝트 실제 패턴과 일치)
- **Svelte 프로젝트 지원 추가**: Svelte 5 Runes, 컴포넌트 컨벤션, TypeScript 주의사항
- **Chore 태스크 유형 추가**: 설정/의존성/빌드 관련 작업용 워크플로우
- **품질 게이트 강화**: type-check 검증 필수화 (Linter보다 우선)
- **새 스킬 추가**:
  - `developer/dependency-management.md`: 의존성 감사/카탈로그/업데이트
  - `developer/config-optimization.md`: tsconfig/eslint/vite/prettier 최적화
  - `developer/monorepo-patterns.md`: pnpm workspace + turbo 관리 패턴
- **메트릭 수집 선택적 적용**: 태스크 복잡도에 따라 수집 수준 차등 적용
- **프레임워크별 주의사항**: Svelte/React/Node.js 설정 차이점 문서화

### v1.2.0 (2026-02-02)
- **파일 구조 개선**: agents와 rules 통합
  - 서브에이전트 Rule 파일 (`.cursor/rules/*.mdc`) 삭제
  - 모든 내용을 agents 정의 파일 (`.cursor/agents/*.md`)로 통합
  - 메인 에이전트만 Rule 파일 유지 (`.cursor/rules/main-orchestrator.mdc`)
- **이유**: 
  - 서브에이전트는 User Rules를 받지 못하므로 agents 파일이 필수
  - 중복 제거 및 유지보수성 향상
  - 단일 진실 공급원 (Single Source of Truth)

### v1.1.0 (2026-02-02)
- Security 에이전트 추가
  - 프롬프트 인젝션 방어
  - 민감 정보 탐지
  - 코드 보안 취약점 스캔
  - 외부 리소스 접근 검증
- 워크플로우 패턴에 Security 검증 단계 추가
- 자율 에이전트 시스템 보안 강화

### v1.0.0 (2026-01-28)
- 초기 버전
