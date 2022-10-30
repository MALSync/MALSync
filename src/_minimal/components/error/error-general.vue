<template>
  <div class="error">
    <TextIcon icon="warning" color="var(--cl-secondary)">
      <slot />
    </TextIcon>
  </div>
</template>

<script lang="ts" setup>
import TextIcon from '../text-icon.vue';
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.error {
  .border-radius();

  padding: 10px 15px;
  border: 2px solid var(--cl-secondary);
  background-color: var(--cl-backdrop);
  font-weight: bold;
  margin-left: auto;
  margin-right: auto;

  :deep(a) {
    color: var(--cl-secondary);
  }
}
</style>
