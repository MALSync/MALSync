<template>
  <div>
    <div v-show="loading" id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: fixed; z-index: 30; max-width: 1377px; margin-left: auto; margin-right: auto;"><div class="progressbar bar bar1" style="width: 0%;"></div><div class="bufferbar bar bar2" style="width: 100%;"></div><div class="auxbar bar bar3" style="width: 0%;"></div></div>
    <slot></slot>
    <span v-if="!loading && !items.length && !errorText" class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">{{lang("NoEntries")}}</span></span>
    <div class="mdl-grid" id="malList" style="justify-content: space-around;">
      <template v-for="item in items">
        <bookmarksItem :item="item" :ref="item.uid" :key="item.uid"/>
      </template>

      <div v-for="n in 10" class="listPlaceholder mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid "  style="cursor: pointer; height: 250px; padding: 0; width: 210px; height: 0px; margin-top:0; margin-bottom:0; visibility: hidden;"></div>

    </div>
    <span v-if="errorText" class="mdl-chip" style="margin: 16px auto 70px auto; display: table; padding-right: 5px; border: 2px solid red;" @click="(!loading) ? load() : ''">
      <span class="mdl-chip__text" v-html="errorText"></span>
      <button type="button" class="mdl-chip__action"><i class="material-icons">autorenew</i></button>
    </span>
  </div>
</template>

<script type="text/javascript">
  import {getList} from "./../../_provider/listFactory";
  import bookmarksItem from './bookmarksItem.vue';

  var timer;

  var cb;

  export default {
    components: {
      bookmarksItem,
    },
    data: function(){
      return {
        items: [],
        loading: true,
        errorText: null,
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
      this.$parent.registerScroll('books', this.handleScroll);
    },
    deactivated: function(){
      this.$parent.unregisterScroll('books');
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
      lang: api.storage.lang,
      load: async function(){
        this.loading = true;
        this.errorText = null;
        cb = undefined;
        var listProvider = await getList(this.state, this.listType);

        var listError = (e) => {
          con.error(e);
          this.errorText = listProvider.errorMessage(e);
          this.loading = false;
        }

        listProvider.modes.cached = true;

        listProvider.getCached().then((list) => {
          this.items = list;
        });

        if(this.state !== 1 && this.state !== '1') {
          listProvider.callbacks = {continueCall: (list) => {
            this.loading = false;
            this.items = list;
            if(!listProvider.isDone()) {
              return new Promise((resolve) => {cb = () => {resolve();};});
            }
          }}
          listProvider.get().catch(listError);

        }else{
          listProvider.modes.sortAiring = true;
          listProvider.get().then((list) => {
            this.loading = false;
            this.items = list;
          }).catch(listError);
        }

      },
      handleScroll: function(pos){
        if( (pos.pos + pos.elHeight + 1000) > pos.height){
          if(typeof cb !== 'undefined'){
            this.loading = true;
            cb();
            cb = undefined;
          }
        }
      },

    }
  }
</script>
