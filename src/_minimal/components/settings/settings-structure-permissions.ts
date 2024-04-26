import SettingsPermissionsOverview from './settings-permission-overview.vue';
import { ConfObj } from '../../../_provider/definitions';

export const permissionsOverview: ConfObj[] = [
  {
    key: 'permission-overview',
    system: 'webextension',
    title: () => api.storage.lang('settings_custom_domains_button'),
    component: SettingsPermissionsOverview,
  },
];

export const missingGeneralPermissions: ConfObj = {
  key: 'permission-overview',
  system: 'webextension',
  title: () => api.storage.lang('settings_custom_domains_button'),
  component: SettingsPermissionsOverview,
  props: {
    requiredOnly: true,
  },
};
