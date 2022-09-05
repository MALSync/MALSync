<template>
  <div class="overview">
    <Section class="image-section fake" />
    <Section class="image-section real">
      <OverviewImage
        class="image"
        :src="metaRequest.data?.imageLarge || singleRequest.data?.getImage() || ''"
        :loading="metaRequest.loading"
      />
    </Section>
    <div class="header-section">
      <Section spacer="half">
        <Header :loading="metaRequest.loading" class="header-block">
          <div class="statusDotSection">
            <StateDot
              class="dot"
              :status="
                !singleRequest.loading && singleRequest.data?.getStatus()
                  ? singleRequest.data?.getStatus()
                  : 0
              "
            />
            <MediaLink
              :force-link="true"
              :href="singleRequest.data?.getDisplayUrl() || ''"
              class="header-link"
            >
              <span class="material-icons">open_in_new</span>
            </MediaLink>
          </div>
          <span>{{ metaRequest.data?.title || singleRequest.data?.getTitle() || '' }}</span>
        </Header>
      </Section>
      <Section v-if="metaRequest.data?.statistics?.length" spacer="half">
        <TextScroller class="stats">
          <span v-for="stat in metaRequest.data!.statistics" :key="stat.title" class="stats-block">
            {{ stat.title }} <span class="value">{{ stat.body }}</span>
          </span>
        </TextScroller>
      </Section>
      <Section class="description-section">
        <Description :loading="totalLoading">
          <div
            v-dompurify-html="cleanDescription"
            class="description-html"
            :class="{ preLine: !cleanDescription.includes('<br') }"
          />
        </Description>
      </Section>
    </div>
    <HR class="header-split" />
    <Section class="update-section">
      <OverviewUpdateUi
        :single="singleRequest.data"
        :loading="totalLoading || singleRequest.loading"
        :type="route.params.type as 'anime'"
      />
    </Section>
    <HR />
    <Section class="stream-section">
      <OverviewStreaming
        :type="route.params.type as 'anime'"
        :cache-key="singleRequest.data && !totalLoading ? singleRequest.data!.getCacheKey() : null"
        :title="singleRequest.data ? singleRequest.data!.getTitle() : ''"
        :alternative-title="metaRequest.data?.alternativeTitle"
      />
    </Section>
    <HR v-if="!totalLoading" />
    <Section :loading="totalLoading" class="additional-content" spacer="none">
      <template v-if="metaRequest.data?.related?.length">
        <Section>
          <OverviewRelated :related="metaRequest.data!.related" />
        </Section>
        <HR />
      </template>
      <template v-if="metaRequest.data?.characters?.length">
        <Section>
          <OverviewCharacters :characters="metaRequest.data!.characters" />
        </Section>
        <HR />
      </template>
      <template v-if="singleRequest.data?.getMalUrl()">
        <Section>
          <OverviewReviews :mal-url="singleRequest.data!.getMalUrl()!" />
        </Section>
        <HR />
      </template>
      <template v-if="singleRequest.data?.getMalUrl()">
        <Section>
          <OverviewRecommendations :mal-url="singleRequest.data!.getMalUrl()!" />
        </Section>
      </template>
    </Section>
    <HR />
    <Section class="info-section" :loading="totalLoading">
      <OverviewInfo :info="metaRequest.data!.info" />
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
import { NotFoundError, UrlNotSupportedError } from '../../_provider/Errors';
import { getSingle } from '../../_provider/singleFactory';
import MediaLink from '../components/media-link.vue';

const route = useRoute();
const router = useRouter();

const open404 = () => {
  router.push({
    name: 'NotFound',
    params: { pathMatch: route.path.substring(1).split('/') },
    query: route.query,
    hash: route.hash,
  });
};

const url = computed(() => {
  try {
    return route.params.slug ? pathToUrl(route.params as Path) : '';
  } catch (error) {
    con.error(error);
    open404();
  }
  return '';
});

const parameters = ref({
  url,
  type: route.params.type as 'anime' | 'manga',
});

const metaRequest = createRequest(parameters, async param => {
  if (!param.value.url) return null;
  const ov = await getOverview(param.value.url, param.value.type).init();
  return ov.getMeta();
});

const singleRequest = createRequest(parameters, async param => {
  if (!param.value.url) return null;
  const single = getSingle(param.value.url);
  await single.update();

  return single;
});

watch(
  () => metaRequest.error,
  error => {
    if (error instanceof UrlNotSupportedError || error instanceof NotFoundError) {
      open404();
    }
  },
);

watch(
  () => singleRequest.error,
  error => {
    if (error instanceof UrlNotSupportedError || error instanceof NotFoundError) {
      open404();
    }
  },
);

const cleanDescription = computed(() => {
  if (!metaRequest.data) return '';
  const { description } = metaRequest.data;
  if (!description) return '';
  return description.replace(/(< *\/? *br *\/? *>(\r|\n| )*){2,}/gim, '<br /><br />');
});

const totalLoading = computed(() => {
  if (!metaRequest.loading) return false;
  return metaRequest.loading || singleRequest.loading;
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

    .statusDotSection {
      width: 32px;
      height: 30px;
      display: flex;
      align-items: center;
    }

    .header-link {
      display: none;
      margin-right: 0.5em;
      color: var(--cl-secondary);
    }

    &:hover {
      .dot {
        display: none;
      }
      .header-link {
        display: flex;
        position: relative;
        left: -3px;
      }
    }
  }

  .description-html {
    &.preLine {
      white-space: pre-line;
    }
  }

  .fake {
    display: none;
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
      grid-column-start: 1;

      &.fake {
        display: block;
        overflow: hidden;
        visibility: hidden;
        aspect-ratio: @aspect-ratio-cover;
      }

      &.real {
        height: 0;
      }
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
