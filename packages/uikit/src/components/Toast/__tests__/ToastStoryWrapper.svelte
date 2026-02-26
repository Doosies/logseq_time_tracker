<script lang="ts">
    import * as Toast from '../';
    import ToastTrigger from './ToastTrigger.svelte';
</script>

<Toast.Provider duration={5000}>
    <ToastTrigger />
    <Toast.Root />
</Toast.Provider>
