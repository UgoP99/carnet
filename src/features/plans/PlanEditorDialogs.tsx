import { ConfirmDialog } from '@/ui/ConfirmDialog';

interface PlanEditorDialogsProps {
  deletingNode: boolean;
  onConfirmDeleteNode: () => void;
  onCancelDeleteNode: () => void;
  deletingPlan: boolean;
  onConfirmDeletePlan: () => void;
  onCancelDeletePlan: () => void;
}

export function PlanEditorDialogs({
  deletingNode,
  onConfirmDeleteNode,
  onCancelDeleteNode,
  deletingPlan,
  onConfirmDeletePlan,
  onCancelDeletePlan,
}: PlanEditorDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={deletingNode}
        title="Supprimer ce nœud ?"
        description="Les enfants de ce nœud seront supprimés aussi."
        destructive
        confirmLabel="Supprimer"
        onConfirm={onConfirmDeleteNode}
        onCancel={onCancelDeleteNode}
      />

      <ConfirmDialog
        open={deletingPlan}
        title="Supprimer le plan ?"
        description="Tous ses nœuds seront supprimés aussi."
        destructive
        confirmLabel="Supprimer"
        onConfirm={onConfirmDeletePlan}
        onCancel={onCancelDeletePlan}
      />
    </>
  );
}
