<template>
  <div :class="{ stopLoading: !metaRequest.loading }">
    <Header :spacer="true">{{ lang('minimalApp_Recommendations') }}</Header>
    <Card
      v-if="metaRequest.loading || (!metaRequest.loading && !parameters.load && !metaRequest.cache)"
      class="grid"
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
    <div v-if="!metaRequest.loading && metaRequest.data && metaRequest.data.length" class="grid">
      <Pagination :entries-per-page="3" :elements="metaRequest.data">
        <template #elements="{ elements }">
          <Section v-for="(rec, index) in elements" :key="rec.entry.url">
            <HR v-if="index" size="thin" />
            <ImageText :href="rec.entry.url" :image="rec.entry.image">
              <div />
              <Header>
                <MediaLink :href="rec.entry.url">{{ rec.entry.title }}</MediaLink>
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
    </div>
    <Section v-if="!metaRequest.loading && metaRequest.data && !metaRequest.data.length">
      <Empty :card="true" />
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
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

const metaRequest = createRequest(parameters, params => recommendationsMeta(params.value.url), {
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
  },
);
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
  margin-top: @spacer-half;
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
