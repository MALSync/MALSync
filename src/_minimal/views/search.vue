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
    <Section v-if="!listRequest.loading && !listRequest.error">
      <Grid :key="listTheme.name" :min-width="listTheme.width">
        <TransitionStaggered :delay-duration="listTheme.transition">
          <component
            :is="listTheme.component"
            v-for="item in listRequest.data"
            :key="item.id"
            :item="formatItem(item)"
          />
        </TransitionStaggered>
      </Grid>
    </Section>
    <ErrorSearch :list-request="listRequest" />
    <Section v-if="listRequest.loading" class="spinner-wrap"><Spinner /></Section>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setStateContent } from '../utils/state';
import { createRequest } from '../utils/reactive';
import { miniMALSearch } from '../../utils/Search';
import FormSwitch from '../components/form/form-switch.vue';
import Section from '../components/section.vue';
import Spinner from '../components/spinner.vue';
import Grid from '../components/grid.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { searchFormats } from '../utils/bookmarks';
import { searchResult } from '../../_provider/definitions';
import { bookmarkItem } from '../minimalClass';
import ErrorSearch from '../components/error/error-search.vue';

const route = useRoute();
const router = useRouter();
const result = ref(route.query.s ? route.query.s.toString() : '');
const type = ref(route.params.type.toString() as 'anime' | 'manga');
const parameters = ref({ result, type });

const listRequest = createRequest<typeof parameters.value>(parameters, async param => {
  if (!param.value.result) return [];
  return miniMALSearch(param.value.result, param.value.type);
});

watch(
  () => route.params.type,
  value => {
    if (route.name === 'Search') type.value = value.toString() as 'anime' | 'manga';
  },
);

watch(type, newValue => {
  router.replace({
    name: 'Search',
    params: { type: newValue },
    query: { s: route.query.s },
  });
  setStateContent(newValue as 'anime' | 'manga');
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
    status: item.list ? item.list.status : 0,
    score: item.list ? item.list.score : item.score,
    watchedEp: item.list ? item.list.episode : 0,
    totalEp: 0,
  };
};
</script>

<style lang="less" scoped>
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
</style>
