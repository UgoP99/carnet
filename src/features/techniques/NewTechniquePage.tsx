import { useNavigate } from 'react-router';
import { createTechnique } from '@/db/techniqueRepo';
import { DEFAULT_TECHNIQUE_FORM_VALUES, TechniqueForm } from './TechniqueForm';

export function NewTechniquePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle technique</h1>
      <TechniqueForm
        initial={DEFAULT_TECHNIQUE_FORM_VALUES}
        submitLabel="Enregistrer"
        onSubmit={async (input) => {
          const created = await createTechnique(input);
          void navigate(`/techniques/${created.id}`);
        }}
      />
    </div>
  );
}
