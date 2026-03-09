import type { SectionDefinition } from './types';
import { SECTION_REGISTRY } from './registry';

export { SECTION_REGISTRY } from './registry';
export { type SectionDefinition, type SectionId } from './types';

/**
 * ID로 섹션 정의를 조회합니다.
 *
 * @param id - 섹션 ID (SectionId)
 * @returns 해당 섹션 정의 또는 없으면 undefined
 *
 * @example
 * ```typescript
 * const section = getSectionById('quick-login');
 * if (section) {
 *   // section.component, section.label 사용
 * }
 * ```
 */
export function getSectionById(id: string): SectionDefinition | undefined {
    return SECTION_REGISTRY.find((s) => s.id === id);
}

/**
 * 등록된 모든 섹션 정의를 반환합니다.
 *
 * @returns SectionDefinition 배열 (registry의 사본)
 */
export function getAllSections(): SectionDefinition[] {
    return [...SECTION_REGISTRY];
}
