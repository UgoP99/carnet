// PostToolUse (Edit|Write): format the touched file, then lint it. Lint errors → exit 2 so Claude fixes them.
import { readInput, runBin, tail, toProjectRelative } from './lib.mjs';

const input = readInput();
const rel = toProjectRelative(input.tool_input?.file_path);
if (!rel || /^(node_modules|dist|dev-dist|coverage)\//.test(rel) || rel === 'package-lock.json') {
  process.exit(0);
}

if (/\.(tsx?|jsx?|mjs|css|json|md|html|ya?ml)$/.test(rel)) {
  runBin('prettier/bin/prettier.cjs', ['--write', '--log-level', 'silent', rel], 30_000);
}

if (/\.(tsx?|jsx?|mjs)$/.test(rel) && !rel.startsWith('.claude/')) {
  const r = runBin('eslint/bin/eslint.js', ['--max-warnings=0', '--no-warn-ignored', rel], 60_000);
  if (!r.skipped && r.status !== 0) {
    process.stderr.write(`ESLint failed for ${rel} — fix before continuing:\n${tail(r.out, 25)}\n`);
    process.exit(2);
  }
}
process.exit(0);
