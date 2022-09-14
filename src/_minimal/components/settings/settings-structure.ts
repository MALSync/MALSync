import SettingsGroup from './settings-group.vue';
import SettingsGeneral from './settings-general.vue';
import SettingsProfile from './settings-profile.vue';
import SettingsStreaming from './settings-streaming.vue';
import { tracking } from './settings-structure-tracking';
import { ConfObj } from '../../../_provider/definitions';
import { theming } from './settings-structure-theming';

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
