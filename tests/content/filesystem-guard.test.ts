import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production content boundary', () => {
  it('keeps filesystem persistence out of production route handlers', () => {
    const root = path.join(process.cwd(), 'app');
    const files: string[] = [];
    function walk(directory: string) {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(target);
        else if (entry.name === 'route.ts') files.push(target);
      }
    }
    walk(root);
    const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    expect(source).not.toMatch(/writeFileSync|unlinkSync|readdirSync|readFileSync/);
    expect(source).not.toMatch(/@\/lib\/(projects|blog)/);
  });
});
