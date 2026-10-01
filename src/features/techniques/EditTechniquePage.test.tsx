import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeTechnique } from '@/test/factories';
import { EditTechniquePage } from './EditTechniquePage';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('EditTechniquePage', () => {
  it('prefills the form and saves changes', async () => {
    const technique = makeTechnique({ name: 'Armbar' });
    await db.techniques.add(technique);

    render(
      <MemoryRouter initialEntries={[`/techniques/${technique.id}/edit`]}>
        <Routes>
          <Route path="/techniques/:id/edit" element={<EditTechniquePage />} />
          <Route path="/techniques/:id" element={<p>Détail</p>} />
        </Routes>
      </MemoryRouter>,
    );
    const user = userEvent.setup();

    const nameInput = await screen.findByDisplayValue('Armbar');
    await user.clear(nameInput);
    await user.type(nameInput, 'Armbar from mount');
    await user.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    expect(await screen.findByText('Détail')).toBeInTheDocument();
    expect(await db.techniques.get(technique.id)).toMatchObject({ name: 'Armbar from mount' });
  });
});
