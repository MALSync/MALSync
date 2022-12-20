<template>
  <component
    :is="comp.component"
    v-if="showOption(comp)"
    v-bind="typeof comp.props === 'function' ? comp.props() : comp.props"
    :id="`id-${comp.key}`"
    :path="[...currentPath, comp.key]"
    :title="typeof comp.title === 'function' ? comp.title() : comp.title"
    :class="{ highlight: comp.key === highlight }"
    @change="comp.change ? comp.change() : null"
  />
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { ConfObj } from '../../../_provider/definitions';

defineProps({
  comp: {
    type: Object as PropType<ConfObj>,
    required: true,
  },
  highlight: {
    type: String,
    default: '',
  },
  currentPath: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

function showOption(comp: ConfObj) {
  if (comp.condition && !comp.condition()) return false;

  if (comp.system && comp.system !== api.type) return false;

  return true;
}
</script>

<style lang="less" scoped></style>
