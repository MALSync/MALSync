<template>
  <div class="overviewImage" :class="{ hov: src, notLoading: !loading }" @click="imgModal = true">
    <ImageFit class="over" :src="src" :loading="loading" />
    <div v-if="progress" class="progress">
      <MediaPillProgress :progress="progress" />
    </div>
    <Modal v-if="src" v-model="imgModal">
      <img :src="src" class="modal-image" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { SingleAbstract } from '../../../_provider/singleAbstract';
import ImageFit from '../image-fit.vue';
import Modal from '../modal.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  single: {
    type: Object as PropType<SingleAbstract | null>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const imgModal = ref(false);

const progress = computed(() => {
  if (!props.single) return false;
  const progressEl = props.single.getProgress();
  if (!progressEl) return false;
  if (!progressEl.isAiring() || !progressEl.getCurrentEpisode()) return false;
  return progressEl;
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.overviewImage {
  .border-radius();

  overflow: hidden;
  position: relative;
  .over {
    .fullSize();
  }

  &.hov {
    .click-move-down();
    .link();
  }

  &.notLoading {
    .box-shadow();
  }

  height: 200px;
  .__breakpoint-desktop__({
    height: auto;
    aspect-ratio: @aspect-ratio-cover;
  });
}

.modal-image {
  max-width: 100%;
  max-height: 85vh;
}

.progress {
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px;
}
</style>
