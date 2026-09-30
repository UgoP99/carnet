import { useLiveQuery } from 'dexie-react-hooks';
import type { Activity, Session } from '@/domain/schemas';
import { db } from './db';

export function useActivities(): Activity[] | undefined {
  return useLiveQuery(() => db.activities.orderBy('order').toArray(), []);
}

export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []);
}

export function useSession(id: string | undefined): Session | undefined {
  return useLiveQuery(() => (id ? db.sessions.get(id) : undefined), [id]);
}
