<template>
  <div>
    <div v-show="loading" id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">
      <span v-if="!loading && !items.length" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">No Entries</span></span>
      <div v-for="item in items" :key="item.id">
        <bookmarksItem :item="item"/>
      </div>

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
      listType: {
        type: String,
        default: 'anime'
      },
      state: {
        type: Number,
        default: 1
      },
    },
    mounted: function(){
      this.loading = true;
      provider.userList(this.state, this.listType, {
        fullListCallback: async (list) => {
          this.loading = false;
          this.items = list;
        }
      });
    },
    updated: function(){
      utils.lazyload(j.$(this.$el));
    },
    methods: {
    }
  }
</script>
