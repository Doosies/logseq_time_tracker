# Git Workflow 개선 리포트

**날짜**: 2026-01-28  
**작성자**: System  
**버전**: 1.1.0

---

## 개선 목표

Git Workflow 에이전트를 다음 세 가지 요구사항에 맞춰 개선:

1. **스테이징 영역 기반**: git 스테이징에 있는 내용만 커밋 진행
2. **변경 정보 파일 저장**: 변경 파일 목록, diff를 별도 파일로 저장하여 활용
3. **PowerShell 명령어 사용**: Windows 환경에 맞는 PowerShell 명령어 사용

---

## 주요 변경 사항

### 1. 스테이징 영역 기반 워크플로우

#### 전제 조건 추가

**변경 위치**: `.cursor/rules/git-workflow.mdc`

```markdown
## 전제 조건

### 스테이징 영역 확인
커밋은 **git 스테이징 영역에 있는 내용만** 대상으로 합니다.

**PowerShell 명령어**:
```powershell
# 스테이징 영역 상태 확인
git status

# 스테이징된 파일만 보기
git diff --cached --name-status

# 스테이징된 파일 diff 보기
git diff --cached
```

**검증 항목**:
- [ ] 스테이징 영역에 변경 사항이 있는지 확인
- [ ] 의도하지 않은 파일이 스테이징되지 않았는지 확인
- [ ] 스테이징되지 않은 변경 사항은 무시
```

#### 작업 프로세스 개선

**0단계: 스테이징 영역 검증 및 정보 저장** 추가

```powershell
# 스테이징 영역 확인
git status

# 스테이징된 파일이 없으면 중단
if ((git diff --cached --name-only).Count -eq 0) {
  Write-Host "Error: 스테이징된 파일이 없습니다. 먼저 'git add'로 파일을 스테이징하세요."
  exit 1
}

# .cursor/git-workflow 디렉토리 생성
New-Item -ItemType Directory -Force -Path .cursor/git-workflow

# 변경 정보 수집 및 저장
git diff --cached --name-status | Out-File -FilePath .cursor/git-workflow/staged-files.txt -Encoding utf8
git diff --cached | Out-File -FilePath .cursor/git-workflow/staged-diff.txt -Encoding utf8
git diff --cached --numstat | Out-File -FilePath .cursor/git-workflow/staged-stats.txt -Encoding utf8
```

---

### 2. 변경 정보 파일 저장

#### 파일 구조

```
.cursor/git-workflow/
  ├── staged-files.txt     # 변경 파일 목록 및 상태
  ├── staged-diff.txt      # 상세 diff 내용
  └── staged-stats.txt     # 통계 정보
```

#### staged-files.txt 형식

```
M       packages/plugin/src/App.tsx
A       packages/plugin/src/components/ThemeToggle.tsx
M       packages/plugin/package.json
```

- `M`: Modified (수정됨)
- `A`: Added (추가됨)
- `D`: Deleted (삭제됨)
- `R`: Renamed (이름 변경됨)

#### staged-stats.txt 형식

```
42      10      packages/plugin/src/App.tsx
85      0       packages/plugin/src/components/ThemeToggle.tsx
3       1       packages/plugin/package.json
```

- `<추가 라인 수> <삭제 라인 수> <file_path>`

#### staged-diff.txt 형식

전체 diff 내용 (`git diff --cached` 결과)

#### 데이터 소스 우선순위

1. **스테이징 영역 정보** (최우선)
   - `.cursor/git-workflow/staged-files.txt` - 변경 파일 목록
   - `.cursor/git-workflow/staged-diff.txt` - 상세 diff
   - `.cursor/git-workflow/staged-stats.txt` - 통계 정보
2. **Developer 에이전트** (보조)
   - 구현 내용 요약
   - 기술적 결정 사항
3. **QA 에이전트** (보조)
   - 테스트 결과
   - 커버리지 정보
   - 발견된 이슈

---

### 3. PowerShell 명령어 사용

#### GIT_COMMANDS.md 생성

**변경 위치**: 커밋 메시지와 함께 `GIT_COMMANDS.md` 생성

