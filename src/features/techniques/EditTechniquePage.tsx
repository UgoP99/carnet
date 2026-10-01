import { useNavigate, useParams } from 'react-router';
import { useTechnique } from '@/db/hooks';
import { updateTechnique } from '@/db/techniqueRepo';
import { TechniqueForm, techniqueToFormValues } from './TechniqueForm';

export function EditTechniquePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const technique = useTechnique(id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier la technique</h1>
      {!technique || !id ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <TechniqueForm
          initial={techniqueToFormValues(technique)}
          submitLabel="Mettre à jour"
          onSubmit={async (input) => {
            await updateTechnique(id, input);
            void navigate(`/techniques/${id}`);
          }}
        />
      )}
    </div>
  );
}
