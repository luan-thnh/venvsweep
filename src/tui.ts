import path from 'node:path';
import readline from 'node:readline';
import { color as pc } from './colors.js';
import { formatAge, formatBytes } from './format.js';
import { removeCandidates } from './remove.js';
import type { VenvCandidate } from './types.js';

interface TuiOptions {
  root: string;
  targets: string[];
  dryRun: boolean;
}

function truncate(value: string, width: number): string {
  if (value.length <= width) return value.padEnd(width);
  if (width <= 1) return value.slice(0, width);
  return `${value.slice(0, width - 1)}…`;
}

function relativeDisplay(root: string, candidate: VenvCandidate): string {
  const relative = path.relative(root, candidate.path) || candidate.name;
  return relative.split(path.sep).join('/');
}

function sumSelected(candidates: VenvCandidate[], selected: Set<number>): number {
  let total = 0;
  for (const index of selected) total += candidates[index]?.sizeBytes ?? 0;
  return total;
}

function clearScreen(): void {
  // Clear only the active terminal viewport. The TUI runs in the alternate
  // screen buffer, so redraws never pollute or scroll the user's shell history.
  process.stdout.write('\x1b[H\x1b[2J');
}

function enterAlternateScreen(): void {
  process.stdout.write('\x1b[?1049h\x1b[?25l');
}

function leaveAlternateScreen(): void {
  process.stdout.write('\x1b[?25h\x1b[?1049l');
}

async function confirm(message: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;

  process.stdin.setRawMode(false);
  process.stdin.pause();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`${message} ${pc.dim('[y/N]')} `, resolve);
  });

  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

