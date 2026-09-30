import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareOrDownloadFile } from './share';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shareOrDownloadFile', () => {
  it('shares via the Web Share API when files can be shared', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { canShare: () => true, share });

    const outcome = await shareOrDownloadFile('carnet-backup.json', '{}', 'application/json');

    expect(outcome).toBe('shared');
    expect(share).toHaveBeenCalledWith({ files: [expect.any(File)] });
  });

  it('reports a cancelled share as such, without throwing', async () => {
    vi.stubGlobal('navigator', {
      canShare: () => true,
      share: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    });

    await expect(shareOrDownloadFile('carnet-backup.json', '{}', 'application/json')).resolves.toBe(
      'cancelled',
    );
  });

  it('falls back to a download when sharing files is not supported', async () => {
    vi.stubGlobal('navigator', { canShare: () => false });
    const click = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      set href(_v: string) {},
      set download(_v: string) {},
    } as unknown as HTMLAnchorElement);
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:mock', revokeObjectURL: () => undefined });

    const outcome = await shareOrDownloadFile('carnet-backup.json', '{}', 'application/json');

    expect(outcome).toBe('downloaded');
    expect(click).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });
});
