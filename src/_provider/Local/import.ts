import * as helper from './helper';
import { search } from '../searchFactory';
import { status } from '../definitions';

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
    // exportRemoteSync() (settings-local-sync-export.vue) also folds already-synced entries -
    // keyed by their real provider URL, not local://... - into the same export file as a record
    // of what was tracked elsewhere. Those aren't Local Sync data and were never meant to be
    // written back: Local's own list/single classes only ever look up local://-prefixed keys, so
    // writing a raw provider URL as a storage key here would just leave it permanently orphaned.
    if (!helper.getRegex('(anime|manga)').test(k)) {
      con.log('Skip (not a local:// key)', k);
      // eslint-disable-next-line no-continue
      continue;
    }
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
  const rows = parseCSV(csvContent).filter(row => row.some(cell => cell.trim()));

  if (rows.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = rows[0].map(h => h.trim());
  const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');

  if (titleIndex === -1) {
    throw new Error('CSV must have a "Title" column');
  }

  const importedData = {};
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const parts = rows[i];
    if (!parts.some(cell => cell.trim())) continue;

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

      // Local keys are read back as local://{source}/{type}/{id} (see Local/single.ts and
      // Local/list.ts, which pulls id/source out of the URL by fixed segment index) - "mal" here
      // just marks that this entry was matched by title search rather than a real streaming site.
      const malId = malUrl.split('/')[4];
      const localKey = `local://mal/anime/${malId}`;

      // A CSV only ever gives us a title, so there's no source for progress/score beyond what
      // marking the entry Completed implies: the full episode count, and no personal score.
      importedData[localKey] = {
        name: result.name || title,
        progress: result.totalEp || 0,
        volumeprogress: 0,
        score: 0,
        status: status.Completed,
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
    // flashm renders this as HTML (via DOMPurify) - '\n' has no visual effect there, so plain
    // '\n'-joined text collapses every error onto one unreadable line. '<br>' is what actually
    // produces separate lines; the log line below keeps the '\n'-joined form for the console.
    const errorMsg = `Import completed with ${errors.length} error(s):<br>${errors.join('<br>')}`;
    utils.flashm(errorMsg, { error: true });
    con.log(`Import completed with ${errors.length} error(s):\n${errors.join('\n')}`);
  }

  if (Object.keys(importedData).length === 0) {
    throw new Error('No animes found to import');
  }

  return importedData;
}

// Parses the whole file rather than splitting it into lines first: a quoted field can legally
// contain a literal newline (common in real-world exports with multi-line notes), so a naive
// split('\n') before parsing would tear that field's row in two before quote-awareness ever gets
// a chance to see it. Also handles RFC4180's escaped-quote rule (a "" pair inside a quoted field
// is a literal ") - a plain "any quote toggles the mode" parser desyncs on a title like `The
// "Best" Anime` and corrupts every field after it on the line.
export function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current);
      current = '';
    } else if (char === '\r') {
      // Swallowed on its own; the following '\n' (or the '\n'-only case below) ends the row.
    } else if (char === '\n') {
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  // Last row has no trailing newline to close it.
  if (current !== '' || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}
