<script lang="ts">
    import type { Category } from '../../types/category';
    import type { DataField } from '../../types/meta';
    import type { Job } from '../../types/job';

    import RelationField from './components/relation_field.svelte';
    import { resolveFieldComponent } from './field_component_registry';

    interface Props {
        field: DataField;
        value: unknown;
        onChange: (value: unknown) => void;
        readonly?: boolean;
        relation_jobs?: Job[];
        relation_categories?: Category[];
    }

    let { field, value, onChange, readonly = false, relation_jobs = [], relation_categories = [] }: Props = $props();

    const FieldComponent = $derived(resolveFieldComponent(field));
</script>

{#if field.data_type === 'relation'}
    <RelationField {field} {value} {onChange} {readonly} jobs={relation_jobs} categories={relation_categories} />
{:else if FieldComponent}
    {@const FieldView = FieldComponent}
    <FieldView {field} {value} {onChange} {readonly} />
{:else}
    <input
        type="text"
        value={String(value ?? '')}
        disabled={readonly}
        onchange={(e) => onChange(e.currentTarget.value)}
    />
{/if}
