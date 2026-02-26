<script lang="ts">
    import type { SelectOption } from '../../design/types';
    import { Select as PrimitiveSelect } from '../../primitives/Select';
    import * as styles from '../../design/styles/select.css';

    interface SelectProps {
        value?: string | undefined;
        options: SelectOption[];
        disabled?: boolean | undefined;
        onchange?: ((value: string) => void) | undefined;
    }

    let { value = $bindable(), options, disabled = false, onchange }: SelectProps = $props();
</script>

<div class={styles.select_container}>
    <PrimitiveSelect class={styles.select_element} bind:value {options} {disabled} {onchange} />
</div>
