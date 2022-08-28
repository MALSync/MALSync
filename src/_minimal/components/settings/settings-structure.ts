import { Component } from 'vue';
import SettingsGroup from './settings-group.vue';
import SettingsGeneral from './settings-general.vue';
import ColorPreview from '../color-preview.vue';

export interface ConfObj {
  key: string;
  title: string;
  component: Component;
  condition?: () => boolean;
  props?: { [key: string]: any };
  children?: ConfObj[];
}

const theming: ConfObj[] = [
  {
    key: 'theme',
    title: api.storage.lang('settings_miniMAL_theme'),
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
    title: 'Sidebars [TODO]',
    props: {
      component: 'checkbox',
      option: 'themeSidebars',
    },
    component: SettingsGeneral,
  },
  {
    key: 'color',
    title: 'Color [TODO]',
    props: {
      component: 'colorPicker',
      option: 'themeColor',
    },
    condition: () => api.settings.get('theme') === 'custom',
    component: SettingsGeneral,
  },
  {
    key: 'image',
    title: 'Background Image [TODO]',
    props: {
      component: 'input',
      option: 'themeImage',
      props: {
        clearIcon: true,
      },
    },
    condition: () => api.settings.get('theme') === 'custom',
    component: SettingsGeneral,
  },
  {
    key: 'opacity',
    title: 'Background Opacity [TODO]',
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

export const structure: ConfObj[] = [
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
    key: 'theming',
    title: 'Theming [TODO]',
    props: {
      icon: 'palette',
    },
    component: SettingsGroup,
    children: theming,
  },
];
