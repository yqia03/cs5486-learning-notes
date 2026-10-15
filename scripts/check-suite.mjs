import { spawnSync } from 'node:child_process';
for (const script of ['scripts/check.mjs', 'scripts/check-midterm.mjs']) {
  const result = spawnSync(process.execPath, [script, ...process.argv.slice(2)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
