import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsHr from './settings-hr.vue';

export const onsite: ConfObj[] = [
  {
    key: 'floatButtonStealth',
    title: () => api.storage.lang('settings_miniMAL_floatButtonStealth'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_miniMAL_floatButtonStealth_tooltip'),
      option: 'floatButtonStealth',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'minimizeBigPopup',
    title: () => api.storage.lang('settings_miniMAL_minimizeBigPopup'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_miniMAL_minimizeBigPopup_tooltip'),
      option: 'minimizeBigPopup',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'floatButtonHide',
    title: () => api.storage.lang('settings_miniMAL_floatButtonHide'),
    props: {
      component: 'checkbox',
      option: 'floatButtonHide',
    },
    component: SettingsGeneral,
  },
  {
    key: 'highlightAllEp',
    title: () => api.storage.lang('settings_highlightAllEp'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_highlightAllEp_Text'),
      option: 'highlightAllEp',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'checkForFiller',
    title: () => api.storage.lang('settings_filler'),
    system: 'webextension',
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_filler_text'),
      option: 'checkForFiller',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: 'MyAnimeList',
    component: SettingsHr,
  },
  {
    key: 'malThumbnail',
    title: () => api.storage.lang('settings_Thumbnails'),
    props: () => ({
      component: 'dropdown',
      tooltip: api.storage.lang('settings_Thumbnails_text'),
      option: 'malThumbnail',
      props: {
        options: [
          { title: api.storage.lang('settings_Thumbnails_Large'), value: '144' },
          { title: api.storage.lang('settings_Thumbnails_Medium'), value: '100' },
          { title: api.storage.lang('settings_Thumbnails_Small'), value: '60' },
          { title: api.storage.lang('settings_Thumbnails_Default'), value: '0' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'friendScore',
    title: () => api.storage.lang('settings_FriendScore'),
    props: {
      component: 'checkbox',
      option: 'friendScore',
    },
    component: SettingsGeneral,
  },
  {
    key: 'hr',
    title: 'Anilist',
    component: SettingsHr,
  },
  {
    key: 'anilistExternalSources',
    title: () => api.storage.lang('settings_anilist_external_sources'),
    props: () => ({
      component: 'checkbox',
      option: 'anilistExternalSources',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'anilistUpdateUi',
    title: () => api.storage.lang('settings_anilist_update_ui'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_anilist_update_ui_tooltip'),
      option: 'anilistUpdateUi',
    }),
    component: SettingsGeneral,
  },
];
