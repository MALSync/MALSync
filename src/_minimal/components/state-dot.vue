<template>
  <div class="state-dot" :class="`state-${status}`" :title="state[status]" />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { status as state } from '../../_provider/definitions';

defineProps({
  status: {
    type: Number as PropType<state>,
    required: true,
  },
});
</script>

<style lang="less" scoped>
.state-dot {
  display: inline-block;
  min-width: 16px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 0.5em;

  &.state-0 {
    background: var(--cl-backdrop);
  }

  &.state-1 {
    background: var(--state-1);
  }

  &.state-2 {
    background: var(--state-2);
  }

  &.state-3 {
    background: var(--state-3);
  }

  &.state-4 {
    background: var(--state-4);
  }

  &.state-6 {
    background: var(--state-6);
  }

  &.state-7 {
    background: var(--state-7);
  }

  &.state-23 {
    background: var(--state-23);
  }
}
</style>
