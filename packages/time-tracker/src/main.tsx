import '@logseq/libs';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const main = () => {
    console.log('logseq-time-tracker loaded');

    // Main UI 스타일 설정
    logseq.setMainUIInlineStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
    });

    // Logseq 플러그인 초기화
    logseq.ready(() => {
        console.log('Plugin ready');

        // 툴바 버튼 등록
        logseq.App.registerUIItem('toolbar', {
            key: 'time-tracker-toolbar',
            template: `
                <a data-on-click="togglePluginUI" class="button" title="Time Tracker">
                    <i class="ti ti-box"></i>
                </a>
            `,
        });

        // 명령어 등록 (단축키) - LogSeq API에 따른 올바른 사용법
        logseq.App.registerCommand(
            'show-plugin-ui',
            {
                key: 'show-plugin-ui',
                label: 'Show Time Tracker UI',
                keybinding: {
                    binding: 'mod+shift+p',
                },
                palette: true,
            },
            () => {
                console.log('Command executed: show-plugin-ui');
                logseq.showMainUI();
            },
        );

        // Command Palette 등록 (선택사항)
        logseq.App.registerCommandPalette(
            {
                key: 'toggle-plugin-ui-palette',
                label: 'Toggle Time Tracker UI',
                keybinding: {
                    binding: 'ctrl+shift+e',
                },
            },
            () => {
                console.log('Command palette executed: toggle-plugin-ui');
                logseq.toggleMainUI();
            },
        );

        // 이벤트 핸들러 등록
        logseq.on('ui:visible:changed', ({ visible }) => {
            console.log('UI visibility changed:', visible);
        });

        // 모델 등록 (툴바 버튼 클릭 핸들러)
        logseq.provideModel({
            togglePluginUI() {
                console.log('Toggle UI clicked');
                logseq.toggleMainUI();
            },
        });

        // 초기 렌더링
        renderApp();
    });
};

const renderApp = () => {
    const root_element = document.getElementById('app');
    if (root_element) {
        const root = createRoot(root_element);
        root.render(
            <StrictMode>
                <div
                    style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '400px',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={() => logseq.hideMainUI()}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        ✕
                    </button>
                    <App />
                </div>
            </StrictMode>,
        );
    }
};

// 플러그인 시작
main();
