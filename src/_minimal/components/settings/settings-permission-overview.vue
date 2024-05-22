<template>
  <component
    :is="requiredOnly ? Card : 'div'"
    v-if="!requiredOnly || !perm.hasAllPermissions()"
    class="permissions"
    border="secondary"
  >
    <Header v-if="requiredOnly" :spacer="true">
      {{ lang('settings_custom_domains_missing_permissions_header') }}
    </Header>

    <Section spacer="half" direction="both">
      <PermissionCard
        :title="lang('settings_permissions_required')"
        :permission="perm.getRequiredPermissions()"
      />
    </Section>

    <Section spacer="half" direction="both">
      <PermissionCard
        :title="lang('settings_permissions_pages')"
        :permissions="perm.getPagesPermissions()"
      />
    </Section>

    <Section spacer="half" direction="both">
      <PermissionCard
        :title="lang('settings_permissions_player')"
        :permission="perm.getPlayerPermissions()"
      />
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
  </component>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import Section from '../section.vue';
import PermissionCard from './settings-permission-overview-card.vue';
import SessionSupportsPermissions from '../session-supports-permissions.vue';
import SettingsCustomDomainsMissingPermissions from './settings-custom-domains-missing-permissions.vue';
import FormButton from '../form/form-button.vue';
import Card from '../card.vue';
import Header from '../header.vue';

import { PermissionsHandler } from '../../../utils/permissions';

defineProps({
  requiredOnly: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

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
