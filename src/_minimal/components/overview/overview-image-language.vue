<template>
  <div v-if="progress" class="progress">
    <MediaPillProgress :progress="progress" />
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import MediaPillProgress from '../media/media-pill-progress.vue';

const props = defineProps({
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
});

const progress = computed(() => {
  if (!props.single) return false;
  const progressEl = props.single.getProgress();
  if (!progressEl) return false;
  if (!progressEl.isAiring() || !progressEl.getCurrentEpisode()) return false;
  return progressEl;
});
</script>

<style lang="less" scoped>
.progress {
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px;
}
</style>
