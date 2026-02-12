// 모든 toggle-icon에 이벤트 리스너 추가
document.querySelectorAll('.toggle-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const version = this.getAttribute('data-version');
        const serverRow = this.closest('.server-row');
        const selectType = serverRow.querySelector(`#${version}-select-type`);
        const inputType = serverRow.querySelector(`#${version}-input-type`);
        const toServerInput = serverRow.querySelector(`#${version}-server`);
        const currentServer = serverRow.querySelector('.current-server');
        const select = serverRow.querySelector(`#${version}-select`);

        if (selectType.style.display === 'none') {
            // 셀렉트형이 활성화될 때
            selectType.style.display = 'flex';
            inputType.style.display = 'none';

            // 텍스트형 값 초기화
            toServerInput.value = '';
        } 
        else {
            // 텍스트형이 활성화될 때
            selectType.style.display = 'none';
            inputType.style.display = 'flex';

            // 셀렉트형 값을 조합하여 텍스트형에 설정
            const serverValue = currentServer.textContent.trim();
            const selectValue = select.value;

            if (serverValue && serverValue !== '=====') {
                toServerInput.value = serverValue + selectValue;
            }
            else {
                toServerInput.value = '=====' + selectValue;
            }
        }
    });
}); 