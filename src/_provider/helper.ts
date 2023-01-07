export type SyncTypes = 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI' | 'MALAPI';

export function getSyncMode(type = '') {
  const mode = api.settings.get('syncMode');
  //
  if (mode === 'SIMKL' && (type === 'manga' || type.indexOf('/manga/') !== -1)) {
    return api.settings.get('syncModeSimkl');
  }
  //
  return mode;
}