```markdown
# Git 커밋 실행 명령어

## 1. 커밋 실행 (PowerShell)

```powershell
# 커밋 메시지 파일 사용
git commit -F COMMIT_MESSAGE.md

# 커밋 확인
git log -1 --oneline
```

## 2. 변경 정보 정리 (선택사항)

```powershell
# 임시 파일 삭제
Remove-Item -Path .cursor/git-workflow/staged-*.txt
```

## 3. 원격 푸시 (선택사항)

```powershell
# 현재 브랜치에 푸시
git push

# 또는 새 브랜치 생성 후 푸시
git checkout -b feat/feature-name
git push -u origin feat/feature-name
```
```

#### PowerShell 특화 명령어

- `New-Item -ItemType Directory -Force`: 디렉토리 생성
- `Out-File -FilePath ... -Encoding utf8`: 파일 저장
- `Remove-Item -Path ...`: 파일 삭제
- `$variable.Count`: 배열 크기 확인
- `if (...) { ... }`: 조건문

---

## 수정된 파일 목록

### 핵심 파일 (2개)

1. **`.cursor/rules/git-workflow.mdc`**
   - 전제 조건 추가 (스테이징 영역 확인)
   - 0단계 추가 (스테이징 영역 검증 및 정보 저장)
   - 4단계 개선 (GIT_COMMANDS.md 생성)
   - 품질 게이트 업데이트
   - 완료 보고 형식 업데이트
   - 주의사항 업데이트
   - 예시 업데이트

2. **`.cursor/agents/git-workflow.md`**
   - 입력 섹션 업데이트 (스테이징 영역 우선)
   - 출력 섹션 업데이트 (변경 정보 파일 포함)
   - 핵심 원칙 업데이트
   - 변경 사항 분석 섹션 업데이트
   - 협업 방식 업데이트
   - 품질 기준 업데이트
   - 예시 작업 업데이트

### Skill 파일 (1개)

3. **`.cursor/skills/git-workflow/change-analysis.md`**
   - 전제 조건 추가 (스테이징 영역 검증)
   - PowerShell 명령어 추가
   - 변경 정보 파일 구조 설명 추가
   - 스테이징 영역 기반 분석 로직 추가
   - 주의사항 업데이트
   - 체크리스트 업데이트
   - 완료 기준 업데이트

---

## 개선 효과

### 1. 명확한 커밋 범위

**Before**:
- 워킹 디렉토리의 모든 변경 사항 혼재
- 의도하지 않은 변경 사항 포함 가능

**After**:
- 스테이징 영역만 대상으로 커밋
- 명확한 범위 제한
- 실수로 인한 잘못된 커밋 방지

### 2. 변경 정보 재사용

**Before**:
- 매번 git diff 실행
- 정보 휘발성
- 추적 불가능

**After**:
- 변경 정보를 파일로 저장
- 재사용 가능
- 추적 가능
- 디버깅 용이

### 3. Windows 환경 지원

**Before**:
- Bash 명령어 사용
- Windows에서 실행 불가능 또는 오류 발생

**After**:
- PowerShell 명령어 사용
- Windows 네이티브 지원
- 안정적인 실행

---

## 워크플로우 비교

### Before (개선 전)

```
1. 변경 사항 수집 (git diff)
2. 커밋 메시지 생성
3. PR 설명 생성
4. 사용자가 실행 (명령어 미제공)
```

### After (개선 후)

```
0. [NEW] 스테이징 영역 검증 및 정보 저장 (PowerShell)
   → .cursor/git-workflow/*.txt 생성
1. 변경 사항 수집 (파일 우선, git diff 보조)
2. 커밋 메시지 생성 (COMMIT_MESSAGE.md)
3. PR 설명 생성 (PR_DESCRIPTION.md)
4. [NEW] 실행 명령어 생성 (GIT_COMMANDS.md, PowerShell)
5. 사용자가 PowerShell에서 실행
```

---

## 품질 게이트 개선

### 추가된 검증 항목

