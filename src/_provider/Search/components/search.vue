<template>
  <div class="search">

    <div class="input">
      <div class="group">
        <input type="text" v-model="searchKeyword" @focus="inputFocus()" required>
        <span class="bar"></span>
        <label>{{lang("correction_Search")}}</label>
      </div>
    </div>

    <div class="loadingBar" >
      <div v-show="loading" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%;">
        <div class="progressbar bar bar1" style="width: 0%;"></div>
        <div class="bufferbar bar bar2" style="width: 100%;"></div>
        <div class="auxbar bar bar3" style="width: 0%;"></div>
      </div>
    </div>

    <div class="results" v-if="searchKeyword">
      <a class="result" href="" style="cursor: pointer;" @click="clickItem($event, '')">
        <div class="image"></div>
        <div class="right">
          <span class="title">{{lang("correction_NoEntry")}}</span>
          <p>{{lang("correction_NoMal")}}</p>
        </div>
      </a>
      <a v-for="item in items" :key="item.id" class="result" :href="item.url" @click="clickItem($event, item)">
        <div class="image"><img :src="item.image"></img></div>
        <div class="right">
          <span class="title">{{item.name}}</span>
          <p>{{lang("search_Type")}} {{item.media_type}}</p>
          <p>{{lang("search_Score")}} {{item.score}}</p>
          <p>{{lang("search_Year")}} {{item.year}}</p>
        </div>
      </a>

    </div>
  </div>
</template>

<script type="text/javascript">
  import {search}  from "./../../../provider/provider";
  var searchTimeout;
  export default {
    components: {
    },
    data: function(){
      return {
        items: [],
        loading: false,
        searchKeyword: ''
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
      syncMode: {
        type: Boolean,
        default: false
      },
    },
    mounted: function(){
      if(this.syncMode) {
        this.searchKeyword = this.keyword;
        this.load();
      }
    },
    watch: {
      keyword: function(type){
        this.searchKeyword = this.keyword;
        this.load();
      },
      searchKeyword: function(type){
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.load();
        }, 200)

      },
      type: function(type){
        this.load();
      }
    },
    methods: {
      lang: api.storage.lang,
      load: function(){
        if(this.searchKeyword) {
          this.loading = true;

          search(this.searchKeyword, this.type).then((items) => {
            this.loading = false;
            this.items = items;
          })
        }

      },
      inputFocus: function() {
        if(!this.searchKeyword) {
          this.searchKeyword = this.keyword;
        }
      },
      clickItem: async function(e, item){
        e.preventDefault();
        if(!item) {
          this.$emit('clicked', '');
          return;
        }
        var url = await item.malUrl();
        if(url) {
          this.$emit('clicked', url);
        }else{
          this.$emit('clicked', item.url);
        }
      }
    }
  }
</script>
