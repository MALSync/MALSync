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
        :type="parameters.type"
        :rewatching="
          listRequest.data ? listRequest.data?.seperateRewatching : parameters.state === 23
        "
      />
      <FormButton padding="pill" @click="refresh()">
        <div class="material-icons m-pill" :title="lang('updateCheck_Refresh')">refresh</div>
      </FormButton>
      <FormButton
        v-if="parameters.state === 6 || parameters.state === 3"
        padding="pill"
        @click="openRandom(parameters.state, parameters.type)"
      >
        <div class="material-icons m-pill" title="random">shuffle</div>
      </FormButton>
      <div style="flex-grow: 1"></div>
      <FormDropdown
        v-if="sortingOptions && sortingOptions.length"
        v-model="sort"
        :options="sortingOptions"
        align-items="left"
        :compare-func="(el, picked) => el.toString() === picked.toString().replace('_asc', '')"
      >
        <template #select="slotProps">
          <div class="select-icon">
            <span
              v-if="slotProps.meta.asc"
              class="material-icons"
              @click.stop="
                sort.endsWith('_asc') ? (sort = sort.replace('_asc', '')) : (sort = sort + '_asc')
              "
            >
              {{ !sort.endsWith('_asc') ? 'arrow_downward' : 'arrow_upward' }}
            </span>
            <span class="material-icons">{{ slotProps.meta.icon || 'filter_list' }}</span>
          </div>
        </template>
        <template #option="slotProps">
          <TextIcon :icon="slotProps.option.meta.icon"> {{ slotProps.option.title }}</TextIcon>
        </template>
      </FormDropdown>
      <span v-else class="material-icons sortPlaceholder">filter_list</span>
      <FormDropdown
        v-model="theme"
        :options="options"
        align-items="left"
        direction="row"
        size="small"
      >
        <template #select>
          <span class="material-icons select-icon">{{ listTheme.icon }}</span>
        </template>
        <template #option="slotProps">
          <span class="material-icons select-icon">{{ slotProps.option.value }}</span>
        </template>
      </FormDropdown>
    </Section>

    <template v-if="!listRequest.error">
      <Section
        v-if="list"
        spacer="double"
        class="grid"
        :class="{ cached: cacheList.length && listRequest.loading }"
      >
        <Grid
          :key="listTheme.name"
          :min-width="listTheme.width"
          :min-width-popup="listTheme.popupWidth"
          class="grid-el"
          :class="`type-${listTheme.name.replace(' ', '-').toLowerCase()}`"
        >
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
      <Section v-if="!listRequest.loading && list && !list.length" class="spinner-wrap">
        <Empty />
      </Section>
      <Section v-if="listRequest.loading" class="spinner-wrap"><Spinner /></Section>
      <transition :duration="100">
        <Section
          v-if="!listRequest.loading && listRequest.data && !listRequest.data!.isDone()"
          class="spinner-wrap"
        >
          <Spinner />
        </Section>
      </transition>
    </template>

    <ErrorBookmarks :list-request="listRequest" />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
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
import Empty from '../components/empty.vue';
import TextIcon from '../components/text-icon.vue';
import FormButton from '../components/form/form-button.vue';
import { urlToSlug } from '../../utils/slugs';
import { localStore } from '../../utils/localStore';

const rootWindow = inject('rootWindow') as Window;
const rootDocument = inject('rootDocument') as Document;

const router = useRouter();

const props = defineProps({
  type: {
    type: String as PropType<'anime' | 'manga'>,
    default: 'anime',
  },
  state: {
    type: String,
    default: '2',
  },
});

const parameters = ref({
  state: Number(props.state),
  type: props.type as 'anime' | 'manga',
});
const cacheList = ref([] as listElement[]);

