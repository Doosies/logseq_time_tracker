import { QuickLoginSection } from '#components/QuickLoginSection';
import { ServerManager } from '#components/ServerManager';
import { ActionBar } from '#components/ActionBar';
import { UserScriptSection } from '#components/UserScriptSection';
import type { SectionDefinition } from './types';

/**
 * 팝업 섹션의 중앙 레지스트리.
 *
 * 새 섹션 추가 시 이 배열에 항목을 추가하고, SectionId 타입(types.ts)에 ID를 추가합니다.
 * App.svelte, section_order 등은 이 레지스트리를 기반으로 동작하므로
 * 한 곳만 수정하면 전체에 반영됩니다.
 */
export const SECTION_REGISTRY: SectionDefinition[] = [
    { id: 'quick-login', label: '빠른 로그인', component: QuickLoginSection },
    { id: 'server-manager', label: '서버 관리', component: ServerManager },
    { id: 'action-bar', label: '빠른 실행', component: ActionBar },
    { id: 'user-script', label: '사용자 스크립트', component: UserScriptSection },
];
