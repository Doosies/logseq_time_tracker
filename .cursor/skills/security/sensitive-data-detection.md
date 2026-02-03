---
name: sensitive-data-detection
description: 민감 정보 (API 키, 비밀번호, 토큰) 탐지 및 보호 가이드
---

# 민감 정보 탐지 가이드

이 Skill은 Security 에이전트가 소스코드에서 민감 정보를 탐지하고 보호할 때 사용합니다.

## 민감 정보 유형

### 1. API 키 및 토큰
- OpenAI API 키
- GitHub Token
- AWS Access Key
- Google API Key
- Stripe API Key
- JWT Token

### 2. 비밀번호 및 인증 정보
- 하드코딩된 비밀번호
- 데이터베이스 비밀번호
- 관리자 계정 정보

### 3. 개인 식별 정보 (PII)
- 이메일 주소 (상황에 따라)
- 전화번호
- 주민등록번호
- 신용카드 번호

---

## 탐지 패턴

### 1. OpenAI API 키

**패턴:**
```typescript
const openai_api_key_pattern = /sk-[a-zA-Z0-9]{48}/;

function detectOpenAIKey(code: string): string[] {
  const matches = code.match(new RegExp(openai_api_key_pattern, 'g'));
  return matches || [];
}
```

**예시:**
```typescript
// ❌ 위험
const API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJ';

// ✅ 안전
const API_KEY = process.env.OPENAI_API_KEY;
```

---

### 2. GitHub Token

**패턴:**
```typescript
const github_token_patterns = [
  /gh[pousr]_[a-zA-Z0-9]{36,}/,  // GitHub Personal Access Token
  /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/,  // GitHub Fine-grained PAT
];

function detectGitHubToken(code: string): string[] {
  const matches: string[] = [];
  github_token_patterns.forEach(pattern => {
    const found = code.match(new RegExp(pattern, 'g'));
    if (found) {
      matches.push(...found);
    }
  });
  return matches;
}
```

**예시:**
```typescript
// ❌ 위험
const GITHUB_TOKEN = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';

// ✅ 안전
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
```

---

### 3. AWS Access Key

**패턴:**
```typescript
const aws_access_key_pattern = /AKIA[0-9A-Z]{16}/;
const aws_secret_key_pattern = /[a-zA-Z0-9/+=]{40}/;

function detectAWSKey(code: string): {
  access_keys: string[];
  secret_keys: string[];
} {
  return {
    access_keys: code.match(new RegExp(aws_access_key_pattern, 'g')) || [],
    secret_keys: code.match(new RegExp(aws_secret_key_pattern, 'g')) || [],
  };
}
```

**예시:**
```typescript
// ❌ 위험
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// ✅ 안전
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
```

---

### 4. 일반 API 키 패턴

**패턴:**
```typescript
const generic_api_key_patterns = [
  /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
  /secret[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
  /access[_-]?token\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
];

function detectGenericAPIKey(code: string): string[] {
  const matches: string[] = [];
  generic_api_key_patterns.forEach(pattern => {
    const found = code.match(new RegExp(pattern, 'g'));
    if (found) {
      matches.push(...found);
    }
  });
  return matches;
}
```

---

### 5. 비밀번호 하드코딩

**패턴:**
```typescript
const password_patterns = [
  /password\s*[:=]\s*['"][^'"]{6,}['"]/i,
  /passwd\s*[:=]\s*['"][^'"]{6,}['"]/i,
  /pwd\s*[:=]\s*['"][^'"]{6,}['"]/i,
];

function detectHardcodedPassword(code: string): string[] {
  const matches: string[] = [];
  password_patterns.forEach(pattern => {
    const found = code.match(new RegExp(pattern, 'g'));
    if (found) {
      matches.push(...found);
    }
  });
  return matches;
}
```

**예시:**
```typescript
// ❌ 위험
const DB_PASSWORD = 'mySecretPassword123';

// ✅ 안전
const DB_PASSWORD = process.env.DB_PASSWORD;
```

---

### 6. JWT 토큰

**패턴:**
```typescript
const jwt_pattern = /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/;

function detectJWT(code: string): string[] {
  const matches = code.match(new RegExp(jwt_pattern, 'g'));
  return matches || [];
}
```

---

## 종합 탐지 함수

```typescript
interface SensitiveDataDetection {
  file_path: string;
  line_number: number;
  type: 'api_key' | 'password' | 'token' | 'secret' | 'pii';
  pattern: string;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

function detectSensitiveData(
  code: string,
  file_path: string
): SensitiveDataDetection[] {
  const detections: SensitiveDataDetection[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const line_number = index + 1;
    
    // OpenAI API 키
    if (openai_api_key_pattern.test(line)) {
      detections.push({
        file_path,
        line_number,
        type: 'api_key',
        pattern: 'OpenAI API Key',
        severity: 'critical',
        recommendation: '환경 변수 OPENAI_API_KEY 사용',
      });
    }
    
    // GitHub Token
    github_token_patterns.forEach(pattern => {
      if (pattern.test(line)) {
        detections.push({
          file_path,
          line_number,
          type: 'token',
          pattern: 'GitHub Token',
          severity: 'critical',
          recommendation: '환경 변수 GITHUB_TOKEN 사용',
        });
      }
    });
    
    // AWS Keys
    if (aws_access_key_pattern.test(line)) {
      detections.push({
        file_path,
        line_number,
        type: 'api_key',
        pattern: 'AWS Access Key',
        severity: 'critical',
        recommendation: '환경 변수 AWS_ACCESS_KEY_ID 사용',
      });
    }
    
    // 일반 API 키
    generic_api_key_patterns.forEach(pattern => {
      if (pattern.test(line)) {
        detections.push({
          file_path,
          line_number,
          type: 'api_key',
          pattern: 'Generic API Key',
          severity: 'high',
          recommendation: '환경 변수 사용 권장',
        });
      }
    });
    
    // 비밀번호
    password_patterns.forEach(pattern => {
      if (pattern.test(line)) {
        detections.push({
          file_path,
          line_number,
          type: 'password',
          pattern: 'Hardcoded Password',
          severity: 'critical',
          recommendation: '환경 변수 또는 Secrets Manager 사용',
        });
      }
    });
    
    // JWT
    if (jwt_pattern.test(line)) {
      detections.push({
        file_path,
        line_number,
        type: 'token',
        pattern: 'JWT Token',
        severity: 'high',
        recommendation: '하드코딩하지 말고 동적으로 생성',
      });
    }
  });
  
  return detections;
}
```

