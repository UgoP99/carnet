import { Component, type ErrorInfo, type ReactNode } from 'react';
import { exportBackup } from '@/db/backup';
import { setLastExportAt } from '@/db/metaRepo';
import { todayLocal } from '@/lib/dates';
import { shareOrDownloadFile } from '@/lib/share';
import { Button } from '@/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  exportMessage?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  handleExport = (): void => {
    void this.exportData();
  };

  async exportData(): Promise<void> {
    try {
      const doc = await exportBackup();
      const outcome = await shareOrDownloadFile(
        `carnet-backup-${todayLocal()}.json`,
        JSON.stringify(doc, null, 2),
        'application/json',
      );
      if (outcome === 'cancelled') return;
      await setLastExportAt(doc.exportedAt);
      this.setState({ exportMessage: 'Sauvegarde exportée.' });
    } catch (error) {
      this.setState({
        exportMessage: error instanceof Error ? error.message : "Échec de l'export.",
      });
    }
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          Une erreur est survenue
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tes données restent sur l'appareil.
        </p>
        <Button onClick={this.handleExport}>Exporter mes données</Button>
        {this.state.exportMessage && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{this.state.exportMessage}</p>
        )}
      </div>
    );
  }
}
