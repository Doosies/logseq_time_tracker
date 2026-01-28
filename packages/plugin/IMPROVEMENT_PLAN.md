# LogSeq 플러그인 향후 개선 계획

> **작성일**: 2026-01-28  
> **현재 버전**: 0.1.0  
> **목표**: 코드 품질, 유지보수성, 테스트, 성능 최적화

---

## 📊 현재 상태 분석

### ✅ 완료된 작업
- LogSeq API 사용법 수정 완료
- 중복 코드 제거 완료
- Linter 오류 없음
- 기본 테스트 구조 구축

### ⚠️ 개선 필요 영역
1. **스타일링**: `main.tsx`에 인라인 스타일 다수 존재
2. **아키텍처**: 모든 로직이 `main.tsx`에 집중
3. **에러 처리**: 에러 핸들링 로직 부재
4. **타입 안정성**: LogSeq API 타입 정의 부족
5. **테마 시스템**: 다크 테마 정의만 있고 미사용
6. **테스트**: 기본 컴포넌트 테스트만 존재
7. **성능**: 최적화 고려사항 없음

---

## 🎯 개선 계획

### Phase 1: 코드 품질 개선 (우선순위: 높음)

#### 1.1 스타일링 통합
**목표**: 인라인 스타일을 Vanilla Extract로 마이그레이션

**현재 문제**:
- `main.tsx` 88-96줄: 컨테이너 인라인 스타일
- `main.tsx` 99-110줄: 닫기 버튼 인라인 스타일

**개선 방안**:
```typescript
// src/styles/modal.css.ts 생성
export const modal_container = style({
    background: theme_vars.color.background,
    padding: theme_vars.space.large,
    borderRadius: theme_vars.radius.medium,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '400px',
    position: 'relative',
});

export const close_button = style({
    position: 'absolute',
    top: theme_vars.space.small,
    right: theme_vars.space.small,
    // ... 나머지 스타일
});
```

**예상 효과**:
- 스타일 재사용성 향상
- 테마 시스템과 통합
- 유지보수성 개선

**작업량**: 2시간

---

#### 1.2 관심사 분리 (Separation of Concerns)
**목표**: `main.tsx`의 책임 분산

**현재 문제**:
- LogSeq API 초기화
- 이벤트 핸들러 등록
- UI 렌더링
- 스타일 설정
모두 `main.tsx`에 집중

**개선 방안**:
```
src/
├── core/
│   ├── logseq-service.ts      # LogSeq API 래퍼
│   ├── plugin-registry.ts      # 플러그인 등록 로직
│   └── event-handlers.ts       # 이벤트 핸들러
├── components/
│   ├── Modal.tsx               # 모달 컨테이너 컴포넌트
│   └── CloseButton.tsx         # 닫기 버튼 컴포넌트
├── hooks/
│   ├── useLogseq.ts            # LogSeq API 훅
│   └── useTheme.ts             # 테마 관리 훅
└── utils/
    └── constants.ts            # 상수 정의
```

**구체적 구조**:

**1. LogSeq Service (`src/core/logseq-service.ts`)**
```typescript
/**
 * LogSeq API 래퍼 서비스
 * LogSeq API 호출을 중앙화하고 타입 안정성 제공
 */
export class LogSeqService {
    static registerToolbarButton(config: ToolbarButtonConfig) {
        logseq.App.registerUIItem('toolbar', config);
    }

    static registerCommand(config: CommandConfig) {
        logseq.App.registerCommand(config.key, config.options, config.handler);
    }

    static toggleUI() {
        logseq.toggleMainUI();
    }

    static showUI() {
        logseq.showMainUI();
    }

    static hideUI() {
        logseq.hideMainUI();
    }
}
```

**2. Plugin Registry (`src/core/plugin-registry.ts`)**
```typescript
/**
 * 플러그인 초기화 및 등록 관리
 */
export class PluginRegistry {
    static async initialize() {
        await logseq.ready();
        
        this.registerToolbar();
        this.registerCommands();
        this.registerEventHandlers();
    }

    private static registerToolbar() {
        // 툴바 버튼 등록 로직
    }

    private static registerCommands() {
        // 명령어 등록 로직
    }

    private static registerEventHandlers() {
        // 이벤트 핸들러 등록 로직
    }
}
```

