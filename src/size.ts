import fs from 'node:fs/promises';
import path from 'node:path';

export async function getDirectorySize(root: string): Promise<number> {
  let total = 0;
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop()!;
    let dir;

    try {
      dir = await fs.opendir(current);
    } catch {
      continue;
    }

    for await (const entry of dir) {
      const fullPath = path.join(current, entry.name);

      try {
        if (entry.isDirectory()) {
          stack.push(fullPath);
        } else if (entry.isFile()) {
          const stat = await fs.stat(fullPath);
          total += stat.size;
        }
      } catch {
        // Ignore files that disappear or become inaccessible mid-scan.
      }
    }
  }

  return total;
}
