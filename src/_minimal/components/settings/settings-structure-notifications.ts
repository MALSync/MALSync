import { ConfObj } from '../../../_provider/definitions';
import SettingsHr from './settings-hr.vue';
import { notificationsSection } from './settings-structure-estimation';

export const notifications: ConfObj[] = [
  {
    key: 'hr',
    title: () => api.storage.lang('settings_progress'),
    component: SettingsHr,
  },
  ...notificationsSection,
];
