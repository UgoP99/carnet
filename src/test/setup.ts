import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// vite-plugin-pwa's virtual module only exists in dev/build, not under Vitest's module graph.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(() => ({
    needRefresh: [false, () => {}],
    offlineReady: [false, () => {}],
    updateServiceWorker: () => Promise.resolve(),
  })),
}));

// jsdom doesn't implement the Storage API; stub it so components using it are testable.
if (!('storage' in navigator)) {
  Object.defineProperty(navigator, 'storage', {
    value: {
      persisted: () => Promise.resolve(false),
      persist: () => Promise.resolve(false),
      estimate: () => Promise.resolve({ usage: 0, quota: 0 }),
    },
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
