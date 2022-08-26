<template>
  <div>
    <Header :spacer="true">{{ lang('minimalApp_Reviews') }}</Header>
    <div v-if="!metaRequest.loading">
      <div v-for="review in metaRequest.data" :key="review.user.name">
        <div>
          <MediaLink :href="review.user.href">{{ review.user.name }}</MediaLink>
        </div>
        <ImageLazy :src="review.user.image" />
        <div>{{review.body.people}}</div>
        <div>{{review.body.date}}</div>
        <div>{{review.body.rating}}</div>
        <div class="text">{{review.body.text}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { createRequest } from '../../utils/reactive';
import Header from '../header.vue';
import { reviewMeta } from './overview-reviews-meta';
import ImageLazy from '../image-lazy.vue';
import MediaLink from '../media-link.vue';

const props = defineProps({
  malUrl: {
    type: String,
    required: true,
  },
});

const parameters = ref({
  url: props.malUrl,
});

const metaRequest = createRequest(parameters, params => {
  if (!params.value.url) return Promise.resolve([]);
  return reviewMeta(params.value.url);
});
</script>

<style lang="less" scoped>
.text {
  white-space: pre-line;
}
</style>
