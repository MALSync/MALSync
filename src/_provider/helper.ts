export type SyncTypes = 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI' | 'MALAPI';

export function getSyncMode(type = '') {
  const mode = api.settings.get('syncMode') as string;
  //
  if (mode === 'SIMKL' && (type === 'manga' || type.indexOf('/manga/') !== -1)) {
    return api.settings.get('syncModeSimkl') as string;
  }
  //
  return mode;
}
