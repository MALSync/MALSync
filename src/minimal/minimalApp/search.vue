<template>
  <div>
    <div
      v-show="loading"
      id="loadMalSearchPop"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: absolute;"
    ></div>
    <slot></slot>
    <div class="mdl-grid">
      <span v-if="!loading && !items.length" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"
        ><span class="mdl-chip__text">{{ lang('NoEntries') }}</span></span
      >

      <a
        v-for="item in items"
        :key="item.id"
        class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem nojs"
        :href="item.url"
        style="cursor: pointer;"
        @click="clickItem($event, item)"
      >
        <img :src="item.image" style="margin: -8px 0 -8px -8px; height: 100px; width: 64px; background-color: grey;" />
        <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
          <span style="font-size: 20px; font-weight: 400; line-height: 1;">{{ item.name }}</span>
          <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">
            {{ lang('search_Type') }} {{ item.media_type }}
          </p>
          <p style="margin-bottom: 0; line-height: 20px;">{{ lang('search_Score') }} {{ item.score }}</p>
          <p style="margin-bottom: 0; line-height: 20px;">{{ lang('search_Year') }} {{ item.year }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script type="text/javascript">
import { search } from '../../_provider/searchFactory';

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
      j.$(this.$el)
        .closest('html')
        .find('head')
        .click();
    });
  },
  methods: {
    lang: api.storage.lang,
    load() {
      this.loading = true;

      search(this.keyword, this.type).then(items => {
        this.loading = false;
        this.items = items;
      });
    },
    clickItem(e, item) {
      e.preventDefault();
      this.$emit('clicked', item);
    },
  },
};
</script>
