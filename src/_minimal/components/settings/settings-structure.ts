import { Component } from 'vue';
import SettingsGroup from './settings-group.vue';
import SettingsGeneral from './settings-general.vue';
import SettingsProfile from './settings-profile.vue';
import SettingsStreaming from './settings-streaming.vue';
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

const tracking: ConfObj[] = [
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
];

export const structure: ConfObj[] = [
  {
    key: 'profile',
    title: 'Profile',
    component: SettingsProfile,
  },
  {
    key: 'tracking',
    title: 'Tracking',
    props: {
      icon: 'visibility',
    },
    component: SettingsGroup,
    children: tracking,
  },
  {
    key: 'theming',
    title: 'Theming',
    props: {
      icon: 'palette',
    },
    component: SettingsGroup,
    children: theming,
  },
  {
    key: 'streaming',
    title: api.storage.lang('settings_StreamingSite'),
    props: {
      icon: 'rss_feed',
    },
    component: SettingsGroup,
    children: [
      {
        key: 'quicklinksPosition',
        title: api.storage.lang('settings_custom_domains_position'),
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
        title: api.storage.lang('settings_StreamingSite'),
        component: SettingsStreaming,
      },
    ],
  },
];
