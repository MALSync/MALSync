export type SyncTypes = 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI' | 'MALAPI' | 'MANGABAKA';

export function getSyncMode(type = '') {
  const primaryMode = api.settings.get('syncMode') as SyncTypes;
  const secondaryMode = api.settings.get('syncModeSimkl') as SyncTypes;
  const primaryProvider = getProviderOption(primaryMode);

  if (type === 'anime' && !primaryProvider.anime) {
    return secondaryMode;
  }
  if (type === 'manga' && !primaryProvider.manga) {
    return secondaryMode;
  }
  if (
    type === 'manga' &&
    primaryProvider.manga &&
    primaryProvider.anime &&
    api.settings.get('splitTracking')
  ) {
    return secondaryMode;
  }

  return primaryMode;
}

type ProviderOption = {
  title: string;
  value: SyncTypes;
  anime: boolean;
  manga: boolean;
  short: boolean;
};

const providers: { [key in SyncTypes]: ProviderOption } = {
  MAL: { title: 'MyAnimeList', value: 'MAL', anime: true, manga: true, short: true },
  ANILIST: { title: 'AniList', value: 'ANILIST', anime: true, manga: true, short: true },
  KITSU: { title: 'Kitsu', value: 'KITSU', anime: true, manga: true, short: true },
  MANGABAKA: { title: 'MangaBaka', value: 'MANGABAKA', anime: false, manga: true, short: true },
  SIMKL: { title: 'Simkl', value: 'SIMKL', anime: true, manga: false, short: true },
  SHIKI: { title: 'Shikimori', value: 'SHIKI', anime: true, manga: true, short: true },
  MALAPI: {
    title: 'MyAnimeList (API) [WORSE]',
    value: 'MALAPI',
    anime: true,
    manga: true,
    short: false,
  },
};

export function getProviderOption(value: SyncTypes) {
  return providers[value];
}

export function allProviders() {
  const currentMode = api.settings.get('syncMode') as SyncTypes;
  const currentOption = Object.values(providers).find(o => o.value === currentMode)!;
  const splitTracking = api.settings.get('splitTracking');

  let secondaryMode: null | 'anime' | 'manga' = null;

  if (!currentOption.manga) {
    secondaryMode = 'manga';
  } else if (!currentOption.anime) {
    secondaryMode = 'anime';
  } else if (splitTracking) {
    secondaryMode = 'manga';
  }

  let secondaryOptions: ProviderOption[] = [];
  if (secondaryMode) {
    secondaryOptions = Object.values(providers).filter(el => el[secondaryMode]);
  }

  return {
    primary: Object.values(providers),
    secondary: secondaryOptions,
    secondaryMode,
  };
}

export function providerSecondaryMode() {
  const providers = allProviders();
  return providers.secondaryMode;
}

export function providerOptions(mode: 'primary' | 'secondary' = 'primary', short = false) {
  const providers = allProviders();

  let optionsList = mode === 'primary' ? providers.primary : providers.secondary;

  if (short) {
    optionsList = optionsList.filter(o => o.short);
  }

  return optionsList.map(o => ({
    title: o.title,
    value: o.value,
  }));
}

export function providerTitle(mode: 'primary' | 'secondary' = 'primary') {
  const secondaryMode = providerSecondaryMode();
  if (mode === 'primary' && !secondaryMode) {
    return api.storage.lang('settings_Mode');
  }
  let type = secondaryMode;
  if (mode === 'primary') {
    type = secondaryMode === 'anime' ? 'manga' : 'anime';
  }
  return `${api.storage.lang('settings_Mode')} (${api.storage.lang(type === 'anime' ? 'Anime' : 'Manga')})`;
}
