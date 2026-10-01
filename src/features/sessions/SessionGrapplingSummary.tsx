import { Link } from 'react-router';
import type { GrapplingBlock, Technique, TechniqueLog } from '@/domain/schemas';
import { attireLabels, positionLabels, sessionContentLabels } from '@/domain/labels';

interface SessionGrapplingSummaryProps {
  grappling: GrapplingBlock;
  techniqueLogs: TechniqueLog[];
  techniques: Technique[];
}

export function SessionGrapplingSummary({
  grappling,
  techniqueLogs,
  techniques,
}: SessionGrapplingSummaryProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Grappling</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {grappling.attire && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Tenue</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {attireLabels[grappling.attire]}
              </dd>
            </div>
          )}
          {grappling.content.length > 0 && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Contenu</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {grappling.content.map((c) => sessionContentLabels[c]).join(', ')}
              </dd>
            </div>
          )}
          {grappling.sparringRounds !== undefined && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Rounds</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {grappling.sparringRounds}
                {grappling.roundMin !== undefined && ` × ${grappling.roundMin} min`}
              </dd>
            </div>
          )}
          {(grappling.subsLanded !== undefined || grappling.subsConceded !== undefined) && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Soumissions</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {grappling.subsLanded ?? 0} marquées / {grappling.subsConceded ?? 0} concédées
              </dd>
            </div>
          )}
          {grappling.partners.length > 0 && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Partenaires</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {grappling.partners.join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {techniqueLogs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Techniques vues
          </h2>
          <ul className="flex flex-col gap-2">
            {techniqueLogs.map((log) => {
              const technique = techniques.find((t) => t.id === log.techniqueId);
              return (
                <li key={log.id} className="text-sm">
                  <Link
                    to={`/techniques/${log.techniqueId}`}
                    className="font-medium text-sky-600 underline dark:text-sky-400"
                  >
                    {technique?.name ?? 'Technique supprimée'}
                  </Link>
                  {technique && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {' '}
                      ({positionLabels[technique.position]})
                    </span>
                  )}
                  {log.text && (
                    <p className="whitespace-pre-wrap break-words text-slate-900 dark:text-white">
                      {log.text}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
