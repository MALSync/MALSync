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
import { exportData, importData, convertCsvToImportFormat } from '../../../_provider/Local/import';
import { status, type contentType } from '../../../_provider/definitions';
import { getListbyType } from '../../../_provider/listFactory';
import { getSyncMode, getProviderOption } from '../../../_provider/helper';
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
  const exportObj = {
    ...(await exportData()),
    ...(await exportRemoteSync()),
  };
  con.log('Export', exportObj);

  const encodedUri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportObj))}`;
  try {
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `malsync_${new Date().toJSON().slice(0, 10).replace(/-/g, '/')}.json`,
    );
    document.body.appendChild(link);

    link.click();
  } catch (e) {
    window.open(encodedUri);
  }
  utils.flashm('File exported');
}

async function exportRemoteSync() {
  const exportObj = {};
  const listTypes = getActiveListTypes();

  for (const listType of listTypes) {
    const listProvider = getListbyType(getSyncMode(listType), [status.All, listType]);
    const list = await listProvider.getCompleteList();

    for (const entry of list) {
      if (!entry.url) continue;
      if (String(entry.uid).startsWith('local://')) continue;

      exportObj[entry.url] = {
        name: entry.title.replace(/^\[L\]\s*/, ''),
        progress: entry.watchedEp ?? 0,
        volumeprogress: entry.readVol ?? 0,
        score: entry.score ?? 0,
        status: entry.status ?? 0,
        tags: entry.tags ?? '',
        image: entry.image ?? '',
        sUrl: entry.fn?.continueUrl?.() || entry.url,
        source: listProvider.name,
        type: listType,
      };
    }
  }

  return exportObj;
}

function getActiveListTypes(): contentType[] {
  const primaryMode = api.settings.get('syncMode');
  const secondaryMode = api.settings.get('syncModeSimkl');
  const types = new Set<contentType>();

  const primaryProvider = getProviderOption(primaryMode);
  if (primaryProvider.anime) types.add('anime');
  if (primaryProvider.manga) types.add('manga');

  const secondaryProvider = getProviderOption(secondaryMode);
  if (!primaryProvider.anime && secondaryProvider.anime) types.add('anime');
  if ((!primaryProvider.manga || api.settings.get('splitTracking')) && secondaryProvider.manga) {
    types.add('manga');
  }

  return Array.from(types);
}

async function importFallbackSync(filecontent: string) {
  con.log('Import FallbackSync', filecontent);
  
  const trimmed = filecontent.trim();
  const isJson = trimmed.startsWith('{');
  const isCsv = trimmed.includes('Title') || trimmed.includes('title') || trimmed.includes('TITLE');

  con.log('Detection - isJson:', isJson, 'isCsv:', isCsv);

  if (isJson) {
    importJson(filecontent);
  } else if (isCsv) {
    await importCsv(filecontent);
  } else {
    alert('File format not recognized. Please use JSON export or CSV with Title column.');
  }
}

function importJson(filecontent: string) {
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
        alert('File imported successfully');
      })
      .catch(e => {
        if (e.message) {
          alert(e.message);
        }
        throw e;
      });
  } catch (e) {
    alert('JSON file has wrong format');
    con.error('JSON file has wrong format:', e);
  }
}

async function importCsv(filecontent: string) {
  try {
    con.log('Importing CSV');
    const convertedData = await convertCsvToImportFormat(filecontent);
    con.log('Converted data:', convertedData);

    await importData(convertedData);
    utils.flashm('CSV imported successfully');
    alert(`CSV imported successfully! ${Object.keys(convertedData).length} animes imported.`);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    alert(`Error importing CSV: ${errorMsg}`);
    con.error('CSV import error:', e);
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
