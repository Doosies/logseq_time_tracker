import type { ParsedUrl } from '#types/server';

let _v5_value = $state('');
let _v3_value = $state('');
let _v5_text_mode = $state(false);
let _v3_text_mode = $state(false);
let _is_initialized = false;

export const server_ui = {
  get v5_value() { return _v5_value; },
  set v5_value(v: string) { _v5_value = v; },

  get v3_value() { return _v3_value; },
  set v3_value(v: string) { _v3_value = v; },

  get v5_text_mode() { return _v5_text_mode; },
  set v5_text_mode(v: boolean) { _v5_text_mode = v; },

  get v3_text_mode() { return _v3_text_mode; },
  set v3_text_mode(v: boolean) { _v3_text_mode = v; },
};

/**
 * parsed URL 기반으로 초기값을 설정합니다.
 * 이미 초기화된 경우 무시합니다 (DnD 재생성 시 값 보존).
 */
export function initializeServerUi(
  parsed: ParsedUrl,
): void {
  if (_is_initialized) return;
  _is_initialized = true;

  if (parsed.v5_domain === 'test') {
    _v5_text_mode = true;
    _v5_value = 'test';
  } else {
    _v5_value = parsed.v5_domain;
  }

  if (parsed.v3_domain === 'test') {
    _v3_text_mode = true;
    _v3_value = 'test';
  } else {
    _v3_value = parsed.v3_domain;
  }
}
