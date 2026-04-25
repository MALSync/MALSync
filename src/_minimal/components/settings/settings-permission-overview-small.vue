<template>
  <div v-if="perm && supportsPermissions && !perm.hasMinimumPermissions()" class="error-section">
    <FormButton color="primary" padding="mini" @click="perm.requestPermissions()">
      {{ lang('Add') }}
    </FormButton>
    <div class="text">{{ lang('settings_custom_domains_missing_permissions_header') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue';
import FormButton from '../form/form-button.vue';

import { PermissionsHandler } from '../../../utils/permissions';
import { sessionSupportsPermissions } from '../../../utils/customDomains';

const supportsPermissions = sessionSupportsPermissions();
const mode = $('html').attr('mode');

const perm: Ref<null | PermissionsHandler> = ref(null);
if (supportsPermissions && mode !== 'install') {
  new PermissionsHandler().init().then(permTemp => {
    perm.value = permTemp;
  });
}
</script>

<style lang="less" scoped>
.error-section {
  background-color: var(--cl-state-4);
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
