import fs from 'node:fs/promises';
import path from 'node:path';

export async function isPythonVenv(directory: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(directory, 'pyvenv.cfg'));
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function readPythonVersion(directory: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(path.join(directory, 'pyvenv.cfg'), 'utf8');
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const [rawKey, ...rest] = line.split('=');
      const key = rawKey?.trim().toLowerCase();
      const value = rest.join('=').trim();
      if (!value) continue;

      if (key === 'version' || key === 'version_info') {
        return value;
      }
    }
  } catch {
    return null;
  }

  return null;
}
