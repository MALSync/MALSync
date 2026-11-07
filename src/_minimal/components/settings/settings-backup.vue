<template>
  <div class="backup-settings">
    <!-- ── Local file ─────────────────────────────────────────────────────── -->
    <div class="section-label">Local file</div>
    <SettingsGeneral component="button" title="Export / Import">
      <template #component>
        <div class="btn-row">
          <FormButton color="primary" @click="exportLocal">Export backup</FormButton>
          <SettingsLocalSyncFileUpload @upload="importLocal">
            Import backup
          </SettingsLocalSyncFileUpload>
        </div>
      </template>
    </SettingsGeneral>

    <!-- ── Google Drive ───────────────────────────────────────────────────── -->
    <Hr />
    <div class="section-label">Google Drive</div>
    <p v-if="!driveAvailable" class="section-desc section-desc--warn">
      Not available — chrome.identity.launchWebAuthFlow is not supported in this browser.
    </p>
    <template v-else>
      <p class="section-desc">
        Stored in the extension's hidden app data folder — not visible in your Drive.
      </p>
      <SettingsGeneral title="OAuth Client ID" component="input">
        <template #component>
          <FormText
            v-model="driveClientId"
            placeholder="your-client-id.apps.googleusercontent.com"
            @input="driveVerified = false"
          />
        </template>
      </SettingsGeneral>
      <SettingsGeneral component="button" title=" ">
        <template #component>
          <div class="btn-row">
            <FormButton @click="driveSave">Save</FormButton>
            <FormButton @click="driveAction('backup')">Backup</FormButton>
            <FormButton :disabled="!driveVerified" @click="driveAction('restore')">
              Restore
            </FormButton>
            <FormButton padding="mini" @click="driveAction('test')">Test connection</FormButton>
          </div>
        </template>
      </SettingsGeneral>
    </template>

    <!-- ── WebDAV ─────────────────────────────────────────────────────────── -->
    <Hr />
    <div class="section-label">WebDAV / NAS</div>
    <p class="section-desc">Nextcloud, Synology, QNAP, or any WebDAV server.</p>
    <SettingsGeneral title="Server URL" component="input">
      <template #component>
        <FormText
          v-model="webdav.url"
          placeholder="https://my.nas.local/remote.php/dav/files/alice"
          @input="webdavVerified = false"
        />
      </template>
    </SettingsGeneral>
    <SettingsGeneral title="Username" component="input">
      <template #component>
        <FormText v-model="webdav.username" placeholder="alice" @input="webdavVerified = false" />
      </template>
    </SettingsGeneral>
    <SettingsGeneral title="Password" component="input">
      <template #component>
        <FormPassword
          v-model="webdav.password"
          placeholder="Password"
          @update:model-value="webdavVerified = false"
        />
      </template>
    </SettingsGeneral>
    <SettingsGeneral component="button" title=" ">
      <template #component>
        <div class="btn-row">
          <FormButton @click="webdavSave">Save</FormButton>
          <FormButton @click="webdavAction('backup')">Backup</FormButton>
          <FormButton :disabled="!webdavVerified" @click="webdavAction('restore')">
            Restore
          </FormButton>
          <FormButton padding="mini" @click="webdavAction('test')">Test connection</FormButton>
        </div>
      </template>
    </SettingsGeneral>

    <!-- ── Backblaze B2 ───────────────────────────────────────────────────── -->
    <Hr />
    <div class="section-label">Backblaze B2</div>
    <p class="section-desc">
      Use an application key scoped to one bucket with readFiles + writeFiles only.
    </p>
    <SettingsGeneral title="Application Key ID" component="input">
      <template #component>
        <FormText v-model="b2.keyId" placeholder="Key ID" @input="b2Verified = false" />
      </template>
    </SettingsGeneral>
    <SettingsGeneral title="Application Key" component="input">
      <template #component>
        <FormPassword
          v-model="b2.appKey"
          placeholder="Key secret"
          @update:model-value="b2Verified = false"
        />
      </template>
    </SettingsGeneral>
    <SettingsGeneral title="Bucket ID" component="input">
      <template #component>
        <FormText v-model="b2.bucketId" placeholder="Bucket ID" @input="b2Verified = false" />
      </template>
    </SettingsGeneral>
    <SettingsGeneral title="Bucket name" component="input">
      <template #component>
        <FormText v-model="b2.bucketName" placeholder="my-malsync-backup" />
      </template>
    </SettingsGeneral>
    <SettingsGeneral component="button" title=" ">
      <template #component>
        <div class="btn-row">
          <FormButton @click="b2Save">Save</FormButton>
          <FormButton @click="b2Action('backup')">Backup</FormButton>
          <FormButton :disabled="!b2Verified" @click="b2Action('restore')">Restore</FormButton>
          <FormButton padding="mini" @click="b2Action('test')">Test connection</FormButton>
        </div>
      </template>
    </SettingsGeneral>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import FormButton from '../form/form-button.vue';
