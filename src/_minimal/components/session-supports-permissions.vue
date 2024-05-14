<template>
  <div>
    <slot v-if="supportsPermissions" />
    <div v-else>
      <!-- Error message -->
      <FormButton color="secondary" :link="link">
        {{ lang('settings_custom_domains_permissions_not_supported') }}
      </FormButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { sessionSupportsPermissions } from '../../utils/customDomains';

import FormButton from './form/form-button.vue';

const supportsPermissions = sessionSupportsPermissions();

const link = window.self !== window.top ? window.location.href : 'https://malsync.moe/pwa';
</script>
