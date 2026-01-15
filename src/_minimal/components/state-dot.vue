<template>
  <div
    class="state-dot"
    :class="`state-${status} ${relativeHeight ? 'relative' : ''}`"
    :title="state[status]"
  />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { status as state } from '../../_provider/definitions';

defineProps({
  status: {
    type: Number as PropType<state>,
    required: true,
  },
  relativeHeight: {
    type: Boolean,
    default: false,
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
  margin-inline-end: 0.5em;

  &.relative {
    min-width: 1em;
    width: 1em;
    height: 1em;
  }

  &.state-0 {
    border: 1px solid var(--cl-text);
  }

  &.state-1 {
    background: var(--cl-state-1);
  }

  &.state-2 {
    background: var(--cl-state-2);
  }

  &.state-3 {
    background: var(--cl-state-3);
  }

  &.state-4 {
    background: var(--cl-state-4);
  }

  &.state-6 {
    background: var(--cl-state-6);
  }

  &.state-7 {
    background: var(--cl-state-7);
  }

  &.state-23 {
    background: var(--cl-state-23);
  }
}
</style>
