<template>
  <div v-if="left || right" class="pill" :class="{ reverse }">
    <div v-if="left" class="left" :class="color"><slot name="left" /></div>
    <div v-if="right" class="right"><slot name="right" /></div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  left: {
    type: Boolean,
    default: true,
  },
  right: {
    type: Boolean,
    default: true,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as PropType<'primary-dark' | 'secondary' | 'dark-background'>,
    default: 'primary-dark',
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.pill {
  .border-pill();
  .block-select();

  display: inline-flex;
  overflow: hidden;
  background-color: #0000003b;
  backdrop-filter: blur(5px);

  &.reverse {
    flex-direction: row-reverse;
  }

  & > .right,
  & > .left {
    padding: 5px 10px;
  }
  & > .left {
    .border-pill();

    color: white;

    &.primary-dark {
      background-color: var(--cl-primary-dark);
    }
    &.secondary {
      background-color: var(--cl-secondary);
    }

    &.dark-background {
      background-color: var(--cl-dark-background);
    }
  }
  & > .right {
    color: white;
  }
}
</style>
