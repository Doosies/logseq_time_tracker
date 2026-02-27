---
name: technology-documentation
description: 외부 라이브러리/프레임워크 사용법 문서화 가이드
---

# 기술 문서화 가이드

이 Skill은 문서화 에이전트가 외부 라이브러리나 프레임워크 사용법을 문서화할 때 사용하는 가이드입니다.

## 목적

- 외부 기술 사용법을 프로젝트 내에 문서화
- 재사용 가능한 기술 문서 생성
- 신규 개발자 온보딩 시간 단축
- API 사용법 표준화

---

## 문서화 대상

### 반드시 문서화
- **프로젝트에서 처음 사용하는 외부 라이브러리**
- **복잡한 설정이 필요한 프레임워크**
- **공식 문서가 부족하거나 찾기 어려운 기술**
- **프로젝트 특화 사용 패턴이 있는 경우**

### 문서화 불필요
- 널리 알려진 표준 라이브러리 (예: React 기본 사용법)
- 간단한 유틸리티 라이브러리
- 프로젝트에서 한 번만 사용하는 기술

---

## 문서 저장 위치

### 구조
```
.cursor/docs/technologies/
  ├── logseq-plugin-api.md
  ├── vanilla-extract.md
  ├── vite-plugins.md
  └── ...
```

### 네이밍 규칙
- 파일명: `kebab-case.md`
- 기술명을 명확히 표현
- 예: `logseq-plugin-api.md`, `nextjs-app-router.md`

---

## 문서 템플릿

```markdown
# [기술명] 사용 가이드

## 개요
- 기술에 대한 간단한 설명
- 프로젝트에서 사용하는 이유
- 공식 문서 링크

## 설치 및 설정

### 설치
\`\`\`bash
npm install [package-name]
\`\`\`

### 설정
\`\`\`typescript
// 설정 예시
\`\`\`

## 주요 API 사용법

### [API 1]
**용도**: [설명]

**시그니처**:
\`\`\`typescript
[API 시그니처]
\`\`\`

**예시**:
\`\`\`typescript
[사용 예시 코드]
\`\`\`

**주의사항**:
- [주의 1]
- [주의 2]

### [API 2]
...

## 프로젝트 특화 패턴

### 패턴 1: [패턴명]
**사용 시나리오**: [언제 사용하는가]

\`\`\`typescript
[코드 예시]
\`\`\`

## 자주 발생하는 문제

### 문제 1: [문제 설명]
**원인**: [원인]
**해결법**: [해결 방법]

## 참고 자료
- [공식 문서 링크]
- [관련 이슈/PR]
```

---

## 실제 예시: LogSeq Plugin API

