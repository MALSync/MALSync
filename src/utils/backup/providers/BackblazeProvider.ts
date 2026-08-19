/**
 * BackblazeProvider
 *
 * Uses the Backblaze B2 Native API (not S3-compatible) to avoid
 * any external SDK dependency.
 *
 * Recommended bucket policy: application key scoped to one bucket
 * with readFiles + writeFiles permissions only.
 *
 * Credentials stored under settings/backup_b2_* (→ sync storage).
 */

import type { BackupData, CloudResult, CloudDownloadResult, ICloudProvider } from '../types';
import type { BackupManager } from '../BackupManager';

const FILE_NAME = 'malsync-backup.json';

interface B2Auth {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
}

interface B2UploadUrl {
  uploadUrl: string;
  authorizationToken: string;
}

async function sha1Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export class BackblazeProvider implements ICloudProvider {
  constructor(private readonly mgr: BackupManager) {}

  // ── Config ────────────────────────────────────────────────────────────────────

  async getConfig(): Promise<{ keyId: string; appKey: string; bucketId: string; bucketName: string } | null> {
    const [keyId, appKey, bucketId, bucketName] = await Promise.all([
      api.storage.get('settings/backup_b2_keyId'),
      api.storage.get('settings/backup_b2_appKey'),
      api.storage.get('settings/backup_b2_bucketId'),
      api.storage.get('settings/backup_b2_bucketName'),
    ]);
    if (!keyId || !appKey || !bucketId) return null;
    return {
      keyId: keyId as string,
      appKey: appKey as string,
      bucketId: bucketId as string,
      bucketName: (bucketName as string) ?? '',
    };
  }

  async saveConfig(keyId: string, appKey: string, bucketId: string, bucketName: string): Promise<void> {
    await Promise.all([
      api.storage.set('settings/backup_b2_keyId', keyId),
      api.storage.set('settings/backup_b2_appKey', appKey),
      api.storage.set('settings/backup_b2_bucketId', bucketId),
      api.storage.set('settings/backup_b2_bucketName', bucketName),
    ]);
  }

  isConfigured(): boolean {
    return true;
  }

  // ── B2 helpers ────────────────────────────────────────────────────────────────

  private async authorize(cfg: NonNullable<Awaited<ReturnType<BackblazeProvider['getConfig']>>>): Promise<B2Auth> {
    const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: { Authorization: `Basic ${btoa(`${cfg.keyId}:${cfg.appKey}`)}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`B2 authorisation failed (${res.status}): ${body}`);
    }
    return res.json() as Promise<B2Auth>;
  }

  // ── ICloudProvider ────────────────────────────────────────────────────────────

  async testConnection(): Promise<string | null> {
    const cfg = await this.getConfig();
    if (!cfg) return 'Backblaze B2 not configured.';
    try {
      await this.authorize(cfg);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  async upload(data: BackupData): Promise<CloudResult> {
    const cfg = await this.getConfig();
    if (!cfg) return { success: false, error: 'Backblaze B2 not configured.' };
    try {
      const auth = await this.authorize(cfg);
      const body = this.mgr.serialise(data);
      const hash = await sha1Hex(body);

      const uploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: { Authorization: auth.authorizationToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketId: cfg.bucketId }),
      });
      if (!uploadUrlRes.ok) throw new Error(`b2_get_upload_url: ${uploadUrlRes.status}`);
      const uploadUrlData = await uploadUrlRes.json() as B2UploadUrl;

      const uploadRes = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: uploadUrlData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(FILE_NAME),
          'Content-Type': 'application/json',
          'Content-Length': String(new TextEncoder().encode(body).byteLength),
          'X-Bz-Content-Sha1': hash,
        },
        body,
      });
      if (!uploadRes.ok) throw new Error(`B2 upload: ${uploadRes.status}`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async download(): Promise<CloudDownloadResult> {
    const cfg = await this.getConfig();
    if (!cfg) return { success: false, error: 'Backblaze B2 not configured.' };
    try {
      const auth = await this.authorize(cfg);
      const url = `${auth.downloadUrl}/file/${encodeURIComponent(cfg.bucketName)}/${encodeURIComponent(FILE_NAME)}`;
      const res = await fetch(url, { headers: { Authorization: auth.authorizationToken } });
      if (res.status === 404) return { success: false, error: 'No backup found in B2 bucket.' };
      if (!res.ok) return { success: false, error: `B2 download: ${res.status}` };
      return { success: true, data: this.mgr.parse(await res.text()) };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
