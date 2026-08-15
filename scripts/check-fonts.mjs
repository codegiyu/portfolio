import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const disallowed = /next\/font\/google|fonts\.googleapis\.com|fonts\.gstatic\.com/;
const sourceExtensions = new Set(['.css', '.js', '.jsx', '.mjs', '.ts', '.tsx']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (sourceExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const matches = [];
for (const file of await walk('app')) {
  const source = await readFile(file, 'utf8');
  if (disallowed.test(source)) matches.push(file);
}

if (matches.length) {
  console.error(`Disallowed remote font references found in: ${matches.join(', ')}`);
  process.exitCode = 1;
}
