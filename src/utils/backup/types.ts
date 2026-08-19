/**
 * Backup types shared across BackupManager and cloud providers.
 *
 * Storage key conventions (determines sync vs local via syncRegex):
 *   settings/backup_*  → chrome.storage.sync  (credentials, config)
 *   backup/*           → chrome.storage.local  (timestamps, state)
 */

export const BACKUP_VERSION = 1;

/**
 * Local-storage key prefixes that are always excluded from backups.
 * These are caches and ephemeral state that should not be restored.
 */
export const LOCAL_EXCLUDE_PREFIXES = [
  'cache/',
  'release/',
  'reqCache/',
  'notificationHistory',
  'rateLimit',
];

export interface BackupMeta {
  version: number;
  timestamp: string;
  malsync_version: string;
}

export interface BackupData {
  meta: BackupMeta;
  /** All chrome.storage.sync keys at the time of backup */
  sync: Record<string, unknown>;
  /** Filtered chrome.storage.local keys (caches excluded) */
  local: Record<string, unknown>;
}

export interface CloudResult {
  success: boolean;
  error?: string;
}

export interface CloudDownloadResult extends CloudResult {
  data?: BackupData;
}

export interface ICloudProvider {
  /** Whether the provider has enough config to attempt an operation */
  isConfigured(): boolean;
  /** Returns null on success, error string on failure */
  testConnection(): Promise<string | null>;
  upload(data: BackupData): Promise<CloudResult>;
  download(): Promise<CloudDownloadResult>;
}
