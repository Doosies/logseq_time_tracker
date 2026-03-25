<script lang="ts">
    import * as css from './manual_entry_form.css';
    import type { AppContext } from '../../app/context';
    import type { Job } from '../../types/job';
    import type { Category } from '../../types/category';
    import type { TimeEntry } from '../../types/time_entry';
    import type { ManualEntryParams } from '../../services/time_entry_service';
    import { generateId } from '../../utils';
    import { MAX_NOTE_LENGTH } from '../../constants/config';
    import { JobSelector } from '../JobSelector';
    import { CategorySelector } from '../CategorySelector';
    import { TimeRangePicker } from '../TimeRangePicker';
    import { OverlapResolutionModal } from '../OverlapResolutionModal';

    let {
        context,
        jobs,
        categories,
        onSubmit,
        onCancel,
    }: {
        context: AppContext;
        jobs: Job[];
        categories: Category[];
        onSubmit: (entry: TimeEntry) => void;
        onCancel: () => void;
    } = $props();

    let selected_job_id = $state<string | null>(null);
    let selected_category_id = $state<string | null>(null);
    let started_at = $state(new Date().toISOString());
    let ended_at = $state(new Date().toISOString());
    let note = $state('');
    let is_submitting = $state(false);
    let overlap_entries = $state<TimeEntry[]>([]);
    let show_overlap_modal = $state(false);

    const is_time_valid = $derived(
        !Number.isNaN(Date.parse(started_at)) &&
            !Number.isNaN(Date.parse(ended_at)) &&
            Date.parse(ended_at) >= Date.parse(started_at),
    );

    const can_submit = $derived(
        selected_job_id !== null &&
            selected_category_id !== null &&
            is_time_valid &&
            !is_submitting &&
            !show_overlap_modal,
    );

    function resetForm() {
        selected_job_id = null;
        selected_category_id = null;
        const now = new Date().toISOString();
        started_at = now;
        ended_at = now;
        note = '';
        overlap_entries = [];
        show_overlap_modal = false;
    }

    function buildManualParams(
        job_id: string,
        category_id: string,
        range_start: string,
        range_end: string,
        note_trimmed: string,
    ): ManualEntryParams {
        const params: ManualEntryParams = {
            job_id,
            category_id,
            started_at: range_start,
            ended_at: range_end,
        };
        if (note_trimmed.length > 0) {
            params.note = note_trimmed;
        }
        return params;
    }

    function buildProvisionalEntry(job_id: string, category_id: string): TimeEntry {
        const now = new Date().toISOString();
        const duration_seconds = Math.max(0, Math.floor((Date.parse(ended_at) - Date.parse(started_at)) / 1000));
        return {
            id: generateId(),
            job_id,
            category_id,
            started_at,
            ended_at,
            duration_seconds,
            note: note.trim(),
            is_manual: true,
            created_at: now,
            updated_at: now,
        };
    }

    async function persistAfterOverlap(strategy: 'new_first' | 'existing_first', overlapping_copy: TimeEntry[]) {
        const job_id = selected_job_id;
        const category_id = selected_category_id;
        if (!job_id || !category_id) {
            return;
        }
        const provisional = buildProvisionalEntry(job_id, category_id);
        const note_trimmed = note.trim();
        const manual_params = buildManualParams(job_id, category_id, started_at, ended_at, note_trimmed);
        const svc = context.services.time_entry_service;

        if (strategy === 'new_first') {
            await svc.resolveOverlap(provisional, overlapping_copy, 'new_first');
            const created = await svc.createManualEntry(manual_params);
            context.stores.toast_store.addToast('success', '시간이 기록되었습니다');
            onSubmit(created);
            resetForm();
            return;
        }

        const fragments = await svc.resolveOverlap(provisional, overlapping_copy, 'existing_first');
        if (fragments.length === 0) {
            context.stores.toast_store.addToast('info', '기존 기록과 겹쳐 추가할 시간이 없습니다');
            resetForm();
            return;
        }
        let last_created: TimeEntry | undefined;
        for (const frag of fragments) {
            last_created = await svc.createManualEntry(
                buildManualParams(job_id, category_id, frag.started_at, frag.ended_at, note_trimmed),
            );
        }
        context.stores.toast_store.addToast(
            'success',
            fragments.length > 1 ? `${fragments.length}건의 시간이 기록되었습니다` : '시간이 기록되었습니다',
        );
        if (last_created) {
            onSubmit(last_created);
        }
        resetForm();
    }

    async function handleSubmit() {
        if (!can_submit) {
            return;
        }
        const job_id = selected_job_id;
        const category_id = selected_category_id;
        if (!job_id || !category_id) {
            context.stores.toast_store.addToast('warning', '작업과 카테고리를 선택하세요');
            return;
        }
        if (!is_time_valid) {
            context.stores.toast_store.addToast('warning', '시간 범위가 올바르지 않습니다');
            return;
        }

        is_submitting = true;
        try {
            const overlaps = await context.services.time_entry_service.detectOverlaps(job_id, started_at, ended_at);
            if (overlaps.length > 0) {
                overlap_entries = overlaps;
                show_overlap_modal = true;
                return;
            }
            const created = await context.services.time_entry_service.createManualEntry(
                buildManualParams(job_id, category_id, started_at, ended_at, note.trim()),
            );
            context.stores.toast_store.addToast('success', '시간이 기록되었습니다');
            onSubmit(created);
            resetForm();
        } catch (e) {
            const msg = e instanceof Error ? e.message : '저장에 실패했습니다';
            context.stores.toast_store.addToast('error', msg);
        } finally {
            is_submitting = false;
        }
    }

    async function handleOverlapResolve(strategy: 'new_first' | 'existing_first') {
        const overlapping_copy = [...overlap_entries];
        show_overlap_modal = false;
        is_submitting = true;
        try {
            await persistAfterOverlap(strategy, overlapping_copy);
        } catch (e) {
            const msg = e instanceof Error ? e.message : '저장에 실패했습니다';
            context.stores.toast_store.addToast('error', msg);
        } finally {
            is_submitting = false;
        }
    }

    function handleOverlapCancel() {
        show_overlap_modal = false;
        overlap_entries = [];
    }

    function handleRangeChange(start: string, end: string) {
        started_at = start;
        ended_at = end;
    }