**3. Modal Component (`src/components/Modal.tsx`)**
```typescript
interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    return (
        <div className={modal_container}>
            <CloseButton onClick={onClose} />
            {children}
        </div>
    );
};
```

**예상 효과**:
- 단일 책임 원칙 준수
- 테스트 용이성 향상
- 코드 재사용성 증가

**작업량**: 4시간

---

#### 1.3 타입 안정성 강화
**목표**: LogSeq API 타입 정의 및 타입 가드 추가

**개선 방안**:
```typescript
// src/types/logseq.d.ts
declare module '@logseq/libs' {
    export interface LogSeqAPI {
        ready: () => Promise<void>;
        setMainUIInlineStyle: (style: CSSProperties) => void;
        showMainUI: () => void;
        hideMainUI: () => void;
        toggleMainUI: () => void;
        App: {
            registerUIItem: (type: string, config: UIItemConfig) => void;
            registerCommand: (
                key: string,
                options: CommandOptions,
                handler: () => void
            ) => void;
            registerCommandPalette: (
                options: CommandPaletteOptions,
                handler: () => void
            ) => void;
        };
        provideModel: (model: Record<string, Function>) => void;
        on: (event: string, handler: (data: any) => void) => void;
    }

    export const logseq: LogSeqAPI;
}

// src/utils/type-guards.ts
export function isLogSeqReady(): boolean {
    return typeof logseq !== 'undefined' && typeof logseq.ready === 'function';
}
```

**예상 효과**:
- 컴파일 타임 타입 체크
- IDE 자동완성 지원
- 런타임 에러 감소

**작업량**: 2시간

---

### Phase 2: 유지보수성 향상 (우선순위: 중간)

#### 2.1 에러 처리 시스템 구축
**목표**: 일관된 에러 처리 및 로깅

**개선 방안**:
```typescript
// src/core/errors.ts
export class PluginError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'PluginError';
    }
}

export class LogSeqAPIError extends PluginError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'LOGSEQ_API_ERROR', context);
        this.name = 'LogSeqAPIError';
    }
}

// src/core/error-handler.ts
export class ErrorHandler {
    static handle(error: unknown, context?: string) {
        if (error instanceof PluginError) {
            console.error(`[${context}] ${error.code}:`, error.message, error.context);
        } else {
            console.error(`[${context}] Unexpected error:`, error);
        }
    }
}
```

**사용 예시**:
```typescript
try {
    await logseq.ready();
} catch (error) {
    ErrorHandler.handle(error, 'Plugin initialization');
    throw new LogSeqAPIError('Failed to initialize LogSeq API', { error });
}
```

**예상 효과**:
- 에러 추적 용이성 향상
- 디버깅 시간 단축
- 사용자 경험 개선

**작업량**: 3시간

---

#### 2.2 설정 관리 시스템
**목표**: 하드코딩된 값들을 설정으로 분리

**개선 방안**:
```typescript
// src/config/plugin.config.ts
export const PLUGIN_CONFIG = {
    id: 'logseq-plugin-personal',
    name: 'Personal Plugin',
    version: '0.1.0',
    ui: {
        minWidth: '400px',
        position: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        },
        zIndex: 999,
    },
    shortcuts: {
        showUI: 'mod+shift+p',
        toggleUI: 'ctrl+shift+e',
    },
    toolbar: {
        key: 'personal-plugin-toolbar',
        icon: 'ti ti-box',
        title: 'Personal Plugin',
    },
} as const;

// src/config/theme.config.ts
export const THEME_CONFIG = {
    light: {
        // 기존 light_theme 값들
    },
    dark: {
        // 기존 dark_theme 값들
    },
} as const;
```

**예상 효과**:
- 설정 변경 용이성
- 환경별 설정 지원 가능
- 코드 가독성 향상

**작업량**: 2시간

---

#### 2.3 테마 시스템 개선
**목표**: 다크 테마 활성화 및 동적 테마 전환