import FormText from '../form/form-text.vue';
import FormPassword from '../form/form-password.vue';
import SettingsGeneral from './settings-general.vue';
import SettingsLocalSyncFileUpload from './settings-local-sync-file-upload.vue';
import Hr from '../hr.vue';
import { backupManager } from '../../../utils/backup/BackupManager';
import { GoogleDriveProvider } from '../../../utils/backup/providers/GoogleDriveProvider';
import { WebDavProvider } from '../../../utils/backup/providers/WebDavProvider';
import { BackblazeProvider } from '../../../utils/backup/providers/BackblazeProvider';

defineProps({
  title: { type: String, default: '' },
});

// Google Drive uses chrome.identity.launchWebAuthFlow — available in the
// webextension build now that the identity permission is in the manifest.
const driveAvailable = api.type === 'webextension';

const webdav = ref({ url: '', username: '', password: '' });
const b2 = ref({ keyId: '', appKey: '', bucketId: '', bucketName: '' });

// Restore is only enabled after a successful test connection this session
const driveClientId = ref('');
const driveVerified = ref(false);
const webdavVerified = ref(false);
const b2Verified = ref(false);

const driveProvider = new GoogleDriveProvider(backupManager);
const webdavProvider = new WebDavProvider(backupManager);
const b2Provider = new BackblazeProvider(backupManager);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function confirmRestore(ts: string): Promise<boolean> {
  return window.confirm(
    `Restore backup from ${new Date(ts).toLocaleString()}?\n\nThis will overwrite all current settings. This cannot be undone.`,
  );
}

function warnExport() {
  utils.flashm('Backup exported. Keep this file safe — it contains your settings.', {
    type: 'warning',
  });
}

// ── Local file ────────────────────────────────────────────────────────────────

async function exportLocal() {
  try {
    const data = await backupManager.createBackup();
    backupManager.downloadFile(data);
    await backupManager.recordRun('local');
    warnExport();
  } catch (e) {
    utils.flashm(e instanceof Error ? e.message : 'Export failed', { error: true });
  }
}

async function importLocal(fileContent: string) {
  try {
    const data = backupManager.parse(fileContent);
    const validationError = backupManager.validate(data);
    if (validationError) throw new Error(validationError);
    const confirmed = await confirmRestore(data.meta.timestamp);
    if (!confirmed) return;
    const result = await backupManager.restoreBackup(data);
    utils.flashm(`Restored ${result.sync + result.local} items — reloading…`);
    setTimeout(() => backupManager.reload(), 1500);
  } catch (e) {
    utils.flashm(e instanceof Error ? e.message : 'Import failed', { error: true });
  }
}

// ── Google Drive ──────────────────────────────────────────────────────────────

async function driveSave() {
  await driveProvider.saveClientId(driveClientId.value);
  driveVerified.value = false;
  utils.flashm('Google Drive client ID saved — test the connection before restoring');
}

async function driveAction(action: 'backup' | 'restore' | 'test') {
  try {
    if (action === 'test') {
      const err = await driveProvider.testConnection();
      if (err) {
        utils.flashm(`Drive: ${err}`, { error: true });
      } else {
        driveVerified.value = true;
        utils.flashm('Connected to Google Drive');
      }
      return;
    }
    if (action === 'backup') {
      const data = await backupManager.createBackup();
      const result = await driveProvider.upload(data);
      if (!result.success) throw new Error(result.error);
      await backupManager.recordRun('googleDrive');
      warnExport();
      return;
    }
    const dl = await driveProvider.download();
    if (!dl.success || !dl.data) throw new Error(dl.error ?? 'Download failed');
    const confirmed = await confirmRestore(dl.data.meta.timestamp);
    if (!confirmed) return;
    const result = await backupManager.restoreBackup(dl.data);
    utils.flashm(`Restored ${result.sync + result.local} items — reloading…`);
    setTimeout(() => backupManager.reload(), 1500);
  } catch (e) {
    utils.flashm(e instanceof Error ? e.message : 'Drive operation failed', { error: true });
  }
}

