/**
 * Svelte 액션 배럴. 외부 클릭 감지, 포커스 트랩, 드래그 차단 등 DOM 동작을 `use:` 디렉티브로 붙일 수 있습니다.
 *
 * @module
 */
export { clickOutside } from './click_outside';
export type { ClickOutsideCallback } from './click_outside';
export { blockDragFromInteractive } from './block_drag_from_interactive';
export type { BlockDragOptions } from './block_drag_from_interactive';
export { focusTrap } from './focus_trap';
export type { FocusTrapOptions } from './focus_trap';
