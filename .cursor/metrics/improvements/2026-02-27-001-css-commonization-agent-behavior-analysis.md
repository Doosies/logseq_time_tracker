# CSS 공통화 세션 서브에이전트 행동 패턴 분석

**분석 일자**: 2026-02-27  
**분석 대상**: developer.md, qa.md, 관련 Skill 파일  
**분석 방법**: 에이전트 정의 파일 및 Skill 전체 검색

---

## 요약

| 이슈 | 규칙 존재 여부 | 추가 필요성 | 권장 조치 |
|------|---------------|-------------|-----------|
| 1. package.json 들여쓰기 변경 | 없음 | **필수** | developer에 "기존 포매팅 보존" 규칙 추가 |
| 2. QA proactive 수정 | 없음 | **권장** | qa에 "검증 중 간단 수정 직접 수행" 규칙 추가 |
| 3. 디자인 토큰 의미적 용도 | 없음 | **필수** | developer에 "토큰 의미적 용도 고려" 규칙 추가 |

---

## 이슈 1: Developer가 package.json 들여쓰기 변경

### 상황
- `package.json` 기존 들여쓰기: 4칸
- Developer 수정 후: 2칸으로 변경
- 영향: 메인 에이전트가 수동으로 `JSON.stringify(pkg, null, 4)`로 복원

### 현재 규칙 분석

| 위치 | 관련 내용 | 포매팅 보존 규칙 |
|------|-----------|-------------------|
| developer.md | "불필요한 코드 변경 없음" (line 112, 255, 356) | 들여쓰기는 "코드"로 해석 가능하나 명시적이지 않음 |
| auto-formatting.md | Prettier 포매팅 적용 | 프로젝트 `.prettierrc`(tabWidth: 4) 존재. JSON overrides 없음 → Prettier가 4칸 적용해야 하나, Developer가 `JSON.stringify` 등으로 2칸으로 저장했을 가능성 |
| dependency-management.md | package.json 수정 프로세스 | 들여쓰기/포매팅 보존 규칙 없음 |

**결론**: **"기존 파일 포매팅 보존" 규칙이 명시되어 있지 않음.**

### 반복 가능성
- **높음** - package.json 수정은 Chore, Feature, Bugfix 등 다양한 워크플로우에서 빈번함 (의존성 추가/제거)
- 설정 파일(tsconfig.json, pnpm-workspace.yaml 등)도 동일 이슈 가능

### 제안 규칙 (developer.md에 추가)

**위치**: `## 주의사항` 섹션 또는 `## 품질 기준` 아래

```markdown
### 설정 파일 포매팅 보존 (필수)

`package.json`, `tsconfig.json`, `pnpm-workspace.yaml` 등 설정 파일을 수정할 때:

1. **기존 들여쓰기 확인**: 수정 전 파일을 읽어 들여쓰기 칸 수(2칸/4칸) 확인
2. **동일하게 유지**: 수정 후 동일한 들여쓰기 적용
3. **JSON.stringify 사용 시**: `JSON.stringify(obj, null, N)`에서 N을 기존 파일의 들여쓰기 칸 수로 설정
   - 예: `d:\personal\package.json`은 4칸 → `JSON.stringify(pkg, null, 4)`
4. **Prettier 적용**: `pnpm format` 실행 시 프로젝트 `.prettierrc`(tabWidth)가 적용됨. 수동 작성 시 tabWidth와 일치시킬 것
```

**또는** auto-formatting.md에 추가:

```markdown
### 설정 파일(JSON) 수정 시

- package.json, tsconfig.json 수정 시 기존 들여쓰기 보존
- 프로젝트 `.prettierrc`의 `tabWidth` 확인 (예: 4) → JSON은 해당 칸 수 사용
- `pnpm format` 실행으로 최종 포매팅 통일
```

---

## 이슈 2: QA 서브에이전트의 proactive 수정

### 상황
- QA가 검증 중 `exactOptionalPropertyTypes` 타입 에러, `handle={true}` prop 이슈 발견
- **직접 수정**하여 검증-수정 사이클 1회로 완료
- 평가: **긍정적** - 효율적

### 현재 규칙 분석

| 위치 | 관련 내용 | Proactive 수정 규칙 |
|------|-----------|---------------------|
| qa.md "테스트 실패 시" (line 403-408) | "코드 문제 → 구현 에이전트에게 수정 요청" | 발견 시 보고만, 직접 수정 없음 |
| code-review.md | 피드백 작성, 승인/수정 요청 | "수정 요청" 위주, 직접 수정 미언급 |

**결론**: **"검증 중 발견한 간단한 이슈를 QA가 직접 수정" 규칙이 없음.**

### 반복 가능성
- **중간** - 타입 에러, prop 오타 등은 자주 발생. 매번 Developer 호출은 비효율
- 하지만 "직접 수정"이 잘못 적용되면 책임 범위 혼란 가능

