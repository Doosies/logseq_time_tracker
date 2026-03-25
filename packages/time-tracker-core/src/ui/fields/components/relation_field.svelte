<script lang="ts">
    import CategorySelector from '../../../components/CategorySelector/CategorySelector.svelte';
    import JobSelector from '../../../components/JobSelector/JobSelector.svelte';
    import * as css from './field_primitives.css';
    import type { Category } from '../../../types/category';
    import type { DataField } from '../../../types/meta';
    import type { Job } from '../../../types/job';

    let {
        field,
        value,
        onChange,
        readonly = false,
        jobs = [],
        categories = [],
    }: {
        field: DataField;
        value: unknown;
        onChange: (value: unknown) => void;
        readonly?: boolean;
        jobs?: Job[];
        categories?: Category[];
    } = $props();

    const selected_id = $derived(value === null || value === undefined || value === '' ? null : String(value));

    const rel_key = $derived(field.relation_entity_key.trim().toLowerCase());

    const use_job_selector = $derived(rel_key === 'job' && jobs.length > 0);
    const use_category_selector = $derived(rel_key === 'category' && categories.length > 0);

    const text_value = $derived(selected_id ?? '');
</script>

<div class={css.field_block}>
    <span class={css.label} id="{field.id}-label"
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</span
    >

    {#if readonly}
        <span class={css.readonly_value}>{text_value === '' ? '—' : text_value}</span>
    {:else if use_job_selector}
        <JobSelector {jobs} {selected_id} onSelect={(id) => onChange(id)} />
    {:else if use_category_selector}
        <CategorySelector {categories} {selected_id} onSelect={(id) => onChange(id)} />
    {:else}
        <input
            id={field.id}
            class={css.input}
            type="text"
            value={text_value}
            placeholder="엔티티 ID"
            aria-labelledby="{field.id}-label"
            oninput={(e) => onChange(e.currentTarget.value)}
        />
    {/if}
</div>
