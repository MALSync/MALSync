<template>
  <hr class="hr" :class="[size, padding, direction].join(' ')" />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  size: {
    type: String as PropType<'thin' | 'normal'>,
    default: 'normal',
  },
  padding: {
    type: String as PropType<'full' | 'half'>,
    default: 'full',
  },
  direction: {
    type: String as PropType<'bottom' | 'both'>,
    default: 'bottom',
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.hr {
  margin-top: 0;
  margin-bottom: @spacer;
  border: none;
  border-top: 2px solid var(--cl-backdrop);
  width: 100%;

  &.thin {
    border-top-width: 1px;
  }

  &.both {
    margin-top: @spacer;
  }

  &.half {
    margin-bottom: @spacer-half;

    &.both {
      margin-top: @spacer-half;
    }
  }
}
</style>
