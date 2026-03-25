<script lang="ts">
    import * as css from './category_selector.css';
    import type { Category } from '../../types/category';

    let {
        categories,
        selected_id,
        onSelect,
        placeholder = '카테고리 선택',
    }: {
        categories: Category[];
        selected_id: string | null;
        onSelect: (id: string) => void;
        placeholder?: string;
    } = $props();

    const listbox_id = `category-lb-${Math.random().toString(36).slice(2, 11)}`;

    let container_ref: HTMLDivElement | undefined = $state(undefined);
    let trigger_ref: HTMLButtonElement | undefined = $state(undefined);
    let search_input_ref: HTMLInputElement | undefined = $state(undefined);

    let is_open = $state(false);
    let search_query = $state('');
    let active_index = $state(0);
    let current_parent_id = $state<string | null>(null);

    const active_categories = $derived(categories.filter((c) => c.is_active));

    const category_by_id = $derived.by(() => {
        const rec: Record<string, Category> = {};
        for (const c of active_categories) {
            rec[c.id] = c;
        }
        return rec;
    });

    const search_trimmed = $derived(search_query.trim().toLowerCase());

    const is_searching = $derived(search_trimmed.length > 0);

    const breadcrumb_path = $derived.by(() => {
        if (current_parent_id === null) {
            return [] as Category[];
        }
        const path: Category[] = [];
        let id: string | null = current_parent_id;
        while (id !== null) {
            const cat: Category | undefined = category_by_id[id];
            if (!cat) {
                break;
            }
            path.push(cat);
            id = cat.parent_id;
        }
        path.reverse();
        return path;
    });

    function hasChildren(cat_id: string): boolean {
        return active_categories.some((c) => c.parent_id === cat_id);
    }

    const tree_rows = $derived.by(() => {
        const children = active_categories
            .filter((c) => c.parent_id === current_parent_id)
            .sort((a, b) => a.sort_order - b.sort_order);
        return children.map((category) => ({
            category,
            has_children: hasChildren(category.id),
        }));
    });

    const search_rows = $derived.by(() => {
        if (!is_searching) {
            return [] as { category: Category; has_children: boolean }[];
        }
        return active_categories
            .filter((c) => c.name.toLowerCase().includes(search_trimmed))
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => ({
                category,
                has_children: hasChildren(category.id),
            }));
    });

    const display_rows = $derived(is_searching ? search_rows : tree_rows);

    $effect(() => {
        if (display_rows.length === 0) {
            active_index = 0;
        } else if (active_index >= display_rows.length) {
            active_index = display_rows.length - 1;
        }
    });

    $effect(() => {
        if (!is_open) {
            search_query = '';
            active_index = 0;
        }
    });

    $effect(() => {
        if (!is_open) {
            return;
        }
        const handler = (e: MouseEvent) => {
            if (container_ref && !container_ref.contains(e.target as Node)) {
                is_open = false;
            }
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    });

    const selected_label = $derived.by(() => {
        if (selected_id === null) {
            return null;
        }
        const cat =
            (selected_id !== null ? category_by_id[selected_id] : undefined) ??
            categories.find((c) => c.id === selected_id);
        return cat?.name ?? null;
    });

    const active_option_dom_id = $derived(display_rows.length > 0 ? `${listbox_id}-opt-${active_index}` : undefined);

    function toggleOpen() {
        is_open = !is_open;
        if (is_open) {
            queueMicrotask(() => search_input_ref?.focus());
        }
    }

    function navigateToParent(parent_id: string | null) {
        current_parent_id = parent_id;
        active_index = 0;
    }

    function activateRow(index: number) {
        if (index < 0 || index >= display_rows.length) {
            return;
        }
        const row = display_rows[index];
        if (!row) {
            return;
        }
        if (row.has_children) {
            current_parent_id = row.category.id;
            active_index = 0;
            if (is_searching) {
                search_query = '';
            }
        } else {
            onSelect(row.category.id);
            is_open = false;
        }
    }

    function handleTriggerKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && is_open) {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
            return;
        }
        if (!is_open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            is_open = true;
            queueMicrotask(() => search_input_ref?.focus());
            return;
        }
        if (!is_open) {
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, display_rows.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            activateRow(active_index);
        }
    }

    function handleSearchKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, display_rows.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter' && display_rows.length > 0) {
            e.preventDefault();
            activateRow(active_index);
        }
    }

    function handleListKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            active_index = Math.min(active_index + 1, Math.max(0, display_rows.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            active_index = Math.max(active_index - 1, 0);
        } else if (e.key === 'Enter' && display_rows.length > 0) {
            e.preventDefault();
            activateRow(active_index);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
        }
    }

    function handleRowClick(index: number, e: MouseEvent) {
        e.preventDefault();
        active_index = index;
        activateRow(index);
    }

    function handleRowMouseEnter(index: number) {
        active_index = index;
    }
</script>

<div class={css.root} bind:this={container_ref}>
    <button
        type="button"
        class={css.trigger}
        bind:this={trigger_ref}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={is_open}
        aria-controls={listbox_id}
        aria-activedescendant={is_open ? active_option_dom_id : undefined}
        onclick={(e) => {
            e.stopPropagation();
            toggleOpen();
        }}
        onkeydown={handleTriggerKeydown}
    >
        <span>{selected_label ?? placeholder}</span>
        <span aria-hidden="true">{is_open ? '▴' : '▾'}</span>
    </button>

    {#if is_open}
        <div class={css.panel} role="presentation">
            <input
                class={css.search_input}
                type="search"
                placeholder="이름 검색"
                bind:this={search_input_ref}
                bind:value={search_query}
                onkeydown={handleSearchKeydown}
            />

            {#if !is_searching}
                <div class={css.breadcrumb_row}>
                    <button type="button" class={css.crumb} onclick={() => navigateToParent(null)}>전체</button>
                    {#each breadcrumb_path as crumb_cat (crumb_cat.id)}
                        <span class={css.crumb_sep} aria-hidden="true">&gt;</span>
                        <button type="button" class={css.crumb} onclick={() => navigateToParent(crumb_cat.id)}>
                            {crumb_cat.name}
                        </button>
                    {/each}
                </div>
            {/if}

            <ul
                id={listbox_id}
                class={css.listbox}
                role="listbox"
                aria-label="카테고리 목록"
                tabindex="-1"
                onkeydown={handleListKeydown}
            >
                {#if display_rows.length === 0}
                    <li class={css.empty_hint} role="presentation">항목이 없습니다</li>
                {:else}
                    {#each display_rows as row, index (row.category.id)}
                        <li role="presentation">
                            <button
                                type="button"
                                id="{listbox_id}-opt-{index}"
                                class={`${css.option}${index === active_index ? ` ${css.option_highlighted}` : ''}`}
                                role="option"
                                aria-selected={selected_id === row.category.id}
                                onclick={(e) => handleRowClick(index, e)}
                                onmouseenter={() => handleRowMouseEnter(index)}
                            >
                                <span>{row.category.name}</span>
                                {#if row.has_children}
                                    <span class={css.option_folder_hint}>하위</span>
                                {/if}
                            </button>
                        </li>
                    {/each}
                {/if}
            </ul>
        </div>
    {/if}
</div>
