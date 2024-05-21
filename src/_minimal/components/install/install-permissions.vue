<template>
  <div>
    <Header :spacer="true">
      🔑 {{ lang('settings_custom_domains_missing_permissions_header') }}
    </Header>
    <Section>
      <p>
        <SettingsPermissionsOverview @required="clickHandler()" />
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
import SettingsPermissionsOverview from '../settings/settings-permission-overview.vue';

const emit = defineEmits(['next', 'back']);

function clickHandler() {
  setTimeout(() => emit('next'), 100);
}
</script>

<style lang="less" scoped></style>
