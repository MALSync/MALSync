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
      <div style="flex-grow: 1"></div>
      <FormDropdown v-model="theme" :options="options" align-items="left">
        <template #select="slotProps">
          <span class="material-icons">{{ slotProps.value }}</span>
        </template>
        <template #option="slotProps">
          <span class="material-icons">{{ slotProps.option.value }}</span>
        </template>
      </FormDropdown>
    </Section>

    <Section v-if="!listRequest.loading">
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
import BookmarksCardsFull from '../components/bookmarks/bookmarks-cards-full.vue';
import BookmarksList from '../components/bookmarks/bookmarks-list.vue';
import BookmarksTiles from '../components/bookmarks/bookmarks-tiles.vue';
import Grid from '../components/grid.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { bookmarkItem } from '../minimalClass';
import { listElement } from '../../_provider/listAbstract';
import MediaStatusDropdown from '../components/media/media-status-dropdown.vue';
import FormDropdown from '../components/form/form-dropdown.vue';

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
  }
  if (item.fn.progress && item.fn.progress.isAiring()) {
    resItem.progressText = item.fn.progress.getAuto();
    resItem.progressEp = item.fn.progress.getCurrentEpisode();
  }
  return resItem;
};

const formats = [
  {
    name: 'Cards',
    icon: 'view_agenda',
    component: BookmarksCards,
    width: 350,
    transition: 20,
  },
  {
    name: 'Full Cards',
    icon: 'view_module',
    component: BookmarksCardsFull,
    width: 191,
    transition: 20,
  },
  {
    name: 'List',
    icon: 'view_list',
    component: BookmarksList,
    width: 0,
    transition: 30,
  },
  {
    name: 'Tiles',
    icon: 'apps',
    component: BookmarksTiles,
    width: 130,
    transition: 15,
  },
];

const options = formats.map(format => ({
  value: format.icon,
  title: format.name,
}));

const theme = computed({
  get() {
    return api.settings.get('bookMarksList');
  },
  set(value) {
    api.settings.set('bookMarksList', value);
  },
});

const listTheme = computed(() => {
  const f = formats.find(format => format.icon === theme.value);

  if (!f) {
    return formats[0];
  }

  return f;
});
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
