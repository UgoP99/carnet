import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/ui/Button';

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh && !offlineReady) return null;

  function close() {
    setNeedRefresh(false);
    setOfflineReady(false);
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-800"
    >
      <span>{needRefresh ? 'Mise à jour disponible.' : 'Application prête hors ligne.'}</span>
      <div className="flex shrink-0 items-center gap-1">
        {needRefresh && (
          <Button
            variant="secondary"
            onClick={() => {
              void updateServiceWorker(true);
            }}
          >
            Recharger
          </Button>
        )}
        <Button variant="ghost" aria-label="Fermer" onClick={close}>
          ✕
        </Button>
      </div>
    </div>
  );
}