// ── WebDAV ────────────────────────────────────────────────────────────────────

async function webdavSave() {
  await webdavProvider.saveConfig(webdav.value.url, webdav.value.username, webdav.value.password);
  webdavVerified.value = false;
  utils.flashm('WebDAV settings saved — test the connection before restoring');
}

async function webdavAction(action: 'backup' | 'restore' | 'test') {
  try {
    if (action === 'test') {
      const err = await webdavProvider.testConnection();
      if (err) {
        utils.flashm(`WebDAV: ${err}`, { error: true });
      } else {
        webdavVerified.value = true;
        utils.flashm('WebDAV connection successful');
      }
      return;
    }
    if (action === 'backup') {
      const data = await backupManager.createBackup();
      const result = await webdavProvider.upload(data);
      if (!result.success) throw new Error(result.error);
      await backupManager.recordRun('webdav');
      warnExport();
      return;
    }
    const dl = await webdavProvider.download();
    if (!dl.success || !dl.data) throw new Error(dl.error ?? 'Download failed');
    const confirmed = await confirmRestore(dl.data.meta.timestamp);
    if (!confirmed) return;
    const result = await backupManager.restoreBackup(dl.data);
    utils.flashm(`Restored ${result.sync + result.local} items — please reload`);
  } catch (e) {
    utils.flashm(e instanceof Error ? e.message : 'WebDAV operation failed', { error: true });
  }
}

// ── Backblaze B2 ──────────────────────────────────────────────────────────────

async function b2Save() {
  await b2Provider.saveConfig(
    b2.value.keyId,
    b2.value.appKey,
    b2.value.bucketId,
    b2.value.bucketName,
  );
  b2Verified.value = false;
  utils.flashm('Backblaze B2 settings saved — test the connection before restoring');
}

async function b2Action(action: 'backup' | 'restore' | 'test') {
  try {
    if (action === 'test') {
      const err = await b2Provider.testConnection();
      if (err) {
        utils.flashm(`B2: ${err}`, { error: true });
      } else {
        b2Verified.value = true;
        utils.flashm('Backblaze B2 authorized');
      }
      return;
    }
    if (action === 'backup') {
      const data = await backupManager.createBackup();
      const result = await b2Provider.upload(data);
      if (!result.success) throw new Error(result.error);
      await backupManager.recordRun('b2');
      warnExport();
      return;
    }
    const dl = await b2Provider.download();
    if (!dl.success || !dl.data) throw new Error(dl.error ?? 'Download failed');
    const confirmed = await confirmRestore(dl.data.meta.timestamp);
    if (!confirmed) return;
    const result = await backupManager.restoreBackup(dl.data);
    utils.flashm(`Restored ${result.sync + result.local} items — please reload`);
  } catch (e) {
    utils.flashm(e instanceof Error ? e.message : 'B2 operation failed', { error: true });
  }
}

// ── Load saved credentials on mount ──────────────────────────────────────────

onMounted(async () => {
  const savedClientId = await api.storage.get('settings/backup_drive_clientId');
  if (savedClientId) driveClientId.value = savedClientId as string;

  const cfg = await webdavProvider.getConfig();
  if (cfg) {
    webdav.value.url = cfg.url;
    webdav.value.username = cfg.username;
    webdav.value.password = cfg.password;
  }

  const b2cfg = await b2Provider.getConfig();
  if (b2cfg) {
    b2.value.keyId = b2cfg.keyId;
    b2.value.appKey = b2cfg.appKey;
    b2.value.bucketId = b2cfg.bucketId;
    b2.value.bucketName = b2cfg.bucketName;
  }
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.backup-settings {
  display: flex;
  flex-direction: column;
}

.section-label {
  font-size: @small-text;
  font-weight: 600;
  color: var(--cl-text);
  padding-top: @spacer-half;
}

.section-desc {
  font-size: @tiny-text;
  color: var(--cl-light-text);
  padding-bottom: 4px;

  &--warn {
    color: var(--cl-secondary-text);
  }
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}
</style>
