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
      <MediaStatusDropdown
        v-model="parameters.state"
        :rewatching="listRequest.data ? listRequest.data?.seperateRewatching : false"
      />
      <div style="flex-grow: 1"></div>
      <FormDropdown
        v-model="theme"
        :options="options"
        align-items="left"
        direction="row"
        size="small"
      >
        <template #select>
          <span class="material-icons">{{ listTheme.icon }}</span>
        </template>
        <template #option="slotProps">
          <span class="material-icons">{{ slotProps.option.value }}</span>
        </template>
      </FormDropdown>
    </Section>

    <template v-if="!listRequest.error">
      <Section v-if="!listRequest.loading">
        <Grid :key="listTheme.name" :min-width="listTheme.width">
          <TransitionStaggered :delay-duration="listTheme.transition">
            <component
              :is="listTheme.component"
              v-for="item in listRequest.data.getTemplist()"
              :key="item.id"
              :item="formatItem(item)"
            />
          </TransitionStaggered>
        </Grid>
      </Section>
      <Section v-if="listRequest.loading" class="spinner-wrap"><Spinner /></Section>
      <Section
        v-if="!listRequest.loading && listRequest.data && !listRequest.data.isDone()"
        class="spinner-wrap"
      >
        <Spinner />
      </Section>
    </template>

    <ErrorBookmarks :list-request="listRequest" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Spinner from '../components/spinner.vue';
import FormSwitch from '../components/form/form-switch.vue';
import { setStateContent } from '../utils/state';
import Section from '../components/section.vue';
import { createRequest } from '../utils/reactive';
import { getList } from '../../_provider/listFactory';
import Grid from '../components/grid.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { bookmarkItem } from '../minimalClass';
import { listElement } from '../../_provider/listAbstract';
import MediaStatusDropdown from '../components/media/media-status-dropdown.vue';
import FormDropdown from '../components/form/form-dropdown.vue';
import { bookmarkFormats } from '../utils/bookmarks';
import ErrorBookmarks from '../components/error/error-bookmarks.vue';

const route = useRoute();
const router = useRouter();
const parameters = ref({
  state: Number(route.params.state),
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

watch(
  () => route.params.state,
  value => {
    if (route.name === 'Bookmarks') parameters.value.state = Number(value);
  },
);
watch(
  () => parameters.value.state,
  value => {
    router.push({ name: 'Bookmarks', params: { state: Number(value) } });
  },
);

const listRequest = createRequest(parameters, async param => {
  const listProvider = await getList(param.value.state, param.value.type);

  listProvider.modes.initProgress = true;
  listProvider.initFrontendMode();
  await listProvider.getNextPage().catch(e => {
    throw { e, html: listProvider.errorMessage(e) };
  });

  return listProvider;
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

const options = bookmarkFormats.map(format => ({
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
  const f = bookmarkFormats.find(format => format.icon === theme.value);

  if (!f) {
    return bookmarkFormats[0];
  }

  return f;
});

async function loadNext() {
  if (!listRequest.data || listRequest.data.isLoading()) return;
  await listRequest.data.getNextPage();
}

const handleScroll = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
    loadNext();
  }
};

onActivated(() => {
  window.addEventListener('scroll', handleScroll);
});

onDeactivated(() => {
  window.removeEventListener('scroll', handleScroll);
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
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
