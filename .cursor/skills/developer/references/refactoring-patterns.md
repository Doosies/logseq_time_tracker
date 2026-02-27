---
name: refactoring-patterns
description: 리팩토링 패턴 카탈로그 및 안전한 리팩토링 절차
---

# 리팩토링 패턴

이 Skill은 구현 에이전트가 코드를 리팩토링할 때 사용하는 패턴 카탈로그입니다.

## 리팩토링 원칙

### 1. 기능 변경 없음
- 리팩토링은 **구조 개선**이지 기능 변경이 아닙니다
- 모든 테스트가 통과해야 합니다
- 사용자 관점에서 동작이 동일해야 합니다

### 2. 작은 단계로 진행
- 한 번에 하나의 리팩토링만 수행
- 각 단계마다 테스트 실행
- 문제 발생 시 롤백 가능하도록

### 3. 테스트 먼저 확인
- 리팩토링 전 모든 테스트 통과 확인
- 테스트가 없다면 먼저 작성
- 리팩토링 후 테스트 재실행

## 리팩토링 패턴 카탈로그

### 패턴 1: 함수 추출 (Extract Function)

**언제 사용**: 긴 함수, 중복 코드, 복잡한 로직

**Before:**
```typescript
function printOwing(invoice: Invoice) {
  printBanner();
  let outstanding = 0;
  
  // 채무 계산
  for (const order of invoice.orders) {
    outstanding += order.amount;
  }
  
  // 세부사항 출력
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

**After:**
```typescript
function printOwing(invoice: Invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice.customer, outstanding);
}

function calculateOutstanding(invoice: Invoice): number {
  return invoice.orders.reduce((sum, order) => sum + order.amount, 0);
}

function printDetails(customer: string, amount: number) {
  console.log(`name: ${customer}`);
  console.log(`amount: ${amount}`);
}
```

---

### 패턴 2: 변수 인라인 (Inline Variable)

**언제 사용**: 불필요한 중간 변수

**Before:**
```typescript
function isExpensive(order: Order): boolean {
  const base_price = order.quantity * order.item_price;
  return base_price > 1000;
}
```

**After:**
```typescript
function isExpensive(order: Order): boolean {
  return (order.quantity * order.item_price) > 1000;
}
```

---

### 패턴 3: 매직 넘버 제거 (Replace Magic Number)

**언제 사용**: 의미 불명확한 숫자

**Before:**
```typescript
function potentialEnergy(mass: number, height: number): number {
  return mass * 9.81 * height;
}
```

**After:**
```typescript
const GRAVITATIONAL_CONSTANT = 9.81;

function potentialEnergy(mass: number, height: number): number {
  return mass * GRAVITATIONAL_CONSTANT * height;
}
```

---

### 패턴 4: 조건문 분해 (Decompose Conditional)

**언제 사용**: 복잡한 조건문

**Before:**
```typescript
if (date.before(SUMMER_START) || date.after(SUMMER_END)) {
  charge = quantity * winter_rate + winter_service_charge;
} else {
  charge = quantity * summer_rate;
}
```

**After:**
```typescript
function isSummer(date: Date): boolean {
  return !date.before(SUMMER_START) && !date.after(SUMMER_END);
}

function summerCharge(quantity: number): number {
  return quantity * summer_rate;
}

function winterCharge(quantity: number): number {
  return quantity * winter_rate + winter_service_charge;
}

const charge = isSummer(date) 
  ? summerCharge(quantity) 
  : winterCharge(quantity);
```

---

### 패턴 5: 중복 제거 (Remove Duplication)

**언제 사용**: 동일하거나 유사한 코드 반복

**Before:**
```typescript
function printUsers() {
  const users = db.getUsers();
  for (const user of users) {
    console.log(user.name);
    console.log(user.email);
  }
}

function printAdmins() {
  const admins = db.getAdmins();
  for (const admin of admins) {
    console.log(admin.name);
    console.log(admin.email);
  }
}
```

**After:**
```typescript
function printPeople(people: Person[]) {
  for (const person of people) {
    console.log(person.name);
    console.log(person.email);
  }
}

