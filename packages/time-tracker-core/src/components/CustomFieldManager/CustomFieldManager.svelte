<script lang="ts">
    import { SEEDED_DATA_TYPE_KEYS, VIEW_TYPES_BY_DATA_TYPE } from '../../constants/data_field_meta';
    import type { CreateDataFieldParams, DataFieldService } from '../../services/data_field_service';
    import * as css from './custom_field_manager.css';
    import type { DataField, DataTypeKey } from '../../types/meta';

    let {
        entity_type_id,
        data_field_service,
    }: {
        entity_type_id: string;
        data_field_service: DataFieldService;
    } = $props();

    let fields_list = $state<DataField[]>([]);
    let error_message = $state<string | null>(null);
    let is_loading = $state(true);
    let is_mutating = $state(false);

    let new_key = $state('');
    let new_label = $state('');
    let new_data_type = $state<DataTypeKey>(SEEDED_DATA_TYPE_KEYS[0]!);
    let new_view_type = $state('default');
    let new_options = $state('');
    let new_relation_key = $state('');
    let new_is_required = $state(false);

    const sorted_fields = $derived([...fields_list].sort((a, b) => a.sort_order - b.sort_order));

    const view_type_choices = $derived([...VIEW_TYPES_BY_DATA_TYPE[new_data_type]]);

    $effect(() => {
        const allowed = VIEW_TYPES_BY_DATA_TYPE[new_data_type];
        if (!allowed.includes(new_view_type)) {
            new_view_type = allowed[0] ?? 'default';
        }
    });

    async function refreshList() {
        const list = await data_field_service.getFieldsByEntity(entity_type_id);
        fields_list = list;
    }

    $effect(() => {
        const id = entity_type_id;
        const svc = data_field_service;
        let cancelled = false;
        is_loading = true;
        error_message = null;
        void (async () => {
            try {
                const list = await svc.getFieldsByEntity(id);
                if (!cancelled) {
                    fields_list = list;
                }
            } catch (e) {
                if (!cancelled) {
                    error_message = e instanceof Error ? e.message : '목록을 불러오지 못했습니다';
                }
            } finally {
                if (!cancelled) {
                    is_loading = false;
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    });

    async function handleCreate() {
        error_message = null;
        const key_trim = new_key.trim();
        const label_trim = new_label.trim();
        if (key_trim.length === 0 || label_trim.length === 0) {
            error_message = 'key와 label은 필수입니다';
            return;
        }
        if (new_data_type === 'enum' && new_options.trim().length === 0) {
            error_message = 'enum 타입은 options가 필요합니다';
            return;
        }
        if (new_data_type === 'relation' && new_relation_key.trim().length === 0) {
            error_message = 'relation 타입은 relation_entity_key가 필요합니다';
            return;
        }
        is_mutating = true;
        try {
            const max_sort = fields_list.length === 0 ? -1 : Math.max(...fields_list.map((f) => f.sort_order));
            const params: CreateDataFieldParams = {
                entity_type_id,
                data_type: new_data_type,
                key: key_trim,
                label: label_trim,
                view_type: new_view_type,
                is_required: new_is_required,
                sort_order: max_sort + 1,
            };
            if (new_data_type === 'enum') {
                params.options = new_options;
            }
            if (new_data_type === 'relation') {
                params.relation_entity_key = new_relation_key.trim();
            }
            await data_field_service.createField(params);
            new_key = '';
            new_label = '';
            new_options = '';
            new_relation_key = '';
            new_is_required = false;
            await refreshList();
        } catch (e) {
            error_message = e instanceof Error ? e.message : '필드 생성에 실패했습니다';
        } finally {
            is_mutating = false;
        }
    }

    async function handleDelete(field: DataField) {
        if (field.is_system) {
            return;
        }
        error_message = null;
        is_mutating = true;
        try {
            await data_field_service.deleteField(field.id);
            await refreshList();
        } catch (e) {
            error_message = e instanceof Error ? e.message : '삭제에 실패했습니다';
        } finally {
            is_mutating = false;
        }
    }

    async function moveField(sorted_index: number, direction: -1 | 1) {
        const list = sorted_fields;
        const j = sorted_index + direction;
        if (j < 0 || j >= list.length) {
            return;
        }
        const field_a = list[sorted_index];
        const field_b = list[j];
        if (!field_a || !field_b) {
            return;
        }
        error_message = null;
        is_mutating = true;
        try {
            const sort_a = field_a.sort_order;
            const sort_b = field_b.sort_order;
            await data_field_service.updateField(field_a.id, { sort_order: sort_b });
            await data_field_service.updateField(field_b.id, { sort_order: sort_a });
            await refreshList();
        } catch (e) {
            error_message = e instanceof Error ? e.message : '순서 변경에 실패했습니다';
        } finally {
            is_mutating = false;
        }
    }
</script>

<div class={css.root}>
    <h2 class={css.section_title}>사용자 정의 필드</h2>

    {#if error_message}
        <div class={css.error_banner} role="alert">{error_message}</div>
    {/if}

    {#if is_loading}
        <p class={css.muted}>불러오는 중…</p>
    {:else}
        <ul class={css.list}>
            {#each sorted_fields as field, index (field.id)}
                <li class={css.list_item}>
                    <div class={css.field_meta}>
                        <span class={css.field_label}>{field.label}</span>
                        <span class={css.field_sub}>
                            {field.key} · {field.data_type} · {field.view_type} · 순서 {field.sort_order}
                        </span>
                    </div>
                    {#if field.is_system}
                        <span class={css.badge_system}>시스템 필드</span>
                    {/if}
                    <div class={css.actions}>
                        <button
                            type="button"
                            class={css.icon_button}
                            disabled={is_mutating || index === 0}
                            aria-label="위로 이동"
                            onclick={() => moveField(index, -1)}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            class={css.icon_button}
                            disabled={is_mutating || index === sorted_fields.length - 1}
                            aria-label="아래로 이동"
                            onclick={() => moveField(index, 1)}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            class={css.danger_button}
                            disabled={is_mutating || field.is_system}
                            onclick={() => handleDelete(field)}
                        >
                            삭제
                        </button>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}

    <h3 class={css.section_title}>필드 추가</h3>
    <div class={css.form_card}>
        <div class={css.form_row}>
            <label class={css.form_label} for="cfm-key">key</label>
            <input id="cfm-key" class={css.form_input} type="text" bind:value={new_key} />
        </div>
        <div class={css.form_row}>
            <label class={css.form_label} for="cfm-label">label</label>
            <input id="cfm-label" class={css.form_input} type="text" bind:value={new_label} />
        </div>
        <div class={css.form_row}>
            <label class={css.form_label} for="cfm-dtype">data_type</label>
            <select id="cfm-dtype" class={css.form_input} bind:value={new_data_type}>
                {#each SEEDED_DATA_TYPE_KEYS as dt (dt)}
                    <option value={dt}>{dt}</option>
                {/each}
            </select>
        </div>
        <div class={css.form_row}>
            <label class={css.form_label} for="cfm-vtype">view_type</label>
            <select id="cfm-vtype" class={css.form_input} bind:value={new_view_type}>
                {#each view_type_choices as vt (vt)}
                    <option value={vt}>{vt}</option>
                {/each}
            </select>
        </div>
        {#if new_data_type === 'enum'}
            <div class={css.form_row}>
                <label class={css.form_label} for="cfm-options">options (쉼표 또는 JSON 배열)</label>
                <textarea id="cfm-options" class={css.form_input} rows={3} bind:value={new_options}></textarea>
            </div>
        {/if}
        {#if new_data_type === 'relation'}
            <div class={css.form_row}>
                <label class={css.form_label} for="cfm-rel">relation_entity_key</label>
                <input
                    id="cfm-rel"
                    class={css.form_input}
                    type="text"
                    placeholder="job 또는 category"
                    bind:value={new_relation_key}
                />
            </div>
        {/if}
        <label class={css.checkbox_row}>
            <input type="checkbox" bind:checked={new_is_required} />
            <span class={css.form_label}>필수</span>
        </label>
        <div class={css.form_actions}>
            <button type="button" class={css.primary_button} disabled={is_mutating} onclick={handleCreate}>
                추가
            </button>
        </div>
    </div>
</div>
