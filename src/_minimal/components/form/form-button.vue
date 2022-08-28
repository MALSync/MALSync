<template>
  <div class="button" :class="`${padding} ${animation ? 'animation' : ''}`" tabindex="tabindex">
    <slot /> {{ title }}
    <div v-if="icon" class="material-icons top-icon">{{ icon }}</div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  padding: {
    type: String as PropType<'small' | 'large' | 'pill' | 'mini'>,
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
  icon: {
    type: String,
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

  position: relative;
  display: inline-block;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);

  &.animation {
    .click-move-down();
  }

  &.mini {
    .border-radius-small();

    padding: 2px 5px;
  }

  &.small {
    padding: 5px 10px;
  }

  &.large {
    padding: 10px 42px;
  }

  &.pill {
    height: 30px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    padding: 0 10px;
  }

  &:hover {
    border-color: var(--cl-border-hover);
    .top-icon {
      border-color: var(--cl-border-hover);
    }
  }

  &:focus-visible {
    .focus-outline();
  }

  .top-icon {
    position: absolute;
    font-size: 12px;
    top: -10px;
    right: -10px;
    background-color: var(--cl-primary);
    border-radius: 50%;
    padding: 2px;
    color: white;
    border: 2px solid var(--cl-primary);
  }
}
</style>
