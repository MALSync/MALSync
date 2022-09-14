<template>
  <span class="text-icon" :class="[mode, background, spacer].join(' ')">
    <span v-if="icon && position === 'before'" class="material-icons before">{{ icon }}</span>
    <img v-if="src && position === 'before'" class="img-icons before" :src="src" />
    <slot />
    <span v-if="icon && position === 'after'" class="material-icons after">{{ icon }}</span>
    <img v-if="src && position === 'after'" class="img-icons after" :src="src" />
  </span>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from 'vue';

defineProps({
  icon: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
  position: {
    type: String as PropType<'before' | 'after'>,
    default: 'before',
  },
  color: {
    type: String,
    default: 'inherit',
  },
  mode: {
    type: String as PropType<'normal' | 'flex'>,
    default: 'normal',
  },
  background: {
    type: String as PropType<'round' | ''>,
    default: '',
  },
  spacer: {
    type: String as PropType<'small' | 'medium'>,
    default: 'medium',
  },
});
</script>

<style lang="less" scoped>
.text-icon {
  line-height: 1;
  .before {
    margin-right: 10px;
  }
  .after {
    margin-left: 10px;
  }

  &.small {
    .before {
      margin-right: 5px;
    }
    .after {
      margin-left: 5px;
    }
  }

  .material-icons {
    font-size: 18px;
    vertical-align: sub;
    color: v-bind(color);
  }
  .img-icons {
    display: inline-block;
    vertical-align: sub;
    height: 18px;
    width: 18px;
  }

  &.flex {
    display: flex;
    align-items: center;
    .material-icons {
      font-size: inherit;
    }
  }

  &.round {
    .material-icons {
      background-color: var(--cl-text);
      color: var(--cl-foreground-solid);
      border-radius: 50%;
      height: 30px;
      width: 30px;
      font-size: 20px;
      text-align: center;
      line-height: 30px;
    }
  }
}
</style>
