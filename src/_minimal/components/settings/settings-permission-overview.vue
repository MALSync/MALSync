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
      <FormButton color="secondary" padding="large" @click="perm.requestPermissions()">
        {{ lang('Add') }}
      </FormButton>
    </SessionSupportsPermissions>
  </div>
</template>

<script lang="ts" setup>
import Section from '../section.vue';
import PermissionCard from './settings-permission-overview-card.vue';
import SessionSupportsPermissions from '../session-supports-permissions.vue';
import FormButton from '../form/form-button.vue';

import { PermissionsHandler } from '../../../utils/permissions';

const perm = new PermissionsHandler();
perm.checkPermissions();
</script>

<style lang="less" scoped></style>
