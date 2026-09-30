import { HashRouter } from 'react-router';
import { AppRoutes } from './app/routes';
import { ErrorBoundary } from './app/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ErrorBoundary>
  );
}
