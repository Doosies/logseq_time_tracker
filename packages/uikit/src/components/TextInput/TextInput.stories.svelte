<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import TextInput from './TextInput.svelte';

    const { Story } = defineMeta({
        component: TextInput,
        title: 'uikit/TextInput',
        argTypes: {
            disabled: { control: 'boolean' },
            oninput: { action: 'input' },
        },
    });

    function handleInput(v) {
        console.log('Input:', v);
    }
</script>

<Story name="Default" />

<Story name="WithPlaceholder" args={{ placeholder: '입력하세요...' }} />

<Story name="WithInitialValue" args={{ value: '초기값' }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="WithInputHandler" args={{ oninput: handleInput }} />
