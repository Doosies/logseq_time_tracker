---
name: testable-code
description: 테스트 가능한 코드 작성 가이드
---

# 테스트 가능한 코드 작성

이 Skill은 QA 에이전트가 쉽게 테스트할 수 있는 코드를 작성하는 방법을 설명합니다.

## 핵심 원칙

### 1. 의존성 주입 (Dependency Injection)

외부 의존성을 직접 생성하지 않고 주입받습니다.

**❌ 나쁜 예: 테스트 불가능**
```typescript
class UserService {
  private db = new Database();  // 하드코딩된 의존성
  
  async getUser(id: string) {
    return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// 테스트 시 실제 DB 연결 필요 → 느리고 불안정
```

**✅ 좋은 예: 테스트 가능**
```typescript
interface Database {
  query(sql: string, params: any[]): Promise<any>;
}

class UserService {
  constructor(private db: Database) {}  // 의존성 주입
  
  async getUser(id: string) {
    return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// 테스트 시 Mock DB 주입 가능
const mock_db: Database = {
  query: async () => ({ id: '1', name: 'Test' })
};
const service = new UserService(mock_db);
```

---

### 2. 순수 함수 우선 (Pure Functions)

동일한 입력에 항상 동일한 출력을 반환하고 부작용이 없는 함수.

**❌ 나쁜 예: 부작용 있음**
```typescript
let total = 0;

function addToTotal(amount: number) {
  total += amount;  // 외부 상태 변경
  return total;
}

// 테스트 시 total의 초기값에 따라 결과가 달라짐
```

**✅ 좋은 예: 순수 함수**
```typescript
function addToTotal(current_total: number, amount: number): number {
  return current_total + amount;  // 입력만으로 출력 결정
}

// 테스트 간단: addToTotal(10, 5) === 15
```

---

### 3. 부작용 분리

부작용(I/O, DB, API 호출)과 로직을 분리합니다.

**❌ 나쁜 예: 로직과 I/O 혼재**
```typescript
async function processOrder(order_id: string) {
  const order = await db.getOrder(order_id);  // I/O
  const total = order.items.reduce((sum, item) => sum + item.price, 0);  // 로직
  const tax = total * 0.1;  // 로직
  const final = total + tax;  // 로직
  await db.updateOrder(order_id, { total: final });  // I/O
  return final;
}

// 테스트 시 DB 필요, 로직만 테스트 불가
```

**✅ 좋은 예: 분리**
```typescript
// 순수 로직 (테스트 쉬움)
function calculateOrderTotal(items: Item[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  return subtotal + tax;
}

// I/O 로직 (통합 테스트)
async function processOrder(order_id: string, db: Database) {
  const order = await db.getOrder(order_id);
  const total = calculateOrderTotal(order.items);
  await db.updateOrder(order_id, { total });
  return total;
}

// 단위 테스트는 calculateOrderTotal만
```

---

## 테스트 가능한 패턴

### 패턴 1: 인터페이스 활용

**Before:**
```typescript
class EmailService {
  sendEmail(to: string, subject: string, body: string) {
    // 실제 SMTP 서버로 이메일 전송
    smtp.send({ to, subject, body });
  }
}
```

**After:**
```typescript
interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

class SmtpEmailSender implements EmailSender {
  async send(to: string, subject: string, body: string) {
    await smtp.send({ to, subject, body });
  }
}

class MockEmailSender implements EmailSender {
  sent_emails: any[] = [];
  
  async send(to: string, subject: string, body: string) {
    this.sent_emails.push({ to, subject, body });
  }
}

class UserService {
  constructor(private email_sender: EmailSender) {}
  
  async registerUser(email: string) {
    // 로직...
    await this.email_sender.send(email, 'Welcome', 'Welcome to our service');
  }
}

// 테스트
const mock = new MockEmailSender();
const service = new UserService(mock);
await service.registerUser('test@example.com');
assert(mock.sent_emails.length === 1);
```

---

### 패턴 2: Factory 패턴

**Before:**
```typescript
class OrderProcessor {
  process(order: Order) {
    const date = new Date();  // 테스트 시 현재 시간에 의존
    if (date.getHours() < 9) {
      throw new Error('Cannot process before 9am');
    }
  }
}
```

