---
name: monorepo-patterns
description: pnpm workspace 기반 모노레포 관리 패턴 및 체크리스트
---

# 모노레포 관리 패턴

이 Skill은 pnpm workspace + turbo 기반 모노레포의 관리 패턴과 체크리스트를 제공합니다.

## 프로젝트 구조

```
root/
  pnpm-workspace.yaml    # 워크스페이스 정의 + catalog
  package.json            # 루트 스크립트 (turbo 실행)
  turbo.json              # 빌드 파이프라인
  tsconfig.base.json      # 공통 TypeScript 설정
  eslint.config.ts        # 공통 ESLint 설정
  .prettierrc             # 공통 Prettier 설정
  packages/
    package-a/
      package.json        # catalog: 참조
      tsconfig.json       # extends base
      eslint.config.ts    # extends 루트
    package-b/
      ...
```

---

## pnpm Workspace 패턴

### workspace 정의
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'

catalog:
  # 공통 의존성 버전 중앙 관리
  typescript: ^5.8.3
  eslint: ^9.22.0
```

### 패키지 간 의존성
```json
// packages/app/package.json
{
  "dependencies": {
    "@my-scope/uikit": "workspace:*"
  }
}
```

### workspace 프로토콜
- `workspace:*` - 현재 버전
- `workspace:^` - 호환 버전 (publish 시 변환)
- `catalog:` - catalog에서 버전 참조

---

## 스크립트 패턴

### 루트 package.json
```json
{
  "scripts": {
    "build": "turbo run build",
    "type-check": "turbo run type-check",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "test": "turbo run test",
    "format": "prettier --write ."
  }
}
```

### 패키지별 package.json
```json
{
  "scripts": {
    "build": "vite build",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run"
  }
}
```

---

## 새 패키지 추가 체크리스트

```markdown
1. packages/ 하위에 디렉토리 생성
2. package.json 작성
   - name: @scope/package-name
   - 공통 의존성은 catalog: 사용
3. tsconfig.json 작성 (extends ../../tsconfig.base.json)
4. eslint.config.ts 작성 (extends 루트)
5. src/ 디렉토리 구조 설정
6. pnpm install --no-offline 실행
7. turbo.json에 필요한 태스크 확인
```

---

## 패키지 유형별 설정 패턴

### 라이브러리 패키지 (npm 배포용)
```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build",
    "type-check": "tsc --noEmit"
  }
}
```

### 앱 패키지 (배포/실행용)
```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### CLI/서버 패키지 (Node.js)
```json
{
  "type": "module",
  "bin": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 의존성 관리 원칙

### 1. 공통 의존성은 catalog
- 2개+ 패키지에서 사용 → catalog에 등록
- 패키지별 `package.json`에서 `catalog:` 참조
- 버전 업데이트는 catalog 한 곳에서만

### 2. 순환 의존성 금지
```markdown
❌ 금지:
package-a → package-b → package-a

✅ 허용:
package-a → shared-lib
package-b → shared-lib
```

### 3. devDependencies 올바르게 분류
- **dependencies**: 런타임에 필요한 패키지
- **devDependencies**: 빌드/테스트/개발에만 필요한 패키지
- **peerDependencies**: 호스트 앱이 제공해야 하는 패키지

---

## 문제 해결 패턴

### pnpm install 실패
```bash
# 캐시 정리 후 재설치
pnpm store prune
rm -rf node_modules
pnpm install --no-offline
```

### 타입 인식 안됨
```bash
# 패키지 빌드 후 타입 체크
pnpm --filter <dependency-pkg> build
pnpm type-check
```

### Turbo 캐시 문제
```bash
# 캐시 무효화
pnpm turbo run build --force
```

---

## 완료 기준

- [ ] 모든 패키지가 workspace에 등록
- [ ] 공통 의존성 catalog 관리
- [ ] 순환 의존성 없음
- [ ] 패키지별 설정이 base에서 상속
- [ ] pnpm install --no-offline → type-check → test 모두 통과
