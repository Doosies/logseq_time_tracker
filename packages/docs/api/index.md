# API Reference

## @personal/uikit

Svelte 5 기반 공유 UI 컴포넌트 라이브러리의 API 문서입니다.

## 구조

UIKit은 세 가지 레이어로 구성됩니다:

- **Components** - Styled compound 컴포넌트 (vanilla-extract 스타일 포함)
- **Actions** - Svelte use: 디렉티브용 액션 함수
- **Design Tokens** - 테마 변수, Light/Dark 테마

## 컴포넌트 종류

### Simple 컴포넌트

단일 import으로 사용하는 컴포넌트입니다.

| 컴포넌트      | 설명                            |
| ------------- | ------------------------------- |
| `Button`      | 버튼 (primary/secondary/accent) |
| `ButtonGroup` | 버튼 그룹 레이아웃              |
| `TextInput`   | 텍스트 입력 필드                |
| `Select`      | 드롭다운 선택                   |

### Compound 컴포넌트

네임스페이스 import로 사용하며, 여러 sub-component로 구성됩니다.

| 컴포넌트       | Sub-components                       | 설명                        |
| -------------- | ------------------------------------ | --------------------------- |
| `Card`         | Root, Header, Body, Footer           | 카드 컨테이너               |
| `Section`      | Root, Header, Title, Action, Content | 섹션 레이아웃 (접기/펼치기) |
| `ToggleInput`  | Root, Prefix, Toggle                 | 토글 스위치                 |
| `Popover`      | Root, Trigger, Content               | 팝오버 (clickOutside 닫힘)  |
| `Toast`        | Provider, Root                       | 토스트 알림 (타이머)        |
| `CheckboxList` | Root, Item                           | 체크박스 리스트 (DnD 지원)  |
| `Dnd`          | Zone, Row, Handle                    | 드래그앤드롭                |

## Import

```typescript
// Simple 컴포넌트
import { Button, TextInput, Select, ButtonGroup } from '@personal/uikit';

// Compound 컴포넌트
import { Card, Section, Popover, Toast, CheckboxList, Dnd, ToggleInput } from '@personal/uikit';

// Actions
import { clickOutside, blockDragFromInteractive } from '@personal/uikit';

// 타입
import type { ButtonVariant, ButtonSize, SelectOption, DndEvent } from '@personal/uikit';

// 디자인 시스템
import { theme_vars, light_theme, dark_theme } from '@personal/uikit/design';
```

## 상세 문서

- [Components](/api/components) - 컴포넌트 Props 및 사용법
- [Actions](/api/actions) - Svelte actions
- [Design Tokens](/api/design-tokens) - 테마 및 디자인 토큰
