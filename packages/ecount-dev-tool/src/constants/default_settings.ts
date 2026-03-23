import type { BackupPayload } from '#types/backup';

const AUTO_DEV_MODE_CODE = `function main() {
  'use strict';

  const TARGET_PARAM = 'ec_req_sid';

  const INJECT_PARAMS = {
    __disableMin: 'Y',
    __trace: 'N',
  };

  /** URL 문자열 → 변경된 URL 문자열 | null */
  function buildNextUrl(currentUrl) {
    const url = new URL(currentUrl);

    if (!url.searchParams.has(TARGET_PARAM)) {
      return null;
    }

    const changed = Object.entries(INJECT_PARAMS).reduce((acc, [key, value]) => {
      if (url.searchParams.get(key) !== value) {
        url.searchParams.set(key, value);
        return true;
      }
      return acc;
    }, false);

    return changed ? url.toString() : null;
  }

  function syncUrl() {
    const nextUrl = buildNextUrl(location.href);
    if (nextUrl) {
      history.replaceState(null, '', nextUrl);
    }
  }

  function wrapHistory(type) {
    const original = history[type];

    history[type] = function (...args) {
      const result = original.apply(this, args);
      syncUrl();
      return result;
    };
  }

  function init() {
    wrapHistory('pushState');
    wrapHistory('replaceState');

    window.addEventListener('popstate', syncUrl);

    syncUrl();
  }

  init();
}

// 실행
main();`;

export const DEFAULT_SETTINGS: BackupPayload = {
    accounts: [
        { company: '313786', id: '뚜뚜', password: '1q2w3e4r' },
        { company: '600317', id: '루리11', password: '1q2w3e4r5t' },
        { company: '305000', id: '은경', password: '1q2w3e4r' },
        { company: '300000', id: '기수', password: '1q2w3e4r' },
        { company: '600320', id: '예진', password: '1q2w3e4r' },
        { company: '313773', id: 'cm', password: '1q2w3e4r' },
        { company: '300001', id: '치민', password: '1q2w3e4r' },
        { company: '664841', id: 'test', password: '1q2w3e4r' },
        { company: '665226', id: 'test', password: '1q2w3e4r' },
    ],
    active_account: '300000§기수',
    user_scripts: [
        {
            id: '7101d518-48f1-4feb-9099-901f7226586c',
            name: '자동 dev mode',
            enabled: true,
            url_patterns: ['https://zeus*.ecount.com/*', 'https://test.ecount.com:5001/*'],
            code: AUTO_DEV_MODE_CODE,
            run_at: 'document_idle',
            created_at: 1773707666477,
            updated_at: 1773711742200,
        },
        {
            id: '3321d652-9038-4cc0-9800-0ef8764e6a74',
            name: '로그무시',
            enabled: true,
            url_patterns: ['https://zeus*.ecount.com/*', 'https://test.ecount.com:5001/*'],
            code: '$ECount.logger.setLevel($ECount.logger.levels.SILENT);',
            run_at: 'document_idle',
            created_at: 1773707738377,
            updated_at: 1773709147905,
        },
    ],
    section_order: ['quick-login', 'server-manager', 'action-bar', 'user-script'],
    section_visibility: { 'action-bar': false, 'server-manager': false },
    theme: 'auto',
    preferences: { enable_animations: true },
};
