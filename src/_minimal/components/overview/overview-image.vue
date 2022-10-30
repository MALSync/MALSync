<template>
  <div class="overviewImage" :class="{ hov: src, notLoading: !loading }" @click="imgModal = true">
    <ImageFit class="over" :src="src" :loading="loading" />
    <div v-if="progress" class="progress">
      <MediaPillProgress :progress="progress" />
    </div>
    <div v-if="streaming.url" class="streaming" @click.stop>
      <PillSplit
        :right="Boolean(streaming.url)"
        :left="Boolean(streaming.url)"
        :reverse="true"
        color="secondary"
      >
        <template #right>
          <MediaLink :href="streaming.url" class="stream-link">
            <img class="img-icons" :src="streaming.favicon" />
          </MediaLink>
        </template>
        <template #left>
          <MediaLink :href="streaming.continueUrl">
            {{ lang(`overview_Continue_${single?.getType()}`) }} <Arrow />
          </MediaLink>
        </template>
      </PillSplit>
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
import PillSplit from '../pill-split.vue';
import MediaLink from '../media-link.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';
import Arrow from '../arrow.vue';

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

const streaming = computed(() => {
  const streamingEl = {
    url: '',
    favicon: '',
    continueUrl: '',
  };

  if (!props.single) return streamingEl;

  const overview = props.single.getStreamingUrl() || '';
  const resumeUrlObj = props.single.getResumeWatching();
  const continueUrlObj = props.single.getContinueWatching();
  const ep = props.single.getEpisode();

  streamingEl.url = overview;

  if (continueUrlObj && continueUrlObj.ep === ep + 1) {
    streamingEl.continueUrl = continueUrlObj.url;
  } else if (resumeUrlObj && resumeUrlObj.ep === ep) {
    streamingEl.continueUrl = resumeUrlObj.url;
  } else if (overview) {
    streamingEl.continueUrl = overview;
  }

  if (streamingEl.url) {
    streamingEl.favicon = utils.favicon(streamingEl.url.split('/')[2]);
  }

  return streamingEl;
});

const progress = computed(() => {
  if (!props.single) return false;
  const progressEl = props.single.getProgress();
  if (!progressEl) return false;
  if (!progressEl.isAiring()) return false;
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

.streaming {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 10px;
  border-radius: 30px;
  .block-select();

  .pill {
    user-select: none;
  }

  .img-icons {
    width: 18px;
    height: 18px;
  }

  .stream-link {
    display: flex;
  }
}
.progress {
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px;
}
</style>
