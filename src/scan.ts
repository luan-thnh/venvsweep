import fs from 'node:fs/promises';
import path from 'node:path';
import { getDirectorySize } from './size.js';
import { isPythonVenv, readPythonVersion } from './venv.js';
import type { ScanOptions, VenvCandidate } from './types.js';

export async function scanForVenvs(options: ScanOptions): Promise<VenvCandidate[]> {
  const rootStat = await fs.stat(options.root).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Search root is not a directory: ${options.root}`);
  }

  const targetSet = new Set(options.targets);
  const results: VenvCandidate[] = [];
  const stack = [options.root];

  while (stack.length > 0) {
    const current = stack.pop()!;
    let dir;

    try {
      dir = await fs.opendir(current);
    } catch {
      continue;
    }

    for await (const entry of dir) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(current, entry.name);

      if (targetSet.has(entry.name)) {
        if (await isPythonVenv(fullPath)) {
          const [sizeBytes, pythonVersion, stat] = await Promise.all([
            getDirectorySize(fullPath),
            readPythonVersion(fullPath),
            fs.stat(fullPath),
          ]);

          results.push({
            path: fullPath,
            name: entry.name,
            projectPath: current,
            sizeBytes,
            pythonVersion,
            lastModifiedMs: stat.mtimeMs,
          });
        }

        // Never descend into a target-named directory. Even an invalid one can be huge.
        continue;
      }

      if (options.excludes.has(entry.name)) continue;
      stack.push(fullPath);
    }
  }

  return results.sort((a, b) => b.sizeBytes - a.sizeBytes);
}
