<template>
  <div v-if="!hide" class="overview">
    <Section class="image-section fake" />
    <Section class="image-section real">
      <OverviewImage
        class="image"
        :single="(singleRequest.data as null | SingleAbstract)"
        :src="metaRequest.data?.imageLarge || singleRequest.data?.getImage() || ''"
        :loading="metaRequest.loading"
      />
    </Section>
    <div class="header-section">
      <Section spacer="half">
        <Header
          :loading="metaRequest.loading"
          class="header-block"
          :class="{
            hasTitle:
              metaRequest.data &&
              metaRequest.data.alternativeTitle &&
              metaRequest.data.alternativeTitle.length,
          }"
        >
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
          <span @click="titleModal = true">
            {{ metaRequest.data?.title || singleRequest.data?.getTitle() || '' }}
          </span>
        </Header>
        <Modal
          v-if="
            metaRequest.data &&
            metaRequest.data.alternativeTitle &&
            metaRequest.data.alternativeTitle.length
          "
          v-model="titleModal"
        >
          <div class="alt-titles">
            <div
              v-for="altTitle in [...new Set(metaRequest.data.alternativeTitle)]"
              :key="altTitle"
              class="alt-title"
            >
              {{ altTitle }}
            </div>
          </div>
        </Modal>
      </Section>
      <ErrorMeta :meta-request="metaRequest" />
      <Section v-if="metaRequest.data?.statistics?.length || metaRequest.loading" spacer="half">
        <TextScroller class="stats" :loading="metaRequest.loading">
          <span v-for="stat in metaRequest.data!.statistics" :key="stat.title" class="stats-block">
            {{ stat.title }} <span class="value">{{ stat.body }}</span>
          </span>
        </TextScroller>
      </Section>
      <Section class="description-section">
        <Description
          :loading="totalLoading"
          :height="breakpoint === 'desktop' ? 'dynamic' : 240"
          :fade="breakpoint === 'mobile'"
        >
          <div
            v-dompurify-html="cleanDescription"
            class="description-html"
            :class="{ preLine: !cleanDescription.includes('<br') }"
          />
        </Description>
      </Section>
    </div>
    <HR v-if="breakpoint === 'desktop' || !totalLoading" class="header-split" />
    <Section v-if="breakpoint === 'desktop' || !totalLoading" class="update-section">
      <OverviewUpdateUi
        :single="(singleRequest.data as null | SingleAbstract)"
        :loading="totalLoading || singleRequest.loading"
        :type="props.type"
      />
    </Section>
    <template v-if="breakpoint === 'desktop' || (!totalLoading && !singleRequest.loading)">
      <HR />
      <Section class="stream-section">
        <OverviewStreaming
          :type="props.type as 'anime'"
          :cache-key="singleRequest.data && !totalLoading ? singleRequest.data!.getCacheKey() : ''"
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
        <template
          v-if="metaRequest.data!.reviews && metaRequest.data!.reviews.length || singleRequest.data?.getMalUrl()"
        >
          <Section>
            <OverviewReviews
              :reviews="metaRequest.data!.reviews"
              :mal-url="singleRequest.data ? singleRequest.data!.getMalUrl()! : ''"
            />
          </Section>
          <HR />
        </template>
        <template
          v-if="metaRequest.data!.recommendations && metaRequest.data!.recommendations.length || singleRequest.data?.getMalUrl()"
        >
          <Section>
            <OverviewRecommendations
              :recommendations="metaRequest.data!.recommendations"
              :mal-url="singleRequest.data ? singleRequest.data!.getMalUrl()! : ''"
            />
          </Section>
        </template>
      </Section>
      <HR v-if="metaRequest.data && metaRequest.data!.info.length" />
      <Section
        v-if="metaRequest.data && metaRequest.data!.info.length"
        class="info-section"
        :loading="totalLoading"
      >
        <OverviewInfo
          :info="metaRequest.data!.info"
          :single="(singleRequest.data as null | SingleAbstract)"
        />
      </Section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pathToUrl } from '../../utils/slugs';
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
import Modal from '../components/modal.vue';
import HR from '../components/hr.vue';
import { NotFoundError, UrlNotSupportedError } from '../../_provider/Errors';
import { getSingle } from '../../_provider/singleFactory';
import MediaLink from '../components/media-link.vue';
import { SingleAbstract } from '../../_provider/singleAbstract';
import ErrorMeta from '../components/error/error-meta.vue';

const breakpoint = inject('breakpoint');

const route = useRoute();
const router = useRouter();

const titleModal = ref(false);

const hide = ref(true);
setTimeout(() => {
  hide.value = false;
}, 100);

const open404 = () => {
  router.push({
    name: 'NotFound',
    params: { pathMatch: route.path.substring(1).split('/') },
    query: route.query,
    hash: route.hash,
  });
};

const props = defineProps({
  type: {
    type: String as PropType<'anime' | 'manga'>,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

const url = computed(() => {
  try {
    return props.slug ? pathToUrl(props) : '';
  } catch (error) {
    con.error(error);
    open404();
  }
  return '';
});

const parameters = ref({
  url,
  type: props.type as 'anime' | 'manga',
});

const metaRequest = createRequest(parameters, async param => {
  if (!param.value.url) return null;
  const ov = await getOverview(param.value.url, param.value.type).init();
  return ov.getMeta();
});

const singleRequest = createRequest(parameters, async param => {
  if (!param.value.url) return null;
  const single = reactive(getSingle(param.value.url));
  await single.update().catch(e => {
    con.error(e);
    return single;
  });

  single.initProgress();

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
      font-weight: 600;
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

    &.hasTitle {
      .link();
    }

    &:hover {
      .dot {
        display: none;
      }
      .header-link {
        display: flex;
        position: relative;
        max-width: 16px;
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
    gap: 0 @spacer;

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
      overflow: hidden;

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
      grid-row-end: 7;
    }

    .info-section {
      grid-column-start: 1;
      grid-row-start: 5;
    }

  });
}

.alt-titles {
  .border-radius();

  background-color: var(--cl-foreground-solid);
  color: var(--cl-text);
  padding: 15px 10px;

  .alt-title {
    padding: 5px 15px;
  }
}
</style>
