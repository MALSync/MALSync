import * as helper from './helper';
import { search } from '../searchFactory';

export async function exportData() {
  const data = await helper.getSyncList();
  const newData = {};
  for (const key in data) {
    if (helper.getRegex('(anime|manga)').test(key)) {
      newData[key] = data[key];
    }
  }
  return newData;
}

export async function importData(newData: {}) {
  const data = await helper.getSyncList();

  // Delete old data
  for (const key in data) {
    if (helper.getRegex('(anime|manga)').test(key)) {
      con.log('Remove', key);
      await api.storage.remove(key).catch(e => {
        if (e.message) {
          if (e.message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
            utils.flashm(
              'Max write operations per minute hit. Import stopped for 1 minute. Just keep this window open.',
            );
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(api.storage.remove(key));
              }, 60 * 1000);
            });
          }
        }
        throw e;
      });
    }
  }

  // import Data
  for (const k in newData) {
    con.log('Set', k, newData[k]);
    await api.storage.set(k, newData[k]).catch(e => {
      if (e.message) {
        if (e.message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
          utils.flashm(
            'Max write operations per minute hit. Import stopped for 1 minute. Just keep this window open.',
          );
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(api.storage.set(k, newData[k]));
            }, 60 * 1000);
          });
        }
      }
      throw e;
    });
  }

  return 1;
}

export async function convertCsvToImportFormat(csvContent: string) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
  
  if (titleIndex === -1) {
    throw new Error('CSV must have a "Title" column');
  }

  const importedData = {};
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    const title = parts[titleIndex]?.trim();

    if (!title) continue;

    try {
      con.log(`Searching for anime: ${title}`);
      const results = await search(title, 'anime');

      if (!results || results.length === 0) {
        errors.push(`${title} - Not found`);
        continue;
      }

      const result = results[0];
      const malUrl = await result.malUrl();

      if (!malUrl) {
        errors.push(`${title} - No MAL URL found`);
        continue;
      }

      const localKey = `local://${malUrl.split('/')[4]}/${malUrl.split('/')[3]}`;
      
      importedData[localKey] = {
        name: result.name || title,
        progress: result.list?.episode || 0,
        volumeprogress: 0,
        score: result.list?.score || 0,
        status: 2, // Completed
        tags: '',
        image: result.image || '',
        sUrl: malUrl,
      };

      con.log(`Successfully matched: ${title} -> ${result.name}`);
    } catch (e) {
      con.error(`Error searching for ${title}:`, e);
      errors.push(`${title} - Error: ${String(e)}`);
    }
  }

  if (errors.length > 0) {
    const errorMsg = `Import completed with ${errors.length} error(s):\n${errors.join('\n')}`;
    utils.flashm(errorMsg, { error: true });
    con.log(errorMsg);
  }

  if (Object.keys(importedData).length === 0) {
    throw new Error('No animes found to import');
  }

  return importedData;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
