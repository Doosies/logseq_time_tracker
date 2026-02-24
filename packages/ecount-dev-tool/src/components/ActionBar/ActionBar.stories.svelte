<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ActionBar from './ActionBar.svelte';

  const { Story } = defineMeta({
    component: ActionBar,
    title: 'ecount-dev-tool/ActionBar',
  });
</script>

<Story name="Default" />
