---
name: dependency-management
description: 작업 간 의존성 관리
---

# 의존성 관리

## 의존성 유형

### 1. 데이터 의존성
서브태스크 B가 A의 출력 필요

```markdown
A: User 모델 정의
   ↓ (User 타입 필요)
B: 회원가입 API 구현
```

### 2. 순서 의존성
논리적 순서 필요

```markdown
A: DB 마이그레이션
   ↓ (테이블 필요)
B: 데이터 조회
```

### 3. 리소스 의존성
같은 파일 수정

```markdown
A: auth-controller.ts에 login 추가
   ↓ (충돌 방지)
B: auth-controller.ts에 register 추가
```

## 의존성 표현

```markdown
서브태스크 의존성 맵:

Task1: User 모델
  └─> Task2: 회원가입 (Task1 필요)
  └─> Task3: 로그인 (Task1 필요)
       └─> Task4: 로그아웃 (Task3 필요)
       └─> Task5: 토큰 갱신 (Task3 필요)
```

## 해결 전략

### 순환 의존성 감지
```markdown
A → B → C → A  (❌ 순환)

해결: 공통 부분 추출
A → D ← B
    ↓
    C
```

### 병렬화
독립적인 작업 동시 실행:
```markdown
Task2와 Task4는 독립적
→ 병렬 실행 가능
```

## 완료 기준
- [ ] 의존성 그래프 완성
- [ ] 순환 의존성 없음
- [ ] 병렬 실행 가능 작업 식별
