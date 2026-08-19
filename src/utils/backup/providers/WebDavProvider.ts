/**
 * WebDavProvider
 *
 * Works with any WebDAV server: Nextcloud, Synology DiskStation,
 * QNAP NAS, ownCloud, and generic WebDAV endpoints.
 *
 * Credentials stored under settings/backup_webdav_* (→ sync storage).
 * Note: the password key matches SYNC_CREDENTIAL_PATTERNS and is
 * therefore excluded from backup exports.
 */

import type { BackupData, CloudResult, CloudDownloadResult, ICloudProvider } from '../types';
import type { BackupManager } from '../BackupManager';

const FILE_NAME = 'malsync-backup.json';

function basic(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

export class WebDavProvider implements ICloudProvider {
  constructor(private readonly mgr: BackupManager) {}

  // ── Config ────────────────────────────────────────────────────────────────────

  async getConfig(): Promise<{ url: string; username: string; password: string } | null> {
    return new Promise(resolve => {
      chrome.storage.sync.get(
        ['settings/backup_webdav_url', 'settings/backup_webdav_username', 'settings/backup_webdav_password'],
        items => {
          const url = items['settings/backup_webdav_url'] as string | undefined;
          const username = items['settings/backup_webdav_username'] as string | undefined;
          const password = (items['settings/backup_webdav_password'] as string | undefined) ?? '';
          if (url && username) resolve({ url: url.replace(/\/$/, ''), username, password });
          else resolve(null);
        },
      );
    });
  }

  async saveConfig(
    url: string,
    username: string,
    password: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(
        {
          'settings/backup_webdav_url': url.replace(/\/$/, ''),
          'settings/backup_webdav_username': username,
          'settings/backup_webdav_password': password,
        },
        () => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve();
        },
      );
    });
  }

  isConfigured(): boolean {
    return true;
  }

  // ── ICloudProvider ────────────────────────────────────────────────────────────

  async testConnection(): Promise<string | null> {
    const cfg = await this.getConfig();
    if (!cfg) return 'WebDAV not configured.';
    try {
      const res = await fetch(cfg.url, {
        method: 'PROPFIND',
        headers: { Authorization: basic(cfg.username, cfg.password), Depth: '0' },
      });
      if (res.status === 207 || res.ok) return null;
      return `Server returned HTTP ${res.status}`;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  async upload(data: BackupData): Promise<CloudResult> {
    const cfg = await this.getConfig();
    if (!cfg) return { success: false, error: 'WebDAV not configured.' };
    try {
      const res = await fetch(`${cfg.url}/${FILE_NAME}`, {
        method: 'PUT',
        headers: {
          Authorization: basic(cfg.username, cfg.password),
          'Content-Type': 'application/json',
        },
        body: this.mgr.serialise(data),
      });
      if (res.ok || res.status === 201 || res.status === 204) return { success: true };
      return { success: false, error: `PUT returned HTTP ${res.status}` };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async download(): Promise<CloudDownloadResult> {
    const cfg = await this.getConfig();
    if (!cfg) return { success: false, error: 'WebDAV not configured.' };
    try {
      const res = await fetch(`${cfg.url}/${FILE_NAME}`, {
        headers: { Authorization: basic(cfg.username, cfg.password) },
      });
      if (res.status === 404) return { success: false, error: 'No backup file found on server.' };
      if (!res.ok) return { success: false, error: `GET returned HTTP ${res.status}` };
      return { success: true, data: this.mgr.parse(await res.text()) };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
