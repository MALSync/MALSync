<template>
  <component
    :is="link ? MediaLink : 'div'"
    class="button"
    :href="link"
    :class="`
      ${padding}
      ${animation ? 'animation' : ''}
      ${color}
      ${disabled ? 'disabled' : ''}
      ${hoverAnimation ? 'hoverActive' : ''}
    `"
    :tabindex="tabindex"
    @click="disabled ? null : click()"
    @keyup.enter="$el.click()"
  >
    <slot /> {{ title }}
    <div v-if="icon" class="material-icons top-icon">{{ icon }}</div>
  </component>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import MediaLink from '../media-link.vue';

defineProps({
  padding: {
    type: String as PropType<'small' | 'large' | 'pill' | 'mini' | 'slim'>,
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
  hoverAnimation: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: false,
    default: '',
  },
  click: {
    type: Function as PropType<() => void>,
    default: () => true,
  },
  link: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String as PropType<'default' | 'primary' | 'secondary'>,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
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

  &.slim {
    display: flex;
    align-items: center;
    padding: 0 15px;
  }

  &.primary {
    background-color: var(--cl-primary);
    border-color: var(--cl-primary);
    color: var(--cl-primary-contrast);
  }

  &.secondary {
    background-color: var(--cl-secondary);
    border-color: var(--cl-secondary);
    color: white;
  }

  &.hoverActive:hover {
    border-color: var(--cl-border-hover);
    .top-icon {
      border-color: var(--cl-border-hover);
    }
  }

  &:focus-visible {
    .focus-outline();
  }

  &.disabled {
    opacity: 0.5;
    user-select: none;
    cursor: not-allowed;
    background-color: var(--cl-foreground);
    border-color: var(--cl-foreground);
    color: inherit;
  }

  .top-icon {
    position: absolute;
    font-size: 12px;
    top: -10px;
    right: -10px;
    background-color: var(--cl-primary);
    border-radius: 50%;
    padding: 2px;
    color: var(--cl-primary-contrast);
    border: 2px solid var(--cl-primary);
  }
}
</style>
