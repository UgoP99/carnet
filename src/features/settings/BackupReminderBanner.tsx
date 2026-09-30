import { differenceInCalendarDays, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router';
import { useLastExportAt, useSettings } from '@/db/hooks';

export function BackupReminderBanner() {
  const lastExportAt = useLastExportAt();
  const settings = useSettings();

  if (lastExportAt === undefined || settings === undefined) return null;
  if (lastExportAt !== null) {
    const daysSince = differenceInCalendarDays(new Date(), parseISO(lastExportAt));
    if (daysSince < settings.backupReminderDays) return null;
  }

  return (
    <NavLink
      to="/settings/backup"
      className="flex min-h-11 items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      Pense à exporter tes données.
    </NavLink>
  );
}
