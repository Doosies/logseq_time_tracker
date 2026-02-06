document.addEventListener('DOMContentLoaded', function() {
    const serverManagerField = document.getElementById('server-manager-field');
    const stageServerManagerField = document.getElementById('stage-server-manager-field');
    
    // 현재 탭의 URL 상태에 따라 서버 매니저 필드 업데이트
    async function updateFields() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url) {
                const url = new URL(tab.url);
                const isStage = tab.url.includes('stage');
                
                // stage URL일 때는 stage 서버 매니저 필드만 표시
                if (isStage) {
                    serverManagerField.style.display = 'none';
                    stageServerManagerField.style.display = 'block';
                    document.querySelector('.background-field').style.height = '90px';
                } else {
                    serverManagerField.style.display = 'block';
                    stageServerManagerField.style.display = 'none';
                    document.querySelector('.background-field').style.height = 'auto';
                }
            }
        } catch (error) {
            console.error('필드 업데이트 중 오류 발생:', error);
        }
    }
    
    // 초기 필드 설정
    updateFields();
    
    // 탭이 변경될 때마다 필드 업데이트
    chrome.tabs.onActivated.addListener(updateFields);
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url) {
            updateFields();
        }
    });
}); 