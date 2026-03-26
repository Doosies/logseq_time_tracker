<script lang="ts">
    import * as Toast from '../';
    import ToastLevelTriggers from './ToastLevelTriggers.svelte';
</script>

<Toast.Provider duration={60_000}>
    <ToastLevelTriggers />
    <Toast.Root />
</Toast.Provider>
