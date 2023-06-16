<template>
  <div>
    <Header :spacer="true"> 📂 {{ lang('installPage_Mode') }} </Header>
    <Section>
      <p>
        <SettingsRendering :comp="comp" @click="clickHandler" />
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
import SettingsRendering from '../settings/settings-rendering.vue';
import { providerOptions } from '../settings/settings-structure-tracking';
import SettingsGeneral from '../settings/settings-general.vue';

const emit = defineEmits(['next', 'back']);

const comp = {
  key: 'syncMode',
  title: () => api.storage.lang('settings_Mode'),
  props: {
    component: 'multiSelect',
    option: 'syncMode',
    labelSection: false,
    props: {
      options: providerOptions('short'),
      ignoreSelect: true,
    },
  },
  component: SettingsGeneral,
};

function clickHandler() {
  setTimeout(() => emit('next'), 100);
}
</script>

<style lang="less" scoped></style>