export async function runTui(candidates: VenvCandidate[], options: TuiOptions): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive mode requires a TTY. Use --json for non-interactive output.');
  }

  if (candidates.length === 0) {
    console.log(pc.green('✓ No Python virtual environments found.'));
    return;
  }

  let cursor = 0;
  let selected = new Set<number>();
  let message = '';
  let running = true;
  let viewportStart = 0;

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  const render = () => {
    const width = Math.max(72, Math.min(process.stdout.columns || 100, 120));
    const terminalRows = Math.max(10, process.stdout.rows || 24);
    const pathWidth = Math.max(28, width - 43);
    const reclaim = sumSelected(candidates, selected);

    // Reserve rows for title/root/targets/header + footer. Keep one spare row so
    // writing the frame never reaches the last terminal cell and triggers scroll.
    const fixedRows = message ? 9 : 8;
    const visibleCount = Math.max(1, terminalRows - fixedRows - 1);

    if (cursor < viewportStart) {
      viewportStart = cursor;
    } else if (cursor >= viewportStart + visibleCount) {
      viewportStart = cursor - visibleCount + 1;
    }

    const maxViewportStart = Math.max(0, candidates.length - visibleCount);
    viewportStart = Math.min(viewportStart, maxViewportStart);
    const viewportEnd = Math.min(candidates.length, viewportStart + visibleCount);

    const lines: string[] = [];
    lines.push(`${pc.bold(pc.green('VenvSweep'))} ${pc.dim('0.1.0')}`);
    lines.push(`${pc.dim('root')}    ${options.root}`);
    lines.push(`${pc.dim('targets')} ${options.targets.map((target) => pc.cyan(target)).join(pc.dim(', '))}`);
    lines.push('');
    lines.push(
      `${pc.dim('   ')} ${pc.dim(truncate('Environment', pathWidth))} ${pc.dim('Size'.padStart(10))} ${pc.dim('Age'.padStart(6))} ${pc.dim('Python'.padStart(9))}`,
    );

    for (let index = viewportStart; index < viewportEnd; index += 1) {
      const candidate = candidates[index];
      const active = index === cursor;
      const checked = selected.has(index);
      const prefix = `${active ? pc.cyan('›') : ' '} ${checked ? pc.green('●') : pc.dim('○')}`;
      const envPath = truncate(relativeDisplay(options.root, candidate), pathWidth);
      const size = formatBytes(candidate.sizeBytes).padStart(10);
      const age = formatAge(candidate.lastModifiedMs).padStart(6);
      const python = (candidate.pythonVersion ?? '?').slice(0, 9).padStart(9);
      const line = `${prefix} ${envPath} ${size} ${age} ${python}`;
      lines.push(active ? pc.bgBlack(pc.white(line)) : line);
    }

    lines.push('');
    lines.push(
      `${pc.inverse(' ↑↓/jk ')} move  ${pc.inverse(' Space ')} select  ${pc.inverse(' A ')} all  ${pc.inverse(' Enter ')} remove  ${pc.inverse(' Q ')} quit`,
    );

    const range = candidates.length > visibleCount
      ? pc.dim(` · showing ${viewportStart + 1}-${viewportEnd}/${candidates.length}`)
      : '';
    lines.push(
      `${selected.size} selected · ${pc.green(formatBytes(reclaim))} reclaimable${options.dryRun ? pc.yellow(' · DRY RUN') : ''}${range}`,
    );
    if (message) lines.push(pc.yellow(message));

    // One write, no trailing newline: prevents the terminal itself from scrolling
    // when the cursor is sitting on the last visible row.
    process.stdout.write(`\x1b[H\x1b[2J${lines.join('\n')}`);
  };

  enterAlternateScreen();
  render();

  await new Promise<void>((resolve, reject) => {
    const onKeypress = async (_str: string, key: readline.Key) => {
      try {
        message = '';

        if (key.ctrl && key.name === 'c') {
          running = false;
          cleanup();
          resolve();
          return;
        }
        if (key.name === 'q' || key.name === 'escape') {
          running = false;
          cleanup();
          resolve();
          return;
        }
        if (key.name === 'down' || key.name === 'j') {
          cursor = Math.min(candidates.length - 1, cursor + 1);
          render();
          return;
        }
        if (key.name === 'up' || key.name === 'k') {
          cursor = Math.max(0, cursor - 1);
          render();
          return;
        }
        if (key.name === 'space') {
          selected.has(cursor) ? selected.delete(cursor) : selected.add(cursor);
          render();
          return;
        }
        if (key.name === 'a') {
          selected = selected.size === candidates.length
            ? new Set<number>()
            : new Set(candidates.map((_, index) => index));
          render();
          return;
        }
        if (key.name === 'return') {
          if (selected.size === 0) {
            message = 'Select at least one environment first.';
            render();
            return;
          }

          const chosen = [...selected].sort((a, b) => a - b).map((index) => candidates[index]);
          const reclaim = sumSelected(candidates, selected);

          process.stdin.off('keypress', onKeypress);
          process.stdin.setRawMode(false);
          clearScreen();

          const action = options.dryRun ? 'simulate removal of' : 'remove';
          const accepted = await confirm(
            `About to ${action} ${chosen.length} environment(s), ${formatBytes(reclaim)} total. Continue?`,
          );

          if (!accepted) {
            readline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('keypress', onKeypress);
            message = 'Cancelled.';
            render();
            return;
          }

          const results = await removeCandidates(chosen, options.dryRun);
          const failures = results.filter((result) => result.error);
          const removedCount = options.dryRun ? 0 : results.filter((result) => result.removed).length;

          // Restore the user's normal terminal screen before printing the final
          // result so the summary remains visible in shell history.
          running = false;
          cleanup();

          if (options.dryRun) {
            console.log(pc.yellow(`Dry run complete. ${results.length} environment(s) would be removed.`));
          } else {
            console.log(pc.green(`✓ Removed ${removedCount} environment(s).`));
          }

          for (const failure of failures) {
            console.error(pc.red(`✗ ${failure.candidate.path}: ${failure.error}`));
          }

          resolve();
        }
      } catch (error) {
        running = false;
        cleanup();
        reject(error);
      }
    };

    const cleanup = () => {
      process.stdin.off('keypress', onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      if (!running) leaveAlternateScreen();
    };

    process.stdin.on('keypress', onKeypress);
  });
}
