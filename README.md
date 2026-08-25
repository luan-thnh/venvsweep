<p align="center">
  <a href="https://luan-thnh.github.io/venvsweep/">
    <img src="https://raw.githubusercontent.com/luan-thnh/venvsweep/main/website/logo.svg" width="88" height="88" alt="VenvSweep logo" />
  </a>
</p>

<h1 align="center">VenvSweep</h1>

<p align="center">
  A fast, keyboard-first CLI for finding and safely removing forgotten Python virtual environments.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/venvsweep"><img src="https://img.shields.io/npm/v/venvsweep?style=flat-square&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/venvsweep"><img src="https://img.shields.io/npm/dm/venvsweep?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/luan-thnh/venvsweep/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/venvsweep?style=flat-square" alt="license" /></a>
  <a href="https://www.npmjs.com/package/venvsweep"><img src="https://img.shields.io/node/v/venvsweep?style=flat-square" alt="Node version" /></a>
</p>

<p align="center">
  <a href="https://luan-thnh.github.io/venvsweep/"><strong>Website</strong></a>
  ·
  <a href="https://github.com/luan-thnh/venvsweep"><strong>GitHub</strong></a>
  ·
  <a href="https://www.npmjs.com/package/venvsweep"><strong>npm</strong></a>
  ·
  <a href="https://github.com/luan-thnh/venvsweep/issues"><strong>Issues</strong></a>
</p>

---

Python projects tend to leave behind `.venv`, `venv`, and custom environment directories. Each one is reproducible, but together they can quietly consume gigabytes of disk space.

**VenvSweep** scans a workspace, validates real Python virtual environments using `pyvenv.cfg`, shows useful metadata, and lets you choose exactly what to remove from an interactive terminal UI.

Inspired by the keyboard-first cleanup flow of [`npkill`](https://github.com/voidcosmos/npkill), with safeguards and metadata designed specifically for Python virtual environments.

## Features

- 🔎 Scan the current directory or any workspace you choose.
- 🐍 Detect `.venv` and `venv` by default.
- 🧩 Add custom target names such as `.my-venv`, `env-py312`, or `backend-env`.
- 🛡️ Validate candidates using `pyvenv.cfg` instead of deleting folders based on name alone.
- 📦 Calculate environment size and read the Python version when available.
- ⌨️ Navigate and multi-select entirely from the keyboard.
- 👀 Preview results safely with `--dry-run`.
- 🤖 Output machine-readable scan results with `--json`.
- 🪶 Zero runtime dependencies.

## Install

Run it without installing globally:

```bash
npx venvsweep
```

Or install it globally:

```bash
npm install --global venvsweep
venvsweep
```

> VenvSweep requires Node.js 18.18 or newer.

## Quick start

Scan the current directory:

```bash
npx venvsweep
```

Scan a projects workspace:

```bash
npx venvsweep ~/Developer
```

Use custom virtual-environment directory names:

```bash
npx venvsweep ~/Developer --targets .venv,venv,.my-venv
```

Preview without deleting anything:

```bash
npx venvsweep ~/Developer --dry-run
```

Get JSON output without opening the interactive TUI:

```bash
npx venvsweep ~/Developer --json
```

## Interactive controls

| Key       | Action                              |
| --------- | ----------------------------------- |
| `↑` / `↓` | Move cursor                         |
| `j` / `k` | Move cursor, Vim-style              |
| `Space`   | Toggle the current environment      |
| `A`       | Select or unselect all environments |
| `Enter`   | Continue with selected removals     |
| `Q`       | Quit                                |

The TUI uses an alternate terminal screen and keeps the visible list inside a viewport, so selecting an item does not flood or scroll your shell history.

## CLI reference

```text
venvsweep [directory] [options]
```

| Option                   | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `-d, --directory <path>` | Search root. Defaults to the current directory.                        |
| `-t, --targets <names>`  | Comma-separated environment directory names. Defaults to `.venv,venv`. |
| `-x, --exclude <names>`  | Additional directory names to skip while scanning.                     |
| `--dry-run`              | Preview deletion without removing anything.                            |
| `--json`                 | Print scan results as JSON and skip the interactive TUI.               |
| `-h, --help`             | Show help.                                                             |
| `-v, --version`          | Show the installed version.                                            |

### Examples

```bash
# Current directory
venvsweep

# Explicit search root
venvsweep --directory ~/Developer

# Custom environment names
venvsweep -d ~/Developer -t .venv,venv,.my-venv

# Skip extra directories while walking the workspace
venvsweep ~/Developer --exclude archive,generated

# Safe preview
venvsweep ~/Developer --dry-run

# Script-friendly output
venvsweep ~/Developer --json
```

## Safety model

Deleting directories from a CLI deserves conservative defaults.

VenvSweep does **not** consider a directory removable just because its name matches `.venv`, `venv`, or a custom target. A candidate must contain `pyvenv.cfg`, the file Python creates inside a virtual environment. VenvSweep validates that marker during scanning and checks it again immediately before removal. Python's own `venv` documentation describes `pyvenv.cfg` as part of the virtual-environment directory structure.

On top of that:

1. Nothing is selected automatically just because it was discovered.
2. You explicitly choose environments with `Space` or `A`.
3. VenvSweep shows the selected total before removal.
4. A final confirmation is required.
5. `--dry-run` is available when exploring a new workspace.

If a directory contains important files that merely happen to resemble a virtual environment, do not select it for deletion.

## Default scan behavior

VenvSweep currently targets:

```text
.venv
venv
```

and skips common high-noise directories including:

```text
.git
node_modules
__pycache__
```

Custom targets replace the default target list for that run:

```bash
venvsweep --targets .venv,venv,.my-venv,python-env
```

Additional exclusions can be appended with `--exclude`:

```bash
venvsweep --exclude dist,build,archive
```

## Development

Clone the repository:

```bash
git clone https://github.com/luan-thnh/venvsweep.git
cd venvsweep
```

Install dependencies and build:

```bash
pnpm install
pnpm build
```

Run locally:

```bash
node dist/cli.js --help
node dist/cli.js ~/Developer --dry-run
```

Run tests:

```bash
pnpm test
```

Inspect the npm package before publishing:

```bash
npm pack --dry-run
```

## Roadmap

- [x] `.venv` and `venv` defaults
- [x] Custom target names
- [x] Configurable search root
- [x] Environment size calculation
- [x] Python version from `pyvenv.cfg`
- [x] Keyboard multi-select
- [x] Confirmation before removal
- [x] `--dry-run`
- [x] `--json`
- [x] Fullscreen viewport-based TUI
- [ ] Interactive directory picker
- [ ] Live scan progress
- [ ] Search/filter inside the TUI
- [ ] Sorting controls
- [ ] Persistent config / ignore file
- [ ] Trash/recycle-bin mode
- [ ] Additional Windows polish
- [ ] Automated npm release workflow

## Contributing

Issues and pull requests are welcome.

If you find a directory layout that VenvSweep detects incorrectly, please open an issue with a minimal reproducible example. Safety-related bug reports are especially valuable.

- [Open an issue](https://github.com/luan-thnh/venvsweep/issues)
- [View the source](https://github.com/luan-thnh/venvsweep)

## Website

Project landing page: **https://luan-thnh.github.io/venvsweep/**

The static site source lives in [`docs/`](./docs/).

## License

[MIT](./LICENSE) © luan-thnh
