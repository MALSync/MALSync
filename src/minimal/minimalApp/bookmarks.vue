<template>
  <div>
    <div v-show="loading" id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <slot></slot>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">
      <span v-if="!loading && !items.length" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">No Entries</span></span>
      <div v-for="item in items" :key="item.id">
        <bookmarksItem :item="item" :ref="item.id"/>
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
      this.load();
    },
    activated: function(){
      this.$nextTick(()=>{
      j.$(this.$el).closest('html').find("head").click();
      })
    },
    watch: {
      listType: function(type){
        this.load();
      },
      state: function(state){
        this.load();
      }
    },
    methods: {
      load: function(){
        this.loading = true;
        provider.userList(this.state, this.listType, {
          fullListCallback: async (list) => {
            this.loading = false;
            this.items = list;
            this.$nextTick(()=>{
              utils.lazyload(j.$(this.$el));
            })
          }
        });
      },
      sortByPrediction: function(){
        if(this.state != 1 && this.state != '1') return;

        this.items = this.items.sort((a, b) => {
          var vueA = this.$refs[a.id][0];
          var vueB = this.$refs[b.id][0];
          var preA = 99;
          var preB = 99;

          if(vueA.prediction && vueA.prediction.prediction && vueA.prediction.prediction.diffDays){
            preA = vueA.prediction.prediction.diffDays;
          }
          if(vueB.prediction && vueB.prediction.prediction && vueB.prediction.prediction.diffDays){
            preB = vueB.prediction.prediction.diffDays;
          }

          return preA - preB;
        });

      }
    }
  }
</script>
