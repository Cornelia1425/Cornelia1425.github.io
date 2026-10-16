import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'dist');
function run(script, args = []) {
  const result = spawnSync(process.execPath, [join(root, script), ...args], {
    cwd: root, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

run('node_modules/typescript/bin/tsc', ['-b']);
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
// Keep the domain file and every original image at its existing public URL.
cpSync(join(root, 'public'), output, { recursive: true });
cpSync(join(root, 'spatial'), output, { recursive: true });
writeFileSync(join(output, '.nojekyll'), '');
run('node_modules/vite/bin/vite.js', ['build']);
run('scripts/check-site.mjs');
