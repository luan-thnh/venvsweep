import fs from 'node:fs/promises';
import type { VenvCandidate } from './types.js';
import { isPythonVenv } from './venv.js';

export interface RemovalResult {
  candidate: VenvCandidate;
  removed: boolean;
  error?: string;
}

export async function removeCandidates(
  candidates: VenvCandidate[],
  dryRun: boolean,
): Promise<RemovalResult[]> {
  const results: RemovalResult[] = [];

  for (const candidate of candidates) {
    if (dryRun) {
      results.push({ candidate, removed: false });
      continue;
    }

    try {
      // Re-check immediately before deletion. A candidate may have changed since scan time.
      if (!(await isPythonVenv(candidate.path))) {
        throw new Error('pyvenv.cfg no longer exists; refusing to delete');
      }

      await fs.rm(candidate.path, { recursive: true, force: false });
      results.push({ candidate, removed: true });
    } catch (error) {
      results.push({
        candidate,
        removed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
