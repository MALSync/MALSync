<template>
  <div class="media-pill">
    <PillSplit v-if="score" :right="false" :img="img">
      <template #left>
        <TextIcon icon="star">{{ score }}</TextIcon>
      </template>
    </PillSplit>
    <PillSplit :left="false" :right="Boolean(showEp || streamUrl)" :img="img">
      <template #right>
        <div class="right-section">
          <MediaLink v-if="Boolean(streamUrl)" :href="streamUrl">
            <img class="streamIcon" :src="streamIcon" />
          </MediaLink>
          <div v-if="showEp">{{ watchedEp }}/<MediaTotalEpisode :episode="totalEp" /></div>
          <MediaProgressPill
            :episode="progressEp"
            :text="progressText"
            mode="large"
            :watched-ep="watchedEp"
          />
        </div>
      </template>
    </PillSplit>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import PillSplit from '../pill-split.vue';
import TextIcon from '../text-icon.vue';
import MediaLink from '../media-link.vue';
import MediaTotalEpisode from './media-total-episode.vue';
import MediaProgressPill from './media-progress-pill.vue';

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
  showEp: {
    type: Boolean,
    default: true,
  },
  score: {
    type: [String, Number],
    optional: true,
    default: '',
  },
  streamUrl: {
    type: String,
    optional: true,
    default: '',
  },
  streamIcon: {
    type: String,
    optional: true,
    default: '',
  },
  progressEp: {
    type: Number,
    optional: true,
    default: null,
  },
  progressText: {
    type: String,
    optional: true,
    default: '',
  },
  img: {
    type: String,
    optional: true,
    default: '',
  },
});

const showEp = computed(() =>
  Boolean(props.watchedEp && props.watchedEp !== props.totalEp && props.showEp),
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.media-pill {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px 0;
  max-width: 100%;
}

.pill {
  max-width: 100%;

  & + .pill {
    z-index: 0;
    margin-inline-start: -18px;
    padding-inline-start: 18px;
  }
}

.right-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.streamIcon {
  display: inline-block;
  vertical-align: sub;
  height: 18px;
  width: 18px;
}

.progress-pill {
  margin: 0 !important;
}
</style>
