<script lang="ts">
    import { Section, ToggleInput } from '@personal/uikit';
    import { V3_SERVER_OPTIONS, V5_SERVER_OPTIONS } from '@/constants';
    import type { ServerConfig } from '@/types';

    interface ServerManagerProps {
        current_server: string;
        initial_v3: string;
        initial_v5: string;
        onchange?: (config: ServerConfig) => void;
    }

    let {
        current_server,
        initial_v3 = $bindable(),
        initial_v5 = $bindable(),
        onchange,
    }: ServerManagerProps = $props();

    let v3_text_mode = $state(false);
    let v5_text_mode = $state(false);

    const handleV3Change = (value: string) => {
        initial_v3 = value;
        onchange?.({ v5_domain: initial_v5, v3_domain: initial_v3 });
    };

    const handleV5Change = (value: string) => {
        initial_v5 = value;
        onchange?.({ v5_domain: initial_v5, v3_domain: initial_v3 });
    };
</script>

<Section title="Server Change">
    <div style="margin-bottom: 8px;">
        <span style="font-size: 12px;">Current Server: {current_server}</span>
    </div>

    <ToggleInput
        bind:value={initial_v3}
        prefix="v3"
        options={V3_SERVER_OPTIONS}
        isTextMode={v3_text_mode}
        onToggle={() => v3_text_mode = !v3_text_mode}
        onchange={handleV3Change}
    />

    <ToggleInput
        bind:value={initial_v5}
        prefix="v5"
        options={V5_SERVER_OPTIONS}
        isTextMode={v5_text_mode}
        onToggle={() => v5_text_mode = !v5_text_mode}
        onchange={handleV5Change}
    />
</Section>
