<template>
  <div class="section" :class="`${spacer} ${loading ? 'loading' : ''}`">
    <slot v-if="!loading" />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  spacer: {
    type: String as PropType<'half' | 'full' | 'none'>,
    default: 'full',
  },
  loading: {
    type: Boolean,
    default: false,
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

  &.none {
    margin-bottom: 0;
  }

  &.loading {
    .skeleton-text-block();

    min-height: 200px;

    &.none {
      margin-bottom: @spacer;
    }
  }
}
</style>
