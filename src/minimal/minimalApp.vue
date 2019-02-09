<template>
  <div id="material" style="height: 100%;">
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
      <header class="mdl-layout__header" style="min-height: 0;">
        <button class="mdl-layout__drawer-button" id="backbutton" style="display: none;"><i class="material-icons">arrow_back</i></button>
        <div class="mdl-layout__header-row">
          <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="book" style="">
            <i class="material-icons md-48 bookIcon">book</i>
            <i class="material-icons md-48 settingsIcon" style="display:none;">settings</i>
          </button>
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--expandable" id="SearchButton" style="margin-left: -57px; margin-top: 3px; padding-left: 40px;">
            <label class="mdl-button mdl-js-button mdl-button--icon" for="headMalSearch">
              <i class="material-icons">search</i>
            </label>
            <div class="mdl-textfield__expandable-holder">
              <input class="mdl-textfield__input" type="text" id="headMalSearch">
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
        <section class="mdl-layout__tab-panel" id="fixed-tab-4">
          <div id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
          <div class="page-content malClear" id="malSearchPopInner"></div>
        </section>
        <section v-bind:class="{ 'is-active': currentTab == tabs.settings.title }" class="mdl-layout__tab-panel" id="fixed-tab-5">
          <div class="page-content malClear" id="malConfig">
            <settingsVue/>
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
  import reviewsVue from './minimalApp/reviews.vue'

  export default {
    components: {
      overviewVue,
      recommendationsVue,
      reviewsVue,
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
      },
      currentTab: 'overview',
      renderUrl: '',
    }),
    watch: {
      renderUrl: function(url){
        this.currentTab = 'overview';
      },
      currentTab: function(tab, oldtab){
        this.tabs[oldtab].scroll = this.getScroll();
        this.setScroll(this.tabs[tab].scroll);
      }
    },
    methods: {
      selectTab(selectedTab) {
        con.log('Tab Changed', selectedTab);
        this.currentTab = selectedTab;
      },
      getScroll(){
        return j.$(this.$el).find('.simplebar-scroll-content').first().scrollTop();
      },
      setScroll(scroll){
        return j.$(this.$el).find('.simplebar-scroll-content').first().scrollTop(scroll);
      }
    }
  }
</script>
