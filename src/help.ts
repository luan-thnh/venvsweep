export function helpText(): string {
  return `VenvSweep — find and safely remove Python virtual environments

Usage:
  venvsweep [directory] [options]
  npx venvsweep [directory] [options]

Options:
  -d, --directory <path>     Search root (defaults to current directory)
  -t, --targets <names>      Comma-separated env folder names
                             Default: .venv,venv
  -x, --exclude <names>      Additional directory names to skip
      --dry-run              Preview deletion without removing anything
      --json                 Print scan results as JSON; no interactive TUI
  -h, --help                 Show this help
  -v, --version              Show version

Controls:
  ↑ / ↓ or j / k             Move cursor
  Space                      Toggle current item
  A                          Select / unselect all
  Enter                      Confirm selected removals
  Q                          Quit

Safety:
  VenvSweep only lists target-named folders that contain pyvenv.cfg.
  It checks pyvenv.cfg again immediately before deletion.

Examples:
  npx venvsweep
  npx venvsweep ~/Developer
  npx venvsweep -d ~/Developer -t .venv,venv,.my-venv
  npx venvsweep --dry-run
`;
}
