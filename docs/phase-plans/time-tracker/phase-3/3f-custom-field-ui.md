# Phase 3F: 커스텀 필드 UI

## 목표

`FieldRenderer` 시스템, `CustomFieldEditor`, `CustomFieldManager` UI 컴포넌트를 구현합니다. `data_type`·`view_type`에 따라 적절한 입력 컴포넌트를 선택·렌더링하고, 엔티티별 커스텀 필드 정의를 관리할 수 있는 화면을 제공합니다.

---

## 선행 조건

- **Phase 3B** 완료 — `DataFieldService` 구현, `DataField` CRUD, `data_type` / `entity_type` 시드 데이터

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `06-ui-ux.md` | §Core UI 컴포넌트 분기 | `FieldRenderer`, `data_type`별 컴포넌트 매핑 |
| `03-data-model.md` | §1.3 view_type 규칙 | `data_type`별 허용 `view_type` |
| `09-user-flows.md` | UF-15 | 커스텀 필드 관리 사용자 플로우 |

---

## 생성/변경 파일 목록

모든 경로는 `packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `ui/fields/field_renderer.svelte` | 동적 필드 렌더러 | 신규 |
| `ui/fields/field_component_registry.ts` | `(data_type, view_type)` → 컴포넌트 매핑 | 신규 |
| `ui/fields/components/string_field.svelte` | 텍스트 입력 | 신규 |
| `ui/fields/components/decimal_field.svelte` | 숫자 입력 | 신규 |
| `ui/fields/components/date_field.svelte` | 날짜 선택 | 신규 |
| `ui/fields/components/datetime_field.svelte` | 날짜+시간 선택 | 신규 |
| `ui/fields/components/boolean_field.svelte` | 토글/체크박스 | 신규 |
| `ui/fields/components/enum_field.svelte` | 선택 목록/라디오 | 신규 |
| `ui/fields/components/relation_field.svelte` | 엔티티 참조 선택 | 신규 |
| `components/CustomFieldEditor/CustomFieldEditor.svelte` | 필드 값 편집 | 신규 |
| `components/CustomFieldManager/CustomFieldManager.svelte` | 필드 정의 관리 | 신규 |

---

## 상세 구현 내용

### 1. FieldRenderer 시스템

출처: `06-ui-ux.md` — Core UI 컴포넌트 분기.

#### 1.1 `field_component_registry.ts`

- **역할**: `(data_type, view_type)` → Svelte 컴포넌트 매핑 테이블을 유지합니다.
- **`resolveFieldComponent(field: DataField)`**:
  - `field.view_type === 'default'`이면 해당 `data_type`의 **기본** 컴포넌트를 반환합니다.
  - 그 외 명시적 `view_type`이면 레지스트리에서 **override** 컴포넌트를 조회합니다. 키가 없으면 `field_renderer.svelte`에서 fallback 처리(아래).
- 타입은 `Component` 또는 프로젝트에서 쓰는 Svelte 5 컴포넌트 타입으로 통일합니다.

**기본 컴포넌트 매핑** (출처: `03-data-model.md` §1.3 `view_type` 규칙):

| data_type | default 컴포넌트 | 비고 |
| --- | --- | --- |
| `string` | text input | `textarea`는 `view_type === 'textarea'`일 때 |
| `decimal` | number input | `step="any"` |
| `date` | DatePicker | Phase 3D에서 구현한 컴포넌트 재사용 |
| `datetime` | DatePicker + 시간 | 동일 DatePicker 기반, 시간 입력 조합 |
| `boolean` | toggle switch | `checkbox`는 `view_type === 'checkbox'` |
| `enum` | select dropdown | `radio`는 `view_type === 'radio'` |
| `relation` | entity selector | `JobSelector` / `CategorySelector` 등 기존 선택 UI 활용 |

레지스트리 예시(개념):

```typescript
import type { Component } from 'svelte';
import type { DataField } from '../../types/meta';

type FieldComponentKey = `${string}:${string}`;

const default_by_data_type: Record<string, Component> = {
  /* string → StringField default variant 등 */
};

const override_registry: Partial<Record<FieldComponentKey, Component>> = {
  /* 'string:textarea' → Textarea variant */
};

export function resolveFieldComponent(field: DataField): Component {
  const { data_type, view_type } = field;
  if (view_type && view_type !== 'default') {
    const key = `${data_type}:${view_type}` as FieldComponentKey;
    const override = override_registry[key];
    if (override) return override;
  }
  const fallback = default_by_data_type[data_type];
  if (!fallback) {
    /* 호출부에서 텍스트 input fallback */
    throw new Error(`Unknown data_type: ${data_type}`);
  }
  return fallback;
}
```

실제 구현에서는 `throw` 대신 `field_renderer`가 알 수 없는 조합을 흡수하도록 할 수 있습니다(아래 에러 바운더리).

#### 1.2 `field_renderer.svelte`

**Props** (Svelte 5 — `interface Props` + `$props()`):

```svelte
<script lang="ts">
  import type { DataField } from '../../types/meta';

  interface Props {
    field: DataField;
    value: unknown;
    onChange: (value: unknown) => void;
    readonly?: boolean;
  }

  let { field, value, onChange, readonly = false }: Props = $props();
