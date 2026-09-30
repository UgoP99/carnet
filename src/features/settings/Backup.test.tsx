import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db/db';
import { makeActivity } from '@/test/factories';
import { Backup } from './Backup';

vi.mock('@/lib/share', () => ({ shareOrDownloadFile: vi.fn().mockResolvedValue('downloaded') }));

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function makeBackupFile(activityName: string): File {
  const doc = {
    app: 'carnet',
    format: 1,
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      activities: [makeActivity({ name: activityName })],
      sessions: [],
      techniques: [],
      techniqueLogs: [],
      exercises: [],
      exerciseEntries: [],
      gamePlans: [],
      gamePlanNodes: [],
      meta: [],
    },
  };
  return new File([JSON.stringify(doc)], 'carnet-backup.json', { type: 'application/json' });
}

describe('Backup', () => {
  it('exports data and records the export date', async () => {
    render(<Backup />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Exporter mes données' }));

    expect(await screen.findByText('Sauvegarde téléchargée.')).toBeInTheDocument();
    expect((await db.meta.get('lastExportAt'))?.value).toEqual(expect.any(String));
  });

  it('previews then replaces data from an imported file', async () => {
    await db.activities.add(makeActivity({ name: 'Activité existante' }));
    const file = makeBackupFile('Activité importée');

    render(<Backup />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText('Importer une sauvegarde'), file);

    expect(await screen.findByText('Activités : 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remplacer tout' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remplacer' }));

    expect(await screen.findByText('Données remplacées.')).toBeInTheDocument();
    const activities = await db.activities.toArray();
    expect(activities.map((a) => a.name)).toEqual(['Activité importée']);
  });

  it('shows an error for an invalid import file', async () => {
    const file = new File(['not json'], 'broken.json', { type: 'application/json' });

    render(<Backup />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText('Importer une sauvegarde'), file);

    expect(await screen.findByText('Fichier JSON invalide.')).toBeInTheDocument();
  });
});
