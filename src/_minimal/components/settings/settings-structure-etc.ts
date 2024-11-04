import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsGroup from './settings-group.vue';
import SettingsClearTags from './settings-clear-tags.vue';

export const etc: ConfObj[] = [
  {
    key: 'forceEn',
    title: () => api.storage.lang('settings_forceEn'),
    props: {
      component: 'checkbox',
      option: 'forceEn',
    },
    component: SettingsGeneral,
  },
  {
    key: 'cleanTagsUi',
    title: () => api.storage.lang('settings_clean_tags_button'),
    props: () => ({
      type: 'button',
      icon: '',
      props: {
        color: 'primary',
        title: api.storage.lang('settings_clean_tags_button'),
      },
    }),
    component: SettingsGroup,
    children: [
      {
        key: 'cleanTags',
        title: () => api.storage.lang('settings_clean_tags_button'),
        component: SettingsClearTags,
      },
    ],
  },
  {
    key: 'clearCache',
    title: () => api.storage.lang('settings_ClearCache'),
    props: () => ({
      component: 'button',
      props: {
        color: 'primary',
        title: api.storage.lang('settings_ClearCache'),
        click: () => utils.clearCache(),
      },
    }),
    component: SettingsGeneral,
  },
];
