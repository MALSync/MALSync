import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsStreaming from './settings-streaming.vue';

export const links: ConfObj[] = [
  {
    key: 'quicklinksPosition',
    title: () => api.storage.lang('settings_custom_domains_position'),
    condition: () =>
      api.settings.get('syncMode') === 'ANILIST' || api.settings.get('syncMode') === 'MAL',
    props: {
      component: 'dropdown',
      option: 'quicklinksPosition',
      props: {
        options: [
          { title: 'Default', value: 'default' },
          { title: 'Below Information', value: 'below' },
        ],
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'streamingSite',
    title: () => api.storage.lang('settings_StreamingSite'),
    component: SettingsStreaming,
  },
];
