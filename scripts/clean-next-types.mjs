import { rm } from 'node:fs/promises';

await rm('.next/dev/types', { recursive: true, force: true });
