import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeTechnique } from '@/test/factories';
import { TechniqueList } from './TechniqueList';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/techniques']}>
      <Routes>
        <Route path="/techniques" element={<TechniqueList />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TechniqueList', () => {
  it('groups techniques by position and hides archived ones by default', async () => {
    await db.techniques.bulkAdd([
      makeTechnique({ name: 'Armbar', position: 'closed_guard' }),
      makeTechnique({ name: 'Toreando', position: 'open_guard', type: 'guard_pass' }),
      makeTechnique({ name: 'Old move', position: 'closed_guard', archived: true }),
    ]);

    renderList();

    expect(await screen.findByText('Garde fermée (1)')).toBeInTheDocument();
    expect(screen.getByText('Garde ouverte (1)')).toBeInTheDocument();
    expect(screen.queryByText('Old move')).not.toBeInTheDocument();
  });

  it('combines the search box with the type filter', async () => {
    await db.techniques.bulkAdd([
      makeTechnique({ name: 'Armbar', position: 'closed_guard', type: 'submission' }),
      makeTechnique({ name: 'Americana', position: 'side_control', type: 'submission' }),
      makeTechnique({ name: 'Toreando', position: 'open_guard', type: 'guard_pass' }),
    ]);

    renderList();
    const user = userEvent.setup();

    await user.type(
      await screen.findByRole('textbox', { name: 'Rechercher une technique' }),
      'arm',
    );

    expect(screen.getByText('Armbar')).toBeInTheDocument();
    expect(screen.queryByText('Americana')).not.toBeInTheDocument();
    expect(screen.queryByText('Toreando')).not.toBeInTheDocument();
  });

  it('shows archived techniques when the toggle is on', async () => {
    await db.techniques.bulkAdd([makeTechnique({ name: 'Old move', archived: true })]);

    renderList();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Voir les archivées' }));

    expect(await screen.findByText('Old move')).toBeInTheDocument();
  });
});
