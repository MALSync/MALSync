<template>
  <Bars :bars="bars" :background="Boolean(totalEp)" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Bars from '../bars.vue';

const props = defineProps({
  watchedEp: {
    type: Number,
    optional: true,
    default: null,
  },
  totalEp: {
    type: Number,
    optional: true,
    default: null,
  },
  progressEp: {
    type: Number,
    required: false,
    default: 0,
  },
  progressText: {
    type: String,
    required: false,
    default: '',
  },
});

const total = computed(() => {
  if (props.totalEp) return props.totalEp;
  if (props.watchedEp && props.watchedEp > props.progressEp) return props.watchedEp * 1.25;
  if (props.progressEp && props.progressEp > props.watchedEp) return props.progressEp * 1.25;
  return 0;
});

const bars = computed(() => {
  const barData: any[] = [];

  if (props.progressEp) {
    barData.push({
      color: 'red',
      width: (props.progressEp / total.value) * 100,
    });
  }

  barData.push({
    color: 'blue',
    width: props.watchedEp ? (props.watchedEp / total.value) * 100 : 0,
  });

  return barData;
});
</script>

<style lang="less" scoped>
.bars {
  &.background {
    background-color: #eceff142 !important;
  }

  &.noBackground {
    background-image: linear-gradient(90deg, #eceff142 0%, #eceff142 83%, transparent 95%);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