```markdown
# LogSeq Plugin API 사용 가이드

## 개요
LogSeq 플러그인 개발을 위한 API 사용법입니다.
- 공식 문서: https://logseq.github.io/plugins/
- 프로젝트에서 사용: `packages/plugin/src/main.tsx`

## 설치 및 설정

### 설치
\`\`\`bash
npm install @logseq/libs
\`\`\`

### 타입 정의
\`\`\`typescript
import '@logseq/libs';
// 전역 logseq 객체 사용 가능
\`\`\`

## 주요 API 사용법

### registerCommand
**용도**: 명령어 및 단축키 등록

**시그니처**:
\`\`\`typescript
logseq.App.registerCommand(
  type: string,  // 명령어 타입 (필수!)
  options: {
    key: string;
    label: string;
    keybinding?: { binding: string };
    palette?: boolean;
  },
  handler: () => void
)
\`\`\`

**예시**:
\`\`\`typescript
logseq.App.registerCommand(
  'show-plugin-ui',
  {
    key: 'show-plugin-ui',
    label: 'Show Personal Plugin UI',
    keybinding: {
      binding: 'mod+shift+p',
    },
    palette: true,
  },
  () => {
    logseq.showMainUI();
  }
);
\`\`\`

**주의사항**:
- 첫 번째 인자로 문자열 `type`을 반드시 포함해야 함
- 공식 문서와 다른 사용법이 있으므로 주의

### registerCommandPalette
**용도**: 명령어 팔레트에 등록

**시그니처**:
\`\`\`typescript
logseq.App.registerCommandPalette(
  options: {
    key: string;
    label: string;
    keybinding?: { binding: string };
  },
  handler: () => void
)
\`\`\`

**예시**:
\`\`\`typescript
logseq.App.registerCommandPalette(
  {
    key: 'toggle-plugin-ui-palette',
    label: 'Toggle Personal Plugin UI',
    keybinding: {
      binding: 'ctrl+shift+e',
    },
  },
  () => {
    logseq.toggleMainUI();
  }
);
\`\`\`

## 프로젝트 특화 패턴

### 패턴 1: UI 토글 버튼
**사용 시나리오**: 툴바에 플러그인 UI 토글 버튼 추가

\`\`\`typescript
// 1. 툴바 UI 항목 등록
logseq.App.registerUIItem('toolbar', {
  key: 'personal-plugin-toolbar',
  template: `
    <a data-on-click="togglePluginUI" class="button">
      <i class="ti ti-box"></i>
    </a>
  `,
});

// 2. 모델 제공 (클릭 핸들러)
logseq.provideModel({
  togglePluginUI() {
    logseq.toggleMainUI();
  },
});
\`\`\`

## 자주 발생하는 문제

### 문제 1: registerCommand 첫 번째 인자 누락
**원인**: 공식 문서 예시와 실제 API 시그니처가 다름
**해결법**: 첫 번째 인자로 문자열 `type`을 반드시 포함

\`\`\`typescript
// ❌ 잘못된 사용법
logseq.App.registerCommand({
  key: 'show-plugin-ui',
  // ...
}, handler);

// ✅ 올바른 사용법
logseq.App.registerCommand(
  'show-plugin-ui',  // type 추가
  {
    key: 'show-plugin-ui',
    // ...
  },
  handler
);
\`\`\`

### 문제 2: vite-plugin-logseq 테스트 모드 오류
**원인**: 테스트 환경에서 LogSeq 플러그인 모킹 필요
**해결법**: vite.config.ts에서 테스트 모드일 때 플러그인 비활성화

\`\`\`typescript
export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode !== 'test' ? [logseqDevPlugin()] : []),
    // ...
  ],
}));
\`\`\`

## 참고 자료
- [LogSeq Plugin API 공식 문서](https://logseq.github.io/plugins/interfaces/IAppProxy.html)
- [LogSeq Plugin 개발 가이드](https://logseq.github.io/plugins/)
- 프로젝트 내 사용 예시: `packages/plugin/src/main.tsx`
```

---

## 문서화 프로세스

### 1단계: 기술 사용 확인
- 코드에서 외부 라이브러리 사용 확인
- 이미 문서화되어 있는지 확인

### 2단계: 문서 작성
- 템플릿 사용
- 실제 코드 예시 포함
- 프로젝트 특화 패턴 기록

### 3단계: 문서 위치 결정
- `.cursor/docs/technologies/` 디렉토리에 저장
- 파일명은 `kebab-case.md`

### 4단계: 문서 링크 추가
- 관련 코드 파일에 주석으로 문서 링크 추가
- README에 기술 문서 목록 추가 (선택)

---

## 문서 품질 기준

다음 항목을 모두 만족해야 합니다:

- [ ] 설치 및 설정 방법 명시
- [ ] 주요 API 사용법 설명
- [ ] 실제 코드 예시 포함
- [ ] 프로젝트 특화 패턴 기록
- [ ] 자주 발생하는 문제 및 해결법 포함
- [ ] 공식 문서 링크 포함
- [ ] 코드와 문서 일치 확인

---

## 문서 업데이트 시점

다음 경우에 문서를 업데이트합니다:

1. **API 사용법 변경 시**
   - 코드에서 API 사용법이 변경되면 문서도 업데이트

2. **새로운 패턴 발견 시**
   - 프로젝트에서 새로운 사용 패턴이 생기면 추가

3. **문제 해결 후**
   - 자주 발생하는 문제를 해결하면 문서에 추가

---

## 완료 기준

- [ ] 문서 파일 생성 완료
- [ ] 템플릿에 따라 모든 섹션 작성
- [ ] 실제 코드 예시 포함
- [ ] 프로젝트 특화 패턴 기록
- [ ] 공식 문서 링크 포함
- [ ] 관련 코드에 문서 링크 주석 추가 (선택)
