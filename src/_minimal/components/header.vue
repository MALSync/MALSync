<template>
  <h4 class="header" :class="{ loading, [spacerClass]: spacerClass }">
    <template v-if="!loading"><slot /></template>
    <span v-else class="loading-placeholder"></span>
  </h4>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  spacer: {
    type: [Boolean, String] as PropType<boolean | 'half'>,
    default: false,
  },
});

const spacerClass = computed(() => {
  if (props.spacer === 'half') return 'spacer-half';
  if (props.spacer) return 'spacer';
  return '';
});
</script>

<style lang="less" scoped>
@import './../less/_globals.less';

.header {
  .header-normal();

  margin-bottom: 0;

  &.spacer {
    margin-bottom: @spacer;
  }
  &.spacer-half {
    margin-bottom: @spacer-half;
  }
}

.loading-placeholder {
  .skeleton-text();
}
</style>
