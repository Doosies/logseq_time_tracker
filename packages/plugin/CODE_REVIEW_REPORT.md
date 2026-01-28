# LogSeq 플러그인 코드 리뷰 리포트

**파일**: `packages/plugin/src/main.tsx`  
**리뷰 일자**: 2026-01-28  
**리뷰어**: QA 에이전트

---

## 📋 요약

**전체 상태**: ❌ **수정 필요**  
**Critical 이슈**: 1개  
**Major 이슈**: 2개  
**Minor 이슈**: 1개

---

## 🔴 Critical 이슈 (필수 수정)

### 1. 함수 중복 정의 (Line 65, 104)

**문제점**:
```typescript
// Line 65-102: 첫 번째 renderApp 정의 (스타일 포함)
const renderApp = () => {
    // ... 스타일이 있는 버전
};

// Line 104-114: 두 번째 renderApp 정의 (스타일 없음)
const renderApp = () => {
    // ... 스타일이 없는 버전
};
```

**영향**:
- TypeScript 컴파일 오류 발생 (Linter 확인됨)
- 두 번째 정의가 첫 번째를 덮어씀 → 스타일이 있는 버전이 실행되지 않음
- 런타임 동작 불확실

**수정 방법**:
- 중복된 함수 중 하나를 제거하거나
- 함수명을 다르게 변경하거나
- 하나의 함수로 통합

**권장 수정**:
```typescript
// 하나의 renderApp 함수로 통합
const renderApp = () => {
    const root_element = document.getElementById('app');
    if (root_element) {
        const root = createRoot(root_element);
        root.render(
            <StrictMode>
                <div
                    style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '400px',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={() => logseq.hideMainUI()}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        ✕
                    </button>
                    <App />
                </div>
            </StrictMode>,
        );
    }
};
```

---

## 🟡 Major 이슈 (권장 수정)

### 2. LogSeq API 사용법 검증 필요

**확인된 API**:
- ✅ `logseq.ready()` - 올바른 사용
- ✅ `logseq.setMainUIInlineStyle()` - API 존재 확인됨
- ⚠️ `logseq.App.registerUIItem()` - 사용법 확인 필요
- ⚠️ `logseq.App.registerCommandPalette()` - 사용법 확인 필요
- ⚠️ `logseq.provideModel()` - 사용법 확인 필요

**문제점**:
1. **registerUIItem 사용법**:
   - 현재 코드: `logseq.App.registerUIItem('toolbar', {...})`
   - 확인 필요: 첫 번째 인자가 'toolbar'인지, 다른 형식인지

2. **registerCommandPalette 사용법**:
   - 현재 코드: `logseq.App.registerCommandPalette({...}, callback)`
   - 확인 필요: API 이름이 정확한지 (`registerCommandPalette` vs `registerCommand`)

3. **provideModel 사용법**:
   - 현재 코드: `logseq.provideModel({ togglePluginUI() {...} })`
   - 확인 필요: 모델 제공 방식이 올바른지

**권장 조치**:
- LogSeq 공식 문서 확인: https://logseq.github.io/plugins/
- 또는 LogSeq 플러그인 샘플 확인: https://github.com/logseq/logseq-plugin-samples

**예상 수정**:
```typescript
// registerCommandPalette가 아니라 registerCommand일 수 있음
logseq.App.registerCommand({
    key: 'show-plugin-ui',
    label: 'Show Personal Plugin UI',
    keybinding: {
        binding: 'mod+shift+p',
    },
    action: () => {
        console.log('Command executed: show-plugin-ui');
        logseq.showMainUI();
    },
});
```

### 3. React 렌더링 로직 불일치

**문제점**:
- 두 개의 `renderApp` 함수가 서로 다른 렌더링 방식을 사용
- 첫 번째: 스타일이 있는 래퍼 div + 닫기 버튼 포함
- 두 번째: App 컴포넌트만 렌더링

**영향**:
- 어떤 버전이 실행될지 불명확 (현재는 두 번째가 실행됨)
- UI 일관성 문제

**권장 수정**:
- 하나의 일관된 렌더링 방식 선택
- 스타일은 CSS 파일로 분리하는 것을 권장 (현재 App.tsx에서 이미 CSS 모듈 사용 중)

---

## 🟢 Minor 이슈 (선택 수정)

### 4. 코드 구조 개선

**문제점**:
- 인라인 스타일이 많아 가독성 저하
- 스타일 로직이 JavaScript에 하드코딩됨

**권장 개선**:
```typescript
// 스타일을 상수로 분리
const MAIN_UI_STYLE: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
};

const PLUGIN_CONTAINER_STYLE: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '400px',
    position: 'relative',
};

const CLOSE_BUTTON_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '16px',
};
```

또는 CSS 모듈 사용 (권장):
```typescript
// main.module.css.ts 생성
import { style } from '@vanilla-extract/css';

export const pluginContainer = style({
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '400px',
    position: 'relative',
});
```

---

## ✅ 긍정적인 부분

1. **초기화 순서**: `logseq.ready()` 내에서 적절한 순서로 API 호출
2. **이벤트 핸들링**: `ui:visible:changed` 이벤트 리스너 등록
3. **타입 안정성**: TypeScript 사용
4. **React 18**: `createRoot` API 사용 (최신 방식)

---

## 📝 수정 우선순위

### 즉시 수정 (Critical)
1. ✅ **renderApp 함수 중복 제거** - 컴파일 오류 해결

### 빠른 수정 (Major)
2. ⚠️ **LogSeq API 사용법 검증** - 공식 문서 확인 후 수정
3. ⚠️ **렌더링 로직 통합** - 일관된 UI 제공

### 개선 (Minor)
4. 💡 **스타일 분리** - 가독성 향상

---

## 🔍 추가 확인 사항

### LogSeq API 문서 확인 필요
다음 API들의 정확한 사용법을 확인해야 합니다:

1. **registerUIItem**:
   ```typescript
   // 현재 코드
   logseq.App.registerUIItem('toolbar', {...})
   
   // 확인 필요: 올바른 형식인지
   ```

2. **registerCommandPalette**:
   ```typescript
   // 현재 코드
   logseq.App.registerCommandPalette({...}, callback)
   
   // 확인 필요: API 이름과 시그니처
   ```

3. **provideModel**:
   ```typescript
   // 현재 코드
   logseq.provideModel({ togglePluginUI() {...} })
   
   // 확인 필요: 모델 제공 방식
   ```

### 테스트 필요
- [ ] 플러그인이 LogSeq에서 정상 로드되는지
- [ ] 툴바 버튼이 표시되는지
- [ ] 명령어 팔레트에서 명령어가 보이는지
- [ ] UI 토글이 정상 작동하는지
- [ ] 닫기 버튼이 작동하는지

---

## 📚 참고 자료

- [LogSeq 플러그인 공식 문서](https://logseq.github.io/plugins/)
- [LogSeq 플러그인 샘플](https://github.com/logseq/logseq-plugin-samples)
- [@logseq/libs 타입 정의](https://github.com/logseq/logseq/tree/master/packages/libs)

---

## 결론

**현재 상태**: ❌ **수정 필요**

**다음 단계**:
1. renderApp 함수 중복 제거 (즉시)
2. LogSeq 공식 문서 확인 및 API 사용법 검증
3. 렌더링 로직 통합
4. 테스트 실행 및 검증

**예상 작업 시간**: 30분 ~ 1시간

---

**리뷰 완료일**: 2026-01-28  
**승인 여부**: ❌ 수정 후 재검토 필요