**개선 방안**:
```typescript
// src/hooks/useTheme.ts
export const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // LogSeq 테마 감지
        const detectTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        };

        detectTheme();
        
        // 테마 변경 감지
        const observer = new MutationObserver(detectTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return { theme, setTheme };
};

// App.tsx에서 사용
const App = () => {
    const { theme } = useTheme();
    const themeClass = theme === 'dark' ? dark_theme : light_theme;

    return (
        <div className={`${styles.container} ${themeClass}`}>
            {/* ... */}
        </div>
    );
};
```

**예상 효과**:
- LogSeq 테마와 자동 동기화
- 사용자 경험 일관성
- 접근성 향상

**작업량**: 3시간

---

### Phase 3: 테스트 전략 (우선순위: 중간)

#### 3.1 단위 테스트 확장
**목표**: 핵심 로직 테스트 커버리지 80% 이상

**테스트 대상**:
1. **컴포넌트 테스트** (현재 존재)
   - ✅ App 컴포넌트 기본 테스트
   - ⚠️ 엣지 케이스 추가 필요

2. **서비스 테스트** (신규)
   ```typescript
   // tests/core/logseq-service.test.ts
   describe('LogSeqService', () => {
       it('should toggle UI when toggleUI is called', () => {
           // Mock logseq API
           // Test toggleUI
       });
   });
   ```

3. **유틸리티 테스트** (신규)
   ```typescript
   // tests/utils/type-guards.test.ts
   describe('isLogSeqReady', () => {
       it('should return true when logseq is available', () => {
           // Test type guard
       });
   });
   ```

4. **에러 핸들러 테스트** (신규)
   ```typescript
   // tests/core/error-handler.test.ts
   describe('ErrorHandler', () => {
       it('should handle PluginError correctly', () => {
           // Test error handling
       });
   });
   ```

**테스트 구조**:
```
tests/
├── components/
│   └── App.test.tsx (기존)
├── core/
│   ├── logseq-service.test.ts
│   ├── plugin-registry.test.ts
│   └── error-handler.test.ts
├── hooks/
│   ├── useTheme.test.ts
│   └── useLogseq.test.ts
├── utils/
│   └── type-guards.test.ts
└── setup.ts (기존)
```

**예상 효과**:
- 버그 조기 발견
- 리팩토링 안정성 향상
- 문서화 효과

**작업량**: 6시간

---

#### 3.2 통합 테스트
**목표**: 플러그인 초기화 및 이벤트 흐름 테스트

**개선 방안**:
```typescript
// tests/integration/plugin-init.test.ts
describe('Plugin Initialization', () => {
    it('should initialize plugin successfully', async () => {
        // Mock LogSeq API
        // Test full initialization flow
    });

    it('should handle initialization errors gracefully', async () => {
        // Test error scenarios
    });
});
```

**작업량**: 3시간

---

#### 3.3 E2E 테스트 (선택사항)
**목표**: 실제 LogSeq 환경에서의 동작 검증

**도구**: Playwright 또는 Cypress  
**작업량**: 8시간 (선택사항)

---

### Phase 4: 성능 최적화 (우선순위: 낮음)

#### 4.1 React 최적화
**목표**: 불필요한 리렌더링 방지

**개선 방안**:
```typescript
// App.tsx
import { memo, useCallback, useMemo } from 'react';

const App = memo(() => {
    const [count, setCount] = useState(0);

    // useCallback으로 핸들러 메모이제이션
    const handleIncrement = useCallback(() => {
        setCount((prev) => prev + 1);
    }, []);

    const handleDecrement = useCallback(() => {
        setCount((prev) => prev - 1);
    }, []);

    const handleReset = useCallback(() => {
        setCount(0);
    }, []);

    // useMemo로 계산값 메모이제이션
    const countDisplay = useMemo(() => `Count: ${count}`, [count]);

    return (
        <div className={`${styles.container} ${light_theme}`}>
            <h1 className={styles.title}>Logseq Personal Plugin</h1>
            <div className={styles.counter_section}>
                <p className={styles.count_text}>{countDisplay}</p>
                <div className={styles.button_group}>
                    <button onClick={handleDecrement} className={styles.button}>
                        -
                    </button>
                    <button onClick={handleReset} className={styles.button}>
                        Reset
                    </button>
                    <button onClick={handleIncrement} className={styles.button}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
});
```

