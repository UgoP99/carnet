import Dexie, { type Table } from 'dexie';
import type {
  Activity,
  Exercise,
  ExerciseEntry,
  GamePlan,
  GamePlanNode,
  Session,
  Technique,
  TechniqueLog,
} from '@/domain/schemas';
import { buildSeedActivities, buildSeedExercises } from './seed';

export interface MetaRow {
  key: string;
  value: unknown;
}

export class CarnetDB extends Dexie {
  activities!: Table<Activity, string>;
  sessions!: Table<Session, string>;
  techniques!: Table<Technique, string>;
  techniqueLogs!: Table<TechniqueLog, string>;
  exercises!: Table<Exercise, string>;
  exerciseEntries!: Table<ExerciseEntry, string>;
  gamePlans!: Table<GamePlan, string>;
  gamePlanNodes!: Table<GamePlanNode, string>;
  meta!: Table<MetaRow, string>;

  constructor(name = 'carnet') {
    super(name);
    this.version(1).stores({
      activities: 'id, order',
      sessions: 'id, date, activityId, [activityId+date]',
      techniques: 'id, name, position, type, *tags',
      techniqueLogs: 'id, techniqueId, sessionId, date',
      exercises: 'id, name',
      exerciseEntries: 'id, sessionId, [exerciseId+date]',
      gamePlans: 'id, name',
      gamePlanNodes: 'id, planId, parentId',
      meta: 'key',
    });
    this.on('populate', () => this.populate());
  }

  private async populate(): Promise<void> {
    const now = new Date().toISOString();
    await this.activities.bulkAdd(buildSeedActivities(now));
    await this.exercises.bulkAdd(buildSeedExercises(now));
    await this.meta.put({ key: 'seededAt', value: now });
  }
}

export const db = new CarnetDB();
