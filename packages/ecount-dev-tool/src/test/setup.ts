import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.stubEnv(
  'VITE_LOGIN_ACCOUNTS',
  JSON.stringify([
    { company: 'company1', id: 'user1', password: 'pw1' },
    { company: 'company2', id: 'user2', password: 'pw2' },
  ])
);

const chrome_mock = {
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
    onActivated: { addListener: vi.fn() },
    onUpdated: { addListener: vi.fn() },
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: undefined }]),
  },
};

vi.stubGlobal('chrome', chrome_mock);
vi.stubGlobal('close', vi.fn());

beforeEach(() => {
  vi.clearAllMocks();
});
