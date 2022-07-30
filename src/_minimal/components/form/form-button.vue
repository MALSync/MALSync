<template>
  <div class="button" :class="`${padding} ${animation ? 'animation' : ''}`" tabindex="tabindex">
    <slot /> {{ title }}
  </div>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from 'vue';

defineProps({
  padding: {
    type: String as PropType<'small' | 'large'>,
    default: 'small',
  },
  tabindex: {
    type: Number,
    default: 0,
  },
  animation: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.button {
  .link();
  .block-select();
  .border-radius();

  display: inline-block;
  border: 1px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);

  &.animation {
    .click-move-down();
  }

  &.small {
    padding: 5px 10px;
  }

  &.large {
    padding: 10px 42px;
  }

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &:focus-visible {
    .focus-outline();
  }
}
</style>
