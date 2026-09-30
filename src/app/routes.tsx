import { Construction } from 'lucide-react';
import { Route, Routes } from 'react-router';
import { EmptyState } from '@/ui/EmptyState';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

function Placeholder({ title }: { title: string }) {
  return <EmptyState icon={Construction} title={title} description="Écran à venir." />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Placeholder title="Semaine" />} />
        <Route path="journal" element={<Placeholder title="Journal" />} />
        <Route path="sessions/new" element={<Placeholder title="Nouvelle séance" />} />
        <Route path="sessions/:id" element={<Placeholder title="Séance" />} />
        <Route path="sessions/:id/edit" element={<Placeholder title="Modifier la séance" />} />
        <Route path="techniques" element={<Placeholder title="Techniques" />} />
        <Route path="techniques/new" element={<Placeholder title="Nouvelle technique" />} />
        <Route path="techniques/:id" element={<Placeholder title="Technique" />} />
        <Route path="techniques/:id/edit" element={<Placeholder title="Modifier la technique" />} />
        <Route path="plans" element={<Placeholder title="Plans de jeu" />} />
        <Route path="plans/:id" element={<Placeholder title="Plan de jeu" />} />
        <Route path="stats" element={<Placeholder title="Stats" />} />
        <Route path="search" element={<Placeholder title="Recherche" />} />
        <Route path="settings" element={<Placeholder title="Réglages" />} />
        <Route path="settings/activities" element={<Placeholder title="Activités" />} />
        <Route path="settings/exercises" element={<Placeholder title="Exercices" />} />
        <Route path="settings/goals" element={<Placeholder title="Objectifs" />} />
        <Route path="settings/backup" element={<Placeholder title="Sauvegarde" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
