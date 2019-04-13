<template>
  <div>
    <div v-show="loading" id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <slot></slot>
    <div class="mdl-grid">
      <span v-if="!loading && !items.length" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">{{lang("NoEntries")}}</span></span>

      <a v-for="item in items" :key="item.id" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem" :href="item.url" style="cursor: pointer;">
        <img :src="item.image_url" style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;"></img>
        <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
          <span style="font-size: 20px; font-weight: 400; line-height: 1;">{{item.name}}</span>
          <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">{{lang("search_Type")}} {{item.payload.media_type}}</p>
          <p style="margin-bottom: 0; line-height: 20px;">{{lang("search_Score")}} {{item.payload.score}}</p>
          <p style="margin-bottom: 0; line-height: 20px;">{{lang("search_Year")}} {{item.payload.start_year}}</p>
        </div>
      </a>

    </div>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  import bookmarksItem from './bookmarksItem.vue';
  export default {
    components: {
      bookmarksItem,
    },
    data: function(){
      return {
        items: [],
        loading: true,
      }
    },
    props: {
      type: {
        type: String,
        default: 'anime'
      },
      keyword: {
        type: String,
        default: ''
      },
    },
    mounted: function(){
      this.load();
    },
    activated: function(){
      this.$nextTick(() => {
        j.$(this.$el).closest('html').find("head").click();
      })
    },
    watch: {
      keyword: function(type){
        this.load();
      },
      type: function(type){
        this.load();
      }
    },
    methods: {
      lang: api.storage.lang,
      load: function(){
        this.loading = true;
        api.request.xhr('GET', 'https://myanimelist.net/search/prefix.json?type='+this.type+'&keyword='+this.keyword+'&v=1').then((response) => {
          this.loading = false;
          var searchResults = j.$.parseJSON(response.responseText);
          this.items = searchResults.categories[0].items;
        });
      }
    }
  }
</script>
