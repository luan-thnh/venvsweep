#!/usr/bin/env node

import { color as pc } from './colors.js';
import { parseArgs } from './args.js';
import { formatBytes } from './format.js';
import { helpText } from './help.js';
import { scanForVenvs } from './scan.js';
import { runTui } from './tui.js';

const VERSION = '0.1.0';

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

  if (!options.json) {
    process.stdout.write(
      `${pc.cyan('Scanning')} ${options.root} for ${options.targets.join(', ')} ...\n`,
    );
  }

  const candidates = await scanForVenvs({
    root: options.root,
    targets: options.targets,
    excludes: new Set(options.excludes),
  });

  if (options.json) {
    console.log(JSON.stringify({
      root: options.root,
      targets: options.targets,
      totalSizeBytes: candidates.reduce((sum, item) => sum + item.sizeBytes, 0),
      environments: candidates,
    }, null, 2));
    return;
  }

  if (candidates.length > 0) {
    const total = candidates.reduce((sum, item) => sum + item.sizeBytes, 0);
    console.log(pc.dim(`Found ${candidates.length} environment(s), ${formatBytes(total)} total.`));
  }

  await runTui(candidates, {
    root: options.root,
    targets: options.targets,
    dryRun: options.dryRun,
  });
}

main().catch((error) => {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
