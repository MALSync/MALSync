<template>
  <div id="material" style="height: 100%;" v-bind:class="{ 'pop-over': !navigation }">
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
      <header class="mdl-layout__header" style="min-height: 0;">
        <button @click="backbuttonClick()" v-show="backbutton" class="mdl-layout__drawer-button" id="backbutton" style="display: none;"><i class="material-icons">arrow_back</i></button>
        <div class="mdl-layout__header-row">
          <button :style="backbuttonBookStyle" @click="bookClick()" class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="book" style="">
            <i class="material-icons md-48 bookIcon">{{bookIcon}}</i>
          </button>
          <div :style="backbuttonSearchStyle" v-bind:class="{ 'is-dirty': currentTab == tabs.search.title }" class="mdl-textfield mdl-js-textfield mdl-textfield--expandable" id="SearchButton" style="margin-left: -57px; margin-top: 3px; padding-left: 40px;">
            <label class="mdl-button mdl-js-button mdl-button--icon" for="headMalSearch">
              <i class="material-icons">search</i>
            </label>
            <div class="mdl-textfield__expandable-holder">
              <input v-on:keyup="keywordSet()" v-model="keyword" class="mdl-textfield__input" type="text" id="headMalSearch">
              <label class="mdl-textfield__label" for="headMalSearch"></label>
            </div>
          </div>
          <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="material-fullscreen" style="left: initial; right: 40px;">
            <i class="material-icons md-48">fullscreen</i>
          </button>
          <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="close-info-popup" style="left: initial; right: 0;">
            <i class="material-icons close">close</i>
          </button>
        </div>
        <!-- Tabs -->
        <div class="mdl-layout__tab-bar mdl-js-ripple-effect">

          <a v-bind:class="{ 'is-active': currentTab == tabs.overview.title }" @click="selectTab(tabs.overview.title)" class="mdl-layout__tab">Overview</a>
          <a v-bind:class="{ 'is-active': currentTab == tabs.reviews.title }" @click="selectTab(tabs.reviews.title)" class="mdl-layout__tab reviewsTab">Reviews</a>
          <a v-bind:class="{ 'is-active': currentTab == tabs.recommendations.title }" @click="selectTab(tabs.recommendations.title)" class="mdl-layout__tab recommendationTab">Recommendations</a>
          <a v-bind:class="{ 'is-active': currentTab == tabs.settings.title }" @click="selectTab(tabs.settings.title)" class="mdl-layout__tab settingsTab">Settings</a>
        </div>
      </header>
      <main class="mdl-layout__content" data-simplebar style="height:  100%;">
        <section v-bind:class="{ 'is-active': currentTab == tabs.overview.title }" class="mdl-layout__tab-panel" id="fixed-tab-1">
          <overviewVue :url="renderUrl"/>
        </section>
        <section v-bind:class="{ 'is-active': currentTab == tabs.reviews.title }" class="mdl-layout__tab-panel" id="fixed-tab-2">
          <reviewsVue :url="renderUrl" :state="currentTab == tabs.reviews.title"/>
        </section>
        <section v-bind:class="{ 'is-active': currentTab == tabs.recommendations.title }" class="mdl-layout__tab-panel" id="fixed-tab-3">
          <recommendationsVue :url="renderUrl" :state="currentTab == tabs.recommendations.title"/>
        </section>
        <section v-bind:class="{ 'is-active': popOver }" class="mdl-layout__tab-panel" id="fixed-tab-4">
          <keep-alive>
          <bookmarksVue v-if="currentTab == tabs.bookmarks.title" :state="tabs.bookmarks.state" :listType="tabs.bookmarks.type">
            <div class="mdl-grid" id="malList" style="justify-content: space-around;">
              <select v-model="tabs.bookmarks.type" name="myinfo_score" id="userListType" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">
                <option value="anime">Anime</option>
                <option value="manga">Manga</option>
              </select>
              <select v-model="tabs.bookmarks.state" name="myinfo_score" id="userListState" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">
                <option value="7">All</option>
                <option value="1" selected >{{utils.watching(tabs.bookmarks.type)}}</option>
                <option value="2">Completed</option>
                <option value="3">On-Hold</option>
                <option value="4">Dropped</option>
                <option value="6" >{{utils.planTo(tabs.bookmarks.type)}}</option>
              </select>
            </div>
          </bookmarksVue>
          <searchVue v-if="currentTab == tabs.search.title" :keyword="tabs.search.keyword" :type="tabs.search.type">
            <div class="mdl-grid" style="justify-content: space-around;">
              <select v-model="tabs.search.type" name="myinfo_score" id="userListType" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">
                <option value="anime">Anime</option>
                <option value="manga">Manga</option>
              </select>
            </div>
          </searchVue>
        </keep-alive>
        <updateCheckVue v-if="currentTab == tabs.updateCheck.title" />
        </section>
        <section v-bind:class="{ 'is-active': currentTab == tabs.settings.title }" class="mdl-layout__tab-panel" id="fixed-tab-5">
          <div class="page-content malClear" id="malConfig">
            <settingsVue :page="page"/>
          </div>
        </section></main>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import settingsVue from './minimalApp/settings.vue'
  import overviewVue from './minimalApp/overview.vue'
  import recommendationsVue from './minimalApp/recommendations.vue'
  import bookmarksVue from './minimalApp/bookmarks.vue'
  import searchVue from './minimalApp/search.vue'
  import updateCheckVue from './minimalApp/updateCheck.vue'
  import reviewsVue from './minimalApp/reviews.vue'

  var timer;
  var ignoreCurrentTab = true;
  var ignoreNullBase = false;
  var STORAGE_KEY = 'VUE-MAL-SYNC';
  var popupStorage = {
    fetch: function () {
      var state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return state;
    },
    save: function (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  export default {
    components: {
      overviewVue,
      recommendationsVue,
      reviewsVue,
      bookmarksVue,
      searchVue,
      updateCheckVue,
      settingsVue
    },
    data: () => ({
      tabs: {
        overview: {
          title: 'overview',
          scroll: 0,
        },
        reviews: {
          title: 'reviews',
          scroll: 0,
        },
        recommendations: {
          title: 'recommendations',
          scroll: 0,
        },
        settings: {
          title: 'settings',
          scroll: 0,
        },
        bookmarks: {
          title: 'bookmarks',
          scroll: 0,
          state: 1,
          type: 'anime',
        },
        search: {
          title: 'search',
          scroll: 0,
          type: 'anime',
          keyword: '',
        },
        updateCheck: {
          title: 'updateCheck',
          scroll: 0,
        }
      },
      keyword: '',
      currentTab: 'settings',
      renderUrl: '',
      history: [],
      baseFallback: '',
      page: null,
    }),
    computed: {
      base: function(){
        if(this.page){
          if(this.page.malObj) return this.page.malObj.url;
          this.renderUrl = '';
          return '';
        }
        return this.baseFallback;
      },
      utils: function(){
        return utils;
      },
      backbutton: function(){
        if(this.history.length > 0) return true;
        return false;
      },
      backbuttonSearchStyle: function(){
        if(this.backbutton){
          return {'margin-left': '-17px'};
        }
        return {'margin-left': '-57px'};
      },
      backbuttonBookStyle: function(){
        if(this.backbutton){
          return {'left': '40px'};
        }
        return {'left': '0px'};
      },
      popOver: function(){
        if(this.currentTab == this.tabs['bookmarks'].title){
          return true;
        }
        if(this.currentTab == this.tabs['search'].title){
          return true;
        }
        if(this.currentTab == this.tabs['updateCheck'].title){
          return true;
        }
        return false;
      },
      navigation: function(){
        if(this.popOver || this.onlySettings) return false;
        return true;
      },
      onlySettings: function(){
        if(this.renderUrl !== ''){
          return false;
        }
        return true;
      },
      bookIcon: function(){
        var minimal = j.$(this.$el);
        if(this.currentTab === 'bookmarks'){
          if(this.onlySettings){
            return 'settings';
          }
          return 'collections_bookmark';
        }
        return 'book';
      }
    },
    mounted: function(){
      if(this.isPopup()){
        var state = popupStorage.fetch();
        if(typeof state !== 'undefined' && typeof state.currentTab !== 'undefined' ){
          ignoreNullBase = true;
          this.setCurrent(state);
        }
      }
    },
    updated: function(){
      if(this.isPopup()){
        popupStorage.save(this.getCurrent(this.currentTab));
      }
    },
    watch: {
      renderUrl: function(url, oldUrl){
      },
      currentTab: function(tab, oldtab){
        this.tabs[oldtab].scroll = this.getScroll();
        this.$nextTick(() => {
          this.setScroll(this.tabs[tab].scroll);
        });

        if(ignoreCurrentTab){
          ignoreCurrentTab = false;
        }else{
          if(this.currentTab === this.tabs['bookmarks'].title){
            this.history.push(this.getCurrent(oldtab));
          }
          if(this.currentTab === this.tabs['search'].title){
            this.history.push(this.getCurrent(oldtab));
          }
          if(this.currentTab === this.tabs['updateCheck'].title){
            this.history.push(this.getCurrent(oldtab));
          }
        }

      },
      keyword: function(keyword){
        if(keyword !== ''){
          this.selectTab('search');
        }else{
          this.selectTab('overview');
        }
      },
      base: function(base, oldBase){
        if(base !== oldBase){
          while(this.history.length > 0) {
              this.history.pop();
          }
          this.fill(base, true);
        }
      }
    },
    methods: {
      selectTab(selectedTab) {
        if(this.onlySettings && (selectedTab === 'overview' || selectedTab === 'reviews' || selectedTab === 'recommendations')) selectedTab = 'settings';
        con.log('Tab Changed', selectedTab);
        this.currentTab = selectedTab;
      },
      getScroll(){
        return j.$(this.$el).find('.simplebar-scroll-content').first().scrollTop();
      },
      setScroll(scroll){
        return j.$(this.$el).find('.simplebar-scroll-content').first().scrollTop(scroll);
      },
      isPopup(){
        if(j.$('#Mal-Sync-Popup').length) return true;
        return false;
      },
      fill(url, isBase = false){
        var minimal = j.$(this.$el);
        if(url == null){
          if(this.isPopup()){
            this.selectTab('bookmarks');
          }
          return false;
        }
        if(/^https:\/\/myanimelist.net\/(anime|manga)\//i.test(url)){
          if(!isBase){
            this.history.push(this.getCurrent(this.currentTab));
          }
          this.renderUrl = url;
          this.currentTab = 'overview';
          return true;
        }
        if(this.isPopup()){
          this.selectTab('bookmarks');
        }
        return false;
      },
      fillBase(url){
        con.log('Fill Base', url, this.history);
        if(!(ignoreNullBase && url === null)){
          this.baseFallback = url;
        }
        if(url === ''){
          this.renderUrl = url;
        }

      },
      setPage(page){
        this.page = page;
        if(typeof this.page.malObj == 'undefined'){
          this.$set(this.page, 'malObj', undefined);
        }
      },
      backbuttonClick(){
        con.log('History', this.history);
        if(this.history.length > 0){
          this.setCurrent(this.history.pop())
        }
      },
      bookClick(){
        var minimal = j.$(this.$el);
        if(this.bookIcon !== 'book'){
          this.selectTab('overview');
        }else{
          this.selectTab('bookmarks');
        }
      },
      keywordSet(){
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.tabs.search.keyword = this.keyword;
        }, 300);
      },
      getCurrent(tab, url = this.renderUrl){
        return {
          renderUrl: url,
          currentTab: tab,
          tabData: $.extend(true,{},this.tabs[tab]),
        }
      },
      setCurrent(historyElement){
        con.log('Set Current', historyElement);
        if(typeof historyElement.tabData.keyword !== 'undefined'){
          this.keyword = historyElement.tabData.keyword;
        }
        this.tabs[historyElement.currentTab] = historyElement.tabData;
        this.renderUrl = historyElement.renderUrl;
        if(this.currentTab !== historyElement.currentTab){
          ignoreCurrentTab = true;
        }
        this.currentTab = historyElement.currentTab;

      }
    }
  }
</script>
