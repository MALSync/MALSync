<template>
  <SettingsGeneral component="checkbox" :title="title">
    <template #component>
      <div class="buttons">
        <FormButton color="primary" @click="exportFallbackSync()">
          {{ lang('settings_LocalSync_Export') }}
        </FormButton>
        <SettingsLocalSyncFileUpload @upload="importFallbackSync">
          {{ lang('settings_LocalSync_Import') }}
        </SettingsLocalSyncFileUpload>
      </div>
    </template>
  </SettingsGeneral>
</template>

<script lang="ts" setup>
import { exportData, importData } from '../../../_provider/Local/import';
import FormButton from '../form/form-button.vue';
import SettingsGeneral from './settings-general.vue';
import SettingsLocalSyncFileUpload from './settings-local-sync-file-upload.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

async function exportFallbackSync() {
  const exportObj = await exportData();
  con.log('Export', exportObj);

  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(JSON.stringify(exportObj))}`;
  try {
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `malsync_${new Date().toJSON().slice(0, 10).replace(/-/g, '/')}.txt`,
    );
    document.body.appendChild(link);

    link.click();
  } catch (e) {
    window.open(encodedUri);
  }
  utils.flashm('File exported');
}

function importFallbackSync(filecontent) {
  con.log('Import FallbackSync', filecontent);
  try {
    const iData = JSON.parse(filecontent);
    con.log('data', iData);
    const firstData = iData[Object.keys(iData)[0]];
    // eslint-disable-next-line no-prototype-builtins
    if (!firstData.hasOwnProperty('name')) throw 'No name';
    // eslint-disable-next-line no-prototype-builtins
    if (!firstData.hasOwnProperty('progress')) throw 'No progress';
    // eslint-disable-next-line no-prototype-builtins
    if (!firstData.hasOwnProperty('score')) throw 'No score';
    // eslint-disable-next-line no-prototype-builtins
    if (!firstData.hasOwnProperty('status')) throw 'No status';
    // eslint-disable-next-line no-prototype-builtins
    if (!firstData.hasOwnProperty('tags')) throw 'No tags';

    importData(iData)
      .then(() => {
        utils.flashm('File imported');
        alert('File imported');
      })
      .catch(e => {
        if (e.message) {
          alert(e.message);
        }
        throw e;
      });
  } catch (e) {
    alert('File has wrong formating');
    con.error('File has wrong formating:', e);
  }
}
</script>

<style lang="less" scoped>
.buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
}
</style>
