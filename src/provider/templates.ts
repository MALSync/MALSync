import { getSyncMode } from '../_provider/helper';

export function providerTemplates(type: 'anime' | 'manga', malUrl?: string) {
  if (malUrl && /^local:\/\//i.test(malUrl)) {
    return {
      shortName: 'local storage',
    };
  }
  const syncMode = getSyncMode(type);
  if (syncMode === 'MAL' || syncMode === 'MALAPI') {
    return {
      shortName: 'MAL',
    };
  }
  if (syncMode === 'ANILIST') {
    return {
      shortName: 'AniList',
    };
  }
  if (syncMode === 'KITSU') {
    return {
      shortName: 'Kitsu',
    };
  }
  if (syncMode === 'SHIKI') {
    return {
      shortName: 'Shiki',
    };
  }
  if (syncMode === 'SIMKL') {
    return {
      shortName: 'Simkl',
    };
  }
  if (syncMode === 'MANGABAKA') {
    return {
      shortName: 'MangaBaka',
    };
  }
  return {
    shortName: 'Page',
  };
}
