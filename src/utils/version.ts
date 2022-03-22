import semverGte from 'semver/functions/gte';

export function getCurrentVersion(): string {
  return api.storage.version();
}

export function greaterOrEqualCurrentVersion(version: string): boolean {
  return semverGte(version, getCurrentVersion());
}
