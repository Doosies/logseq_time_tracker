import type { Component } from 'svelte';

/**
 * 팝업 내 섹션을 식별하는 ID.
 * 새 섹션 추가 시 이 타입과 SECTION_REGISTRY를 함께 수정합니다.
 */
export type SectionId = 'quick-login' | 'server-manager' | 'action-bar' | 'user-script';

/**
 * 단일 섹션의 정의.
 *
 * @property id - 섹션 고유 ID
 * @property label - UI에 표시할 라벨
 * @property component - Svelte 컴포넌트
 */
export interface SectionDefinition {
    id: SectionId;
    label: string;
    component: Component;
}
