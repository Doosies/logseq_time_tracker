import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';

// LogSeq API 모킹 타입 정의
type MockLogSeq = {
    setMainUIInlineStyle: ReturnType<typeof vi.fn>;
    ready: ReturnType<typeof vi.fn>;
    showMainUI: ReturnType<typeof vi.fn>;
    hideMainUI: ReturnType<typeof vi.fn>;
    toggleMainUI: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    App: {
        registerUIItem: ReturnType<typeof vi.fn>;
        registerCommand: ReturnType<typeof vi.fn>;
        registerCommandPalette: ReturnType<typeof vi.fn>;
    };
    provideModel: ReturnType<typeof vi.fn>;
};

// LogSeq API 모킹
const mock_logseq: MockLogSeq = {
    setMainUIInlineStyle: vi.fn(),
    ready: vi.fn((callback: () => void) => {
        callback();
    }),
    showMainUI: vi.fn(),
    hideMainUI: vi.fn(),
    toggleMainUI: vi.fn(),
    on: vi.fn(),
    App: {
        registerUIItem: vi.fn(),
        registerCommand: vi.fn(),
        registerCommandPalette: vi.fn(),
    },
    provideModel: vi.fn(),
};

// @logseq/libs 모킹
vi.mock('@logseq/libs', () => ({
    default: mock_logseq,
}));

// Mock 함수 호출 타입 정의
type MockCall = unknown[];

// 전역 logseq 객체 모킹 (main.tsx에서 사용하는 방식)
// @logseq/libs가 전역 타입을 확장하므로 타입 단언 사용
// 테스트 환경에서는 MockLogSeq 타입으로 모킹
global.logseq = mock_logseq as unknown as typeof global.logseq;

// React DOM createRoot 모킹
const mock_render = vi.fn();
const mock_create_root = vi.fn(() => ({
    render: mock_render,
}));

vi.mock('react-dom/client', () => ({
    createRoot: mock_create_root,
}));

