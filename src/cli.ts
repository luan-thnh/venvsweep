#!/usr/bin/env node

import { performance } from 'node:perf_hooks';
import { color as pc } from './colors.js';
import { parseArgs } from './args.js';
import { helpText } from './help.js';
import { scanForVenvs } from './scan.js';
import { runTui } from './tui.js';
import { VERSION } from './version.js';

async function main(): Promise<void> {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(pc.red(error instanceof Error ? error.message : String(error)));
    console.error(pc.dim('Run venvsweep --help for usage.'));
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(helpText());
    return;
  }

  if (options.version) {
    console.log(VERSION);
    return;
  }

  const scanStartedAt = performance.now();

  if (!options.json) {
    process.stdout.write(
      `${pc.cyan('◌')} ${pc.dim('Scanning')} ${options.root} ${pc.dim(`for ${options.targets.join(', ')}`)}`,
    );
  }

  const candidates = await scanForVenvs({
    root: options.root,
    targets: options.targets,
    excludes: new Set(options.excludes),
  });

  const scanDurationMs = performance.now() - scanStartedAt;

  if (!options.json && process.stdout.isTTY) {
    process.stdout.write('\r\x1b[2K');
  } else if (!options.json) {
    process.stdout.write('\n');
  }

  if (options.json) {
    console.log(JSON.stringify({
      root: options.root,
      targets: options.targets,
      totalSizeBytes: candidates.reduce((sum, item) => sum + item.sizeBytes, 0),
      environments: candidates,
    }, null, 2));
    return;
  }

  await runTui(candidates, {
    root: options.root,
    targets: options.targets,
    dryRun: options.dryRun,
    scanDurationMs,
  });
}

main().catch((error) => {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
