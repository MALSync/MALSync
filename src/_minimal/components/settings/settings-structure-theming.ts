import SettingsGeneral from './settings-general.vue';
import ColorPreview from '../color-preview.vue';
import { ConfObj } from '../../../_provider/definitions';

export const theming: ConfObj[] = [
  {
    key: 'theme',
    title: () => api.storage.lang('settings_miniMAL_theme'),
    props: {
      component: 'dropdown',
      option: 'theme',
      props: {
        options: [
          { title: 'System', value: 'auto' },
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
          { title: 'Custom', value: 'custom' },
        ],
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'sidebars',
    title: 'Sidebars',
    props: {
      component: 'checkbox',
      option: 'themeSidebars',
    },
    component: SettingsGeneral,
  },
  {
    key: 'color',
    title: 'Color',
    props: {
      component: 'colorPicker',
      option: 'themeColor',
    },
    condition: () => api.settings.get('theme') === 'custom',
    component: SettingsGeneral,
  },
  {
    key: 'image',
    title: 'Background Image',
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
    title: 'Background Opacity',
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
