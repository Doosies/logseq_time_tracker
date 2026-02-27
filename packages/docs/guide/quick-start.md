# Quick Start

## UIKit 컴포넌트 사용

### 1. 컴포넌트 import

```svelte
<script>
    import { Button, Card, Section, TextInput } from '@personal/uikit';
    import '@personal/uikit/design';
</script>

<Card.Root>
    <Card.Header>설정</Card.Header>
    <Card.Body>
        <Section.Root>
            <Section.Header>
                <Section.Title>기본 정보</Section.Title>
            </Section.Header>
            <Section.Content>
                <TextInput placeholder="이름을 입력하세요" />
                <Button variant="primary">저장</Button>
            </Section.Content>
        </Section.Root>
    </Card.Body>
</Card.Root>
```

### 2. Storybook에서 컴포넌트 확인

```bash
pnpm storybook
```

브라우저에서 모든 컴포넌트의 동작을 확인하고 인터랙션 테스트를 실행할 수 있습니다.

## Ecount Dev Tool 개발

### 1. 개발 서버 실행

```bash
cd packages/ecount-dev-tool
pnpm dev
```

### 2. Chrome에 로드

1. `chrome://extensions/`에서 개발자 모드 활성화
2. "압축해제된 확장 프로그램을 로드합니다" 클릭
3. `packages/ecount-dev-tool/dist/` 폴더 선택

### 3. 코드 수정

`packages/ecount-dev-tool/src/components/` 디렉토리의 Svelte 파일을 수정하면 HMR이 자동 반영됩니다.

## Time Tracker 플러그인 개발

### 1. 개발 서버 실행

```bash
cd packages/time-tracker
pnpm dev
```

### 2. Logseq에 플러그인 로드

1. Logseq에서 `Settings` → `Advanced` → `Developer mode` 활성화
2. `Plugins` → `Load unpacked plugin` → `packages/time-tracker` 선택

## 테스트 실행

```bash
# 전체 테스트
pnpm test

# 특정 패키지 테스트
cd packages/uikit
pnpm test
```

## 다음 단계

- [프로젝트 구조](/guide/project-structure) 이해하기
- [설정](/guide/configuration) 커스터마이징
- [API 레퍼런스](/api/) 살펴보기
