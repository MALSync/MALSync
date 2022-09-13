<template>
  <h4 class="header" :class="{ loading, spacer }">
    <template v-if="!loading"><slot /></template>
    <span v-else class="loading-placeholder"></span>
  </h4>
</template>

<script lang="ts" setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  spacer: {
    type: Boolean,
    default: false,
  },
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
}

.loading-placeholder {
  .skeleton-text();
}
</style>