---

## 예외 처리

### 테스트 파일 예외

테스트 파일의 경우 가짜 데이터는 허용합니다.

```typescript
function isTestFile(file_path: string): boolean {
  return /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(file_path) ||
         /\/tests?\//i.test(file_path) ||
         /\/fixtures?\//i.test(file_path);
}

function filterTestExceptions(
  detections: SensitiveDataDetection[]
): SensitiveDataDetection[] {
  return detections.filter(detection => {
    // 테스트 파일이면서 명시적으로 테스트용임을 표시한 경우 제외
    if (isTestFile(detection.file_path)) {
      // 주석으로 "// Test token" 같은 표시가 있으면 허용
      return false;
    }
    return true;
  });
}
```

---

## 보호 방법

### 1. 환경 변수 사용

```typescript
// ❌ 위험
const API_KEY = 'sk-1234567890abcdef';

// ✅ 안전
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}
```

### 2. .env 파일 사용

**`.env` 파일:**
```bash
OPENAI_API_KEY=sk-1234567890abcdef
DATABASE_PASSWORD=mySecretPassword
GITHUB_TOKEN=ghp_abcdefg
```

**`.gitignore` 추가:**
```
.env
.env.local
.env.*.local
```

**코드:**
```typescript
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
```

### 3. Secrets Manager 사용

AWS Secrets Manager, Azure Key Vault, GCP Secret Manager 등 활용:

```typescript
async function getSecret(secret_name: string): Promise<string> {
  // AWS Secrets Manager 예시
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secret_name })
  );
  return response.SecretString!;
}

const API_KEY = await getSecret('openai-api-key');
```

---

## 사용 예시

### 예시 1: 전체 프로젝트 스캔

```typescript
async function scanProject(project_root: string): Promise<void> {
  const files = await glob('**/*.{ts,js,tsx,jsx}', {
    cwd: project_root,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });
  
  const all_detections: SensitiveDataDetection[] = [];
  
  for (const file of files) {
    const file_path = path.join(project_root, file);
    const code = await fs.readFile(file_path, 'utf-8');
    
    const detections = detectSensitiveData(code, file_path);
    all_detections.push(...detections);
  }
  
  // 테스트 파일 예외 처리
  const filtered = filterTestExceptions(all_detections);
  
  if (filtered.length > 0) {
    console.error('민감 정보 탐지됨:');
    filtered.forEach(detection => {
      console.error(
        `[${detection.severity.toUpperCase()}] ${detection.file_path}:${detection.line_number}`,
        `- ${detection.pattern}`,
        `권장: ${detection.recommendation}`
      );
    });
    
    throw new SecurityError(`민감 정보 ${filtered.length}건 발견`);
  }
  
  console.log('✅ 민감 정보 없음');
}
```

### 예시 2: Git Pre-commit Hook

```typescript
// .git/hooks/pre-commit
async function preCommitCheck() {
  // 스테이징된 파일만 검사
  const staged_files = execSync('git diff --cached --name-only')
    .toString()
    .split('\n')
    .filter(file => /\.(ts|js|tsx|jsx)$/.test(file));
  
  const detections: SensitiveDataDetection[] = [];
  
  for (const file of staged_files) {
    const code = await fs.readFile(file, 'utf-8');
    const file_detections = detectSensitiveData(code, file);
    detections.push(...file_detections);
  }
  
  if (detections.length > 0) {
    console.error('⛔ 커밋 차단: 민감 정보 발견');
    detections.forEach(d => {
      console.error(`  ${d.file_path}:${d.line_number} - ${d.pattern}`);
    });
    process.exit(1);
  }
}
```

---

## 체크리스트

민감 정보 보호 적용 시:

- [ ] 모든 소스 파일 스캔
- [ ] API 키 하드코딩 없음
- [ ] 비밀번호 하드코딩 없음
- [ ] 토큰 하드코딩 없음
- [ ] 환경 변수 사용 확인
- [ ] .env 파일 .gitignore 등록
- [ ] 테스트 파일 예외 처리
- [ ] Pre-commit hook 설정 (권장)

---

## 완료 기준

- [ ] 전체 프로젝트 스캔 완료
- [ ] Critical/High 민감 정보 0건
- [ ] .env 파일 .gitignore 등록
- [ ] 환경 변수 사용 가이드 문서화
- [ ] 로그 기록 완료
