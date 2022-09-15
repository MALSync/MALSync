import SettingsCustomDomains from './settings-custom-domains.vue';
import SettingsCustomDomainsMissingPermissions from './settings-custom-domains-missing-permissions.vue';

export const missingPermissions = {
  key: 'permissions',
  title: api.storage.lang('settings_custom_domains_button'),
  component: SettingsCustomDomainsMissingPermissions,
};

export const customDomains = [
  missingPermissions,
  {
    key: 'domains',
    title: api.storage.lang('settings_custom_domains_button'),
    component: SettingsCustomDomains,
  },
];
