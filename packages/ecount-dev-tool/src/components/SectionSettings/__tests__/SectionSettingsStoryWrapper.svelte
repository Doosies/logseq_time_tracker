<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeVisibility } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder } from '#stores/section_order.svelte';
    import SectionSettings from '../SectionSettings.svelte';

    interface Props {
        sections?: Array<{ id: string; label: string }>;
    }

    let {
        sections = [
            { id: 'quick-login', label: '빠른 로그인' },
            { id: 'server-manager', label: '서버 관리' },
            { id: 'action-bar', label: '액션 바' },
        ],
    }: Props = $props();

    let ready = $state(false);

    onMount(async () => {
        const reset_storage = (globalThis as unknown as { __storybook_reset_storage?: () => void })
            .__storybook_reset_storage;
        if (reset_storage) {
            reset_storage();
        }

        await initializeVisibility();
        await initializeSectionOrder();
        ready = true;
    });
</script>

{#if ready}
    <SectionSettings {sections} />
{/if}
