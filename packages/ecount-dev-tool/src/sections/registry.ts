import { QuickLoginSection } from '#components/QuickLoginSection';
import { ServerManager } from '#components/ServerManager';
import { ActionBar } from '#components/ActionBar';
import { UserScriptSection } from '#components/UserScriptSection';
import type { SectionDefinition } from './types';

export const SECTION_REGISTRY: SectionDefinition[] = [
    { id: 'quick-login', label: '빠른 로그인', component: QuickLoginSection },
    { id: 'server-manager', label: '서버 관리', component: ServerManager },
    { id: 'action-bar', label: '빠른 실행', component: ActionBar },
    { id: 'user-script', label: '사용자 스크립트', component: UserScriptSection },
];
