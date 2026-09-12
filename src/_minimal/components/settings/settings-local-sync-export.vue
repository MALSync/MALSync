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
import {
  exportData,
  importData,
  convertCsvToImportFormat,
  parseCSV,
} from '../../../_provider/Local/import';
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

async function exportRemoteSync() {
  const exportObj = {};
  const listTypes = getActiveListTypes();

  for (let i = 0; i < listTypes.length; i++) {
    const listType = listTypes[i];
    const listProvider = getListbyType(getSyncMode(listType), [status.All, listType]);
    // eslint-disable-next-line no-await-in-loop
    const list = await listProvider.getCompleteList();

    for (let j = 0; j < list.length; j++) {
      const entry = list[j];
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

async function exportFallbackSync() {
  let exportObj: Record<string, unknown>;
  try {
    exportObj = {
      ...(await exportData()),
      ...(await exportRemoteSync()),
    };
  } catch (e) {
    con.error('Export failed', e);
    alert(`Error exporting data: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }
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

async function importFallbackSync(filecontent: string) {
  con.log('Import FallbackSync', filecontent);

  const trimmed = filecontent.trim();
  const isJson = trimmed.startsWith('{');
  // Same header-column check convertCsvToImportFormat itself requires, so detection here can't
  // diverge from what actually makes a CSV valid - only the header line is checked, not the whole
  // file, so a JSON export whose data happens to contain the word "title" isn't misread as a CSV.
  // Uses the same quote-aware parser convertCsvToImportFormat parses the body with, so a header
  // that quotes its "Title" column (common from spreadsheet exports) is still recognized.
  const headerCells = (parseCSV(trimmed)[0] || []).map(h => h.trim().toLowerCase());
  const isCsv = headerCells.includes('title');

  if (isJson) {
    importJson(filecontent);
  } else if (isCsv) {
    await importCsv(filecontent);
  } else {
    alert('File format not recognized. Please use JSON export or CSV with Title column.');
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