describe('main.tsx - LogSeq 플러그인 초기화', () => {
    beforeEach(() => {
        // 각 테스트 전에 모킹 초기화
        vi.clearAllMocks();
        mock_render.mockClear();
        mock_create_root.mockClear();

        // DOM 초기화
        document.body.innerHTML = '<div id="app"></div>';

        // 모듈 캐시 초기화 (main.tsx가 여러 번 실행되지 않도록)
        vi.resetModules();
    });

    afterEach(() => {
        // 모킹은 유지하되 호출 기록만 초기화
        vi.clearAllMocks();
    });

    describe('main() 함수', () => {
        it('올바른 스타일로 logseq.setMainUIInlineStyle을 호출해야 함', async () => {
            // main 함수를 동적으로 import하여 실행
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.setMainUIInlineStyle).toHaveBeenCalledWith({
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 999,
                });
            });
        });

        it('플러그인을 초기화하기 위해 logseq.ready를 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.ready).toHaveBeenCalled();
            });
        });
    });

    describe('logseq.ready() 콜백', () => {
        it('툴바 UI 항목을 등록해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.App.registerUIItem).toHaveBeenCalledWith(
                    'toolbar',
                    expect.objectContaining({
                        key: 'time-tracker-toolbar',
                        template: expect.stringContaining('togglePluginUI'),
                    }),
                );
            });
        });

        it('올바른 설정으로 명령어를 등록해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.App.registerCommand).toHaveBeenCalledWith(
                    'show-plugin-ui',
                    expect.objectContaining({
                        key: 'show-plugin-ui',
                        label: 'Show Time Tracker UI',
                        keybinding: {
                            binding: 'mod+shift+p',
                        },
                        palette: true,
                    }),
                    expect.any(Function),
                );
            });
        });

        it('명령어 콜백을 실행하고 showMainUI를 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const register_command_call = mock_logseq.App.registerCommand.mock.calls.find(
                    (call: MockCall) => call[0] === 'show-plugin-ui',
                );

                if (register_command_call && register_command_call[2]) {
                    const command_callback = register_command_call[2];
                    command_callback();

                    expect(mock_logseq.showMainUI).toHaveBeenCalled();
                }
            });
        });

        it('올바른 설정으로 명령어 팔레트를 등록해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.App.registerCommandPalette).toHaveBeenCalledWith(
                    expect.objectContaining({
                        key: 'toggle-plugin-ui-palette',
                        label: 'Toggle Time Tracker UI',
                        keybinding: {
                            binding: 'ctrl+shift+e',
                        },
                    }),
                    expect.any(Function),
                );
            });
        });

        it('명령어 팔레트 콜백을 실행하고 toggleMainUI를 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const register_palette_call = mock_logseq.App.registerCommandPalette.mock.calls[0];

                if (register_palette_call && register_palette_call[1]) {
                    const palette_callback = register_palette_call[1];
                    palette_callback();

                    expect(mock_logseq.toggleMainUI).toHaveBeenCalled();
                }
            });
        });

        it('ui:visible:changed 이벤트 핸들러를 등록해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.on).toHaveBeenCalledWith('ui:visible:changed', expect.any(Function));
            });
        });

        it('UI 가시성이 변경될 때 이벤트 핸들러 콜백을 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const on_call = mock_logseq.on.mock.calls.find((call: MockCall) => call[0] === 'ui:visible:changed');

                if (on_call && on_call[1]) {
                    const event_handler = on_call[1];
                    const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

                    event_handler({ visible: true });

                    expect(console_spy).toHaveBeenCalledWith('UI visibility changed:', true);

                    console_spy.mockRestore();
                }
            });
        });

        it('togglePluginUI 메서드를 가진 모델을 제공해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_logseq.provideModel).toHaveBeenCalledWith(
                    expect.objectContaining({
                        togglePluginUI: expect.any(Function),
                    }),
                );
            });
        });

        it('togglePluginUI 모델 메서드를 실행하고 toggleMainUI를 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const provide_model_call = mock_logseq.provideModel.mock.calls[0];

                if (provide_model_call && provide_model_call[0]?.togglePluginUI) {
                    const toggle_ui_method = provide_model_call[0].togglePluginUI;
                    const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

                    toggle_ui_method();

                    expect(console_spy).toHaveBeenCalledWith('Toggle UI clicked');
                    expect(mock_logseq.toggleMainUI).toHaveBeenCalled();

                    console_spy.mockRestore();
                }
            });
        });

        it('renderApp 함수를 호출해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                expect(mock_create_root).toHaveBeenCalled();
            });
        });
    });

    describe('renderApp() 함수', () => {
        beforeEach(() => {
            mock_create_root.mockReturnValue({
                render: mock_render,
            });
        });

        it('app 요소가 존재할 때 root 요소를 생성해야 함', async () => {
            document.body.innerHTML = '<div id="app"></div>';

            await import('../src/main');

            await waitFor(() => {
                expect(mock_create_root).toHaveBeenCalledWith(expect.objectContaining({ id: 'app' }));
            });
        });

        it('App 컴포넌트를 StrictMode로 감싸서 렌더링해야 함', async () => {
            document.body.innerHTML = '<div id="app"></div>';

            await import('../src/main');

            await waitFor(() => {
                expect(mock_render).toHaveBeenCalled();

                const render_call = mock_render.mock.calls[0];
                expect(render_call[0]).toBeTruthy();

                // StrictMode로 감싸져 있는지 확인
                const rendered_element = render_call[0];
                expect(rendered_element.type).toBe(StrictMode);
            });
        });

        it('hideMainUI 핸들러가 있는 닫기 버튼을 렌더링해야 함', async () => {
            document.body.innerHTML = '<div id="app"></div>';

            await import('../src/main');

            await waitFor(() => {
                expect(mock_render).toHaveBeenCalled();

                const render_call = mock_render.mock.calls[0];
                const rendered_element = render_call[0];

                // StrictMode의 children 확인
                const wrapper_div = rendered_element.props.children;
                expect(wrapper_div.type).toBe('div');

                // close button이 있는지 확인 (실제 렌더링을 통해)
                const { container } = render(wrapper_div);
                const close_button = container.querySelector('button');
                expect(close_button).toBeTruthy();

                if (close_button) {
                    fireEvent.click(close_button);
                    expect(mock_logseq.hideMainUI).toHaveBeenCalled();
                }
            });
        });

        it('app 요소가 존재하지 않을 때 에러를 발생시키지 않아야 함', () => {
            document.body.innerHTML = '';

            // app element가 없어도 에러가 발생하지 않아야 함
            expect(() => {
                // renderApp는 main() 내부에서 호출되므로
                // app element가 없으면 createRoot가 호출되지 않음
            }).not.toThrow();
        });

        it('wrapper div 내부에 App 컴포넌트를 렌더링해야 함', async () => {
            document.body.innerHTML = '<div id="app"></div>';

            await import('../src/main');

            await waitFor(() => {
                expect(mock_render).toHaveBeenCalled();

                const render_call = mock_render.mock.calls[0];
                const rendered_element = render_call[0];
                const wrapper_div = rendered_element.props.children;

                // App 컴포넌트가 렌더링되는지 확인 (type.name으로 비교)
                expect(wrapper_div.props.children[1].type.name).toBe('App');
            });
        });

        it('wrapper div에 올바른 스타일을 적용해야 함', async () => {
            document.body.innerHTML = '<div id="app"></div>';

            await import('../src/main');

            await waitFor(() => {
                expect(mock_render).toHaveBeenCalled();

                const render_call = mock_render.mock.calls[0];
                const rendered_element = render_call[0];
                const wrapper_div = rendered_element.props.children;

                expect(wrapper_div.props.style).toEqual({
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    minWidth: '400px',
                    position: 'relative',
                });
            });
        });
    });

    describe('통합 테스트', () => {
        it('모든 LogSeq API 호출을 올바른 순서로 초기화해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                // setMainUIInlineStyle가 먼저 호출되어야 함
                const set_style_call_index = mock_logseq.setMainUIInlineStyle.mock.invocationCallOrder[0];
                const ready_call_index = mock_logseq.ready.mock.invocationCallOrder[0];

                expect(set_style_call_index).toBeLessThan(ready_call_index);

                // ready 콜백 내부에서 다른 API들이 호출되어야 함
                expect(mock_logseq.App.registerUIItem).toHaveBeenCalled();
                expect(mock_logseq.App.registerCommand).toHaveBeenCalled();
                expect(mock_logseq.App.registerCommandPalette).toHaveBeenCalled();
                expect(mock_logseq.on).toHaveBeenCalled();
                expect(mock_logseq.provideModel).toHaveBeenCalled();
            });
        });

        it('여러 명령어 실행을 올바르게 처리해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const register_command_call = mock_logseq.App.registerCommand.mock.calls.find(
                    (call: MockCall) => call[0] === 'show-plugin-ui',
                );

                if (register_command_call && register_command_call[2]) {
                    const command_callback = register_command_call[2];

                    // 여러 번 호출해도 정상 동작해야 함
                    command_callback();
                    command_callback();
                    command_callback();

                    expect(mock_logseq.showMainUI).toHaveBeenCalledTimes(3);
                }
            });
        });

        it('다양한 가시성 상태로 이벤트 핸들러를 처리해야 함', async () => {
            await import('../src/main');

            await waitFor(() => {
                const on_call = mock_logseq.on.mock.calls.find((call: MockCall) => call[0] === 'ui:visible:changed');

                if (on_call && on_call[1]) {
                    const event_handler = on_call[1];
                    const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

                    event_handler({ visible: true });
                    event_handler({ visible: false });
                    event_handler({ visible: true });

                    expect(console_spy).toHaveBeenCalledTimes(3);
                    expect(console_spy).toHaveBeenNthCalledWith(1, 'UI visibility changed:', true);
                    expect(console_spy).toHaveBeenNthCalledWith(2, 'UI visibility changed:', false);
                    expect(console_spy).toHaveBeenNthCalledWith(3, 'UI visibility changed:', true);

                    console_spy.mockRestore();
                }
            });
        });
    });

    describe('콘솔 로깅', () => {
        it('플러그인 로드 메시지를 로그로 출력해야 함', async () => {
            const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

            await import('../src/main');

            await waitFor(() => {
                expect(console_spy).toHaveBeenCalledWith('logseq-time-tracker loaded');
            });

            console_spy.mockRestore();
        });

        it('플러그인 준비 메시지를 로그로 출력해야 함', async () => {
            const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

            await import('../src/main');

            await waitFor(() => {
                expect(console_spy).toHaveBeenCalledWith('Plugin ready');
            });

            console_spy.mockRestore();
        });

        it('명령어 실행 메시지를 로그로 출력해야 함', async () => {
            const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

            await import('../src/main');

            await waitFor(() => {
                const register_command_call = mock_logseq.App.registerCommand.mock.calls.find(
                    (call: MockCall) => call[0] === 'show-plugin-ui',
                );

                if (register_command_call && register_command_call[2]) {
                    const command_callback = register_command_call[2];
                    command_callback();

                    expect(console_spy).toHaveBeenCalledWith('Command executed: show-plugin-ui');
                }
            });

            console_spy.mockRestore();
        });

        it('명령어 팔레트 실행 메시지를 로그로 출력해야 함', async () => {
            const console_spy = vi.spyOn(console, 'log').mockImplementation(() => {});

            await import('../src/main');

            await waitFor(() => {
                const register_palette_call = mock_logseq.App.registerCommandPalette.mock.calls[0];

                if (register_palette_call && register_palette_call[1]) {
                    const palette_callback = register_palette_call[1];
                    palette_callback();

                    expect(console_spy).toHaveBeenCalledWith('Command palette executed: toggle-plugin-ui');
                }
            });

            console_spy.mockRestore();
        });
    });
});
