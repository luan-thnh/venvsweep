import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { parseArgs } from '../dist/args.js';

test('uses safe default targets', () => {
  const options = parseArgs([], '/tmp/workspace');
  assert.deepEqual(options.targets, ['.venv', 'venv']);
  assert.equal(options.root, path.resolve('/tmp/workspace'));
});

test('accepts a positional root and custom targets', () => {
  const options = parseArgs(['projects', '--targets', '.venv,.my-venv'], '/tmp');
  assert.equal(options.root, path.resolve('/tmp/projects'));
  assert.deepEqual(options.targets, ['.venv', '.my-venv']);
});
