<template>
  <div>
    <Header :spacer="true">{{ lang('minimalApp_Reviews') }}</Header>
    <div v-if="!metaRequest.loading && metaRequest.data">
      <Pagination :entries-per-page="3" :elements="metaRequest.data">
        <template #elements="{ elements }">
          <Section v-for="review in elements" :key="review.user.name">
            <div class="head">
              <MediaLink :href="review.user.href" class="img">
                <ImageLazy :src="review.user.image" class="img-el" />
              </MediaLink>
              <div class="info">
                <Header>
                  <MediaLink :href="review.user.href">{{ review.user.name }}</MediaLink>
                </Header>
                <div>{{ review.body.date }}</div>
                <div>
                  Overall Rating: <strong>{{ review.body.rating }}</strong>
                </div>
                <div>
                  <strong>{{ review.body.people }}</strong> people found this review helpful
                </div>
              </div>
            </div>
            <div class="text">
              <Description>{{ review.body.text }}</Description>
            </div>
          </Section>
        </template>
      </Pagination>
    </div>
    <div v-if="!metaRequest.loading && !parameters.load">
      <FormButton @click="parameters.load = true"> Load [TODO] </FormButton>
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
import Description from '../description.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import Pagination from '../pagination.vue';

const props = defineProps({
  malUrl: {
    type: String,
    required: true,
  },
});

const parameters = ref({
  url: props.malUrl,
  load: false,
});

const metaRequest = createRequest(parameters, params => {
  if (!params.value.url || !params.value.load) return Promise.resolve([]);
  return reviewMeta(params.value.url);
});
</script>

<style lang="less" scoped>
.text {
  white-space: pre-line;
}

.head {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  .img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    &-el {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
</style>
