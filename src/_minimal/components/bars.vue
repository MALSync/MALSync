<template>
  <div class="bars" :class="{ background, noBackground: !background }">
    <div
      v-for="(el, index) in bars"
      :key="index"
      :class="`bar bar-${el.color}`"
      :style="barStyle(el)"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

interface Bar {
  color: 'blue' | 'red' | 'purple';
  width: number;
}

defineProps({
  bars: {
    type: Array as PropType<Bar[]>,
    required: true,
  },
  background: {
    type: Boolean,
    default: true,
  },
});

const barStyle = (el: Bar) => {
  let { width } = el;
  if (!width) width = 0;
  if (width < 0) width = 0;
  if (width > 100) width = 100;
  return `width: ${width}%;`;
};
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.bar-size() {
  height: 10px;
  border-radius: 10px;
}

.bars {
  .bar-size();

  overflow: hidden;
  position: relative;

  &.background {
    background-color: var(--cl-backdrop);
  }

  .bar {
    .bar-size();

    height: auto;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    transition: width @fast-transition;
    &-red {
      background-color: var(--cl-bar-prediction);
    }
    &-blue {
      background-color: var(--cl-bar-progess);
    }
    &-violet {
      background-color: var(--cl-bar-score);
    }
  }
}
</style>
