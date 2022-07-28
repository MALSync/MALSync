<template>
  <div class="button" :class="padding" tabindex="0">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from 'vue';

defineProps({
  padding: {
    type: String as PropType<'small' | 'large'>,
    default: 'small',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.button {
  .link();
  .border-radius();

  display: inline-block;
  border: 1px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);

  &.small {
    padding: 5px 10px;
  }

  &.large {
    padding: 10px 42px;
  }

  &:hover {
    border-color: var(--cl-border-hover);
  }
}
</style>