### 제안 규칙 (qa.md에 추가)

**위치**: `## 작업 프로세스` 또는 `## 협업 방식` 근처, 새 섹션

```markdown
### 검증 중 발견 이슈 처리 (Proactive 수정)

검증(테스트 실행, 타입 체크, 코드 리뷰) 중 이슈를 발견했을 때:

**QA가 직접 수정 가능** (1-2분 이내, 3줄 이하):
- TypeScript 타입 에러 (exactOptionalPropertyTypes, undefined 체크 등)
- Prop 오타/잘못된 값 (예: `handle={true}` → 올바른 prop)
- Import 누락
- 단순한 Linter 자동 수정 가능 항목

**Developer 에이전트에게 위임** (복잡한 수정):
- 로직 변경
- 새 함수/컴포넌트 추가
- 3줄 초과 수정
- 설계와 충돌하는 수정

**직접 수정한 경우**: 완료 보고에 "수정한 이슈" 항목으로 명시
```

---

## 이슈 3: Phase 1B #ffffff → theme_vars.color.background 거부

### 상황
- button.css.ts에서 `#ffffff`를 `theme_vars.color.background`로 교체하지 않음
- 이유: 다크 테마에서 `color.background`가 어두운 색 → 버튼 텍스트가 보이지 않음
- 평가: **올바른 판단** - 토큰의 의미적 용도 이해

### 현재 규칙 분석

| 위치 | 관련 내용 | 의미적 용도 규칙 |
|------|-----------|------------------|
| svelte-conventions.md | theme_vars 네이밍, createThemeContract 예시 | 용도 구분 없음 |
| project-conventions.md | theme_vars 사용 예시 | 용도 구분 없음 |
| VANILLA_EXTRACT_SETUP.md | 테마 변수 개요 (color, text, background) | background가 "페이지 배경"이라는 의미 미명시 |

**결론**: **"디자인 토큰은 의미적 용도(semantic purpose)를 고려하여 사용" 규칙이 없음.**

### 반복 가능성
- **높음** - CSS 공통화, 테마 작업, Vanilla Extract 마이그레이션 시 동일 케이스 반복 가능
- `color.background`를 버튼 텍스트에 쓰는 실수는 흔한 패턴

### 제안 규칙 (developer.md에 추가)

**위치**: `## 프레임워크별 주의사항` > Svelte 프로젝트 섹션, 또는 svelte-conventions.md

```markdown
### 디자인 토큰(Vanilla Extract theme_vars) 의미적 용도 (필수)

테마 토큰(theme_vars.color.* 등)을 사용할 때 **의미적 용도(semantic purpose)**를 고려합니다:

1. **토큰의 의도된 용도 확인**
   - `color.background`: 페이지/컨테이너 배경 (라이트: 밝은색, 다크: 어두운색)
   - `color.text`: 본문 텍스트 (배경과 대비되는 색)
   - `color.primary`: 강조/CTA 요소
   - 단순 "해당 색이 하드코딩과 같다"만으로 교체하지 말 것

2. **맥락에 맞는 토큰 선택**
   - 버튼 텍스트: `color.background`(어두운 배경) 위에선 `color.text` 또는 `color.primary` 사용. `color.background`는 X (다크 모드에서 안 보임)
   - 카드 배경: `color.background` 사용 가능

3. **거부 판단이 맞는 경우**
   - `#ffffff` → `color.background` 교체 시, 다크 테마에서 가독성 저하되면 교체하지 않음
   - 대안: `color.text`, 별도 토큰 추가, 또는 하드코딩 유지
```

**Skill 제안**: `developer/svelte-conventions.md`에 "디자인 토큰" 서브섹션 추가

---

## 적용 완료 (2026-02-27)

| 이슈 | 적용 위치 |
|------|-----------|
| 이슈 1 | developer.md `### 설정 파일 포매팅 보존 (필수)` |
| 이슈 2 | qa.md `### 검증 중 발견 이슈 처리 (Proactive 수정)` |
| 이슈 3 | developer.md `### 디자인 토큰 의미적 용도 (필수)` + svelte-conventions.md `### 디자인 토큰 의미적 용도` |

---

## 적용 우선순위 (참고)

| 순위 | 이슈 | 이유 |
|------|------|------|
| 1 | 이슈 1 (포매팅 보존) | 반복 가능성 높음, 메인 에이전트 수동 개입 필요 |
| 2 | 이슈 3 (토큰 의미적 용도) | 올바른 거부를 명시적 규칙으로, 향후 실수 방지 |
| 3 | 이슈 2 (QA proactive) | 긍정적 행동이지만, 범위 과다 시 책임 혼란 가능 → 보수적으로 추가 |

---

## 추가 불필요 판단 (참고)

- **이슈 2**: "일회성"이 아니라 "긍정적 패턴"이므로, 명시해 두면 향후 QA가 적극적으로 활용 가능 → **추가 권장**