**스테이징 영역 검증**:
- [ ] 스테이징된 파일이 1개 이상 있음
- [ ] `.cursor/git-workflow/staged-files.txt` 파일 존재
- [ ] `.cursor/git-workflow/staged-diff.txt` 파일 존재
- [ ] `.cursor/git-workflow/staged-stats.txt` 파일 존재
- [ ] 변경 정보 파일 내용이 비어있지 않음

**GIT_COMMANDS.md 검증**:
- [ ] PowerShell 명령어 형식 준수
- [ ] 커밋 명령어 포함 (`git commit -F COMMIT_MESSAGE.md`)
- [ ] 선택적 푸시 명령어 포함
- [ ] 파일 정리 명령어 포함 (선택사항)

---

## 사용 예시

### 1단계: 파일 스테이징 (사용자)

```powershell
# 변경된 파일 스테이징
git add packages/plugin/src/App.tsx
git add packages/plugin/src/components/ThemeToggle.tsx

# 스테이징 확인
git status
```

### 2단계: Git-Workflow 에이전트 호출 (메인 에이전트)

에이전트가 자동으로:
1. 스테이징 영역 검증
2. 변경 정보 파일 생성 (`.cursor/git-workflow/*.txt`)
3. 커밋 메시지 생성 (`COMMIT_MESSAGE.md`)
4. 실행 명령어 생성 (`GIT_COMMANDS.md`)
5. PR 설명 생성 (`PR_DESCRIPTION.md`, 필요 시)

### 3단계: 커밋 실행 (사용자)

```powershell
# GIT_COMMANDS.md에 있는 명령어 실행
git commit -F COMMIT_MESSAGE.md

# 커밋 확인
git log -1 --oneline

# 원격 푸시
git push
```

---

## 주의사항

### 1. 스테이징 영역 필수

- 커밋 전 **반드시** `git add`로 파일 스테이징
- 스테이징되지 않은 변경 사항은 무시됨
- 빈 스테이징 영역 시 작업 중단

### 2. 변경 정보 파일 관리

- `.cursor/git-workflow/` 디렉토리는 `.gitignore`에 추가 권장
- 임시 파일이므로 커밋 후 삭제 가능
- 디버깅 시 유용하므로 보존 가능

### 3. PowerShell 실행 정책

- Windows에서 PowerShell 실행 정책 확인 필요
- 필요 시 `Set-ExecutionPolicy RemoteSigned` 실행

---

## 완료 기준

다음 모든 항목 만족 시 개선 완료:

- [x] 스테이징 영역 검증 로직 추가
- [x] 변경 정보 파일 저장 로직 추가
- [x] PowerShell 명령어 사용
- [x] `.cursor/rules/git-workflow.mdc` 업데이트
- [x] `.cursor/agents/git-workflow.md` 업데이트
- [x] `.cursor/skills/git-workflow/change-analysis.md` 업데이트
- [x] GIT_COMMANDS.md 생성 로직 추가
- [x] 품질 게이트 업데이트
- [x] 예시 업데이트
- [x] 문서화 완료

---

## 다음 단계

### 추천 개선 사항

1. **자동화 스크립트 추가**
   - PowerShell 스크립트 파일 생성 (`.cursor/git-workflow/stage-and-analyze.ps1`)
   - 스테이징 → 정보 수집 → 에이전트 호출까지 자동화

2. **변경 정보 파일 포맷 개선**
   - JSON 형식으로 통합 (현재 3개 텍스트 파일)
   - 파싱 편의성 향상

3. **Git Hooks 통합**
   - `pre-commit` hook에서 스테이징 검증
   - `commit-msg` hook에서 Conventional Commits 검증

4. **CI/CD 통합**
   - GitHub Actions에서 커밋 메시지 검증
   - PR 설명 자동 생성 및 업데이트

---

## 결론

Git Workflow 에이전트를 다음과 같이 개선했습니다:

1. ✅ **스테이징 영역 기반**: 명확한 커밋 범위 제한
2. ✅ **변경 정보 파일 저장**: 재사용 및 추적 가능
3. ✅ **PowerShell 명령어 사용**: Windows 네이티브 지원

이로 인해 Git 워크플로우가 더욱 안정적이고 명확해졌으며, Windows 환경에서도 원활하게 작동합니다.
