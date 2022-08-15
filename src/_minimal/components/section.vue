<template>
  <div class="section" :class="spacer">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  spacer: {
    type: String as PropType<'half' | 'full'>,
    default: 'full',
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.section {
  margin-bottom: @spacer;

  &.half {
    margin-bottom: @spacer-half;
  }
}
</style>
