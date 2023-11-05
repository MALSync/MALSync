<template>
  <div class="search">
    <Section v-if="!listRequest.error" class="controls">
      <FormSwitch
        v-model="type"
        :options="[
          {
            value: 'anime',
            title: lang('Anime'),
          },
          {
            value: 'manga',
            title: lang('Manga'),
          },
        ]"
      />
    </Section>
    <Section v-if="listRequest.loading || getTyping()">
      <Spinner />
    </Section>
    <Section v-else-if="listRequest.data && !listRequest.error" spacer="double">
      <Grid
        :key="listTheme.name"
        :min-width="listTheme.width"
        class="grid"
        :class="{ loading: listRequest.loading || getTyping() }"
      >
        <TransitionStaggered :delay-duration="listTheme.transition">
          <component
            :is="listTheme.component"
            v-for="item in listRequest.data!"
            :key="item.id"
            :item="formatItem(item)"
          />
        </TransitionStaggered>
      </Grid>
    </Section>
    <Section
      v-if="!(listRequest.loading || getTyping()) && listRequest.data && !listRequest.data.length"
      class="spinner-wrap"
    >
      <Empty icon="search_off" />
    </Section>
    <ErrorSearch :list-request="listRequest" />
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setTypeContext } from '../utils/state';
import { createRequest } from '../utils/reactive';
import FormSwitch from '../components/form/form-switch.vue';
import Section from '../components/section.vue';
import Spinner from '../components/spinner.vue';
import Grid from '../components/grid.vue';
import Empty from '../components/empty.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { searchFormats } from '../utils/bookmarks';
import { searchResult } from '../../_provider/definitions';
import { bookmarkItem } from '../minimalClass';
import ErrorSearch from '../components/error/error-search.vue';
import { getTyping } from '../components/nav/nav-search-state';
import { miniMALSearch } from '../../_provider/Local/search';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  type: {
    type: String as PropType<'anime' | 'manga'>,
    required: true,
  },
});

const result = ref(route.query.s ? route.query.s.toString() : '');
const type = ref(props.type.toString() as 'anime' | 'manga');
const parameters = ref({ result, type });

const listRequest = createRequest(parameters, async param => {
  if (!param.value.result) return [];
  return miniMALSearch(param.value.result, param.value.type);
});

watch(
  () => props.type,
  value => {
    type.value = value.toString() as 'anime' | 'manga';
  },
);

watch(type, newValue => {
  router.replace({
    name: 'Search',
    params: { type: newValue },
    query: { s: route.query.s },
  });
  setTypeContext(newValue as 'anime' | 'manga');
});

watch(
  () => route.query.s,
  searchTerm => {
    result.value = searchTerm as string;
  },
);

const listTheme = searchFormats[0];

const formatItem = (item: searchResult): bookmarkItem => {
  return {
    title: item.name,
    type: type.value,
    url: item.url,
    image: item.image,
    imageLarge: item.imageLarge,
    imageBanner: item.imageBanner,
    status: item.list ? item.list.status : 0,
    score: item.list ? item.list.score : item.score,
    watchedEp: item.list ? item.list.episode : 0,
    totalEp: item.totalEp || 0,
  };
};
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.search {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.spinner-wrap {
  flex-grow: 1;
  display: flex;
  align-items: center;
}
.controls {
  display: flex;
  gap: 20px;
  height: 30px;
}

.grid {
  transition:
    filter @normal-transition,
    opacity @normal-transition;
  &.loading {
    opacity: 0.4;
    filter: grayscale(1);
    transition: none;
  }
}
</style>