</script>
```

**동작**

1. `$derived`로 `resolveFieldComponent(field)` 결과를 컴포넌트 변수로 둡니다. `resolve` 실패·미등록 `view_type`이면 **텍스트 input**용 fallback 컴포넌트(또는 인라인 최소 입력)를 사용합니다.
2. `<svelte:component this={...} ... />` 패턴으로 동적 렌더링합니다. 공통으로 넘기는 props 예: `value`, `onChange`, `readonly`, `field`(옵션·메타 전달).
3. **에러 바운더리**: 알 수 없는 `view_type` 또는 매핑 누락 시 사용자에게 짧은 안내(또는 개발 모드 로그)와 함께 텍스트 input fallback으로 값 편집 가능하게 유지합니다.

---

### 2. `CustomFieldEditor.svelte`

**Props**

```svelte
<script lang="ts">
  import type { DataField } from '../../types/meta';

  interface Props {
    fields: DataField[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
  }

  let { fields, values, onChange }: Props = $props();
</script>
```

**기능**

- `fields`를 `sort_order` 오름차순으로 정렬한 뒤 `$derived`로 보관합니다.
- 각 행에 `FieldRenderer`를 배치하고, `value`는 `values[field.key]`로 전달합니다.
- **`is_required` 검증**: `$state` 또는 `$derived`로 필드별 에러 맵을 두고, 빈 값(문자열 trim 후 `''`, `null`, `undefined` 등 프로젝트 규약에 맞게 정의)이면 인라인 에러 메시지 표시. 제출/블러 시점 중 하나 이상에서 검증 트리거.
- 값 변경 시 `onChange(field.key, next_value)` 호출.

---

### 3. `CustomFieldManager.svelte`

**Props**

```svelte
<script lang="ts">
  import type { DataFieldService } from '../../services/data_field_service';

  interface Props {
    entity_type_id: string;
    data_field_service: DataFieldService;
  }

  let { entity_type_id, data_field_service }: Props = $props();
</script>
```

**기능**

- `$effect` 또는 명시적 `refresh()`로 현재 `entity_type_id`에 대한 `DataField` 목록을 로드하고, `sort_order` 순으로 표시합니다.
- **필드 추가 폼**: `key`, `label`, `data_type`(select), `view_type`(`data_type`별 허용 목록은 `03-data-model.md` §1.3과 동기화), `options`(`enum`일 때만), `is_required`.
- **삭제**: `is_system === true`이면 삭제 버튼 비활성화 및 **「시스템 필드」** 뱃지 표시.
- **순서**: `sort_order` 변경을 드래그 앤 드롭 또는 위/아래 버튼으로 지원. 변경 시 `DataFieldService`의 업데이트 API 호출(Phase 3B 계약에 맞춤).

---

### 4. 하위 필드 컴포넌트 공통 사항

- Svelte 5 **Runes** 사용: `$state`, `$derived`, `$effect`, `$props()` 등.
- `readonly === true`일 때 입력 비활성화·스타일 처리 일관화.
- `enum_field`: `field.options` 파싱(저장 형식은 `DataField` 타입·서비스와 일치) 후 select/radio 분기.
- `relation_field`: `relation_entity_key` 등 메타에 따라 `JobSelector` vs `CategorySelector` 분기.

---

## 완료 기준

- [ ] `field_component_registry.ts`: `(data_type, view_type)` → 컴포넌트 매핑, `resolveFieldComponent` 함수
- [ ] `field_renderer.svelte`: 동적 렌더링, 알 수 없는 `view_type` fallback
- [ ] `string_field`: text input + `textarea`(`view_type === 'textarea'`)
- [ ] `decimal_field`: number input (`step="any"`)
- [ ] `date_field`: DatePicker 재사용
- [ ] `datetime_field`: DatePicker + 시간 입력
- [ ] `boolean_field`: toggle switch + checkbox(`view_type === 'checkbox'`)
- [ ] `enum_field`: select dropdown + radio(`view_type === 'radio'`)
- [ ] `relation_field`: JobSelector / CategorySelector 활용
- [ ] `CustomFieldEditor`: `sort_order` 순 렌더링, `is_required` 검증
- [ ] `CustomFieldManager`: 필드 추가 폼, `is_system` 보호, `sort_order` 관리

---

## 다음 단계

→ **3G: 테스트** (커스텀 필드 UI 컴포넌트 테스트)
