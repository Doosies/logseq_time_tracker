---
name: readme-maintenance
description: README.md 구조 및 업데이트 가이드
---

# README 유지보수 가이드

이 Skill은 문서화 에이전트가 README.md를 작성하고 유지보수하는 방법을 제공합니다.

## README 목적

프로젝트의 **첫인상**이자 **진입점**입니다.

### 목표
- 5분 안에 프로젝트 이해
- 빠른 시작 가능
- 주요 기능 파악
- 기여 방법 안내

---

## 표준 구조

### 완전한 README 템플릿

```markdown
# 프로젝트 이름

[![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)]()
[![Coverage](https://img.shields.io/codecov/c/github/user/repo)]()
[![License](https://img.shields.io/github/license/user/repo)]()

한 줄 설명: 이 프로젝트가 무엇을 하는지

## 특징

- ✨ 주요 기능 1
- ⚡ 주요 기능 2
- 🔒 주요 기능 3

## 데모

![Screenshot](./docs/screenshot.png)

또는 라이브 데모: https://demo.example.com

## 설치

\`\`\`bash
npm install project-name
\`\`\`

## 빠른 시작

\`\`\`typescript
import { feature } from 'project-name';

const result = feature();
console.log(result);
\`\`\`

## 사용법

### 기본 사용법

[예시 코드]

### 고급 사용법

[예시 코드]

## API 문서

전체 API 문서: [docs/api.md](./docs/api.md)

### 주요 함수

#### `functionName(param: Type): ReturnType`

설명...

## 설정

\`\`\`json
{
  "option1": "value1",
  "option2": "value2"
}
\`\`\`

## 개발

### 요구사항

- Node.js 18+
- npm 9+

### 개발 환경 설정

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
npm install
npm run dev
\`\`\`

### 테스트

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

### 빌드

\`\`\`bash
npm run build
\`\`\`

## 기여

기여는 언제나 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 라이선스

[MIT](./LICENSE)

## 문의

- 이슈: https://github.com/user/repo/issues
- 이메일: contact@example.com
```

---

## 섹션별 가이드

### 1. 프로젝트 제목 및 뱃지

```markdown
# 프로젝트 이름

[![Build Status](badge-url)]()
[![Coverage](badge-url)]()
[![npm version](badge-url)]()
[![License](badge-url)]()
```

**뱃지 추가 (선택적):**
- 빌드 상태
- 테스트 커버리지
- 버전
- 다운로드 수
- 라이선스

---

### 2. 한 줄 설명

**✅ 좋은 예:**
```markdown
React 기반의 빠르고 가벼운 UI 컴포넌트 라이브러리
```

**❌ 나쁜 예:**
```markdown
이 프로젝트는...
```

---

### 3. 특징 (Features)

```markdown
## 특징

- ✨ **TypeScript 지원**: 완벽한 타입 안전성
- ⚡ **빠른 성능**: Virtual DOM 최적화
- 🎨 **커스터마이징**: CSS-in-JS 지원
- 📦 **트리 쉐이킹**: 번들 크기 최소화
- 🔧 **쉬운 설정**: 제로 설정으로 시작
```

**원칙:**
- 3-5개 핵심 기능만
- 이모지 사용 (선택적)
- 간결하게

---

### 4. 데모

```markdown
## 데모

### 스크린샷
![Main Screen](./docs/screenshot.png)

### 라이브 데모
https://demo.example.com

### 코드 샘플
\`\`\`typescript
const result = await api.fetch('/users');
console.log(result);
\`\`\`
```

---

### 5. 설치

```markdown
## 설치

### npm
\`\`\`bash
npm install package-name
\`\`\`

### yarn
\`\`\`bash
yarn add package-name
\`\`\`

### pnpm
\`\`\`bash
pnpm add package-name --no-offline
\`\`\`

### CDN
\`\`\`html
<script src="https://cdn.example.com/package.min.js"></script>
\`\`\`
```

---

### 6. 빠른 시작

```markdown
## 빠른 시작

\`\`\`typescript
import { Api } from 'package-name';

// 1. 초기화
const api = new Api({
  apiKey: 'your-api-key'
});

// 2. 사용
const users = await api.getUsers();
console.log(users);
\`\`\`
```

**원칙:**
- 5분 안에 실행 가능
- 실제 작동하는 코드
- 단계별 주석

---

### 7. 사용법

