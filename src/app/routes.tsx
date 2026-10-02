import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { ActivitiesSettings } from '@/features/settings/ActivitiesSettings';
import { About } from '@/features/settings/About';
import { Backup } from '@/features/settings/Backup';
import { ExercisesSettings } from '@/features/settings/ExercisesSettings';
import { GoalsSettings } from '@/features/settings/GoalsSettings';
import { Settings } from '@/features/settings/Settings';
import { EditSessionPage } from '@/features/sessions/EditSessionPage';
import { NewSessionPage } from '@/features/sessions/NewSessionPage';
import { SessionDetail } from '@/features/sessions/SessionDetail';
import { SessionList } from '@/features/sessions/SessionList';
import { SearchView } from '@/features/search/SearchView';
import { EditTechniquePage } from '@/features/techniques/EditTechniquePage';
import { NewTechniquePage } from '@/features/techniques/NewTechniquePage';
import { TechniqueDetail } from '@/features/techniques/TechniqueDetail';
import { TechniqueList } from '@/features/techniques/TechniqueList';
import { WeekView } from '@/features/week/WeekView';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

const StatsView = lazy(() =>
  import('@/features/stats/StatsView').then((m) => ({ default: m.StatsView })),
);
const PlanList = lazy(() =>
  import('@/features/plans/PlanList').then((m) => ({ default: m.PlanList })),
);
const PlanEditor = lazy(() =>
  import('@/features/plans/PlanEditor').then((m) => ({ default: m.PlanEditor })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<WeekView />} />
        <Route path="journal" element={<SessionList />} />
        <Route path="sessions/new" element={<NewSessionPage />} />
        <Route path="sessions/:id" element={<SessionDetail />} />
        <Route path="sessions/:id/edit" element={<EditSessionPage />} />
        <Route path="techniques" element={<TechniqueList />} />
        <Route path="techniques/new" element={<NewTechniquePage />} />
        <Route path="techniques/:id" element={<TechniqueDetail />} />
        <Route path="techniques/:id/edit" element={<EditTechniquePage />} />
        <Route
          path="plans"
          element={
            <Suspense fallback={null}>
              <PlanList />
            </Suspense>
          }
        />
        <Route
          path="plans/:id"
          element={
            <Suspense fallback={null}>
              <PlanEditor />
            </Suspense>
          }
        />
        <Route
          path="stats"
          element={
            <Suspense fallback={null}>
              <StatsView />
            </Suspense>
          }
        />
        <Route path="search" element={<SearchView />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/activities" element={<ActivitiesSettings />} />
        <Route path="settings/exercises" element={<ExercisesSettings />} />
        <Route path="settings/goals" element={<GoalsSettings />} />
        <Route path="settings/backup" element={<Backup />} />
        <Route path="settings/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
