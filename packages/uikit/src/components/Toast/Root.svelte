<!--
@component Toast.Root - Toast message renderer

Renders all active toast messages as `role="alert"` elements.
Place inside a `Toast.Provider`.
-->
<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Toast';
    import { toast_container } from '../../design/styles/toast.css';

    interface Props {
        class?: string;
    }

    let { class: extra_class }: Props = $props();
    const class_name = $derived([toast_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot class={class_name} />
