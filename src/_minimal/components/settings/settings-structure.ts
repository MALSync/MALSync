import SettingsGroup from './settings-group.vue';
import SettingsProfile from './settings-profile.vue';
import SettingsListSync from './settings-list-sync.vue';
import SettingsHr from './settings-hr.vue';
import { tracking } from './settings-structure-tracking';
import { ConfObj } from '../../../_provider/definitions';
import { theming } from './settings-structure-theming';
import { customDomains, missingPermissions } from './settings-structure-custom-domains';
import { onsite } from './settings-structure-onsite';
import { discord } from './settings-structure-discord';
import { etc } from './settings-structure-etc';
import { video } from './settings-structure-video';
import { minimal } from './settings-structure-minimal';
import { estimation } from './settings-structure-estimation';
import { links } from './settings-structure-links';

export const structure: ConfObj[] = [
  {
    key: 'profile',
    title: 'Profile',
    component: SettingsProfile,
  },
  missingPermissions,
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
    key: 'onsite',
    title: 'Onsite',
    props: {
      icon: 'view_quilt',
    },
    component: SettingsGroup,
    children: onsite,
  },
  {
    key: 'streaming',
    title: () => api.storage.lang('settings_StreamingSite'),
    props: {
      icon: 'rss_feed',
    },
    component: SettingsGroup,
    children: links,
  },
  {
    key: 'videoPlayerSection',
    title: () => api.storage.lang('settings_Video_Player'),
    props: {
      icon: 'play_circle_filled',
    },
    component: SettingsGroup,
    children: video,
  },
  {
    key: 'minimalSection',
    title: () => api.storage.lang('settings_miniMAL_popup'),
    props: {
      icon: 'picture_in_picture',
    },
    component: SettingsGroup,
    children: minimal,
  },
  {
    key: 'estimationSection',
    title: 'Progress Estimation',
    props: {
      icon: 'update',
    },
    component: SettingsGroup,
    children: estimation,
  },
  {
    key: 'customDoamins',
    title: () => api.storage.lang('settings_custom_domains_button'),
    system: 'webextension',
    props: {
      icon: 'web',
    },
    component: SettingsGroup,
    children: customDomains,
  },
  {
    key: 'listSyncSection',
    title: 'List Sync',
    props: {
      icon: 'sync_alt',
    },
    component: SettingsGroup,
    children: [
      {
        key: 'listSync',
        title: 'List Sync',
        component: SettingsListSync,
      },
    ],
  },
  {
    key: 'DiscordSection',
    title: 'Discord Rich Presence',
    system: 'webextension',
    props: {
      icon: 'discord',
    },
    component: SettingsGroup,
    children: discord,
  },
  {
    key: 'miscellaneous',
    title: 'Miscellaneous',
    props: {
      icon: 'code',
    },
    component: SettingsGroup,
    children: etc,
  },
  {
    key: 'hr',
    title: '',
    component: SettingsHr,
  },
  {
    key: 'support',
    title: 'Need help?',
    props: {
      icon: 'help',
      href: 'https://github.com/MALSync/MALSync/wiki/Support',
    },
    component: SettingsGroup,
  },
  {
    key: 'joinDiscord',
    title: 'Join our Discord Server',
    props: {
      icon: 'forum',
      href: 'https://discord.com/invite/cTH4yaw',
    },
    component: SettingsGroup,
  },
  {
    key: 'donate',
    title: 'Donate',
    props: {
      icon: 'favorite',
      href: 'https://malsync.moe/donate',
    },
    component: SettingsGroup,
  },
];
