<template>
  <div class="section" :class="`${direction} ${spacer} ${loading ? 'loading' : ''}`">
    <slot v-if="!loading" />
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  spacer: {
    type: String as PropType<'half' | 'full' | 'double' | 'none'>,
    default: 'full',
  },
  direction: {
    type: String as PropType<'down' | 'both'>,
    default: 'down',
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

  &.both {
    margin-top: @spacer;
  }

  &.half {
    margin-bottom: @spacer-half;
    &.both {
      margin-top: @spacer-half;
    }
  }

  &.double {
    margin-bottom: calc(@spacer * 2);
    &.both {
      margin-top: calc(@spacer * 2);
    }
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
