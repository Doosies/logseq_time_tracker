<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorState } from '@codemirror/state';
    import {
        EditorView,
        keymap,
        lineNumbers,
        highlightActiveLineGutter,
        highlightActiveLine,
        placeholder,
    } from '@codemirror/view';
    import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
    import { search, searchKeymap } from '@codemirror/search';
    import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
    import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput } from '@codemirror/language';
    import { javascript } from '@codemirror/lang-javascript';

    /**
     * CodeMirror 6 기반 코드 에디터 컴포넌트의 Props
     *
     * JS 문법 하이라이팅, 자동완성, 괄호 매칭/자동 닫기, 검색(Ctrl+F),
     * Undo/Redo, 줄 번호, 줄 바꿈, 읽기 전용 모드, placeholder를 지원합니다.
     */
    interface Props {
        /** 에디터에 표시할 내용. 양방향 바인딩($bindable) 지원 */
        value: string;
        /** 문법 하이라이팅 언어. 현재 javascript만 지원
         * @default 'javascript' */
        language?: 'javascript';
        /** 읽기 전용 모드 여부. true면 편집 불가
         * @default false */
        readonly?: boolean;
        /** 빈 상태일 때 표시할 placeholder 텍스트
         * @default '' */
        placeholder?: string;
    }

    let {
        value = $bindable(''),
        language = 'javascript',
        readonly = false,
        placeholder: placeholderText = '',
    }: Props = $props();

    let editorElement: HTMLDivElement;
    let editorView: EditorView | null = null;
    let isInternalUpdate = false;

    function buildExtensions(): import('@codemirror/state').Extension[] {
        const exts: import('@codemirror/state').Extension[] = [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightActiveLine(),
            history(),
            syntaxHighlighting(defaultHighlightStyle),
            bracketMatching(),
            indentOnInput(),
            closeBrackets(),
            autocompletion(),
            search(),
            EditorView.lineWrapping,
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...completionKeymap,
            ]),
        ];

        if (placeholderText) {
            exts.push(placeholder(placeholderText));
        }

        if (readonly) {
            exts.push(EditorState.readOnly.of(true));
        }

        exts.push(
            EditorView.updateListener.of((update) => {
                if (update.docChanged && !isInternalUpdate) {
                    isInternalUpdate = true;
                    value = update.state.doc.toString();
                    isInternalUpdate = false;
                }
            }),
        );

        if (language === 'javascript') {
            exts.push(javascript());
        }

        return exts;
    }

    onMount(() => {
        const state = EditorState.create({
            doc: value,
            extensions: buildExtensions(),
        });

        editorView = new EditorView({
            state,
            parent: editorElement,
        });

        return () => {
            editorView?.destroy();
            editorView = null;
        };
    });

    $effect(() => {
        const currentValue = value;
        if (!editorView || isInternalUpdate) return;

        const doc = editorView.state.doc.toString();
        if (doc !== currentValue) {
            isInternalUpdate = true;
            editorView.dispatch({
                changes: { from: 0, to: doc.length, insert: currentValue },
            });
            isInternalUpdate = false;
        }
    });
</script>

<div class="code-editor-container" data-testid="code-editor" bind:this={editorElement}></div>

<style>
    .code-editor-container {
        flex: 1;
        min-width: 0;
        min-height: 8rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .code-editor-container :global(.cm-editor) {
        height: 100%;
        font-family: monospace;
        font-size: var(--font-size-sm, 14px);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm, 4px);
        background-color: var(--color-background);
        color: var(--color-text);
    }

    .code-editor-container :global(.cm-scroller) {
        overflow: auto;
    }

    .code-editor-container :global(.cm-content) {
        padding: var(--space-sm, 8px);
        min-height: 100%;
    }

    .code-editor-container :global(.cm-gutters) {
        background-color: var(--color-background);
        border-right: 1px solid var(--color-border);
    }

    .code-editor-container :global(.cm-activeLineGutter) {
        background-color: var(--color-border, rgba(128, 128, 128, 0.2));
    }
</style>