</script>

<form
    class={css.form}
    aria-label="수동 시간 입력"
    onsubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
    }}
>
    <div class={css.field_group}>
        <span class={css.label} id="manual-form-job-label">작업</span>
        <JobSelector {jobs} selected_id={selected_job_id} onSelect={(id) => (selected_job_id = id)} />
    </div>

    <div class={css.field_group}>
        <span class={css.label} id="manual-form-category-label">카테고리</span>
        <CategorySelector
            {categories}
            selected_id={selected_category_id}
            onSelect={(id) => (selected_category_id = id)}
            placeholder="카테고리 선택"
        />
    </div>

    <div class={css.field_group}>
        <span class={css.label} id="manual-form-range-label">시간 범위</span>
        <TimeRangePicker {started_at} {ended_at} onChange={handleRangeChange} />
    </div>

    <div class={css.field_group}>
        <label class={css.label} for="manual-entry-note">메모 (선택)</label>
        <textarea
            id="manual-entry-note"
            class={css.note_textarea}
            bind:value={note}
            maxlength={MAX_NOTE_LENGTH}
            rows={3}
            placeholder="메모"
        ></textarea>
    </div>

    <div class={css.button_row}>
        <button type="button" class={css.button_cancel} onclick={onCancel}>취소</button>
        <button type="submit" class={css.button_submit} disabled={!can_submit}>
            {#if is_submitting}
                저장 중…
            {:else}
                저장
            {/if}
        </button>
    </div>
</form>

{#if show_overlap_modal && selected_job_id !== null}
    <OverlapResolutionModal
        new_entry={{ started_at, ended_at, job_id: selected_job_id }}
        overlapping={overlap_entries}
        onResolve={(s) => void handleOverlapResolve(s)}
        onCancel={handleOverlapCancel}
    />
{/if}
