export const STRINGS = {
    timer: {
        start: '시작',
        pause: '일시정지',
        resume: '재개',
        stop: '정지',
        switch_job: '전환',
        elapsed: '경과 시간',
    },
    job: {
        create: '새 작업',
        delete: '삭제',
        reopen: '재오픈',
        status: {
            pending: '대기',
            in_progress: '진행중',
            paused: '보류',
            cancelled: '취소',
            completed: '완료',
        },
    },
    reason_modal: {
        confirm: '확인',
        cancel: '취소',
        placeholder: '사유를 입력하세요 (최소 1글자)',
    },
    error: {
        storage_fallback: '저장소에 접근할 수 없어 임시 모드로 실행 중입니다.',
        timer_recovery: '이전 세션에서 타이머가 실행 중이었습니다.',
    },
} as const;
