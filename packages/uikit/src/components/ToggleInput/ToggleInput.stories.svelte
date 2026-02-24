<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import ToggleInput from './ToggleInput.svelte';

    const { Story } = defineMeta({
        component: ToggleInput,
        title: 'uikit/ToggleInput',
        argTypes: {
            isTextMode: { control: 'boolean' },
            onToggle: { action: 'toggled' },
            onchange: { action: 'changed' },
        },
    });

    const options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
    ];

    function handleChange(v) {
        console.log('Changed:', v);
    }
</script>

<Story name="SelectMode" args={{ options, isTextMode: false }} />

<Story name="TextMode" args={{ options, isTextMode: true }} />

<Story name="WithPrefix" args={{ options, prefix: 'Server:' }} />

<Story name="Interactive" args={{ options, onToggle: () => {} }} />

<Story name="WithChangeHandler" args={{ options, onchange: handleChange }} />
