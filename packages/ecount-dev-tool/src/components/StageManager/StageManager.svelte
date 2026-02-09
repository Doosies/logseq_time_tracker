<script lang="ts">
    import { Section, Select } from '@personal/uikit';
    import { STAGE_SERVER_OPTIONS } from '@/constants';

    interface StageManagerProps {
        current_stage: string;
        onchange?: (stage: string) => void;
    }

    let {
        current_stage = $bindable(),
        onchange,
    }: StageManagerProps = $props();
</script>

<Section title="Stage Server">
    <div style="margin-bottom: 8px;">
        <span style="font-size: 12px;">Current: {current_stage}</span>
    </div>

    <Select
        bind:value={current_stage}
        options={STAGE_SERVER_OPTIONS}
        onchange={onchange}
    />
</Section>
