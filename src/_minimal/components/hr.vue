<template>
  <hr class="hr" :class="`${size}`" />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  size: {
    type: String as PropType<'thin' | 'normal'>,
    default: 'normal',
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
}
</style>
