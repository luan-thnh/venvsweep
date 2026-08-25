export interface CliOptions {
  root: string;
  targets: string[];
  excludes: string[];
  dryRun: boolean;
  json: boolean;
  help: boolean;
  version: boolean;
}

export interface VenvCandidate {
  path: string;
  name: string;
  projectPath: string;
  sizeBytes: number;
  pythonVersion: string | null;
  lastModifiedMs: number;
}

export interface ScanOptions {
  root: string;
  targets: string[];
  excludes: Set<string>;
}
