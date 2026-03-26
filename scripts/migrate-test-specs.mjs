// One-off: 08-test-usecases.md -> packages/*/__test_specs__/
// Run: node scripts/migrate-test-specs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'docs/time-tracker/08-test-usecases.md');
const raw = fs.readFileSync(srcPath, 'utf8');
const lines = raw.split(/\r?\n/);

function block(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n') + '\n';
}

function writeSpec(relPath, title, pkg, level, body) {
  const pkgRef = `@personal/${pkg}`;
  const idRef = 'UC-{영역}-{번호}';
  const header = `# ${title} 테스트 스펙

> **패키지**: \`${pkgRef}\`
> **테스트 레벨**: ${level}
> **ID 체계**: \`${idRef}\` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

`;
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, header + body.trimEnd() + '\n', 'utf8');
}

const core = 'packages/time-tracker-core/__test_specs__';
const logseq = 'packages/logseq-time-tracker/__test_specs__';

const timerBody =
  block(49, 143) + '\n' + block(1150, 1174) + '\n' + block(1176, 1192);
writeSpec(`${core}/unit/timer.md`, 'Timer 서비스 (cancel/stop 포함)', 'time-tracker-core', 'unit', timerBody);

writeSpec(`${core}/unit/job.md`, 'Job 서비스', 'time-tracker-core', 'unit', block(145, 228));
writeSpec(`${core}/unit/history.md`, 'History 서비스', 'time-tracker-core', 'unit', block(231, 264));
writeSpec(
  `${core}/unit/category.md`,
  'Category 서비스 (순환 참조 포함)',
  'time-tracker-core',
  'unit',
  block(267, 302) + '\n' + block(1220, 1228),
);
writeSpec(`${core}/unit/time-entry.md`, 'TimeEntry 서비스', 'time-tracker-core', 'unit', block(305, 357));
writeSpec(`${core}/unit/job-category.md`, 'JobCategory 서비스', 'time-tracker-core', 'unit', block(456, 481));
writeSpec(`${core}/unit/data-field.md`, 'DataField 서비스', 'time-tracker-core', 'unit', block(484, 509));
writeSpec(`${core}/unit/template.md`, 'Template 서비스', 'time-tracker-core', 'unit', block(512, 545));
writeSpec(`${core}/unit/statistics.md`, 'Statistics 서비스', 'time-tracker-core', 'unit', block(548, 581));
writeSpec(`${core}/unit/store.md`, 'MemoryStorageAdapter', 'time-tracker-core', 'unit', block(360, 417));
writeSpec(`${core}/unit/type.md`, '타입 검증', 'time-tracker-core', 'unit', block(420, 453));
writeSpec(`${core}/unit/migration.md`, '스키마 마이그레이션', 'time-tracker-core', 'unit', block(584, 601));

writeSpec(
  `${core}/unit/export.md`,
  '데이터보내기 (단위)',
  'time-tracker-core',
  'unit',
  block(1194, 1202) + '\n' + block(1211, 1217),
);

writeSpec(`${core}/integration/fsm.md`, 'FSM·서비스·Store 통합', 'time-tracker-core', 'integration', block(606, 656));

const perfIntBody = block(1106, 1110) + '\n' + block(1128, 1142);
writeSpec(`${core}/integration/performance.md`, '성능 (컴포넌트·통합)', 'time-tracker-core', 'integration', perfIntBody);

writeSpec(
  `${core}/integration/export.md`,
  '데이터보내기 (통합)',
  'time-tracker-core',
  'integration',
  block(1194, 1195) + '\n' + block(1204, 1210),
);
writeSpec(`${core}/integration/reminder.md`, '알림·리마인더', 'time-tracker-core', 'integration', block(1078, 1103));

writeSpec(`${core}/component/timer.md`, 'Timer 컴포넌트', 'time-tracker-core', 'component', block(662, 686));
writeSpec(`${core}/component/job-list.md`, 'JobList 컴포넌트', 'time-tracker-core', 'component', block(688, 712));
writeSpec(
  `${core}/component/time-entry-form.md`,
  'TimeEntryForm 컴포넌트',
  'time-tracker-core',
  'component',
  block(714, 730),
);
writeSpec(`${core}/component/selector.md`, '셀렉터', 'time-tracker-core', 'component', block(732, 748));
writeSpec(`${core}/component/date-picker.md`, '데이트피커', 'time-tracker-core', 'component', block(750, 766));
writeSpec(
  `${core}/component/time-entry-manual.md`,
  '수동 TimeEntry 입력',
  'time-tracker-core',
  'component',
  block(768, 818),
);

