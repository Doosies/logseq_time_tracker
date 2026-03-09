import type { SectionDefinition } from './types';
import { SECTION_REGISTRY } from './registry';

export { SECTION_REGISTRY } from './registry';
export { type SectionDefinition, type SectionId } from './types';

export function getSectionById(id: string): SectionDefinition | undefined {
    return SECTION_REGISTRY.find((s) => s.id === id);
}

export function getAllSections(): SectionDefinition[] {
    return [...SECTION_REGISTRY];
}
