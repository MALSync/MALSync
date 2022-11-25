import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsStreaming from './settings-streaming.vue';
import SettingsHr from './settings-hr.vue';

export const links: ConfObj[] = [
  {
    key: 'usedPage',
    title: () => api.storage.lang('settings_usedPage'),
    props: {
      component: 'checkbox',
      option: 'usedPage',
    },
    component: SettingsGeneral,
  },
  {
    key: 'malContinue',
    title: () => api.storage.lang('settings_malContinue'),
    props: {
      component: 'checkbox',
      option: 'malContinue',
    },
    component: SettingsGeneral,
  },
  {
    key: 'malResume',
    title: () => api.storage.lang('settings_malResume'),
    props: {
      component: 'checkbox',
      option: 'malResume',
    },
    component: SettingsGeneral,
  },
  {
    key: 'epPredictions',
    title: () => api.storage.lang('settings_epPredictions'),
    props: {
      component: 'checkbox',
      option: 'epPredictions',
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'quicklinksPosition',
    title: () => api.storage.lang('settings_custom_domains_position'),
    condition: () =>
      api.settings.get('syncMode') === 'ANILIST' || api.settings.get('syncMode') === 'MAL',
    props: () => ({
      component: 'dropdown',
      option: 'quicklinksPosition',
      props: {
        options: [
          { title: api.storage.lang('settings_progress_default'), value: 'default' },
          { title: api.storage.lang('settings_custom_position_below'), value: 'below' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'streamingSite',
    title: () => api.storage.lang('settings_StreamingSite'),
    component: SettingsStreaming,
  },
];
