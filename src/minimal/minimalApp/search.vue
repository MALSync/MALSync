<template>
  <div>
    <div
      v-show="loading"
      id="loadMalSearchPop"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute"
    ></div>
    <slot></slot>
    <div class="mdl-grid">
      <span
        v-if="(!loading && !items.length) || error"
        class="mdl-chip"
        style="margin: auto; margin-top: 16px; display: table"
      >
        <span v-if="error" class="mdl-chip__text">{{ error.message }}</span>
        <span v-else class="mdl-chip__text">{{ lang('NoEntries') }}</span>
      </span>

      <a
        v-for="item in items"
        :key="item.id"
        class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem nojs"
        :class="{ onList: item.list }"
        :href="item.url"
        style="cursor: pointer"
        @click="clickItem($event, item)"
      >
        <img
          :src="item.image"
          style="margin: -8px 0 -8px -8px; height: 100px; width: 64px; background-color: grey"
        />
        <div
          style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0"
          class="mdl-cell"
        >
          <span style="font-size: 20px; font-weight: 400; line-height: 1">{{ item.name }}</span>
          <template v-if="item.list">
            <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px">
              {{ lang('UI_Status') }} {{ getStatusText(type, item.list.status) }}
            </p>
            <p v-if="item.list.score" style="margin-bottom: 0; line-height: 20px; padding-top: 3px">
              {{ lang('UI_Score') }} {{ item.list.score }}
            </p>
            <p
              v-else-if="item.list.status === 1"
              style="margin-bottom: 0; line-height: 20px; padding-top: 3px"
            >
              {{ episodeText(type) }} {{ item.list.episode }}
            </p>
          </template>
          <template v-else>
            <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px">
              {{ lang('search_Type') }} {{ item.media_type }}
            </p>
            <p v-if="item.score" style="margin-bottom: 0; line-height: 20px">
              {{ lang('search_Score') }} {{ item.score }}
            </p>
            <p v-if="item.year" style="margin-bottom: 0; line-height: 20px">
              {{ lang('search_Year') }} {{ item.year }}
            </p>
          </template>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { miniMALSearch } from '../../utils/Search';

export default {
  components: {},
  props: {
    type: {
      type: String,
      default: 'anime',
    },
    keyword: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      items: [],
      loading: true,
      error: null,
    };
  },
  watch: {
    keyword() {
      this.load();
    },
    type() {
      this.load();
    },
  },
  mounted() {
    this.load();
  },
  activated() {
    this.$nextTick(() => {
      j.$(this.$el).closest('html').find('head').click();
    });
  },
  methods: {
    lang: api.storage.lang,
    getStatusText: utils.getStatusText,
    episodeText: utils.episode,
    load() {
      this.loading = true;
      this.error = null;

      miniMALSearch(this.keyword, this.type)
        .then(items => {
          this.loading = false;
          this.items = items;
        })
        .catch(e => {
          this.loading = false;
          this.error = e;
          this.items = [];
        });
    },
    clickItem(e, item) {
      e.preventDefault();
      this.$emit('clicked', item);
    },
  },
};
</script>
