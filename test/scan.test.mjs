import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { scanForVenvs } from '../dist/scan.js';

test('finds only target folders that contain pyvenv.cfg', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'venvsweep-'));

  try {
    const valid = path.join(root, 'project-a', '.venv');
    const invalid = path.join(root, 'project-b', 'venv');
    const custom = path.join(root, 'project-c', '.my-venv');

    await fs.mkdir(valid, { recursive: true });
    await fs.mkdir(invalid, { recursive: true });
    await fs.mkdir(custom, { recursive: true });
    await fs.writeFile(path.join(valid, 'pyvenv.cfg'), 'version = 3.12.4\n');
    await fs.writeFile(path.join(valid, 'payload.bin'), Buffer.alloc(256));
    await fs.writeFile(path.join(custom, 'pyvenv.cfg'), 'version = 3.11.9\n');

    const results = await scanForVenvs({
      root,
      targets: ['.venv', 'venv', '.my-venv'],
      excludes: new Set(['.git', 'node_modules']),
    });

    assert.equal(results.length, 2);
    assert.deepEqual(new Set(results.map((item) => item.name)), new Set(['.venv', '.my-venv']));
    assert.equal(results.find((item) => item.name === '.venv')?.pythonVersion, '3.12.4');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
