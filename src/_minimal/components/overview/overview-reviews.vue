<template>
  <div>
    <Header :spacer="true">{{ lang('minimalApp_Reviews') }}</Header>
    <div v-if="!metaRequest.loading && metaRequest.data" class="grid">
      <Pagination :entries-per-page="3" :elements="metaRequest.data">
        <template #elements="{ elements }">
          <Section v-for="(review, index) in elements" :key="review.user.name">
            <HR v-if="index" size="thin" />
            <ImageText :href="review.user.href" :image="review.user.image">
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
            </ImageText>
            <div class="text">
              <Description>{{ review.body.text }}</Description>
            </div>
          </Section>
        </template>
      </Pagination>
    </div>
    <div v-if="!metaRequest.loading && !parameters.load && !metaRequest.cache">
      <FormButton @click="parameters.load = true"> {{ lang('Load') }} </FormButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { createRequest } from '../../utils/reactive';
import Header from '../header.vue';
import { reviewMeta } from './overview-reviews-meta';
import MediaLink from '../media-link.vue';
import Description from '../description.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import Pagination from '../pagination.vue';
import ImageText from '../image-text.vue';
import HR from '../hr.vue';

const props = defineProps({
  malUrl: {
    type: String,
    required: true,
  },
});

const parameters = ref({
  url: computed(() => props.malUrl),
  load: false,
});

const metaRequest = createRequest(parameters, params => reviewMeta(params.value.url), {
  executeCondition: params => params.value.load && params.value.url,
  cache: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    refetchTtl: 7 * 24 * 60 * 60 * 1000,
    keyFn: params => params.value.url,
  },
});

watch(
  () => props.malUrl,
  () => {
    parameters.value.load = false;
    metaRequest.reset();
  },
);
</script>

<style lang="less" scoped>
.text {
  white-space: pre-line;
}

.grid {
  padding: 0 10px;
}
</style>
