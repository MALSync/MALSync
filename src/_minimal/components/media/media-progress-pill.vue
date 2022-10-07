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
.progress-pill {
  font-size: 12px;
  background-color: var(--cl-primary);
  color: white;
  padding: 0 5px;
  border-radius: 5px;

  &.medium,
  &.large {
    font-size: 14px;
    margin-left: 3px;
    &.large {
      margin-left: 6px;
    }
  }

  &.has-new-eps {
    background-color: var(--cl-secondary);
  }
}
</style>
