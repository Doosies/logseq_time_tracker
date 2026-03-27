<script lang="ts">
    import Provider from '../Provider.svelte';
    import Root from '../Root.svelte';
    import ToastTrigger from './ToastTrigger.svelte';

    interface Props {
        duration?: number;
    }

    let { duration = 60_000 }: Props = $props();
</script>

<Provider {duration}>
    <Root />
    <ToastTrigger />
</Provider>
