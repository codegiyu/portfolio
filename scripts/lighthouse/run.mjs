import { spawnSync } from 'node:child_process';

const url = process.env.LIGHTHOUSE_URL || process.env.E2E_BASE_URL;
if (!url) {
  console.error('LIGHTHOUSE_URL or E2E_BASE_URL is required for the performance gate.');
  process.exit(2);
}

try {
  new URL(url);
} catch {
  console.error('LIGHTHOUSE_URL/E2E_BASE_URL must be a valid URL.');
  process.exit(2);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['lhci', 'autorun'], {
  stdio: 'inherit',
  env: { ...process.env, LIGHTHOUSE_URL: url },
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(`Unable to start Lighthouse CI: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
