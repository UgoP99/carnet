import { useLiveQuery } from 'dexie-react-hooks';
import type { Activity, Session, Settings } from '@/domain/schemas';
import { db } from './db';
import { getSettings } from './metaRepo';

export function useActivities(): Activity[] | undefined {
  return useLiveQuery(() => db.activities.orderBy('order').toArray(), []);
}

export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []);
}

export function useSession(id: string | undefined): Session | undefined {
  return useLiveQuery(() => (id ? db.sessions.get(id) : undefined), [id]);
}

export function useLastExportAt(): string | null | undefined {
  return useLiveQuery(
    async () => (await db.meta.get('lastExportAt'))?.value as string | undefined,
    [],
    null,
  );
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => getSettings(), []);
}
