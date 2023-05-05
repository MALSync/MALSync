<template>
  <div>
    <slot name="elements" :elements="pageElements" />
  </div>
  <div v-if="pageElements.length !== elements.length">
    <div class="material-icons next" @click="page++">arrow_downward</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';

const props = defineProps({
  elements: {
    type: Array as PropType<any[]>,
    required: true,
  },
  entriesPerPage: {
    type: Number,
    default: 10,
  },
  openAll: {
    type: Boolean,
    default: false,
  },
});

const page = ref(1);

const pageElements = computed(() => {
  if (props.openAll && page.value > 1) return props.elements;
  const start = (page.value - 1) * props.entriesPerPage;
  const end = start + props.entriesPerPage;
  return props.elements.slice(0, end);
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.next {
  .border-radius();
  .link();
  .click-move-down();

  text-align: center;
  display: block;
  padding: 5px 15px;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);

  &:hover {
    border-color: var(--cl-border-hover);
  }
}
</style>
