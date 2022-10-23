<template>
  <MediaLink v-if="href" :href="href">
    <div class="overview-button">
      <Header weight="normal">
        <TextIcon :icon="icon" mode="flex">{{ title }}</TextIcon>
      </Header>
    </div>
  </MediaLink>
  <router-link v-else-if="type === 'general'" :to="{ name: 'Settings', params: { path } }">
    <div class="overview-button">
      <Header weight="normal">
        <TextIcon :icon="icon" mode="flex">{{ title }}</TextIcon>
      </Header>
    </div>
  </router-link>
  <div v-else>
    <SettingsGeneral component="button" :title="title">
      <template #component>
        <router-link :to="{ name: 'Settings', params: { path } }">
          <FormButton v-bind="props" />
        </router-link>
      </template>
    </SettingsGeneral>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import TextIcon from '../text-icon.vue';
import Header from '../header.vue';
import SettingsGeneral from './settings-general.vue';
import FormButton from '../form/form-button.vue';
import MediaLink from '../media-link.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  path: {
    type: Array as PropType<string[]>,
    require: true,
    default: () => [],
  },
  href: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<'button' | 'general'>,
    required: false,
    default: 'general',
  },
  props: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.overview-button {
  .click-move-down();

  padding: 15px 0;
}
</style>
