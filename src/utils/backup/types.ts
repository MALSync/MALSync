/**
 * Backup types shared across BackupManager and cloud providers.
 *
 * Storage key conventions (determines sync vs local via syncRegex):
 *   settings/backup_*  → chrome.storage.sync  (credentials, config)
 *   backup/*           → chrome.storage.local  (timestamps, state)
 */

export const BACKUP_VERSION = 1;

/**
 * Local-storage key prefixes excluded from backups.
 * Caches and ephemeral state that should not be restored.
 */
export const LOCAL_EXCLUDE_PREFIXES = [
  'cache/',
  'release/',
  'reqCache/',
  'notificationHistory',
  'rateLimit',
];

/**
 * Sync-storage key patterns for credentials/tokens that must never
 * be included in a backup file. Backups may be shared or stored in
 * cloud services — credentials should always stay on-device.
 */
export const SYNC_CREDENTIAL_PATTERNS: RegExp[] = [
  /[Tt]oken/,
  /[Pp]assword/,
  /[Ss]ecret/,
  /[Aa]uth/,
  /[Cc]redential/,
  /[Aa]pi[Kk]ey/,
  /backup_webdav_password/,
  /backup_b2_appKey/,
  /backup_drive_clientId/,
];

export interface BackupMeta {
  version: number;
  timestamp: string;
  malsync_version: string;
}

export interface BackupData {
  meta: BackupMeta;
  /** chrome.storage.sync keys at the time of backup — credentials excluded */
  sync: Record<string, unknown>;
  /** Filtered chrome.storage.local keys — caches excluded */
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
  isConfigured(): boolean;
  testConnection(): Promise<string | null>;
  upload(data: BackupData): Promise<CloudResult>;
  download(): Promise<CloudDownloadResult>;
}
