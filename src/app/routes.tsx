import { Construction } from 'lucide-react';
import { Route, Routes } from 'react-router';
import { Backup } from '@/features/settings/Backup';
import { BackupReminderBanner } from '@/features/settings/BackupReminderBanner';
import { ExercisesSettings } from '@/features/settings/ExercisesSettings';
import { Settings } from '@/features/settings/Settings';
import { EditSessionPage } from '@/features/sessions/EditSessionPage';
import { NewSessionPage } from '@/features/sessions/NewSessionPage';
import { SessionDetail } from '@/features/sessions/SessionDetail';
import { SessionList } from '@/features/sessions/SessionList';
import { EditTechniquePage } from '@/features/techniques/EditTechniquePage';
import { NewTechniquePage } from '@/features/techniques/NewTechniquePage';
import { TechniqueDetail } from '@/features/techniques/TechniqueDetail';
import { TechniqueList } from '@/features/techniques/TechniqueList';
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
        <Route
          index
          element={
            <>
              <BackupReminderBanner />
              <Placeholder title="Semaine" />
            </>
          }
        />
        <Route path="journal" element={<SessionList />} />
        <Route path="sessions/new" element={<NewSessionPage />} />
        <Route path="sessions/:id" element={<SessionDetail />} />
        <Route path="sessions/:id/edit" element={<EditSessionPage />} />
        <Route path="techniques" element={<TechniqueList />} />
        <Route path="techniques/new" element={<NewTechniquePage />} />
        <Route path="techniques/:id" element={<TechniqueDetail />} />
        <Route path="techniques/:id/edit" element={<EditTechniquePage />} />
        <Route path="plans" element={<Placeholder title="Plans de jeu" />} />
        <Route path="plans/:id" element={<Placeholder title="Plan de jeu" />} />
        <Route path="stats" element={<Placeholder title="Stats" />} />
        <Route path="search" element={<Placeholder title="Recherche" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/activities" element={<Placeholder title="Activités" />} />
        <Route path="settings/exercises" element={<ExercisesSettings />} />
        <Route path="settings/goals" element={<Placeholder title="Objectifs" />} />
        <Route path="settings/backup" element={<Backup />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