**예상 효과**:
- 리렌더링 최소화
- 메모리 사용량 감소
- 반응성 향상

**작업량**: 1시간

---

#### 4.2 코드 스플리팅 (선택사항)
**목표**: 초기 로딩 시간 단축

**개선 방안**:
```typescript
// Lazy loading for heavy components
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// Suspense로 감싸기
<Suspense fallback={<Loading />}>
    <HeavyComponent />
</Suspense>
```

**작업량**: 2시간 (필요시)

---

#### 4.3 번들 크기 최적화
**목표**: 프로덕션 번들 크기 최소화

**현재 상태 확인**:
```bash
pnpm build --analyze
```

**최적화 방안**:
- Tree shaking 확인
- 불필요한 의존성 제거
- 동적 import 활용

**작업량**: 2시간

---

## 📋 우선순위 요약

### 🔴 높음 (즉시 진행)
1. **스타일링 통합** (2시간)
   - 인라인 스타일 → Vanilla Extract
   - 즉각적인 가독성 향상

2. **관심사 분리** (4시간)
   - 아키텍처 개선
   - 장기적 유지보수성

3. **타입 안정성 강화** (2시간)
   - 타입 정의 추가
   - 개발 경험 개선

**총 작업량**: 8시간

---

### 🟡 중간 (다음 스프린트)
4. **에러 처리 시스템** (3시간)
5. **설정 관리 시스템** (2시간)
6. **테마 시스템 개선** (3시간)
7. **단위 테스트 확장** (6시간)
8. **통합 테스트** (3시간)

**총 작업량**: 17시간

---

### 🟢 낮음 (향후 고려)
9. **React 최적화** (1시간)
10. **코드 스플리팅** (2시간, 선택사항)
11. **번들 크기 최적화** (2시간)
12. **E2E 테스트** (8시간, 선택사항)

**총 작업량**: 13시간 (선택사항 포함)

---

## 🎯 단계별 실행 계획

### Sprint 1 (1주)
- ✅ 스타일링 통합
- ✅ 관심사 분리 (핵심)
- ✅ 타입 안정성 강화

### Sprint 2 (1주)
- ✅ 에러 처리 시스템
- ✅ 설정 관리 시스템
- ✅ 테마 시스템 개선

### Sprint 3 (1주)
- ✅ 단위 테스트 확장
- ✅ 통합 테스트
- ✅ React 최적화

---

## 📊 성공 지표

### 코드 품질
- [ ] 인라인 스타일 0개
- [ ] 함수당 평균 라인 수 < 50
- [ ] 순환 복잡도 < 10

### 테스트
- [ ] 테스트 커버리지 > 80%
- [ ] 모든 핵심 로직 테스트 존재

### 성능
- [ ] 초기 로딩 시간 < 500ms
- [ ] 번들 크기 < 100KB (gzipped)

### 유지보수성
- [ ] 모든 에러 케이스 처리
- [ ] 타입 안정성 100%
- [ ] 설정값 하드코딩 0개

---

## 🔄 지속적 개선

### 코드 리뷰 체크리스트
- [ ] 단일 책임 원칙 준수
- [ ] 에러 처리 포함
- [ ] 타입 정의 완료
- [ ] 테스트 작성
- [ ] 문서화 완료

### 정기 점검
- 주간: 코드 품질 메트릭 확인
- 월간: 아키텍처 리뷰
- 분기: 기술 부채 정리

---

## 📚 참고 자료

### 아키텍처 패턴
- Clean Architecture
- Separation of Concerns
- SOLID 원칙

### React Best Practices
- React 19 공식 문서
- React Performance 최적화 가이드

### LogSeq 플러그인 개발
- LogSeq Plugin API 문서
- Vanilla Extract 문서

---

**작성자**: Planner Agent  
**검토 필요**: Developer Agent, QA Agent
