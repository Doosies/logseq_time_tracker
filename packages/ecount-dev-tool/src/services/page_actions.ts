/**
 * Content Script functions that are injected into the page context.
 * These functions must be standalone (no imports) because they run in the page context.
 */

/**
 * 로그인 폼에 자격 증명을 채웁니다.
 * 
 * ecount.com 로그인 페이지의 입력 필드에 회사코드, 아이디, 비밀번호를 자동으로 입력합니다.
 * 이 함수는 Content Script로 주입되어 페이지 컨텍스트에서 실행됩니다.
 * 
 * @param company_code - 회사코드
 * @param user_id - 사용자 ID
 * @param password - 비밀번호
 * 
 * @example
 * ```typescript
 * // Content Script로 주입
 * await executeScript(tabId, () => {
 *   fillLoginForm('12345', 'user@example.com', 'password123');
 * });
 * ```
 */
export function fillLoginForm(company_code: string, user_id: string, password: string): void {
    const company_input = document.getElementById('com_code') as HTMLInputElement;
    const id_input = document.getElementById('id') as HTMLInputElement;
    const password_input = document.getElementById('passwd') as HTMLInputElement;

    if (company_input) company_input.value = company_code;
    if (id_input) id_input.value = user_id;
    if (password_input) password_input.value = password;
}
