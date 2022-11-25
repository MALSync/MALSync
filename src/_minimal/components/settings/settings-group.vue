<template>
  <MediaLink v-if="href" :href="href">
    <div class="overview-button">
      <Header weight="normal">
        <TextIcon :icon="icon" mode="flex" spacer="big">
          {{ title }}
          <SettingsDiscordPill v-if="special === 'discord'"></SettingsDiscordPill>
        </TextIcon>
      </Header>
    </div>
  </MediaLink>
  <Link v-else-if="type === 'general'" :to="{ name: 'Settings', params: { path } }">
    <div class="overview-button">
      <Header weight="normal">
        <TextIcon :icon="icon" mode="flex" spacer="big">{{ title }}</TextIcon>
      </Header>
    </div>
  </Link>
  <div v-else>
    <SettingsGeneral component="button" :title="title">
      <template #component>
        <Link :to="{ name: 'Settings', params: { path } }">
          <FormButton v-bind="props" />
        </Link>
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
import Link from '../link.vue';
import SettingsDiscordPill from './settings-discord-pill.vue';

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
  special: {
    type: String as PropType<'discord' | ''>,
    required: false,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.overview-button {
  .click-move-down();

  padding: @spacer-half 0;
}
</style>
