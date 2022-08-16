<template>
  <div class="overview">
    <Section>
      <OverviewImage
        class="image"
        :src="metaRequest.data?.image || ''"
        :loading="metaRequest.loading"
      />
    </Section>
    <Section spacer="half">
      <Header :loading="metaRequest.loading">
        <StateDot :status="0" />{{ metaRequest.data?.title }}
      </Header>
    </Section>
    <Section spacer="half">
      <TextScroller class="stats">
        <span v-for="stat in metaRequest.data?.statistics" :key="stat.title">
          {{ stat.title }} <span class="value">{{ stat.body }}</span>
        </span>
      </TextScroller>
    </Section>
    <Section>
      <Description :loading="metaRequest.loading">
        <div class="description-html" v-dompurify-html="metaRequest.data?.description" />
      </Description>
    </Section>
    <HR />
    <Section>
      <OverviewUpdateUi />
    </Section>
    <HR />
    <Section>
      <OverviewStreaming />
    </Section>
    <HR />
    <Section>
      <OverviewRelated />
    </Section>
    <HR />
    <Section>
      <OverviewCharacters />
    </Section>
    <HR />
    <Section>
      <OverviewReviews />
    </Section>
    <HR />
    <Section>
      <OverviewRecommendations />
    </Section>
    <HR />
    <Section>
      <OverviewInfo />
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Path, pathToUrl } from '../../utils/slugs';
import { getOverview } from '../../_provider/metaDataFactory';
import { createRequest } from '../utils/reactive';
import OverviewImage from '../components/overview/overview-image.vue';
import Section from '../components/section.vue';
import Header from '../components/header.vue';
import StateDot from '../components/state-dot.vue';
import Description from '../components/description.vue';
import TextScroller from '../components/text-scroller.vue';
import OverviewUpdateUi from '../components/overview/overview-update-ui.vue';
import OverviewStreaming from '../components/overview/overview-streaming.vue';
import OverviewCharacters from '../components/overview/overview-characters.vue';
import OverviewReviews from '../components/overview/overview-reviews.vue';
import OverviewInfo from '../components/overview/overview-info.vue';
import OverviewRecommendations from '../components/overview/overview-recommendations.vue';
import OverviewRelated from '../components/overview/overview-related.vue';
import HR from '../components/hr.vue';

const route = useRoute();

const url = computed(() => (route.params.slug ? pathToUrl(route.params as Path) : ''));

const parameters = ref({
  url,
  type: route.params.type as 'anime' | 'manga',
});

const metaRequest = createRequest(parameters, async param => {
  const ov = await getOverview(param.value.url, param.value.type).init();
  return ov.getMeta();
});
</script>

<style lang="less" scoped>
.overview {
  .image {
    height: 200px;
  }

  .stats {
    color: var(--cl-light-text);
    display: flex;
    gap: 20px;
    .value {
      font-weight: bold;
    }
  }
  .description-html {
    white-space: pre-line;
    :deep(br + br + br) {
      display: none;
    }
  }
}
</style>