watch(
  () => props.type,
  value => {
    parameters.value.type = value as 'anime' | 'manga';
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
  () => props.state,
  value => {
    parameters.value.state = Number(value);
    if (value) setStateContext(Number(value));
  },
);
watch(
  () => parameters.value.state,
  value => {
    router.push({ name: 'Bookmarks', params: { state: Number(value) } });
  },
);

const getSort = sortingOptions => {
  const curSort = localStore.getItem(`sort/${parameters.value.type}/${parameters.value.state}`);
  if (curSort && sortingOptions.find(el => el.value === curSort.replace('_asc', '')))
    return curSort;
  return 'default';
};

const listRequest = createRequest(parameters, async param => {
  cacheList.value = [];
  const listProvider = await getList(param.value.state, param.value.type);

  listProvider.setSort(getSort(listProvider.getSortingOptions()));

  listProvider.modes.cached = true;
  listProvider.getCached().then(list => {
    cacheList.value = list;
  });

  listProvider.modes.initProgress = true;
  listProvider.initFrontendMode();

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
    resItem.progress = item.fn.progress;
  }
  return resItem;
};

const options = bookmarkFormats.map(format => ({
  value: format.icon,
  title: format.name,
}));

const theme = computed({
  get() {
    return api.settings.get(`bookMarksList${props.type === 'manga' ? 'Manga' : ''}`);
  },
  set(value) {
    api.settings.set(`bookMarksList${props.type === 'manga' ? 'Manga' : ''}`, value);
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
  if (
    rootWindow.pageYOffset + rootWindow.innerHeight >
    rootDocument.documentElement.scrollHeight - 600
  ) {
    loadNext();
  }
};

watch(
  () => listRequest.data,
  () => handleScroll(),
);

onActivated(() => {
  rootWindow.addEventListener('scroll', handleScroll);
});

onDeactivated(() => {
  rootWindow.removeEventListener('scroll', handleScroll);
});

onMounted(() => {
  rootWindow.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  rootWindow.removeEventListener('scroll', handleScroll);
});

const sortingOptions = computed(() => {
  const temp = listRequest.data ? listRequest.data.getSortingOptions(true) : [];

  return temp.map(option => ({
    value: option.value,
    title: option.title,
    meta: {
      icon: option.icon,
      asc: option.asc,
    },
  }));
});

const sort = computed({
  get() {
    return getSort(sortingOptions.value);
  },
  set(value) {
    localStore.setItem(`sort/${parameters.value.type}/${parameters.value.state}`, value);
    listRequest.execute();
  },
});

const randomListCache = {};
async function openRandom(status, type) {
  const cacheKey = `${status}-${type}`;
  if (typeof randomListCache[cacheKey] === 'undefined' || !randomListCache[cacheKey].length) {
    utils.flashm('Loading');
    const listProvider = await getList(status, type);
    await listProvider
      .getCompleteList()
      .then(async res => {
        randomListCache[cacheKey] = res;
      })
      .catch(e => {
        con.error(e);
      });
  }
  if (typeof randomListCache[cacheKey] !== 'undefined' && randomListCache[cacheKey].length > 1) {
    const currentUrl =
      randomListCache[cacheKey][Math.floor(Math.random() * randomListCache[cacheKey].length)].url;
    const slugObj = urlToSlug(currentUrl);
    router.push({ name: 'Overview', params: slugObj.path });
  } else {
    utils.flashm('List is too small!');
  }
}

function refresh() {
  listRequest.execute();
}
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
  gap: @spacer-half;
  flex-wrap: wrap;
  min-height: 30px;
}

.grid {
  transition:
    filter @normal-transition,
    opacity @normal-transition;
  &.cached {
    opacity: 0.4;
    filter: grayscale(1);
    transition: none;
  }

  .grid-el {
    &.type-tiles {
      gap: 20px;
      .__breakpoint-popup__({
        gap: @spacer;
      });
    }
  }
}

.sortPlaceholder {
  padding-top: 3px;
  pointer-events: not-allowed;
}

.select-icon {
  display: flex;
}

.__breakpoint-popup__({
  .m-pill {
    font-size: 20px;
  }
});
</style>
