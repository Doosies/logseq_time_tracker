<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import QuickLoginSection from './QuickLoginSection.svelte';

  const { Story } = defineMeta({
    component: QuickLoginSection,
    title: 'ecount-dev-tool/QuickLoginSection',
  });
</script>

<Story name="WithAccounts" />
<Story name="EmptyAccounts" />
