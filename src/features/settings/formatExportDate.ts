import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Formats `lastExportAt` for display: `undefined` = loading, `null` = never exported. */
export function formatExportDate(lastExportAt: string | null | undefined): string {
  if (lastExportAt === undefined) return '…';
  if (lastExportAt === null) return 'jamais';
  return format(parseISO(lastExportAt), "d MMM yyyy 'à' HH:mm", { locale: fr });
}
