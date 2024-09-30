<template>
  <div class="search">
    <div class="input">
      <div class="group">
        <input v-model="searchKeyword" type="text" required @focus="inputFocus()" />
        <span class="bar"></span>
        <label>{{ lang('correction_Search') }}</label>
      </div>
    </div>

    <div class="loadingBar">
      <div
        v-show="loading"
        class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
        style="width: 100%"
      >
        <div class="progressbar bar bar1" style="width: 0%"></div>
        <div class="bufferbar bar bar2" style="width: 100%"></div>
        <div class="auxbar bar bar3" style="width: 0%"></div>
      </div>
    </div>

    <div v-if="searchKeyword" class="results">
      <a class="result" href="" style="cursor: pointer" @click="clickItem($event, '')">
        <div class="image"></div>
        <div class="right">
          <span class="title">{{ lang('correction_NoEntry') }}</span>
          <p>{{ lang('correction_NoMal') }}</p>
        </div>
      </a>
      <a
        v-for="item in items"
        :key="item.id"
        class="result"
        :href="item.url"
        :class="{ active: currentId === item.id, onList: item.list }"
        @click="clickItem($event, item)"
      >
        <div class="image"><img :src="item.image" /></div>
        <div class="right">
          <span class="title">{{ item.name }}</span>
          <template v-if="item.list">
            <p>{{ lang('UI_Status') }} {{ getStatusText(type, item.list.status) }}</p>
            <p v-if="item.list.score">{{ lang('UI_Score') }} {{ item.list.score }}</p>
            <p v-else-if="item.list.status === 1">
              {{ episodeText(type) }} {{ item.list.episode }}
            </p>
          </template>
          <template v-else>
            <p v-if="item.media_type">{{ lang('search_Type') }} {{ item.media_type }}</p>
            <p v-if="item.score">{{ lang('search_Score') }} {{ item.score }}</p>
            <p v-if="item.year">{{ lang('search_Year') }} {{ item.year }}</p>
          </template>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { normalSearch } from '../../../utils/Search';
import { searchResult } from '../../definitions';

let searchTimeout;
export default {
  components: {},
  props: {
    type: {
      type: String as PropType<'anime' | 'manga'>,
      default: 'anime',
    },
    keyword: {
      type: String,
      default: '',
    },
    syncMode: {
      type: Boolean,
      default: false,
    },
    currentId: {
      type: Number,
      default: 0,
    },
    options: {
      type: Object,
      default: () => {
        return {
          novel: false,
        };
      },
    },
  },
  data() {
    return {
      items: [] as searchResult[],
      loading: false,
      searchKeyword: '',
    };
  },
  watch: {
    keyword() {
      this.searchKeyword = this.keyword;
      this.load();
    },
    searchKeyword() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.load();
      }, 200);
    },
    type() {
      this.load();
    },
  },
  mounted() {
    if (this.syncMode) {
      this.searchKeyword = this.keyword;
      this.load();
    }
  },
  methods: {
    lang: api.storage.lang,
    getStatusText: utils.getStatusText,
    episodeText: utils.episode,
    load() {
      if (this.searchKeyword) {
        this.loading = true;

        normalSearch(this.searchKeyword, this.type, this.options).then(items => {
          this.loading = false;
          this.items = items;
          this.$nextTick(() => {
            this.$el.scrollIntoView({ behavior: 'smooth' });
          });
        });
      }
    },
    inputFocus() {
      if (!this.searchKeyword) {
        this.searchKeyword = this.keyword;
      }
    },
    async clickItem(e, item) {
      e.preventDefault();
      if (!item) {
        this.$emit('clicked', { url: '', id: 0 });
        return;
      }
      const url = await item.malUrl();
      if (url) {
        this.$emit('clicked', { url, id: item.id });
      } else {
        this.$emit('clicked', { url: item.url, id: item.id });
      }
    },
  },
};
</script>
