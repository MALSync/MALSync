<template>
  <div :class="{ stopLoading: !metaRequest.loading }">
    <Header :spacer="true">{{ lang('minimalApp_Recommendations') }}</Header>
    <Card
      v-if="
        metaRequest.loading ||
        (!metaRequest.loading && !parameters.load && !metaRequest.cache && !recommendations.length)
      "
      class="grid-sp"
    >
      <div class="loading-placeholder">
        <ImageText href="" image="" :loading="true">
          <div />
          <Header class="skeleton-text">
            <MediaLink href=""></MediaLink>
          </Header>
          <div class="skeleton-text"></div>
          <div />
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
      :class="{ 'grid-sp': data[0].body && !metaRequest.cache }"
    >
      <Pagination v-if="data[0].body" :entries-per-page="3" :elements="data">
        <template #elements="{ elements }">
          <Section v-for="(rec, index) in elements" :key="rec.entry.url">
            <HR v-if="index" size="thin" />
            <ImageText :href="rec.entry.url" :image="rec.entry.image">
              <div />
              <Header>
                <MediaLink :href="rec.entry.url">
                  <div class="head-dot">
                    <StateDot class="dot" :status="rec.entry.list ? rec.entry.list.status : 0" />
                    {{ rec.entry.title }}
                  </div>
                </MediaLink>
              </Header>
              <div>
                <MediaLink :href="rec.body.more.url">
                  <TextIcon icon="open_in_new" position="after" spacer="small">
                    Recommended by
                    <strong>
                      <MediaLink :href="rec.user.href">{{ rec.user.name }}</MediaLink>
                    </strong>
                    <template v-if="rec.body.more.number">
                      and <strong>{{ rec.body.more.number }}</strong> more users
                    </template>
                  </TextIcon>
                </MediaLink>
              </div>
              <div />
            </ImageText>
            <div class="text">
              <Description :height="150">{{ rec.body.text }}</Description>
            </div>
          </Section>
        </template>
      </Pagination>
      <Pagination
        v-else
        :entries-per-page="breakpoint === 'desktop' ? 6 : 4"
        :elements="data"
        :open-all="true"
      >
        <template #elements="{ elements }">
          <Section>
            <Grid :min-width-popup="100" :min-width="130">
              <MediaLink
                v-for="rec in elements"
                :key="rec.entry.title"
                class="rec"
                :href="rec.entry.url"
              >
                <div class="rec-cover">
                  <ImageFit mode="cover" :src="rec.entry.image" />
                  <PillSplit v-if="rec.stats" class="users" :left="false">
                    <template #right>
                      <TextIcon icon="people" position="before" spacer="small">
                        {{ rec.stats.users }}
                      </TextIcon>
                    </template>
                  </PillSplit>
                </div>
                <div>
                  <div class="rec-name">
                    <TextCutoff>{{ rec.entry.title }}</TextCutoff>
                  </div>
                </div>
              </MediaLink>
            </Grid>
          </Section>
        </template>
      </Pagination>
    </div>
    <Section v-if="!metaRequest.loading && data && !data.length">
      <Empty :card="true" icon="egg_alt" />
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, PropType, inject } from 'vue';
import { createRequest } from '../../utils/reactive';
import Header from '../header.vue';
import { recommendationsMeta } from './overview-recommendations-meta';
import MediaLink from '../media-link.vue';
import Description from '../description.vue';
import Section from '../section.vue';
import FormButton from '../form/form-button.vue';
import Pagination from '../pagination.vue';
import ImageText from '../image-text.vue';
import HR from '../hr.vue';
import Empty from '../empty.vue';
import Card from '../card.vue';
import TextIcon from '../text-icon.vue';
import StateDot from '../state-dot.vue';
import ImageFit from '../image-fit.vue';
import Grid from '../grid.vue';
import TextCutoff from '../text-cutoff.vue';
import { Recommendation } from '../../../_provider/metaOverviewAbstract';
import PillSplit from '../pill-split.vue';

const breakpoint = inject('breakpoint');

const props = defineProps({
  recommendations: {
    type: Array as PropType<Recommendation[]>,
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

const metaRequest = createRequest(parameters, params => recommendationsMeta(params.value.url), {
  executeCondition: params => params.value.load && params.value.url,
  cache: {
    prefix: 'overview-recommendations',
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
  props.recommendations && props.recommendations.length ? props.recommendations : metaRequest.data,
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.text {
  white-space: pre-line;
}

.grid-sp {
  padding: 10px !important;
}

.text {
  margin-top: @spacer;
}

.head-dot {
  display: flex;
  align-items: center;
}

.rec-cover {
  .click-move-down();

  position: relative;

  .users {
    position: absolute;
    top: var(--size-spacer-half);
    left: var(--size-spacer-half);
  }
}
.rec-name {
  font-weight: bold;
  margin-top: 10px;
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
