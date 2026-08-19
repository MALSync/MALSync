/**
 * WebDavProvider
 *
 * Works with any WebDAV server: Nextcloud, Synology DiskStation,
 * QNAP NAS, ownCloud, and generic WebDAV endpoints.
 *
 * Credentials stored under settings/backup_webdav_* (→ sync storage).
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
    const [url, username, password] = await Promise.all([
      api.storage.get('settings/backup_webdav_url'),
      api.storage.get('settings/backup_webdav_username'),
      api.storage.get('settings/backup_webdav_password'),
    ]);
    if (!url || !username) return null;
    return { url: (url as string).replace(/\/$/, ''), username: username as string, password: (password as string) ?? '' };
  }

  async saveConfig(url: string, username: string, password: string): Promise<void> {
    await Promise.all([
      api.storage.set('settings/backup_webdav_url', url.replace(/\/$/, '')),
      api.storage.set('settings/backup_webdav_username', username),
      api.storage.set('settings/backup_webdav_password', password),
    ]);
  }

  isConfigured(): boolean {
    // Synchronous check not possible; callers should await getConfig()
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
