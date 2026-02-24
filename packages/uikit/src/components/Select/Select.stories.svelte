<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Select from './Select.svelte';

    const { Story } = defineMeta({
        component: Select,
        title: 'uikit/Select',
        argTypes: {
            disabled: { control: 'boolean' },
            onchange: { action: 'changed' },
        },
    });

    const default_options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
    ];

    const two_options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
    ];

    const many_options = Array.from({ length: 10 }, (_, i) => ({
        value: 'opt' + i,
        label: 'Option ' + (i + 1),
    }));

    function handleChange(v) {
        console.log('Selected:', v);
    }
</script>

<Story name="Default" args={{ options: default_options }} />

<Story name="WithInitialValue" args={{ options: two_options, value: 'b' }} />

<Story name="Disabled" args={{ options: [{ value: 'a', label: 'Option A' }], disabled: true }} />

<Story name="ManyOptions" args={{ options: many_options }} />

<Story name="WithChangeHandler" args={{ options: two_options, onchange: handleChange }} />
