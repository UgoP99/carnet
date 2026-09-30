import { useEffect, useState } from 'react';
import { Button } from '@/ui/Button';

interface StorageState {
  persisted: boolean;
  usageMb: number | undefined;
  quotaMb: number | undefined;
}

const numberFormat = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

async function readStorageState(): Promise<StorageState> {
  const persisted = await navigator.storage.persisted();
  const estimate = await navigator.storage.estimate();
  return {
    persisted,
    usageMb: estimate.usage !== undefined ? estimate.usage / (1024 * 1024) : undefined,
    quotaMb: estimate.quota !== undefined ? estimate.quota / (1024 * 1024) : undefined,
  };
}

export function Storage() {
  const [state, setState] = useState<StorageState>();

  useEffect(() => {
    void readStorageState().then(setState);
  }, []);

  async function handlePersist() {
    await navigator.storage.persist();
    setState(await readStorageState());
  }

  if (!state) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
      <p className="font-medium text-slate-900 dark:text-white">Stockage</p>
      <p className="text-slate-600 dark:text-slate-400">
        Stockage persistant : {state.persisted ? 'activé' : 'non activé'}
      </p>
      {state.usageMb !== undefined && state.quotaMb !== undefined && (
        <p className="text-slate-600 dark:text-slate-400">
          {numberFormat.format(state.usageMb)} Mo utilisés sur {numberFormat.format(state.quotaMb)}{' '}
          Mo
        </p>
      )}
      {!state.persisted && (
        <Button
          variant="secondary"
          onClick={() => {
            void handlePersist();
          }}
        >
          Activer le stockage persistant
        </Button>
      )}
    </div>
  );
}
