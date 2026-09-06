<template>
  <span v-if="episode" class="progress-pill" :title="text" :class="[mode, hasNewEps].join(' ')">
    {{ episode }}
  </span>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';

const props = defineProps({
  episode: {
    type: Number,
    required: false,
    default: 0,
  },
  text: {
    type: String,
    required: false,
    default: '',
  },
  mode: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'small',
  },
  watchedEp: {
    type: Number,
    required: false,
    default: 0,
  },
});

const hasNewEps = computed(() => {
  return props.episode > props.watchedEp ? 'has-new-eps' : '';
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.progress-pill {
  font-size: @tiny-text;
  background-color: var(--cl-primary);
  color: var(--cl-primary-contrast);
  padding: 0 5px;
  border-radius: 5px;

  &.medium,
  &.large {
    font-size: @small-text;
    margin-inline-start: 3px;
    &.large {
      margin-inline-start: 6px;
    }
  }

  &.has-new-eps {
    background-color: var(--cl-secondary);
  }
}
</style>
