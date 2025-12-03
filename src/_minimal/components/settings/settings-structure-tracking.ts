import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsLogin from './settings-login.vue';
import SettingsLocalSyncExport from './settings-local-sync-export.vue';
import SettingsDisabledWebsites from './settings-disabled-websites.vue';
import SettingsGroup from './settings-group.vue';
import SettingsHr from './settings-hr.vue';
import { localStore } from '../../../utils/localStore';
import type { SyncTypes } from '../../../_provider/helper';

type ProviderOption = {
  title: string;
  value: SyncTypes;
  anime: boolean;
  manga: boolean;
  short: boolean;
};

export function allProviders() {
  const options: ProviderOption[] = [
    { title: 'MyAnimeList', value: 'MAL', anime: true, manga: true, short: true },
    { title: 'AniList', value: 'ANILIST', anime: true, manga: true, short: true },
    { title: 'Kitsu', value: 'KITSU', anime: true, manga: true, short: true },
    { title: 'MangaBaka', value: 'MANGABAKA', anime: false, manga: true, short: true },
    { title: 'Simkl', value: 'SIMKL', anime: true, manga: false, short: true },
    { title: 'Shikimori', value: 'SHIKI', anime: true, manga: true, short: true },
    { title: 'MyAnimeList (API) [WORSE]', value: 'MALAPI', anime: true, manga: true, short: false },
  ];

  const currentMode = api.settings.get('syncMode') as SyncTypes;
  const currentOption = options.find(o => o.value === currentMode)!;
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
    secondaryOptions = options.filter(el => el[secondaryMode]);
  }
  console.log({ secondaryMode, secondaryOptions });
  return {
    primary: options,
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

export const trackingSimple: ConfObj[] = [
  {
    key: 'login',
    title: () => api.storage.lang('kitsuClass_authentication_Login'),
    component: SettingsLogin,
  },
  {
    key: 'login',
    title: () => api.storage.lang('kitsuClass_authentication_Login'),
    condition: () => Boolean(providerSecondaryMode()),
    props: {
      option: 'syncModeSimkl',
    },
    component: SettingsLogin,
  },
  {
    key: 'syncMode',
    title: () => providerTitle('primary'),
    change: () => {
      utils.clearCache();
      if (api.type === 'webextension') localStore.clear();
    },
    props: () => ({
      component: 'dropdown',
      option: 'syncMode',
      props: {
        options: providerOptions('primary'),
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'syncModeSimkl',
    title: () => providerTitle('secondary'),
    condition: () => Boolean(providerSecondaryMode()),
    change: () => utils.clearCache(),
    props: () => ({
      component: 'dropdown',
      option: 'syncModeSimkl',
      props: {
        options: providerOptions('secondary'),
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'splitTracking',
    title: () => api.storage.lang('settings_splitTracking'),
    props: {
      component: 'checkbox',
      option: 'splitTracking',
    },
    component: SettingsGeneral,
  },
];

export const tracking: ConfObj[] = [
  ...trackingSimple,
  {
    key: 'autoTrackingModeanime',
    title: () => api.storage.lang('settings_Animesync'),
    props: () => ({
      component: 'dropdown',
      option: 'autoTrackingModeanime',
      props: {
        options: [
          { title: api.storage.lang('settings_Animesync_Video'), value: 'video' },
          { title: api.storage.lang('settings_Animesync_Instant'), value: 'instant' },
          { title: api.storage.lang('settings_Animesync_Manual'), value: 'manual' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'autoTrackingModemanga',
    title: () => api.storage.lang('settings_Mangasync'),
    props: () => ({
      component: 'dropdown',
      option: 'autoTrackingModemanga',
      props: {
        options: [
          { title: api.storage.lang('settings_Animesync_Instant'), value: 'instant' },
          { title: api.storage.lang('settings_Animesync_Manual'), value: 'manual' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'askBefore',
    title: () => api.storage.lang('settings_AskBefore'),
    props: {
      component: 'checkbox',
      option: 'askBefore',
    },
    component: SettingsGeneral,
  },
  {
    key: 'forceEnglishTitles',
    title: () => api.storage.lang('settings_ForceEnglishTitles'),
    condition: () =>
      api.settings.get('syncMode') === 'MAL' || api.settings.get('syncMode') === 'MALAPI',
    props: {
      component: 'checkbox',
      option: 'forceEnglishTitles',
    },
    change: () => {
      utils.clearCache();
      if (api.type === 'webextension') localStore.clear();
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'readerTracking',
    title: () =>
      api.storage.lang('settings_Mangasync_readerTracking', [
        api.settings.get('mangaCompletionPercentage'),
      ]),
    props: {
      component: 'checkbox',
      option: 'readerTracking',
    },
    component: SettingsGeneral,
  },
  {
    key: 'mangaCompletionPercentage',
    title: () => api.storage.lang('settings_Mangasync_readerTracking_percentage'),
    condition: () => api.settings.get('readerTracking'),
    props: {
      component: 'input',
      option: 'mangaCompletionPercentage',
      props: {
        suffix: '%',
        validation: (value: number) => Boolean(value >= 10 && value < 100),
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'videoDuration',
    title: () =>
      api.storage.lang('settings_AutoTracking_Video', [api.settings.get('videoDuration')]),
    condition: () => api.settings.get('autoTrackingModeanime') === 'video',
    props: {
      component: 'input',
      option: 'videoDuration',
      props: {
        suffix: '%',
        validation: value => Boolean(value >= 10 && value < 100),
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'delay',
    title: () => api.storage.lang('settings_AutoTracking_Instant', [api.settings.get('delay')]),
    condition: () =>
      api.settings.get('autoTrackingModeanime') === 'instant' ||
      api.settings.get('autoTrackingModemanga') === 'instant',
    props: {
      component: 'input',
      option: 'delay',
      props: {
        validation: value => Boolean((Number(value) && Number(value) > 0) || value === '0'),
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'syncShort',
    title: () => api.storage.lang('settings_Shortcuts_Sync'),
    props: {
      component: 'shortcut',
      option: 'syncShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'correctionShort',
    title: () => api.storage.lang('settings_Shortcuts_Correction'),
    props: {
      component: 'shortcut',
      option: 'correctionShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'floatButtonCorrection',
    title: () => api.storage.lang('settings_miniMAL_floatButtonCorrection'),
    props: {
      component: 'checkbox',
      option: 'floatButtonCorrection',
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'malTags',
    title: () => api.storage.lang('settings_malTags'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_malTags_Text'),
      option: 'malTags',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'localSync',
    title: () => api.storage.lang('settings_LocalSync'),
    props: {
      component: 'checkbox',
      option: 'localSync',
      infoLink: 'https://github.com/MALSync/MALSync/wiki/Local-Sync',
    },
    component: SettingsGeneral,
  },
  {
    key: 'localSyncExport',
    title: () => api.storage.lang('settings_LocalSync_Label'),
    condition: () => api.settings.get('localSync'),
    component: SettingsLocalSyncExport,
  },
  {
    key: 'allSitesUi',
    title: () => api.storage.lang('settings_tracking'),
    props: () => ({
      type: 'button',
      icon: '-',
      props: {
        color: 'primary',
        title: api.storage.lang('settings_website_button'),
      },
    }),
    component: SettingsGroup,
    children: [
      {
        key: 'enablePages',
        title: () => api.storage.lang('settings_website_button'),
        component: SettingsDisabledWebsites,
      },
    ],
  },
  {
    key: 'enablePages',
    title: () => api.storage.lang('settings_website_button'),
    props: {
      onlyDisabled: true,
    },
    component: SettingsDisabledWebsites,
  },
];
