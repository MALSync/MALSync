<template>
  <Section spacer="none" class="install-backup">
    <Header style="width: 100%">{{ lang('settings_backup') || 'Backup &amp; Restore' }}</Header>

    <!-- ── Idle: offer to import ──────────────────────────────────────────── -->
    <template v-if="state === 'idle'">
      <p class="description">
        {{
          lang('installPage_Backup_Description') ||
          'Already have a MAL-Sync backup? Import it now to restore all your settings instantly.'
        }}
      </p>
      <div class="upload-row">
        <SettingsLocalSyncFileUpload @upload="onFile">
          {{ lang('installPage_Backup_Import') || 'Import backup file' }}
        </SettingsLocalSyncFileUpload>
      </div>
      <div class="button-section">
        <FormButton color="default" @click="$emit('back')">{{ lang('back') }}</FormButton>
        <FormButton class="button-next" color="default" @click="$emit('next')">
          {{ lang('installPage_Backup_Skip') || 'Skip — Start fresh' }}
        </FormButton>
      </div>
    </template>

    <!-- ── Confirm: show what will be restored ────────────────────────────── -->
    <template v-else-if="state === 'confirm'">
      <p class="description">
        {{ lang('installPage_Backup_Found') || 'Backup found from' }}
        <strong>{{ backupDate }}</strong> —
        {{ itemCount }} {{ lang('installPage_Backup_Items') || 'items' }}
      </p>
      <div class="button-section">
        <FormButton color="default" @click="state = 'idle'">{{ lang('back') }}</FormButton>
        <FormButton class="button-next" color="primary" @click="doRestore">
          {{ lang('installPage_Backup_Restore') || 'Restore this backup' }}
        </FormButton>
      </div>
    </template>

    <!-- ── Done ──────────────────────────────────────────────────────────── -->
    <template v-else-if="state === 'done'">
      <p class="description done-text">
        {{
          lang('installPage_Backup_Done') ||
          'Settings restored. Taking you to MAL-Sync…'
        }}
      </p>
    </template>

    <!-- ── Error ──────────────────────────────────────────────────────────── -->
    <template v-else-if="state === 'error'">
      <p class="description error-text">{{ errorMessage }}</p>
      <div class="button-section">
        <FormButton color="default" @click="state = 'idle'">{{ lang('back') }}</FormButton>
      </div>
    </template>
  </Section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Header from '../header.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import SettingsLocalSyncFileUpload from '../settings/settings-local-sync-file-upload.vue';
import { backupManager } from '../../../utils/backup/BackupManager';
import type { BackupData } from '../../../utils/backup/types';

defineEmits(['back', 'next']);

type State = 'idle' | 'confirm' | 'done' | 'error';

const state = ref<State>('idle');
const backupDate = ref('');
const itemCount = ref(0);
const restoredCount = ref(0);
const errorMessage = ref('');

let pendingData: BackupData | null = null;

function onFile(fileContent: string) {
  try {
    const data = backupManager.parse(fileContent);
    const err = backupManager.validate(data);
    if (err) throw new Error(err);

    pendingData = data;
    backupDate.value = new Date(data.meta.timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    itemCount.value = Object.keys(data.sync).length + Object.keys(data.local).length;
    state.value = 'confirm';
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Could not read backup file.';
    state.value = 'error';
  }
}

async function doRestore() {
  if (!pendingData) return;
  try {
    await backupManager.restoreBackup(pendingData);
    state.value = 'done';
    // All settings are restored — skip the rest of the wizard and go straight to the PWA
    setTimeout(() => {
      window.location.href = chrome.runtime.getURL('window.html');
    }, 1800);
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Restore failed.';
    state.value = 'error';
  }
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.install-backup {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.description {
  font-size: @normal-text;
  color: var(--cl-text);
  text-align: center;
  max-width: 480px;
  line-height: 1.6;
}

.done-text {
  color: var(--cl-primary);
  font-weight: 600;
}

.error-text {
  color: var(--cl-secondary-text);
}

.upload-row {
  display: flex;
  justify-content: center;
  padding: @spacer 0;
}
</style>
