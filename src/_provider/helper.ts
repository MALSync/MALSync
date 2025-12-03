export type SyncTypes = 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI' | 'MALAPI' | 'MANGABAKA';

export function getSyncMode(type = '') {
  const mode = api.settings.get('syncMode');
  //
  if (mode === 'SIMKL' && type === 'manga') {
    return api.settings.get('syncModeSimkl');
  }
  //
  return mode;
}
