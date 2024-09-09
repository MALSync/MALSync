import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsHr from './settings-hr.vue';

export const video: ConfObj[] = [
  {
    key: 'autofull',
    title: () => api.storage.lang('settings_Video_Fullscreen'),
    props: {
      component: 'checkbox',
      option: 'autofull',
      infoLink:
        'https://github.com/MALSync/MALSync/wiki/Troubleshooting#auto-fullscreen-doesnt-work',
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoresume',
    title: () => api.storage.lang('settings_Video_Resume'),
    props: {
      component: 'checkbox',
      option: 'autoresume',
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoNextEp',
    title: () => api.storage.lang('settings_autoNextEp'),
    props: {
      component: 'checkbox',
      option: 'autoNextEp',
    },
    component: SettingsGeneral,
  },
  {
    key: 'nextEpShort',
    title: () => api.storage.lang('settings_Shortcuts_Next_Episode'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'nextEpShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'introSkipFwd',
    title: () => api.storage.lang('settings_Shortcuts_Skip_Forward'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'introSkipFwd',
    },
    component: SettingsGeneral,
  },
  {
    key: 'introSkipBwd',
    title: () => api.storage.lang('settings_Shortcuts_Skip_Backward'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'introSkipBwd',
    },
    component: SettingsGeneral,
  },

  {
    key: 'introSkip',
    title: () => api.storage.lang('settings_introSkip', [api.settings.get('introSkip')]),
    system: 'webextension',
    props: {
      component: 'input',
      option: 'introSkip',
      props: {
        validation: value => Boolean(Number(value) > 0),
      },
    },
    component: SettingsGeneral,
  },
];
