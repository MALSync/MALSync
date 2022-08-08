<template>
  <PillSplit>
    <template v-if="score" #left>
      <TextIcon icon="star">{{ score }}</TextIcon>
    </template>
    <template v-if="streamUrl" #right>
      <MediaLink :href="streamUrl">
        <TextIcon :src="streamIcon">{{ watchedEp }}</TextIcon>
      </MediaLink>
    </template>
  </PillSplit>
</template>

<script lang="ts" setup>
import PillSplit from '../pill-split.vue';
import TextIcon from '../text-icon.vue';
import MediaLink from '../media-link.vue';

defineProps({
  watchedEp: {
    type: Number,
    optional: true,
    default: null,
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
</script>