```markdown
## 사용법

### 기본 사용법

\`\`\`typescript
// 사용자 생성
const user = await api.createUser({
  email: 'test@example.com',
  name: 'Test User'
});
\`\`\`

### 고급 사용법

\`\`\`typescript
// 페이지네이션
const users = await api.getUsers({
  page: 1,
  limit: 10,
  sort: 'created_at'
});
\`\`\`

### 에러 처리

\`\`\`typescript
try {
  await api.createUser(data);
} catch (error) {
  if (error.code === 'DUPLICATE_EMAIL') {
    console.error('이메일이 이미 존재합니다');
  }
}
\`\`\`
```

---

### 8. 설정

```markdown
## 설정

\`\`\`typescript
const api = new Api({
  // 필수
  apiKey: 'your-key',
  
  // 선택
  timeout: 5000,      // 타임아웃 (ms)
  retries: 3,         // 재시도 횟수
  baseUrl: 'https://custom-api.com'
});
\`\`\`

### 환경 변수

\`\`\`.env
API_KEY=your-api-key
API_TIMEOUT=5000
\`\`\`
```

---

### 9. 개발

```markdown
## 개발

### 요구사항

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (선택)

### 설정

\`\`\`bash
# 1. 클론
git clone https://github.com/user/repo.git
cd repo

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# 4. 데이터베이스 마이그레이션
npm run db:migrate

# 5. 개발 서버 시작
npm run dev
\`\`\`

### 테스트

\`\`\`bash
# 모든 테스트
npm test

# Watch 모드
npm test -- --watch

# 커버리지
npm run test:coverage
\`\`\`

### 빌드

\`\`\`bash
npm run build
\`\`\`
```

---

### 10. 기여

```markdown
## 기여

기여를 환영합니다! 다음 절차를 따라주세요:

1. 이 저장소를 Fork합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.
```

---

### 11. 라이선스

```markdown
## 라이선스

[MIT](./LICENSE) © [Your Name](https://github.com/username)
```

---

## 업데이트 시점

### 즉시 업데이트

- [ ] **주요 기능 추가**: Features 섹션 업데이트
- [ ] **Breaking Changes**: 마이그레이션 가이드 추가
- [ ] **설치 방법 변경**: 설치 섹션 업데이트
- [ ] **요구사항 변경**: 요구사항 섹션 업데이트

### 정기 업데이트

- [ ] **버전 번호**: 뱃지 업데이트
- [ ] **스크린샷**: UI 변경 시
- [ ] **데모 링크**: URL 변경 시

---

## 작성 팁

### 1. 간결하게

**❌ 나쁜 예:**
```markdown
이 프로젝트는 사용자들이 쉽게 사용할 수 있도록 만들어진 
라이브러리로서, 다양한 기능들을 제공하며...
```

**✅ 좋은 예:**
```markdown
React UI 컴포넌트 라이브러리
```

### 2. 코드 예시는 실행 가능하게

```markdown
## 빠른 시작

\`\`\`typescript
// ✅ 이 코드는 실제로 실행됩니다
import { add } from 'my-lib';
console.log(add(1, 2)); // 3
\`\`\`
```

### 3. 시각 자료 활용

```markdown
### Before
텍스트만 있는 설명...

### After
![Demo](./demo.gif)
코드로 설명
```

### 4. 목차 추가 (긴 README)

```markdown
## 목차

- [설치](#설치)
- [사용법](#사용법)
- [API](#api)
- [기여](#기여)
```

---

## 체크리스트

README 작성 완료 후:

### 필수 섹션
- [ ] 프로젝트 제목
- [ ] 한 줄 설명
- [ ] 설치 방법
- [ ] 빠른 시작 코드
- [ ] 라이선스

### 권장 섹션
- [ ] 특징 (3-5개)
- [ ] 데모 (스크린샷/GIF)
- [ ] 사용법 (예시 코드)
- [ ] 개발 가이드
- [ ] 기여 방법

### 품질
- [ ] 모든 코드 예시 실행 가능
- [ ] 링크 작동 확인
- [ ] 맞춤법 검사
- [ ] 최신 정보 반영

---

## 완료 기준

- [ ] README.md 파일 생성 또는 업데이트
- [ ] 필수 섹션 모두 포함
- [ ] 실행 가능한 예시 코드
- [ ] 최신 정보 반영
- [ ] 링크 작동 확인
