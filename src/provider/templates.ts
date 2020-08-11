import { mal } from './MyAnimeList/templates';
import { anilist } from './AniList/templates';
import { kitsu } from './Kitsu/templates';
import { simkl } from './Simkl/templates';
import { local } from './Local/templates';

function getSyncMode() {
  return api.settings.get('syncMode');
}

export function providerTemplates(malUrl?) {
  if (/^local:\/\//i.test(malUrl)) {
    return local;
  }
  const syncMode = getSyncMode();
  if (syncMode === 'MAL' || syncMode === 'MALAPI') {
    return mal;
  }
  if (syncMode === 'ANILIST') {
    return anilist;
  }
  if (syncMode === 'KITSU') {
    return kitsu;
  }
  return simkl;
}
