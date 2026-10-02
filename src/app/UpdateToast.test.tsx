import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { describe, expect, it, vi } from 'vitest';
import { UpdateToast } from './UpdateToast';

const mockedUseRegisterSW = vi.mocked(useRegisterSW);

describe('UpdateToast', () => {
  it('renders nothing when no update and not offline-ready', () => {
    render(<UpdateToast />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a reload prompt and triggers the service worker update', async () => {
    const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
    mockedUseRegisterSW.mockReturnValueOnce({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker,
    });

    render(<UpdateToast />);
    expect(screen.getByText('Mise à jour disponible.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Recharger' }));
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('shows an offline-ready message', () => {
    mockedUseRegisterSW.mockReturnValueOnce({
      needRefresh: [false, vi.fn()],
      offlineReady: [true, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<UpdateToast />);
    expect(screen.getByText('Application prête hors ligne.')).toBeInTheDocument();
  });

  it('dismisses the toast on close', async () => {
    const setNeedRefresh = vi.fn();
    mockedUseRegisterSW.mockReturnValueOnce({
      needRefresh: [true, setNeedRefresh],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<UpdateToast />);
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(setNeedRefresh).toHaveBeenCalledWith(false);
  });
});
