---
name: cli-usage
description: "CLI/terminal command guide for pnpm monorepo on Windows/PowerShell. Use when running pnpm install/add (--no-offline required), pnpm build/test/lint/type-check, turbo commands, git operations, or troubleshooting ERR_PNPM_NO_OFFLINE_META/ENOENT errors. Includes command chaining rules and verification order."
---

# CLI 사용 가이드

에이전트가 Shell 도구로 터미널 명령어를 실행할 때 준수해야 할 규칙입니다.

## 패키지 매니저 (pnpm)

### 필수 옵션

**레지스트리 접근 명령(`install/add/update`)에만 `--no-offline` 옵션 사용**

```bash
# ✅ --no-offline 필요 (레지스트리 접근)
pnpm install --no-offline
pnpm add <package> --no-offline
pnpm update --no-offline

# ✅ --no-offline 불필요 (스크립트 실행)
pnpm run build
pnpm test
pnpm build-storybook

# ❌ 잘못된 사용
pnpm install                # --no-offline 누락
pnpm build --no-offline     # run 계열에 불필요한 옵션
```

### 자주 사용하는 pnpm 명령어

```bash
# 의존성 설치
pnpm install --no-offline

# 패키지 추가 (devDependencies)
pnpm add -D <package> --no-offline

# 워크스페이스 특정 패키지에 추가
pnpm add -D <package> --filter <workspace> --no-offline

# 의존성 제거
pnpm remove <package>
pnpm remove <package> --filter <workspace>

# 스크립트 실행
pnpm run <script>
pnpm run <script> --filter <workspace>

# 타입 체크
pnpm type-check

# 테스트
pnpm test
pnpm test --filter <workspace>

# 빌드
pnpm build
pnpm build --filter <workspace>
```

### pnpm 워크스페이스 필터

```bash
# 특정 패키지만 실행
pnpm --filter <package-name> <command>

# 예시
pnpm --filter ecount-dev-tool test
pnpm --filter @minhyung/uikit build
```

---

## Turbo

```bash
# 전체 빌드
pnpm turbo build

# 특정 패키지만
pnpm turbo build --filter=<package>

# 캐시 무시
pnpm turbo build --force
```

---

## Git 명령어

```bash
# 상태 확인
git status
git diff
git diff --staged

# 스테이징 & 커밋
git add <files>
git commit -m "메시지"

# 브랜치
git checkout -b <branch-name>
git switch <branch-name>

# 변경 통계 (메트릭용)
git diff --numstat HEAD
git diff --stat
```

---

## 명령어 체이닝 규칙

### 순차 실행 (의존성 있는 경우)

```bash
# && 사용: 앞 명령어 성공 시에만 다음 실행
pnpm install --no-offline && pnpm type-check && pnpm test
```

### 독립 실행 (의존성 없는 경우)

여러 Shell 도구 호출을 병렬로 수행합니다. 하나의 Shell 호출에 체이닝하지 않습니다.

### 실패해도 계속 (드물게 사용)

```bash
# ; 사용: 실패와 무관하게 다음 실행
command1 ; command2
```

---

## Windows 환경 주의사항

- 경로 구분자: `/` 사용 (PowerShell에서도 동작)
- 공백 포함 경로: 반드시 `"` 쌍따옴표로 감싸기
- 환경 변수: `$env:VAR_NAME` (PowerShell) vs `%VAR_NAME%` (cmd)

---

## 에러 처리

### 명령어 실패 시

1. 에러 메시지를 정확히 읽기
2. 원인 파악 후 즉시 수정
3. "나중에 고치자" 금지

### 일반적인 실패 원인

| 에러 | 원인 | 해결 |
|------|------|------|
| `ERR_PNPM_NO_OFFLINE_META` | 오프라인 모드에서 캐시 없는 패키지 | `--no-offline` 옵션 사용 |
| `ENOENT` | 파일/디렉토리 없음 | 경로 확인 |
| `EACCES` | 권한 부족 | `required_permissions` 설정 |
| `tsc: command not found` | TypeScript 미설치 | `pnpm install --no-offline` |

---

## 검증 명령어 순서

코드 변경 후 검증 시 다음 순서를 따릅니다:

```bash
# 1. 타입 검증
pnpm type-check

# 2. Linter 검증
pnpm lint

# 3. 테스트 실행
pnpm test

# 4. 빌드 (필요 시)
pnpm build
```

---

## 완료 기준

- [ ] pnpm install/add/update에 `--no-offline` 옵션 포함 (run/exec/build 등에는 불필요)
- [ ] 에러 발생 시 즉시 해결
- [ ] 검증 명령어 순서 준수
