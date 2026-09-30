// Stop: quality gate. Runs typecheck + tests related to uncommitted changes, only when code changed
// since the last green run. Failure → exit 2: Claude keeps working instead of finishing on red.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { git, readInput, ROOT, runBin, tail } from './lib.mjs';

const input = readInput();
if (input.stop_hook_active) process.exit(0); // never loop; the next turn re-checks
if (!existsSync(path.join(ROOT, 'node_modules'))) process.exit(0);

const status = git(['status', '--porcelain']);
if (status === null) process.exit(0); // not a git repo yet
const relevant = status
  .split('\n')
  .filter((l) => /(src\/|vite\.config|tsconfig|package\.json|eslint\.config)/.test(l));
if (relevant.length === 0) process.exit(0);

const stamp = path.join(ROOT, 'node_modules', '.tmp', 'stop-gate.hash');
const hash = createHash('sha1')
  .update(status + (git(['diff']) ?? ''))
  .digest('hex');
if (existsSync(stamp) && readFileSync(stamp, 'utf8') === hash) process.exit(0);

const tsc = runBin('typescript/bin/tsc', ['-b'], 180_000);
if (!tsc.skipped && tsc.status !== 0) {
  process.stderr.write(`Quality gate: typecheck failed.\n${tail(tsc.out, 30)}\n`);
  process.exit(2);
}
const tests = runBin(
  'vitest/vitest.mjs',
  ['run', '--changed', '--reporter=dot', '--passWithNoTests'],
  300_000,
);
if (!tests.skipped && tests.status !== 0) {
  process.stderr.write(`Quality gate: tests failed.\n${tail(tests.out, 40)}\n`);
  process.exit(2);
}
mkdirSync(path.dirname(stamp), { recursive: true });
writeFileSync(stamp, hash);
process.exit(0);
