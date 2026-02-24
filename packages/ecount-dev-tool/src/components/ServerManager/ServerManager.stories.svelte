<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ServerManagerStoryWrapper from './ServerManagerStoryWrapper.svelte';

  const { Story } = defineMeta({
    component: ServerManagerStoryWrapper,
    title: 'ecount-dev-tool/ServerManager',
  });
</script>

<Story
  name="ZeusEnvironment"
  args={{
    url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1',
  }}
/>
<Story
  name="TestEnvironment"
  args={{
    url: 'https://onetestba1.ecount.com/ec5/view/erp?__v3domains=test',
  }}
/>
<Story
  name="UnsupportedEnvironment"
  args={{
    url: 'https://other.ecount.com/some/path',
  }}
/>
