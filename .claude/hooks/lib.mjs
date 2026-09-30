// Shared helpers for Claude Code hooks. Pure Node (no shell) so it works on Windows, macOS, Linux.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

/** Run a JS CLI from node_modules with the current Node binary (avoids .cmd shims on Windows). */
export function runBin(relBin, args, timeoutMs = 120_000) {
  const bin = path.join(ROOT, 'node_modules', relBin);
  if (!existsSync(bin)) return { skipped: true, status: 0, out: '' };
  const r = spawnSync(process.execPath, [bin, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  return { skipped: false, status: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

export function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

/** Keep hook output small: it is injected into Claude's context. */
export function tail(text, maxLines = 30) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const kept = lines.slice(-maxLines);
  return (
    (lines.length > maxLines ? `…(${lines.length - maxLines} lines cut)\n` : '') + kept.join('\n')
  );
}

export function toProjectRelative(filePath) {
  if (!filePath) return null;
  const rel = path.relative(ROOT, filePath).replaceAll('\\', '/');
  return rel.startsWith('..') || path.isAbsolute(rel) ? null : rel;
}
