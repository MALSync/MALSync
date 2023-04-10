<template>
  <div :class="{ stopLoading: !metaRequest.loading }">
    <Header :spacer="true">{{ lang('minimalApp_Reviews') }}</Header>
    <Card
      v-if="
        metaRequest.loading ||
        (!metaRequest.loading && !parameters.load && !metaRequest.cache && !reviews.length)
      "
      class="grid"
    >
      <div class="loading-placeholder">
        <ImageText href="" image="" :loading="true">
          <Header class="skeleton-text">
            <MediaLink href=""></MediaLink>
          </Header>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </ImageText>
        <div v-if="metaRequest.loading" class="text">
          <Description :loading="true" :height="150"></Description>
        </div>
        <div class="load-button">
          <FormButton
            v-if="!metaRequest.loading"
            padding="large"
            color="secondary"
            @click="parameters.load = true"
          >
            {{ lang('Load') }}
          </FormButton>
        </div>
      </div>
    </Card>
    <div
      v-if="!metaRequest.loading && data && data.length"
      :class="{ grid: !metaRequest.cache && !reviews.length }"
    >
      <Pagination :entries-per-page="3" :elements="data">
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
              <Description :height="150">
                <div
                  v-dompurify-html:noMedia="cleanDescription(review.body.text)"
                  class="description-html"
                  :class="{
                    preLine: !(review.body.text.includes('<br') || review.body.text.includes('<p')),
                  }"
                />
              </Description>
            </div>
          </Section>
        </template>
      </Pagination>
    </div>
    <Section v-if="!metaRequest.loading && data && !data.length">
      <Empty :card="true" />
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, PropType } from 'vue';
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
import Empty from '../empty.vue';
import Card from '../card.vue';
import { Review } from '../../../_provider/metaOverviewAbstract';

const props = defineProps({
  reviews: {
    type: Array as PropType<Review[]>,
    default: () => [],
  },
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
    prefix: 'overview-reviews',
    ttl: 7 * 24 * 60 * 60 * 1000,
    refetchTtl: 7 * 24 * 60 * 60 * 1000,
    keyFn: params => params.value.url,
  },
});

watch(
  () => props.malUrl,
  () => {
    parameters.value.load = false;
  },
);

const data = computed(() =>
  props.reviews && props.reviews.length ? props.reviews : metaRequest.data,
);

const cleanDescription = desc => {
  if (!desc) return '';
  return desc.replace(/(< *\/? *br *\/? *>(\r|\n| )*){2,}/gim, '<br /><br />');
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.text {
  white-space: pre-line;
}

.grid {
  padding: 10px !important;
}

.text {
  margin-top: @spacer;
}

.description-html {
  white-space: initial;
  &.preLine {
    white-space: pre-line;
  }
}

.skeleton-text {
  .skeleton-text();

  color: transparent;
}

.loading-placeholder {
  position: relative;
  .load-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }
}

.stopLoading {
  --cl-loading: 0;
}
</style>