function printUsers() {
  printPeople(db.getUsers());
}

function printAdmins() {
  printPeople(db.getAdmins());
}
```

---

### 패턴 6: 파라미터 객체 도입 (Introduce Parameter Object)

**언제 사용**: 여러 파라미터가 항상 함께 사용됨

**Before:**
```typescript
function amountInvoiced(start_date: Date, end_date: Date) { }
function amountReceived(start_date: Date, end_date: Date) { }
function amountOverdue(start_date: Date, end_date: Date) { }
```

**After:**
```typescript
interface DateRange {
  start_date: Date;
  end_date: Date;
}

function amountInvoiced(date_range: DateRange) { }
function amountReceived(date_range: DateRange) { }
function amountOverdue(date_range: DateRange) { }
```

---

### 패턴 7: Guard Clauses (조기 반환)

**언제 사용**: 중첩된 if 문

**Before:**
```typescript
function getPayAmount() {
  let result;
  if (is_dead) {
    result = deadAmount();
  } else {
    if (is_separated) {
      result = separatedAmount();
    } else {
      if (is_retired) {
        result = retiredAmount();
      } else {
        result = normalPayAmount();
      }
    }
  }
  return result;
}
```

**After:**
```typescript
function getPayAmount() {
  if (is_dead) return deadAmount();
  if (is_separated) return separatedAmount();
  if (is_retired) return retiredAmount();
  return normalPayAmount();
}
```

---

## 안전한 리팩토링 절차

### 1. 준비 단계
```markdown
1. Git 커밋: 현재 상태 저장
2. 테스트 실행: 모든 테스트 통과 확인
3. 범위 결정: 리팩토링할 코드 범위 명확히
```

### 2. 리팩토링 실행
```markdown
1. 작은 변경: 하나의 패턴만 적용
2. 테스트 실행: 즉시 테스트
3. 커밋: 성공 시 커밋
```

### 3. 검증 단계
```markdown
1. 모든 테스트 통과 확인
2. Linter 실행: 오류 0개
3. 성능 측정: 10% 이내 저하 확인
4. 코드 리뷰: 변경사항 검토
```

### 4. 문제 발생 시
```markdown
1. 즉시 중단
2. Git revert로 롤백
3. 원인 분석
4. 다른 접근 시도
```

## 리팩토링 체크리스트

리팩토링 완료 후 확인:

- [ ] 모든 테스트 통과
- [ ] Linter 오류 0개
- [ ] 성능 저하 10% 이내
- [ ] 기능 변경 없음
- [ ] 코드 가독성 향상
- [ ] 복잡도 감소
- [ ] 중복 제거
- [ ] 변수명/함수명 개선

## 리팩토링 금지 상황

다음 경우 리팩토링하지 않습니다:

- [ ] 테스트가 없는 코드 (테스트부터 작성)
- [ ] 긴급 배포 직전
- [ ] 기능 추가와 동시 진행 (분리해서 진행)
- [ ] 코드 이해 불충분
- [ ] 시간 부족 (중단된 리팩토링은 위험)

## 성능에 영향을 주는 리팩토링

성능 측정 필수:

### 1. 루프 관련
```typescript
// Before: 단일 루프
for (const item of items) {
  process(item);
  validate(item);
}

// After: 두 개 루프 (성능 저하 가능)
for (const item of items) {
  process(item);
}
for (const item of items) {
  validate(item);
}
```

### 2. 함수 호출 증가
```typescript
// Before: 인라인 계산
const result = x * y * z;

// After: 함수 호출 (약간의 오버헤드)
const result = multiply(x, y, z);
```

**원칙**: 가독성 > 성능 (10% 이내 저하는 허용)

## 완료 기준

- [ ] 리팩토링 목표 달성
- [ ] 모든 테스트 통과
- [ ] 성능 저하 없음 (10% 이내)
- [ ] 코드 품질 향상 확인
- [ ] Git 커밋 완료
