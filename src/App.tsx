import { HashRouter } from 'react-router';
import { AppRoutes } from './app/routes';
import { ErrorBoundary } from './app/ErrorBoundary';
import { UpdateToast } from './app/UpdateToast';

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <UpdateToast />
    </ErrorBoundary>
  );
}
