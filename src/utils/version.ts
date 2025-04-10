import semverGte from 'semver/functions/gte';
import semverGt from 'semver/functions/gt';

export function getCurrentVersion(): string {
  return api.storage.version();
}

export function greaterOrEqualCurrentVersion(version: string): boolean {
  return semverGte(version, getCurrentVersion());
}

export function greaterCurrentVersion(version: string): boolean {
  return semverGt(version, getCurrentVersion()) && version !== getCurrentVersion();
}
