<template>
  <div class="card" :class="{ [`border-${border}`]: border }">
    <div class="inner-card">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  border: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.card {
  .border-radius();

  border: 2px solid var(--cl-backdrop);
  padding: @spacer-half;
  background-color: var(--cl-backdrop);

  .inner-card {
    --cl-foreground: var(--cl-background-solid);
    --cl-backdrop: var(--cl-background-solid);
  }

  &.border-secondary {
    border-color: var(--cl-secondary);
  }
}
</style>
