<template>
  <span v-if="episode" class="progress-pill" :title="text" :class="[mode].join(' ')">
    {{ episode }}
  </span>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
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
    type: String as PropType<'small' | 'medium'>,
    default: 'small',
  },
});
</script>

<style lang="less" scoped>
.progress-pill {
  font-size: 12px;
  background-color: var(--cl-primary);
  color: white;
  padding: 0 5px;
  border-radius: 5px;

  &.medium {
    font-size: 14px;
    margin-left: 3px;
  }
}
</style>
