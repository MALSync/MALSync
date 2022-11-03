<template>
  <div :class="{ grid: minWidth }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  minWidth: {
    type: Number,
    default: 100,
  },
  minWidthPopup: {
    type: Number,
    default: null,
  },
});

const width = computed(() => {
  return `${props.minWidth}px`;
});

const popupWidth = computed(() => {
  return props.minWidthPopup ? `${props.minWidthPopup}px` : width.value;
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.grid {
  display: grid;
  grid-gap: @spacer;
  grid-template-columns: repeat(auto-fill, minmax(v-bind(width), 1fr));

  .__breakpoint-popup__( {
    grid-template-columns: repeat(auto-fill, minmax(v-bind(popupWidth), 1fr));
  });
}
</style>
