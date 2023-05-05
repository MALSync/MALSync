import SettingsGeneral from './settings-general.vue';
import ColorPreview from '../color-preview.vue';
import { ConfObj } from '../../../_provider/definitions';
import { themeOptions } from '../themes';

export const theming: ConfObj[] = [
  {
    key: 'theme',
    title: () => api.storage.lang('settings_miniMAL_theme'),
    props: () => ({
      component: 'dropdown',
      option: 'theme',
      props: {
        options: [
          { title: api.storage.lang('settings_theming_theme_system'), value: 'auto' },
          { title: api.storage.lang('settings_theming_theme_light'), value: 'light' },
          { title: api.storage.lang('settings_theming_theme_dark'), value: 'dark' },
          ...themeOptions,
          { title: api.storage.lang('settings_theming_theme_custom'), value: 'custom' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'sidebars',
    title: () => api.storage.lang('settings_theming_sidebars'),
    props: {
      component: 'checkbox',
      option: 'themeSidebars',
    },
    component: SettingsGeneral,
  },
  {
    key: 'color',
    title: () => api.storage.lang('settings_theming_color'),
    props: {
      component: 'colorPicker',
      option: 'themeColor',
    },
    condition: () => api.settings.get('theme') === 'custom',
    component: SettingsGeneral,
  },
  {
    key: 'image',
    title: () => api.storage.lang('settings_theming_background_image'),
    props: {
      component: 'input',
      option: 'themeImage',
      props: {
        clearIcon: true,
        placeholder: 'url',
        simplePlaceholder: true,
      },
    },
    condition: () => api.settings.get('theme') === 'custom',
    component: SettingsGeneral,
  },
  {
    key: 'opacity',
    title: () => api.storage.lang('settings_theming_background_opacity'),
    props: {
      component: 'slider',
      option: 'themeOpacity',
      props: {
        max: 100,
      },
    },
    condition: () => api.settings.get('theme') === 'custom' && api.settings.get('themeImage'),
    component: SettingsGeneral,
  },
  {
    key: 'colorPreview',
    title: 'Color Preview',
    condition: () => api.settings.get('theme') === 'custom',
    component: ColorPreview,
  },
];
