<template>
  <h4 class="header" :class="{ loading }">
    <template v-if="!loading"><slot /></template>
  </h4>
</template>

<script lang="ts" setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import './../less/_globals.less';

.header {
  .header-normal();

  margin-bottom: @spacer;

  &.loading {
    .skeleton-text();
  }
}
</style>
