<template>
  <div class="bookmarks">
    <Section class="controls">
      <FormSwitch
        v-model="parameters.type"
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
      <MediaStatusDropdown v-model="parameters.state" />
    </Section>

    <Section v-if="!listRequest.loading">
      <Grid :min-width="listTheme.width">
        <TransitionStaggered>
          <component
            :is="listTheme.component"
            v-for="item in listRequest.data"
            :key="item.id"
            :item="formatItem(item)"
          />
        </TransitionStaggered>
      </Grid>
    </Section>
    <Section v-if="listRequest.loading" class="spinner-wrap"><Spinner /></Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Spinner from '../components/spinner.vue';
import FormSwitch from '../components/form/form-switch.vue';
import { setStateContent } from '../utils/state';
import Section from '../components/section.vue';
import { createRequest } from '../utils/reactive';
import { getList } from '../../_provider/listFactory';
import BookmarksCards from '../components/bookmarks/bookmarks-cards.vue';
import Grid from '../components/grid.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { bookmarkItem } from '../minimalClass';
import { listElement } from '../../_provider/listAbstract';
import MediaStatusDropdown from '../components/media/media-status-dropdown.vue';

const route = useRoute();
const router = useRouter();
const parameters = ref({
  state: 1,
  type: route.params.type as 'anime' | 'manga',
});

watch(
  () => route.params.type,
  value => {
    if (route.name === 'Bookmarks') parameters.value.type = value as 'anime' | 'manga';
  },
);
watch(
  () => parameters.value.type,
  value => {
    router.push({ name: 'Bookmarks', params: { type: value } });
    setStateContent(value);
  },
);

const listRequest = createRequest<typeof parameters.value>(parameters, async param => {
  const listProvider = await getList(param.value.state, param.value.type);

  listProvider.modes.initProgress = true;
  listProvider.initFrontendMode();
  await listProvider.getNextPage();

  return computed(() => {
    return listProvider.getTemplist();
  });
});

const listTheme = {
  component: BookmarksCards,
  width: 350,
  transition: 0,
};

const formatItem = (item: listElement): bookmarkItem => {
  const resItem = item as bookmarkItem;
  if (item.options) {
    const overview = item.options.u;
    const resumeUrlObj = item.options.r;
    const continueUrlObj = item.options.c;

    if (continueUrlObj && continueUrlObj.ep === item.watchedEp + 1) {
      resItem.streamUrl = continueUrlObj.url;
    } else if (resumeUrlObj && resumeUrlObj.ep === item.watchedEp) {
      resItem.streamUrl = resumeUrlObj.url;
    } else if (overview) {
      resItem.streamUrl = overview;
    }

    if (resItem.streamUrl) {
      resItem.streamIcon = utils.favicon(resItem.streamUrl.split('/')[2]);
    }
    console.log(resItem.streamUrl);
  }
  if (item.fn.progress && item.fn.progress.isAiring()) {
    resItem.progressText = item.fn.progress.getAuto();
    resItem.progressEp = item.fn.progress.getCurrentEpisode();
  }
  return resItem;
};
</script>

<style lang="less" scoped>
.bookmarks {
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
