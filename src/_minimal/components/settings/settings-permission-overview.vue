<template>
  <div class="permissions">
    <Section spacer="half" direction="both">
      <PermissionCard title="Required" :permission="perm.getRequiredPermissions()" />
    </Section>

    <Section spacer="half" direction="both">
      <PermissionCard title="Pages" :permissions="perm.getPagesPermissions()" />
    </Section>

    <Section spacer="half" direction="both">
      <PermissionCard title="Video player" :permission="perm.getPlayerPermissions()" />
    </Section>

    <SessionSupportsPermissions>
      <FormButton
        v-if="!perm.hasAllPermissions()"
        color="secondary"
        padding="large"
        @click="perm.requestPermissions()"
      >
        {{ lang('Add') }}
      </FormButton>
      <SettingsCustomDomainsMissingPermissions
        v-else
        :title="lang('settings_custom_domains_button')"
      />
    </SessionSupportsPermissions>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import Section from '../section.vue';
import PermissionCard from './settings-permission-overview-card.vue';
import SessionSupportsPermissions from '../session-supports-permissions.vue';
import SettingsCustomDomainsMissingPermissions from './settings-custom-domains-missing-permissions.vue';
import FormButton from '../form/form-button.vue';

import { PermissionsHandler } from '../../../utils/permissions';

const emits = defineEmits(['required']);

const perm = new PermissionsHandler();
perm.checkPermissions();

watch(
  perm.getRequiredState(),
  value => {
    if (value === 'granted') {
      emits('required');
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped></style>
