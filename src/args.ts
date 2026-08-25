import path from 'node:path';
import type { CliOptions } from './types.js';

const DEFAULT_TARGETS = ['.venv', 'venv'];
const DEFAULT_EXCLUDES = ['.git', 'node_modules', '__pycache__'];

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseArgs(argv: string[], cwd = process.cwd()): CliOptions {
  let root = cwd;
  let targets = [...DEFAULT_TARGETS];
  let excludes = [...DEFAULT_EXCLUDES];
  let dryRun = false;
  let json = false;
  let help = false;
  let version = false;
  let positionalRootSeen = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      help = true;
      continue;
    }
    if (arg === '-v' || arg === '--version') {
      version = true;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '-d' || arg === '--directory') {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} requires a directory path`);
      root = path.resolve(cwd, value);
      positionalRootSeen = true;
      continue;
    }
    if (arg === '-t' || arg === '--targets' || arg === '--target') {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} requires a comma-separated value`);
      targets = splitCsv(value);
      if (targets.length === 0) throw new Error('At least one target is required');
      continue;
    }
    if (arg === '-x' || arg === '--exclude') {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} requires a comma-separated value`);
      excludes = [...new Set([...excludes, ...splitCsv(value)])];
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (!positionalRootSeen) {
      root = path.resolve(cwd, arg);
      positionalRootSeen = true;
      continue;
    }
    throw new Error(`Unexpected argument: ${arg}`);
  }

  return {
    root: path.resolve(root),
    targets: [...new Set(targets)],
    excludes: [...new Set(excludes)],
    dryRun,
    json,
    help,
    version,
  };
}

export const DEFAULTS = {
  targets: DEFAULT_TARGETS,
  excludes: DEFAULT_EXCLUDES,
};
