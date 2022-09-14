import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';

export const tracking: ConfObj[] = [
  {
    key: 'syncMode',
    title: api.storage.lang('settings_Mode'),
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
    title: `${api.storage.lang('Manga')} ${api.storage.lang('settings_Mode')}`,
    condition: () => api.settings.get('syncMode') === 'SIMKL',
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
    title: api.storage.lang('settings_Animesync'),
    props: {
      component: 'dropdown',
      option: 'autoTrackingModeanime',
      props: {
        options: [
          { title: api.storage.lang('settings_Animesync_Video'), value: 'video' },
          { title: api.storage.lang('settings_Animesync_Instant'), value: 'instant' },
          { title: api.storage.lang('settings_Animesync_Manual'), value: 'manual' },
        ],
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoTrackingModemanga',
    title: api.storage.lang('settings_Mangasync'),
    props: {
      component: 'dropdown',
      option: 'autoTrackingModemanga',
      props: {
        options: [
          { title: api.storage.lang('settings_Animesync_Instant'), value: 'instant' },
          { title: api.storage.lang('settings_Animesync_Manual'), value: 'manual' },
        ],
      },
    },
    component: SettingsGeneral,
  },
];