const toolbarBody =
  block(820, 860) +
  `
#### UC-UI-024: on_reason_modal_change 콜백 모드

- **Given**: Toolbar에 \`on_reason_modal_change\` 콜백이 제공된 상태이다
- **When**: 일시정지/완료 버튼을 클릭한다
- **Then**: 내부 ReasonModal이 렌더링되지 않고, 콜백이 \`{ title, onconfirm, oncancel }\` 설정 객체와 함께 호출된다. onconfirm/oncancel 실행 시 콜백이 \`null\`로 재호출된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트
`;
writeSpec(`${core}/component/toolbar.md`, 'Toolbar', 'time-tracker-core', 'component', toolbarBody);

writeSpec(`${core}/component/toast.md`, '토스트', 'time-tracker-core', 'component', block(1230, 1254));
writeSpec(`${core}/component/accessibility.md`, '접근성 (컴포넌트)', 'time-tracker-core', 'component', block(1258, 1296));
writeSpec(`${core}/edge-cases/edge.md`, '엣지 케이스', 'time-tracker-core', 'edge-cases', block(996, 1074));

writeSpec(`${logseq}/unit/plugin.md`, 'Logseq 플러그인 (단위)', 'logseq-time-tracker', 'unit', block(866, 908));
writeSpec(`${logseq}/integration/plugin.md`, 'Logseq 플러그인 (통합)', 'logseq-time-tracker', 'integration', block(910, 918));
writeSpec(`${logseq}/e2e/timer.md`, 'E2E 타이머', 'logseq-time-tracker', 'e2e', block(924, 932));
writeSpec(`${logseq}/e2e/job-switch.md`, 'E2E 작업 전환', 'logseq-time-tracker', 'e2e', block(934, 942));
writeSpec(`${logseq}/e2e/job-creation.md`, 'E2E 잡 생성', 'logseq-time-tracker', 'e2e', block(944, 952));
writeSpec(`${logseq}/e2e/statistics.md`, 'E2E 통계', 'logseq-time-tracker', 'e2e', block(954, 962));
writeSpec(`${logseq}/e2e/toolbar.md`, 'E2E 툴바', 'logseq-time-tracker', 'e2e', block(964, 980));
writeSpec(`${logseq}/e2e/performance.md`, 'E2E 성능', 'logseq-time-tracker', 'e2e', block(1112, 1126));
writeSpec(`${logseq}/e2e/accessibility.md`, 'E2E 접근성', 'logseq-time-tracker', 'e2e', block(1298, 1304));

const vrtBody = `#### UC-VRT-001: Toolbar 기본 상태 (잡 없음)

- **Given**: Toolbar가 드롭다운 모드로 표시되어 있고, 등록된 잡이 없다
- **When**: 페이지 전체 스크린샷을 캡처한다
- **Then**: 베이스라인 이미지와 시각적 차이가 maxDiffPixelRatio 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT

#### UC-VRT-002: Toolbar에서 완료 클릭 시 ReasonModal 표시

- **Given**: 잡이 시작되어 활성 타이머가 있는 상태이다
- **When**: 완료 버튼을 클릭하여 ReasonModal이 표시된 상태에서 스크린샷을 캡처한다
- **Then**: ReasonModal이 전체 뷰포트를 올바르게 덮고, 베이스라인과 시각적 차이가 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT

#### UC-VRT-003: Toolbar에서 일시정지 클릭 시 ReasonModal 표시

- **Given**: 잡이 시작되어 활성 타이머가 있는 상태이다
- **When**: 일시정지 버튼을 클릭하여 ReasonModal이 표시된 상태에서 스크린샷을 캡처한다
- **Then**: ReasonModal이 전체 뷰포트를 올바르게 덮고, 베이스라인과 시각적 차이가 0.01 이내이다
- **Phase**: 3
- **테스트 레벨**: VRT
`;
writeSpec(`${logseq}/vrt/toolbar.md`, 'Toolbar VRT', 'logseq-time-tracker', 'vrt', vrtBody);

console.log('migrate-test-specs.mjs: wrote 37 files under', core, 'and', logseq);
