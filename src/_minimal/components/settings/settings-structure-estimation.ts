import { ConfObj } from '../../../_provider/definitions';
import { IntlDuration } from '../../../utils/IntlWrapper';
import SettingsGeneral from './settings-general.vue';
import SettingsProgressDropdown from './settings-progress-dropdown.vue';

const intl = new IntlDuration().setDurationFormatStyle('long');

function startProgressSync() {
  if (api.type === 'webextension') {
    const inter = parseInt(api.settings.get('progressInterval'));
    if (!inter) return;
    con.log('Trigger Progress update');
    chrome.alarms.create('progressSync', {
      periodInMinutes: inter,
      when: Date.now() + 1000,
    });
  }
}

export const notificationsSection: ConfObj[] = [
  {
    key: 'progressNotificationsAnime',
    title: () => `${api.storage.lang('settings_Notifications')} (${api.storage.lang('Anime')})`,
    condition: () => Boolean(Number(api.settings.get('progressInterval'))),
    props: {
      component: 'checkbox',
      option: 'progressNotificationsAnime',
    },
    component: SettingsGeneral,
  },
  {
    key: 'progressNotificationsManga',
    title: () => `${api.storage.lang('settings_Notifications')} (${api.storage.lang('Manga')})`,
    condition: () => Boolean(Number(api.settings.get('progressInterval'))),
    props: {
      component: 'checkbox',
      option: 'progressNotificationsManga',
    },
    component: SettingsGeneral,
  },
  {
    key: 'notificationsSticky',
    title: () => api.storage.lang('settings_Notifications_Sticky'),
    props: {
      component: 'checkbox',
      option: 'notificationsSticky',
    },
    component: SettingsGeneral,
  },
];

export const estimation: ConfObj[] = [
  {
    key: 'progressInterval',
    title: () => api.storage.lang('settings_Interval'),
    change: () => startProgressSync(),
    props: () => {
      return {
        component: 'dropdown',
        option: 'progressInterval',
        props: {
          options: [
            { title: api.storage.lang('settings_Interval_Off'), value: '0' },
            {
              title: `${intl.setDuration({ minutes: 30 }).getText()}`,
              value: '30',
            },
            {
              title: `${intl.setDuration({ hours: 1 }).getText()}`,
              value: '60',
            },
            {
              title: `${intl.setDuration({ hours: 2 }).getText()}`,
              value: '120',
            },
            {
              title: `${intl.setDuration({ hours: 4 }).getText()}`,
              value: '240',
            },
            {
              title: `${intl.setDuration({ hours: 12 }).getText()}`,
              value: '720',
            },
            {
              title: `${intl.setDuration({ hours: 24 }).getText()}`,
              value: '1440',
            },
          ],
        },
      };
    },
    component: SettingsGeneral,
  },
  {
    key: 'progressIntervalDefaultAnime',
    title: () => api.storage.lang('settings_Interval_Default_Anime'),
    change: () => startProgressSync(),
    condition: () => Boolean(Number(api.settings.get('progressInterval'))),
    props: {
      component: 'dropdown',
      option: 'progressIntervalDefaultAnime',
      type: 'anime',
    },
    component: SettingsProgressDropdown,
  },
  {
    key: 'progressIntervalDefaultManga',
    title: () => api.storage.lang('settings_Interval_Default_Manga'),
    change: () => startProgressSync(),
    condition: () => Boolean(Number(api.settings.get('progressInterval'))),
    props: {
      component: 'dropdown',
      option: 'progressIntervalDefaultManga',
      type: 'manga',
    },
    component: SettingsProgressDropdown,
  },
  ...notificationsSection,
  {
    key: 'loadPTWForProgress',
    title: () => api.storage.lang('settings_loadPTWForProgress'),
    condition: () => Boolean(Number(api.settings.get('progressInterval'))),
    props: {
      component: 'checkbox',
      option: 'loadPTWForProgress',
    },
    component: SettingsGeneral,
  },
];
