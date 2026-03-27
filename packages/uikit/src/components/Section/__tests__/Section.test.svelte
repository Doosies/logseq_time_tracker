<script lang="ts">
    import * as Section from '../';

    interface Props {
        title_text?: string;
        content_text?: string;
        action_label?: string;
    }

    let { title_text = '섹션 제목', content_text = '본문 내용', action_label = '액션' }: Props = $props();
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>{title_text}</Section.Title>
        <Section.Action>
            <button type="button">{action_label}</button>
        </Section.Action>
    </Section.Header>
    <Section.Content>
        <p>{content_text}</p>
    </Section.Content>
</Section.Root>
