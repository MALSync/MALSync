<template>
  <PillSplit
    :left="Boolean(showEp || score)"
    :right="Boolean(streamUrl)"
    :reverse="showEp"
    :color="showEp ? 'dark-background' : 'primary-dark'"
  >
    <template #left>
      <div v-if="showEp">{{ watchedEp }} / <MediaTotalEpisode :episode="totalEp" /></div>
      <TextIcon v-else icon="star">{{ score }}</TextIcon>
    </template>
    <template #right>
      <div class="right-section">
        <MediaLink v-if="Boolean(streamUrl)" :href="streamUrl">
          <img class="streamIcon" :src="streamIcon" />
        </MediaLink>
        <div v-if="!showEp && !score">
          {{ watchedEp }}
        </div>
      </div>
    </template>
  </PillSplit>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import PillSplit from '../pill-split.vue';
import TextIcon from '../text-icon.vue';
import MediaLink from '../media-link.vue';
import MediaTotalEpisode from './media-total-episode.vue';

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
});

const showEp = computed(() =>
  Boolean(props.watchedEp && props.watchedEp !== props.totalEp && props.showEp),
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

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
</style>
