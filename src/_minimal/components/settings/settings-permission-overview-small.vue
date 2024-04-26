<template>
  <div v-if="supportsPermissions && !perm.hasRequiredPermissions()" class="error-section">
    <FormButton color="primary" padding="mini" @click="perm.requestPermissions()">
      {{ lang('Add') }}
    </FormButton>
    <div class="text">{{ lang('settings_custom_domains_missing_permissions_header') }}</div>
  </div>
</template>

<script lang="ts" setup>
import FormButton from '../form/form-button.vue';

import { PermissionsHandler } from '../../../utils/permissions';
import { sessionSupportsPermissions } from '../../../utils/customDomains';

const supportsPermissions = sessionSupportsPermissions();
const mode = $('html').attr('mode');

const perm = new PermissionsHandler();
if (supportsPermissions && mode !== 'install') perm.checkPermissions();
</script>

<style lang="less" scoped>
.error-section {
  background-color: var(--state-4);
  position: sticky;
  bottom: 0;
  padding: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  .text {
    color: white;
  }
}
</style>
