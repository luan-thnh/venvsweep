# VenvSweep

Interactive CLI for finding and safely removing Python virtual environments across a workspace.

Inspired by the interaction model of `npkill`, but built specifically around Python venv safety and metadata.

## Why

Python repos often accumulate `.venv`, `venv`, `.my-venv`, and other environment folders. They are reproducible, but can quietly consume many gigabytes of storage.

VenvSweep scans a root folder, validates candidates using `pyvenv.cfg`, shows their size and Python version, then lets you select exactly what to remove.

## Run locally

```bash
npm install
npm run build
node dist/cli.js --help
```

For development:

```bash
npm run dev -- ~/Developer --dry-run
```

## Usage

```bash
# current directory
npx venvsweep

# choose a workspace
npx venvsweep ~/Developer

# or explicitly
npx venvsweep --directory ~/Developer

# custom environment folder names
npx venvsweep --targets .venv,venv,.my-venv

# preview only
npx venvsweep --dry-run

# machine-readable scan output
npx venvsweep --json
```

## TUI keys

- `↑` / `↓` or `j` / `k`: move
- `Space`: toggle selection
- `A`: select/unselect all
- `Enter`: confirm removal
- `Q`: quit

## Safety model

VenvSweep does **not** delete any folder merely because its name matches a target.

A candidate must contain `pyvenv.cfg`, and that file is checked again immediately before removal. This helps avoid deleting an unrelated directory that happens to be named `venv`.

Deletion also requires explicit selection and a final confirmation. Use `--dry-run` when evaluating a new workspace.

## MVP roadmap

- [x] `.venv` and `venv` defaults
- [x] multiple custom targets
- [x] choose search root
- [x] scan size
- [x] read Python version from `pyvenv.cfg`
- [x] keyboard multi-select
- [x] delete confirmation
- [x] dry-run
- [x] JSON scan output
- [ ] interactive directory picker
- [ ] live scan progress
- [ ] sort/filter inside TUI
- [ ] age-based filters
- [ ] ignore file / config file
- [ ] recycle-bin/trash mode
- [ ] Windows polish
- [ ] npm publish workflow

## Landing page

A static landing page prototype is included at `website/index.html`. Open it directly in a browser or serve the folder with any static server.

## Publish checklist

Before publishing, verify the npm package name is still available and update repository/author metadata in `package.json`.

```bash
npm install
npm test
npm run build
npm pack --dry-run
npm login
npm publish --access public
```
