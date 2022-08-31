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
      <Section
        v-if="list"
        class="grid"
        :class="{ cached: cacheList.length && listRequest.loading }"
      >
        <Grid :key="listTheme.name" :min-width="listTheme.width">
          <TransitionStaggered :delay-duration="listTheme.transition">
            <component
              :is="listTheme.component"
              v-for="item in list!"
              :key="item.uid"
              :item="formatItem(item as listElement)"
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
import { setStateContext, setTypeContext } from '../utils/state';
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
const cacheList = ref([] as listElement[]);

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
    if (value) setTypeContext(value);
  },
);

watch(
  () => route.params.state,
  value => {
    if (route.name === 'Bookmarks') parameters.value.state = Number(value);
    if (value) setStateContext(Number(value));
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

  listProvider.modes.cached = true;
  listProvider.getCached().then(list => {
    cacheList.value = list;
  });

  await listProvider.getNextPage().catch(e => {
    throw { e, html: listProvider.errorMessage(e) };
  });

  return listProvider;
});

const list = computed(() => {
  if (cacheList.value.length && listRequest.loading) return cacheList.value;
  return listRequest.data && !listRequest.loading ? listRequest.data.getTemplist() : null;
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
@import '../less/_globals.less';
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

.grid {
  transition: filter @normal-transition, opacity @normal-transition;
  &.cached {
    opacity: 0.4;
    filter: grayscale(1);
    transition: none;
  }
}
</style>
