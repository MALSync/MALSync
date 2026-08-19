import { BACKUP_VERSION, LOCAL_EXCLUDE_PREFIXES, SYNC_CREDENTIAL_PATTERNS, BackupData, BackupMeta } from './types';

function shouldExcludeLocalKey(key: string): boolean {
  return LOCAL_EXCLUDE_PREFIXES.some(p => key.startsWith(p));
}

function shouldExcludeSyncKey(key: string): boolean {
  return SYNC_CREDENTIAL_PATTERNS.some(pattern => pattern.test(key));
}

export class BackupManager {
  // ── Snapshot ────────────────────────────────────────────────────────────────

  async createBackup(): Promise<BackupData> {
    const [rawSync, rawLocal] = await Promise.all([
      this.storageGetAll(chrome.storage.sync),
      this.storageGetAll(chrome.storage.local),
    ]);

    const filteredSync = Object.fromEntries(
      Object.entries(rawSync).filter(([key]) => !shouldExcludeSyncKey(key)),
    );

    const filteredLocal = Object.fromEntries(
      Object.entries(rawLocal).filter(([key]) => !shouldExcludeLocalKey(key)),
    );

    const meta: BackupMeta = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      malsync_version: api.storage.version(),
    };

    return { meta, sync: filteredSync, local: filteredLocal };
  }

  // ── Validate ─────────────────────────────────────────────────────────────────

  validate(data: BackupData): string | null {
    if (!data?.meta?.version || !data.sync || !data.local) {
      return 'Invalid backup file: missing required fields.';
    }
    if (data.meta.version > BACKUP_VERSION) {
      return `Backup was created with a newer version of MALSync (schema v${data.meta.version}). Please update the extension first.`;
    }
    return null;
  }

  // ── Restore ──────────────────────────────────────────────────────────────────

  async restoreBackup(data: BackupData): Promise<{ sync: number; local: number }> {
    const error = this.validate(data);
    if (error) throw new Error(error);

    await Promise.all(
      Object.entries(data.sync).map(([key, value]) => api.storage.set(key, value)),
    );

    await Promise.all(
      Object.entries(data.local).map(([key, value]) => api.storage.set(key, value)),
    );

    return {
      sync: Object.keys(data.sync).length,
      local: Object.keys(data.local).length,
    };
  }

  // ── Serialise / parse ────────────────────────────────────────────────────────

  serialise(data: BackupData): string {
    return JSON.stringify(data, null, 2);
  }

  parse(raw: string): BackupData {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid backup: not a JSON object.');
    }
    return parsed as BackupData;
  }

  // ── File helpers ─────────────────────────────────────────────────────────────

  downloadFile(data: BackupData): void {
    const blob = new Blob([this.serialise(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malsync-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  readFile(): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error('No file selected.'));
          return;
        }
        try {
          resolve(this.parse(await file.text()));
        } catch (e) {
          reject(e);
        }
      };
      input.click();
    });
  }

  // ── Reload helper ─────────────────────────────────────────────────────────────

  /** Reload the extension so restored settings take effect immediately */
  reload(): void {
    chrome.runtime.reload();
  }

  // ── Last-run tracking ────────────────────────────────────────────────────────

  async recordRun(provider: string): Promise<void> {
    await api.storage.set(`backup/lastRun_${provider}`, new Date().toISOString());
  }

  async getLastRun(provider: string): Promise<string | undefined> {
    return api.storage.get(`backup/lastRun_${provider}`);
  }

  // ── Storage helpers ───────────────────────────────────────────────────────────

  private storageGetAll(area: chrome.storage.StorageArea): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      area.get(null, items => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(items as Record<string, unknown>);
        }
      });
    });
  }
}

export const backupManager = new BackupManager();
