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
import { notifications } from './settings-structure-notifications';
import { missingGeneralPermissions, permissionsOverview } from './settings-structure-permissions';

export const structure: ConfObj[] = [
  {
    key: 'profile',
    title: 'Profile',
    component: SettingsProfile,
  },
  missingPermissions,
  missingGeneralPermissions,
  {
    key: 'tracking',
    title: () => api.storage.lang('settings_tracking'),
    props: {
      icon: 'visibility',
    },
    component: SettingsGroup,
    children: tracking,
  },
  {
    key: 'theming',
    title: () => api.storage.lang('settings_theming'),
    props: {
      icon: 'palette',
    },
    component: SettingsGroup,
    children: theming,
  },
  {
    key: 'onsite',
    title: () => api.storage.lang('settings_onsite'),
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
    title: () => api.storage.lang('settings_progress'),
    props: {
      icon: 'update',
    },
    component: SettingsGroup,
    children: estimation,
  },
  {
    key: 'notifiactionSection',
    title: () => api.storage.lang('settings_Notifications'),
    props: {
      icon: 'notifications',
    },
    component: SettingsGroup,
    children: notifications,
  },
  {
    key: 'permissions-overview',
    title: () => api.storage.lang('settings_permissions_overview'),
    system: 'webextension',
    props: {
      icon: 'lock_open',
    },
    component: SettingsGroup,
    children: permissionsOverview,
  },
  {
    key: 'customDomains',
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
    title: () => api.storage.lang('settings_listsync'),
    props: {
      icon: 'sync_alt',
    },
    component: SettingsGroup,
    children: [
      {
        key: 'listSync',
        title: () => api.storage.lang('settings_listsync'),
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
    title: () => api.storage.lang('settings_miscellaneous'),
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
    title: () => api.storage.lang('settings_help'),
    props: {
      icon: 'help',
      href: 'https://github.com/MALSync/MALSync/wiki/Support',
    },
    component: SettingsGroup,
  },
  {
    key: 'joinDiscord',
    title: () => api.storage.lang('settings_discord_join'),
    props: {
      icon: 'forum',
      href: 'https://discord.com/invite/cTH4yaw',
      special: 'discord',
    },
    component: SettingsGroup,
  },
  {
    key: 'donate',
    title: () => api.storage.lang('settings_donate'),
    props: {
      icon: 'favorite',
      href: 'https://malsync.moe/donate',
    },
    component: SettingsGroup,
  },
];
