<template>
  <div>
    <div v-show="loading" id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <slot></slot>
    <span v-if="!loading && !items.length" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">No Entries</span></span>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">
      <template v-for="item in items">
        <bookmarksItem :item="item" :ref="item.uid" :key="item.uid"/>
      </template>

      <div v-for="n in 10" class="listPlaceholder mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid "  style="cursor: pointer; height: 250px; padding: 0; width: 210px; height: 0px; margin-top:0; margin-bottom:0; visibility: hidden;"></div>

    </div>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  import bookmarksItem from './bookmarksItem.vue';

  var timer;

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
      this.$nextTick(() => {
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
          }
        });
      },
      sortByPrediction: function(){
        if(this.state !== 1 && this.state !== '1') return;

        clearTimeout(timer);
        timer = setTimeout(() => {
          var This = this;

          var normalItems = [];
          var preItems = [];
          var watchedItems = [];
          this.items.forEach((item) => {
            var vue = this.$refs[item.uid][0];
            if(vue.prediction && vue.prediction.prediction){
              if(item.watchedEp < vue.prediction.tagEpisode){
                preItems.push(item);
              }else{
                watchedItems.push(item);
              }
            }else{
              normalItems.push(item);
            }
          });

          preItems = preItems.sort(sortItems).reverse();
          watchedItems = watchedItems.sort(sortItems);

          this.items = preItems.concat(watchedItems, normalItems);

          function sortItems(a,b) {
            var vueA = This.$refs[a.id][0];
            var vueB = This.$refs[b.id][0];
            var preA = 99999999;
            var preB = preA;

            if(vueA.prediction && vueA.prediction.prediction){
              preA = (vueA.prediction.prediction.diffDays * 1440)
                    + (vueA.prediction.prediction.diffHours * 60)
                    + vueA.prediction.prediction.diffMinutes;
            }
            if(vueB.prediction && vueB.prediction.prediction){
              preB = (vueB.prediction.prediction.diffDays * 1440)
                    + (vueB.prediction.prediction.diffHours * 60)
                    + vueB.prediction.prediction.diffMinutes;
            }

            return preA - preB;
          }

          this.$nextTick(() => {
            j.$(this.$el).closest('.mdl-layout__content').first().scroll();
          })
        }, 50);

      }
    }
  }
</script>
