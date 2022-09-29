import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsLogin from './settings-login.vue';
import SettingsLocalSyncExport from './settings-local-sync-export.vue';
import SettingsDisabledWebsites from './settings-disabled-websites.vue';
import SettingsGroup from './settings-group.vue';

export const tracking: ConfObj[] = [
  {
    key: 'login',
    title: 'Login',
    component: SettingsLogin,
  },
  {
    key: 'login',
    title: 'Login',
    condition: () => api.settings.get('syncMode') === 'SIMKL',
    props: {
      option: 'syncModeSimkl',
    },
    component: SettingsLogin,
  },
  {
    key: 'syncMode',
    title: () => api.storage.lang('settings_Mode'),
    change: () => utils.clearCache(),
    props: {
      component: 'dropdown',
      option: 'syncMode',
      props: {
        options: [
          { title: 'MyAnimeList API (Hybrid)', value: 'MAL' },
          { title: 'AniList', value: 'ANILIST' },
          { title: 'Kitsu', value: 'KITSU' },
          { title: 'Simkl', value: 'SIMKL' },
          { title: 'MyAnimeList API (Full) (BETA)', value: 'MALAPI' },
        ],
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'syncModeSimkl',
    title: () => `${api.storage.lang('Manga')} ${api.storage.lang('settings_Mode')}`,
    condition: () => api.settings.get('syncMode') === 'SIMKL',
    change: () => utils.clearCache(),
    props: {
      component: 'dropdown',
      option: 'syncModeSimkl',
      props: {
        options: [
          { title: 'MyAnimeList API', value: 'MAL' },
          { title: 'AniList', value: 'ANILIST' },
          { title: 'Kitsu', value: 'KITSU' },
        ],
      },
    },
    component: SettingsGeneral,
  },
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
    title: 'Local Sync Export',
    condition: () => api.settings.get('localSync'),
    component: SettingsLocalSyncExport,
  },
  {
    key: 'allSitesUi',
    title: 'Tracking',
    props: () => ({
      type: 'button',
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
