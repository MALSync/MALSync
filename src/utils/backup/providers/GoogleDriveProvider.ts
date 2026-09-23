/**
 * GoogleDriveProvider
 *
 * Uses chrome.identity.launchWebAuthFlow — works in Chrome, Firefox,
 * Opera, and Edge. The identity permission must be in the manifest.
 *
 * Backup is stored in the drive.appdata scope — the file is not
 * visible in the user's Drive UI.
 *
 * Setup required (maintainer or user):
 *   1. Google Cloud Console → APIs & Services → Credentials
 *   2. Create OAuth 2.0 Client ID → type: Chrome Extension
 *   3. Add the extension ID as the Item ID
 *   4. Enable the Google Drive API
 *   5. Paste the client ID into Settings → Backup & Restore → Google Drive
 */

import type { BackupData, CloudResult, CloudDownloadResult, ICloudProvider } from '../types';
import type { BackupManager } from '../BackupManager';

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'malsync-backup.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const CLIENT_ID_KEY = 'settings/backup_drive_clientId';

// ── Identity API shim (Chrome / Firefox) ─────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const identity: typeof chrome.identity | undefined =
  (globalThis as any).chrome?.identity ?? (globalThis as any).browser?.identity;

function getRedirectUri(): string {
  return identity?.getRedirectURL?.() ?? `https://${chrome.runtime.id}.chromiumapp.org/`;
}

// ── Credential storage (direct chrome.storage to avoid api wrapper issues) ───

async function getClientId(): Promise<string | null> {
  return new Promise(resolve => {
    chrome.storage.sync.get(CLIENT_ID_KEY, items => {
      const val = items[CLIENT_ID_KEY];
      resolve(typeof val === 'string' && val.length > 0 ? val : null);
    });
  });
}

// ── Token via launchWebAuthFlow ───────────────────────────────────────────────

async function launchOAuth(clientId: string, interactive: boolean): Promise<string> {
  const redirectUri = getRedirectUri();

  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', SCOPE);

  return new Promise((resolve, reject) => {
    if (!identity?.launchWebAuthFlow) {
      reject(new Error('chrome.identity.launchWebAuthFlow is not available in this browser.'));
      return;
    }
    identity.launchWebAuthFlow({ url: authUrl.toString(), interactive }, responseUrl => {
      const err = chrome.runtime.lastError;
      if (err || !responseUrl) {
        reject(new Error(err?.message ?? 'Auth cancelled or failed'));
        return;
      }
      const hash = new URL(responseUrl).hash.slice(1);
      const token = new URLSearchParams(hash).get('access_token');
      if (!token) {
        reject(new Error('No access token in OAuth response'));
        return;
      }
      resolve(token);
    });
  });
}

// ── Drive API helpers ─────────────────────────────────────────────────────────

async function driveRequest<T = unknown>(
  token: string,
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...((init.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Google Drive API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

interface DriveFile {
  id: string;
}
interface DriveFileList {
  files: DriveFile[];
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class GoogleDriveProvider implements ICloudProvider {
  constructor(private readonly mgr: BackupManager) {}

  isConfigured(): boolean {
    return !!identity?.launchWebAuthFlow;
  }

  async saveClientId(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [CLIENT_ID_KEY]: clientId.trim() }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
  }

  async loadClientId(): Promise<string> {
    return (await getClientId()) ?? '';
  }

  async testConnection(): Promise<string | null> {
    try {
      const clientId = await getClientId();
      if (!clientId) return 'No Google OAuth client ID configured.';
      const token = await launchOAuth(clientId, true);
      await driveRequest(
        token,
        `${DRIVE_API}/files?spaces=appDataFolder&pageSize=1&fields=files(id)`,
      );
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  async upload(data: BackupData): Promise<CloudResult> {
    try {
      const clientId = await getClientId();
      if (!clientId) return { success: false, error: 'No Google OAuth client ID configured.' };
      const token = await launchOAuth(clientId, true);
      const body = this.mgr.serialise(data);
      const existingId = await this.findFileId(token);

      if (existingId) {
        const res = await fetch(`${UPLOAD_API}/files/${existingId}?uploadType=media`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body,
        });
        if (!res.ok) throw new Error(`PATCH returned ${res.status}`);
        return { success: true };
      }

      const boundary = '-------malsync314159';
      const multipart =
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        `${JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })}` +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        `${body}` +
        `\r\n--${boundary}--`;

      const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipart,
      });
      if (!res.ok) throw new Error(`Upload returned ${res.status}`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async download(): Promise<CloudDownloadResult> {
    try {
      const clientId = await getClientId();
      if (!clientId) return { success: false, error: 'No Google OAuth client ID configured.' };
      const token = await launchOAuth(clientId, true);
      const fileId = await this.findFileId(token);
      if (!fileId) return { success: false, error: 'No backup found in Google Drive.' };

      const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { success: false, error: `Download returned ${res.status}` };
      return { success: true, data: this.mgr.parse(await res.text()) };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private async findFileId(token: string): Promise<string | null> {
    const list = await driveRequest<DriveFileList>(
      token,
      `${DRIVE_API}/files?spaces=appDataFolder&q=name%3D%27${encodeURIComponent(FILE_NAME)}%27&fields=files(id)`,
    );
    return list.files?.[0]?.id ?? null;
  }
}
