import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Une erreur est survenue
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tes données restent sur l'appareil. L'export de sauvegarde sera disponible ici.
        </p>
        <Button disabled title="Disponible à l'étape 4 (sauvegarde)">
          Exporter mes données
        </Button>
      </div>
    );
  }
}
