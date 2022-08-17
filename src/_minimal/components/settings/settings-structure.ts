import { Component } from 'vue';
import SettingsGroup from './settings-group.vue';
import SettingsGeneral from './settings-general.vue';

export interface ConfObj {
  key: string;
  title: string;
  component: Component;
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
