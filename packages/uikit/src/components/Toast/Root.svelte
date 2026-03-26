<!--
@component Toast.Root - Toast message renderer

Renders all active toast messages as `role="status"` elements inside an `aria-live` region.
Place inside a `Toast.Provider`.
-->
<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Toast';
    import { toast_container, toast_item } from '../../design/styles/toast.css';

    interface Props {
        class?: string;
    }

    let { class: extra_class }: Props = $props();
    const container_class = $derived([toast_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot class={container_class} item_class={toast_item} />
