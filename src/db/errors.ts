/** Thrown when a write would violate a data-model invariant (see docs/DATA_MODEL.md). */
export class InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvariantError';
  }
}

/** Thrown when a backup file fails the import pipeline (size, parsing, version, …). */
export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}
