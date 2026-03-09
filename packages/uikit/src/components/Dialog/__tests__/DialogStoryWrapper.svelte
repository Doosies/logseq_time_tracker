<script lang="ts">
    import * as Dialog from '../index';

    interface Props {
        title?: string;
        description?: string;
        showForm?: boolean;
    }

    let {
        title = '스크립트 추가',
        description = '새로운 사용자 스크립트를 등록합니다.',
        showForm = false,
    }: Props = $props();
</script>

<Dialog.Root>
    <Dialog.Trigger>열기</Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
            <Dialog.Title>{title}</Dialog.Title>
            {#if description}
                <Dialog.Description>{description}</Dialog.Description>
            {/if}
            {#if showForm}
                <form data-testid="dialog-form" onsubmit={(e) => e.preventDefault()}>
                    <label for="script-name">이름</label>
                    <input id="script-name" type="text" placeholder="스크립트 이름" />
                    <label for="script-code">코드</label>
                    <textarea id="script-code" placeholder="코드 입력"></textarea>
                    <button type="submit">저장</button>
                </form>
            {:else}
                <p>모달 내용</p>
            {/if}
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
