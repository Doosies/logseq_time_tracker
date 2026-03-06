<script lang="ts">
    import { Button, Section } from '@personal/uikit';

    const RESULT_TEXT = '1 + 1 = 2';
    let result_text = $state<string | null>(null);

    function handleCalculate(): void {
        result_text = RESULT_TEXT;
    }
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>1+1 계산기</Section.Title>
    </Section.Header>
    <Section.Content>
        <div class="calculator-inner">
            <Button variant="secondary" onclick={handleCalculate}>계산하기</Button>
            {#if result_text}
                <p class="result">{result_text}</p>
            {/if}
        </div>
    </Section.Content>
</Section.Root>

<style>
    .calculator-inner {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
    }

    .result {
        margin: 0;
        font-size: var(--font-size-md);
    }
</style>
