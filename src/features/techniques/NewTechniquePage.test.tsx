import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { NewTechniquePage } from './NewTechniquePage';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderNew() {
  return render(
    <MemoryRouter initialEntries={['/techniques/new']}>
      <Routes>
        <Route path="/techniques/new" element={<NewTechniquePage />} />
        <Route path="/techniques/:id" element={<p>Détail</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NewTechniquePage', () => {
  it('creates a technique and navigates to its detail page', async () => {
    renderNew();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nom'), 'Armbar from closed guard');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Détail')).toBeInTheDocument();
    const techniques = await db.techniques.toArray();
    expect(techniques).toHaveLength(1);
    expect(techniques[0]).toMatchObject({ name: 'Armbar from closed guard' });
  });

  it('rejects an invalid video URL', async () => {
    renderNew();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nom'), 'Armbar');
    await user.type(screen.getByLabelText('URL de la vidéo (https)'), 'http://example.com');
    const [, addVideoButton] = screen.getAllByRole('button', { name: 'Ajouter' });
    if (!addVideoButton) throw new Error('expected a video "Ajouter" button');
    await user.click(addVideoButton);

    expect(screen.getByRole('alert')).toHaveTextContent('URL https invalide');
    expect(await db.techniques.toArray()).toHaveLength(0);
  });
});
