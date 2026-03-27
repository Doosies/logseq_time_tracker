<script lang="ts">
    import * as Popover from '../';

    interface Props {
        trigger_label?: string;
        content_text?: string;
        content_label?: string;
    }

    let { trigger_label = '열기', content_text = '팝오버 본문', content_label = '팝오버 패널' }: Props = $props();
</script>

<Popover.Root>
    <Popover.Trigger>{trigger_label}</Popover.Trigger>
    <Popover.Content label={content_label}>{content_text}</Popover.Content>
</Popover.Root>
