import { spawnSync } from 'node:child_process';

if (!process.env.E2E_BASE_URL) {
  console.error('E2E_BASE_URL is required. Point the suite at an isolated preview environment.');
  process.exit(2);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['playwright', 'test'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
