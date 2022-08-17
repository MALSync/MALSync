<template>
  <div class="overview">
    <Section class="image-section">
      <OverviewImage
        class="image"
        :src="metaRequest.data?.image || ''"
        :loading="metaRequest.loading"
      />
    </Section>
    <div class="header-section">
      <Section spacer="half">
        <Header :loading="metaRequest.loading" class="header-block">
          <StateDot :status="0" /><span>{{ metaRequest.data?.title }}</span>
        </Header>
      </Section>
      <Section spacer="half">
        <TextScroller class="stats">
          <span class="stats-block" v-for="stat in metaRequest.data?.statistics" :key="stat.title">
            {{ stat.title }} <span class="value">{{ stat.body }}</span>
          </span>
        </TextScroller>
      </Section>
      <Section class="description-section">
        <Description :loading="metaRequest.loading">
          <div class="description-html" v-dompurify-html="metaRequest.data?.description" />
        </Description>
      </Section>
    </div>
    <HR class="header-split" />
    <Section class="update-section">
      <OverviewUpdateUi />
    </Section>
    <HR />
    <Section class="stream-section">
      <OverviewStreaming />
    </Section>
    <HR />
    <div class="additional-content">
      <Section>
        <OverviewRelated :related="metaRequest.data?.related" />
      </Section>
      <HR />
      <Section>
        <OverviewCharacters :characters="metaRequest.data?.characters" />
      </Section>
      <HR />
      <Section>
        <OverviewReviews />
      </Section>
      <HR />
      <Section>
        <OverviewRecommendations />
      </Section>
    </div>
    <HR />
    <Section class="info-section">
      <OverviewInfo :info="metaRequest.data?.info" />
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
  if (!param.value.url) return null;
  const ov = await getOverview(param.value.url, param.value.type).init();
  return ov.getMeta();
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.overview {
  .stats {
    color: var(--cl-light-text);
    .stats-block {
      display: inline-block;
    }
    .value {
      font-weight: bold;
      margin-right: 20px;
    }
  }

  .header-block {
    display: flex;
    align-items: center;
  }

  .description-html {
    white-space: pre-line;
    :deep(br + br + br) {
      display: none;
    }
  }

  .__breakpoint-desktop__( {
    display: grid;
    grid-template-columns: 300px auto;
    grid-template-rows: min-content auto auto auto max-content;
    gap: 0 40px;

    > hr {
      display: none;
    }

    .image-section {
      grid-row-start: 1;
      grid-row-end: 3;
      overflow: hidden;
    }

    .header-section {
      grid-column-start: 2;
      grid-row-start: 1;
      display: flex;
      flex-direction: column;
      .description-section {
        flex-grow: 1;
      }
    }

    .stream-section {
      grid-column-start: 2;
      grid-row-start: 2;
    }

    .header-split {
      display: block;
      grid-column-start: 1;
      grid-column-end: 3;
      grid-row-start: 3;
    }
    .update-section {
      grid-column-start: 1;
      grid-row-start: 4;
    }

    .additional-content {
      grid-column-start: 2;
      grid-row-start: 4;
      grid-row-end: 6;
      overflow: hidden;
    }

    .info-section {
      grid-column-start: 1;
      grid-row-start: 5;
    }

  });
}
</style>
