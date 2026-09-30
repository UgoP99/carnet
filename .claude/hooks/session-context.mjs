// SessionStart: print a tiny status so Claude doesn't need to read whole files to orient itself.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { git, ROOT } from './lib.mjs';

const out = [];
const roadmap = path.join(ROOT, 'docs', 'ROADMAP.md');
if (existsSync(roadmap)) {
  const next = readFileSync(roadmap, 'utf8')
    .split(/\r?\n/)
    .find((l) => /^###\s+\[ \]/.test(l));
  out.push(
    next ? `Next ROADMAP step: ${next.replace(/^###\s+\[ \]\s*/, '')}` : 'ROADMAP: all steps done.',
  );
}
const branch = git(['branch', '--show-current']);
if (branch !== null) {
  const dirty = git(['status', '--porcelain'])?.split('\n').filter(Boolean).length ?? 0;
  out.push(`Git: branch ${branch || '(detached)'}, ${dirty} uncommitted file(s).`);
}
if (!existsSync(path.join(ROOT, 'node_modules'))) out.push('node_modules missing: run `npm ci`.');
process.stdout.write(out.join('\n') + '\n');
