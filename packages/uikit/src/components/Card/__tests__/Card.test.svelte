<script lang="ts">
    import * as Card from '../';

    interface Props {
        header_text?: string;
        body_text?: string;
        footer_text?: string;
    }

    let { header_text = '카드 제목', body_text = '카드 본문', footer_text = '카드 하단' }: Props = $props();
</script>

<Card.Root>
    <Card.Header>{header_text}</Card.Header>
    <Card.Body>{body_text}</Card.Body>
    <Card.Footer>{footer_text}</Card.Footer>
</Card.Root>