**After:**
```typescript
type DateProvider = () => Date;

class OrderProcessor {
  constructor(private get_date: DateProvider = () => new Date()) {}
  
  process(order: Order) {
    const date = this.get_date();
    if (date.getHours() < 9) {
      throw new Error('Cannot process before 9am');
    }
  }
}

// 테스트
const mock_date = () => new Date('2024-01-01T08:00:00');
const processor = new OrderProcessor(mock_date);
// 테스트 가능
```

---

### 패턴 3: 설정 외부화

**Before:**
```typescript
class ApiClient {
  private BASE_URL = 'https://api.production.com';  // 하드코딩
  
  async fetch(path: string) {
    return await fetch(`${this.BASE_URL}${path}`);
  }
}
```

**After:**
```typescript
interface ApiConfig {
  base_url: string;
  timeout_ms: number;
}

class ApiClient {
  constructor(private config: ApiConfig) {}
  
  async fetch(path: string) {
    return await fetch(`${this.config.base_url}${path}`);
  }
}

// 테스트
const test_config: ApiConfig = {
  base_url: 'http://localhost:3000',
  timeout_ms: 1000
};
const client = new ApiClient(test_config);
```

---

## Mock 가능한 코드 작성

### 1. 외부 서비스 래핑

**Before:**
```typescript
async function getUserData(id: string) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  return response.json();
}
```

**After:**
```typescript
interface UserApi {
  getUser(id: string): Promise<User>;
}

class RealUserApi implements UserApi {
  async getUser(id: string): Promise<User> {
    const response = await fetch(`https://api.example.com/users/${id}`);
    return response.json();
  }
}

class MockUserApi implements UserApi {
  async getUser(id: string): Promise<User> {
    return { id, name: 'Test User', email: 'test@example.com' };
  }
}

// 사용
async function processUser(id: string, api: UserApi) {
  const user = await api.getUser(id);
  return user.name.toUpperCase();
}
```

---

### 2. 시간 의존성 제거

**Before:**
```typescript
function isExpired(created_at: Date): boolean {
  const now = new Date();  // 현재 시간에 의존
  const diff_ms = now.getTime() - created_at.getTime();
  return diff_ms > 86400000;  // 24시간
}
```

**After:**
```typescript
function isExpired(created_at: Date, current_time: Date = new Date()): boolean {
  const diff_ms = current_time.getTime() - created_at.getTime();
  return diff_ms > 86400000;
}

// 테스트
const created = new Date('2024-01-01');
const now = new Date('2024-01-02');
assert(isExpired(created, now) === true);
```

---

## 테스트하기 어려운 코드 신호

다음 패턴이 보이면 리팩토링 고려:

### 🚨 신호 1: new 키워드 남용
```typescript
function process() {
  const db = new Database();  // 🚨
  const api = new ApiClient();  // 🚨
  // ...
}
```

### 🚨 신호 2: 정적 메서드 호출
```typescript
function process() {
  const data = GlobalCache.get('key');  // 🚨
  Logger.log('message');  // 🚨
}
```

### 🚨 신호 3: 전역 변수 접근
```typescript
function calculate() {
  return global_config.value * 2;  // 🚨
}
```

### 🚨 신호 4: 부작용 많은 함수
```typescript
function doEverything() {
  db.save();  // 부작용
  api.call();  // 부작용
  fs.writeFile();  // 부작용
  return result;
}
```

---

## 체크리스트

코드 작성 후 확인:

- [ ] 외부 의존성이 주입되는가?
- [ ] 순수 함수로 작성 가능한가?
- [ ] 부작용이 분리되어 있는가?
- [ ] Mock 객체 주입 가능한가?
- [ ] 시간/랜덤 의존성이 제거되었는가?
- [ ] 전역 변수를 사용하지 않는가?
- [ ] new 키워드가 최소화되었는가?
- [ ] 인터페이스를 사용하는가?

## 완료 기준

- [ ] 단위 테스트 작성 가능
- [ ] Mock 없이도 테스트 가능한 부분 최대화
- [ ] Mock 필요한 부분은 인터페이스로 추상화
- [ ] 부작용 명확히 분리
