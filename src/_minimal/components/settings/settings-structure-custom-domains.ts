import SettingsCustomDomains from './settings-custom-domains.vue';
import SettingsCustomDomainsMissingPermissions from './settings-custom-domains-missing-permissions.vue';
import { ConfObj } from '../../../_provider/definitions';

export const missingPermissions: ConfObj = {
  key: 'permissions',
  system: 'webextension',
  title: () => api.storage.lang('settings_custom_domains_button'),
  component: SettingsCustomDomainsMissingPermissions,
};

export const customDomains = [
  missingPermissions,
  {
    key: 'domains',
    title: () => api.storage.lang('settings_custom_domains_button'),
    component: SettingsCustomDomains,
  },
];
