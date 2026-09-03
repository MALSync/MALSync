import { defineAsyncComponent } from 'vue';
import { ConfObj } from '../../../_provider/definitions';
import SettingsGroup from './settings-group.vue';

export const backup: ConfObj[] = [
  {
    key: 'backupPage',
    title: 'Backup & Restore',
    component: defineAsyncComponent(() => import('./settings-backup.vue')),
  },
];

export const backupGroup: ConfObj = {
  key: 'backupSection',
  title: 'Backup & Restore',
  props: {
    icon: 'backup',
  },
  // Backup uses chrome.storage and chrome.identity — not available in userscript mode
  system: 'webextension',
  component: SettingsGroup,
  children: backup,
};
