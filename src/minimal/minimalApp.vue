<template>
  <div id="material" style="height: 100%;" :class="{ 'pop-over': !navigation, [getTheme(options)]: true }">
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs mdl-shadow--2dp">
      <header class="mdl-layout__header" style="min-height: 0;">
        <button
          v-show="backbutton"
          id="backbutton"
          class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button"
          style="display: none;"
          @click="backbuttonClick()"
        >
          <i class="material-icons">arrow_back</i>
        </button>
        <div class="mdl-layout__header-row">
          <button
            id="book"
            :style="backbuttonBookStyle"
            class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button"
            style=""
            @click="bookClick()"
          >
            <i class="material-icons md-48 bookIcon">{{ bookIcon }}</i>
          </button>
          <div
            id="SearchButton"
            :style="backbuttonSearchStyle"
            :class="{ 'is-dirty': currentTab == tabs.search.title }"
            class="mdl-textfield mdl-js-textfield mdl-textfield--expandable"
            style="margin-left: -57px; margin-top: 3px; padding-left: 40px;"
          >
            <label class="mdl-button mdl-js-button mdl-button--icon" for="headMalSearch">
              <i class="material-icons">search</i>
            </label>
            <div class="mdl-textfield__expandable-holder">
              <input
                id="headMalSearch"
                v-model="keyword"
                class="mdl-textfield__input"
                type="text"
                @keyup="keywordSet()"
              />
              <label class="mdl-textfield__label" for="headMalSearch"></label>
            </div>
          </div>
          <button
            id="material-fullscreen"
            class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button"
            style="left: initial; right: 40px;"
          >
            <i class="material-icons md-48">fullscreen</i>
          </button>
          <button
            id="close-info-popup"
            class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button"
            style="left: initial; right: 0;"
          >
            <i class="material-icons close">close</i>
          </button>
        </div>
        <!-- Tabs -->
        <div class="mdl-layout__tab-bar mdl-js-ripple-effect">
          <a
            :class="{ 'is-active': currentTab == tabs.overview.title }"
            class="mdl-layout__tab"
            @click="selectTab(tabs.overview.title)"
            >{{ lang('minimalApp_Overview') }}</a
          >
          <a
            v-show="showReviewAndRecom"
            :class="{ 'is-active': currentTab == tabs.reviews.title }"
            class="mdl-layout__tab reviewsTab"
            @click="selectTab(tabs.reviews.title)"
            >{{ lang('minimalApp_Reviews') }}</a
          >
          <a
            v-show="showReviewAndRecom"
            :class="{ 'is-active': currentTab == tabs.recommendations.title }"
            class="mdl-layout__tab recommendationTab"
            @click="selectTab(tabs.recommendations.title)"
            >{{ lang('minimalApp_Recommendations') }}</a
          >
          <a
            :class="{ 'is-active': currentTab == tabs.settings.title }"
            class="mdl-layout__tab settingsTab"
            @click="selectTab(tabs.settings.title)"
            >{{ lang('minimalApp_Settings') }}</a
          >
        </div>
      </header>
      <main class="mdl-layout__content" style="height: 100%;">
        <section
          id="fixed-tab-1"
          :class="{ 'is-active': currentTab == tabs.overview.title }"
          class="mdl-layout__tab-panel"
        >
          <overviewVue :render-obj="renderObj" />
        </section>
        <section
          id="fixed-tab-2"
          :class="{ 'is-active': currentTab == tabs.reviews.title }"
          class="mdl-layout__tab-panel"
        >
          <reviewsVue :url="renderMalUrl" :state="currentTab == tabs.reviews.title" />
        </section>
        <section
          id="fixed-tab-3"
          :class="{ 'is-active': currentTab == tabs.recommendations.title }"
          class="mdl-layout__tab-panel"
        >
          <recommendationsVue :url="renderMalUrl" :state="currentTab == tabs.recommendations.title" />
        </section>
        <section id="fixed-tab-4" :class="{ 'is-active': popOver }" class="mdl-layout__tab-panel">
          <keepAlive :max="1">
            <bookmarksVue
              v-if="currentTab == tabs.bookmarks.title"
              :state="tabs.bookmarks.state"
              :list-type="tabs.bookmarks.type"
              :sort="tabs.bookmarks.sort"
              @rewatch="tabs.bookmarks.supportsRewatch = $event"
              @sort="tabs.bookmarks.sort = $event"
            >
              <template #default="{sorting}">
                <div id="malList" class="mdl-grid" style="justify-content: space-around;">
                  <select
                    id="userListType"
                    v-model="tabs.bookmarks.type"
                    name="myinfo_score"
                    class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col"
                    style="outline: none; background-color: white; border: none;"
                  >
                    <option value="anime">{{ lang('Anime') }}</option>
                    <option value="manga">{{ lang('Manga') }}</option>
                  </select>
                  <div class="mdl-cell mdl-cell--12-col" style="display: flex;">
                    <select
                      id="userListState"
                      v-model="tabs.bookmarks.state"
                      name="myinfo_score"
                      class="inputtext mdl-textfield__input"
                      style="outline: none; background-color: white; border: none; flex: 1; width: auto;"
                    >
                      <option :value="7">{{ lang('All') }}</option>
                      <option :value="1" selected>{{ lang('UI_Status_watching_' + tabs.bookmarks.type) }}</option>
                      <option :value="2">{{ lang('UI_Status_Completed') }}</option>
                      <option :value="3">{{ lang('UI_Status_OnHold') }}</option>
                      <option :value="4">{{ lang('UI_Status_Dropped') }}</option>
                      <option :value="6">{{ lang('UI_Status_planTo_' + tabs.bookmarks.type) }}</option>
                      <option v-if="tabs.bookmarks.supportsRewatch" :value="23">{{
                        lang(`UI_Status_Rewatching_${tabs.bookmarks.type}`)
                      }}</option>
                    </select>
                    <div
                      v-if="tabs.bookmarks.state === 6"
                      style="padding: 0 5px; margin-left: 10px; display: flex; cursor: pointer;"
                      class="bg-cell"
                      @click="openRandom(6, tabs.bookmarks.type)"
                    >
                      <i class="material-icons" style="position: relative; top: 2px;">shuffle</i>
                    </div>
                    <div
                      style="padding: 0 5px; margin-left: 10px; display: flex; cursor: pointer;"
                      class="bg-cell"
                      @click="listView = !listView"
                    >
                      <i v-if="!listView" class="material-icons" style="position: relative; top: 2px;">view_list</i>
                      <i v-else class="material-icons" style="position: relative; top: 2px;">view_module</i>
                    </div>

                    <div
                      v-show="sorting && sorting.length && sorting.length > 1"
                      id="demo-menu-lower-left"
                      style="padding: 0 5px; margin-left: 10px; display: flex; cursor: pointer;"
                      class="bg-cell"
                    >
                      <i v-if="tabs.bookmarks.sort" class="material-icons">{{ tabs.bookmarks.sort.icon }}</i>
                    </div>
                    <div>
                      <ul
                        v-if="tabs.bookmarks.sort"
                        class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect"
                        for="demo-menu-lower-left"
                      >
                        <li
                          v-for="sort in sorting"
                          :key="sort.value"
                          class="mdl-menu__item"
                          :class="{
                            active:
                              sort.value === tabs.bookmarks.sort.value ||
                              (sort.child && sort.child.value === tabs.bookmarks.sort.value),
                          }"
                          @click="
                            sort.child && sort.value === tabs.bookmarks.sort.value
                              ? (tabs.bookmarks.sort = sort.child)
                              : (tabs.bookmarks.sort = sort)
                          "
                        >
                          <template
                            v-if="
                              sort.child &&
                                (sort.value === tabs.bookmarks.sort.value ||
                                  sort.child.value === tabs.bookmarks.sort.value)
                            "
                          >
                            <i
                              v-if="sort.value === tabs.bookmarks.sort.value"
                              class="material-icons"
                              style="vertical-align: sub; margin-right: 10px;"
                              >arrow_downward</i
                            >
                            <i v-else class="material-icons" style="vertical-align: sub; margin-right: 10px;"
                              >arrow_upward</i
                            >
                          </template>
                          <i v-else class="material-icons" style="vertical-align: sub; margin-right: 10px;">{{
                            sort.icon
                          }}</i>

                          {{ sort.title }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </template>
            </bookmarksVue>
          </keepAlive>
          <searchVue
            v-if="currentTab == tabs.search.title"
            :keyword="tabs.search.keyword"
            :type="tabs.search.type"
            @clicked="searchClick"
          >
            <div class="mdl-grid" style="justify-content: space-around;">
              <select
                id="userListType"
                v-model="tabs.search.type"
                name="myinfo_score"
                class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col"
                style="outline: none; background-color: white; border: none;"
              >
                <option value="anime">{{ lang('Anime') }}</option>
                <option value="manga">{{ lang('Manga') }}</option>
              </select>
            </div>
          </searchVue>
          <updateCheckVue v-if="currentTab == tabs.updateCheck.title" />
          <listSyncVue v-if="currentTab == tabs.listSync.title" :list-type="tabs.listSync.type">
            <select
              v-model="tabs.listSync.type"
              style="margin-bottom: 20px;"
              class="typeSelect-updateCheck"
              @change="rebuildListSync()"
            >
              <option value="anime">{{ lang('Anime') }}</option>
              <option value="manga">{{ lang('Manga') }}</option>
            </select>
          </listSyncVue>
          <cleanTagsVue v-if="currentTab == tabs.cleanTags.title" />
          <allSitesVue v-if="currentTab == tabs.allSites.title" />
          <customDomainsVue v-if="currentTab == tabs.customDomains.title" />
          <quicklinksEdit v-if="currentTab == tabs.quicklinks.title" />
        </section>
        <section
          id="fixed-tab-5"
          :class="{ 'is-active': currentTab == tabs.settings.title }"
          class="mdl-layout__tab-panel"
        >
          <div id="malConfig" class="page-content malClear">
            <settingsVue :page="page" />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script type="text/javascript">
import settingsVue from './minimalApp/settings.vue';
import overviewVue from './minimalApp/overview.vue';
import recommendationsVue from './minimalApp/recommendations.vue';
import bookmarksVue from './minimalApp/bookmarks.vue';
import searchVue from './minimalApp/search.vue';
import updateCheckVue from './minimalApp/updateCheck.vue';
import listSyncVue from './minimalApp/listSync/listSync.vue';
import cleanTagsVue from './minimalApp/cleanTags/cleanTags.vue';
import allSitesVue from './minimalApp/allSites.vue';
import reviewsVue from './minimalApp/reviews.vue';
import customDomainsVue from './minimalApp/customDomains.vue';
import quicklinksEdit from './minimalApp/components/quicklinksEdit.vue';
import { getSingle } from '../_provider/singleFactory';
import { getList } from '../_provider/listFactory';

let timer;
let ignoreCurrentTab = true;
let ignoreNullBase = false;
const STORAGE_KEY = 'VUE-MAL-SYNC';
const scrollHandler = {};
let scrollHandlerArray = [];
const randomListCache = { anime: [], manga: [] };
const popupStorage = {
  fetch() {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return state;
  },
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
};

export default {
  components: {
    overviewVue,
    recommendationsVue,
    reviewsVue,
    bookmarksVue,
    searchVue,
    updateCheckVue,
    listSyncVue,
    cleanTagsVue,
    allSitesVue,
    customDomainsVue,
    quicklinksEdit,
    settingsVue,
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
        sort: null,
        supportsRewatch: false,
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
      },
      listSync: {
        title: 'listSync',
        scroll: 0,
        type: 'anime',
      },
      cleanTags: {
        title: 'cleanTags',
        scroll: 0,
      },
      allSites: {
        title: 'allSites',
        scroll: 0,
      },
      customDomains: {
        title: 'customDomains',
        scroll: 0,
      },
      quicklinks: {
        title: 'quicklinks',
        scroll: 0,
      },
    },
    keyword: '',
    currentTab: 'settings',
    renderUrl: '',
    renderObj: null,
    history: [],
    baseFallback: '',
    page: null,
    options: api.settings.options,
  }),
  computed: {
    base() {
      if (this.page) {
        if (this.page.singleObj) return this.page.singleObj.getUrl();
        // eslint-disable-next-line
        this.renderUrl = '';
        return '';
      }
      return this.baseFallback;
    },
    renderMalUrl() {
      if (this.renderObj !== null) {
        return this.renderObj.getMalUrl();
      }
      return null;
    },
    showReviewAndRecom() {
      if (this.renderMalUrl === null && this.renderObj !== null) return false;
      return true;
    },
    utils() {
      return utils;
    },
    backbutton() {
      if (this.history.length > 0) return true;
      return false;
    },
    backbuttonSearchStyle() {
      if (this.backbutton) {
        return { 'margin-left': '-17px' };
      }
      return { 'margin-left': '-57px' };
    },
    backbuttonBookStyle() {
      if (this.backbutton) {
        return { left: '40px' };
      }
      return { left: '0px' };
    },
    popOver() {
      if (this.currentTab === this.tabs.bookmarks.title) {
        return true;
      }
      if (this.currentTab === this.tabs.search.title) {
        return true;
      }
      if (this.currentTab === this.tabs.updateCheck.title) {
        return true;
      }
      if (this.currentTab === this.tabs.listSync.title) {
        return true;
      }
      if (this.currentTab === this.tabs.cleanTags.title) {
        return true;
      }
      if (this.currentTab === this.tabs.allSites.title) {
        return true;
      }
      if (this.currentTab === this.tabs.customDomains.title) {
        return true;
      }
      if (this.currentTab === this.tabs.quicklinks.title) {
        return true;
      }
      return false;
    },
    navigation() {
      if (this.popOver || this.onlySettings) return false;
      return true;
    },
    onlySettings() {
      if (this.renderUrl !== '') {
        return false;
      }
      return true;
    },
    listView: {
      get() {
        return api.settings.get('bookMarksList');
      },
      set(value) {
        api.settings.set('bookMarksList', value);
      },
    },
    bookIcon() {
      // eslint-disable-next-line
      const minimal = j.$(this.$el);
      if (this.currentTab === 'bookmarks') {
        if (this.onlySettings) {
          return 'settings';
        }
        return 'collections_bookmark';
      }
      return 'book';
    },
  },
  watch: {
    renderUrl(url) {
      this.renderObj = null;
      const tempRenderObj = getSingle(url);

      tempRenderObj
        .update()
        .then(() => {
          this.renderObj = tempRenderObj;
          this.tabs.search.type = this.renderObj.getType();
          this.renderObj.initProgress();
        })
        .catch(e => {
          this.renderObj = tempRenderObj;
          this.renderObj.flashmError(e);
          throw e;
        });
    },
    currentTab(tab, oldtab) {
      this.tabs[oldtab].scroll = this.getScroll();
      this.$nextTick(() => {
        this.setScroll(this.tabs[tab].scroll);
      });

      if (ignoreCurrentTab) {
        ignoreCurrentTab = false;
      } else {
        if (this.currentTab === this.tabs.bookmarks.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.search.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.updateCheck.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.listSync.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.cleanTags.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.allSites.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.customDomains.title) {
          this.history.push(this.getCurrent(oldtab));
        }
        if (this.currentTab === this.tabs.quicklinks.title) {
          this.history.push(this.getCurrent(oldtab));
        }
      }
    },
    keyword(keyword) {
      if (keyword !== '') {
        this.selectTab('search');
      } else {
        this.selectTab('overview');
      }
    },
    base(base, oldBase) {
      if (base !== oldBase) {
        while (this.history.length > 0) {
          this.history.pop();
        }
        this.fill(base, true);
      }
    },
  },
  mounted() {
    if (this.isPopup()) {
      const state = popupStorage.fetch();
      if (typeof state !== 'undefined' && typeof state.currentTab !== 'undefined') {
        ignoreNullBase = true;
        this.setCurrent(state);
      }
    }
    j.$(this.$el)
      .find('.mdl-layout__content')
      .first()
      .scroll(() => {
        if (scrollHandlerArray.length) {
          const pos = {
            pos: this.getScroll(),
            elHeight: j
              .$(this.$el)
              .find('.mdl-layout__content')
              .first()
              .height(),
            height: j
              .$(this.$el)
              .find('.mdl-layout__content > .is-active')
              .first()
              .height(),
          };
          for (const i in scrollHandlerArray) {
            scrollHandlerArray[i](pos);
          }
        }
      });
  },
  updated() {
    if (this.isPopup()) {
      popupStorage.save(this.getCurrent(this.currentTab));
    }
  },
  methods: {
    lang: api.storage.lang,
    getTheme(options) {
      if (options.theme === 'auto') {
        if (!window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      }
      return options.theme;
    },
    selectTab(_selectedTab) {
      let selectedTab = _selectedTab;

      if (
        this.onlySettings &&
        (selectedTab === 'overview' || selectedTab === 'reviews' || selectedTab === 'recommendations')
      )
        selectedTab = 'settings';

      con.log('Tab Changed', selectedTab);

      this.currentTab = selectedTab;
    },
    registerScroll(key, fn) {
      scrollHandler[key] = fn;
      scrollHandlerArray = Object.values(scrollHandler);
    },
    unregisterScroll(key) {
      delete scrollHandler[key];
      scrollHandlerArray = Object.values(scrollHandler);
    },
    getScroll() {
      return j
        .$(this.$el)
        .find('.mdl-layout__content')
        .first()
        .scrollTop();
    },
    setScroll(scroll) {
      return j
        .$(this.$el)
        .find('.mdl-layout__content')
        .first()
        .scrollTop(scroll);
    },
    isPopup() {
      if (j.$('#Mal-Sync-Popup').length) return true;
      return false;
    },
    fill(url, isBase = false) {
      con.log('fill', url);
      // eslint-disable-next-line
      const minimal = j.$(this.$el);
      if (url === null) {
        if (this.isPopup()) {
          this.selectTab('bookmarks');
        }
        return false;
      }
      if (
        /^https:\/\/myanimelist.net\/(anime|manga)\/\d+/i.test(url) ||
        /^https:\/\/kitsu.io\/(anime|manga)\/.+/i.test(url) ||
        /^https:\/\/anilist.co\/(anime|manga)\/\d+/i.test(url) ||
        /^https:\/\/simkl.com\/(anime|manga)\/\d+/i.test(url) ||
        /^local:\/\//i.test(url)
      ) {
        if (!isBase) {
          this.tabs[this.currentTab].scroll = this.getScroll();
          this.history.push(this.getCurrent(this.currentTab));
        }
        this.renderUrl = url;
        this.currentTab = 'overview';
        return true;
      }
      if (this.isPopup()) {
        this.selectTab('bookmarks');
      }
      return false;
    },
    urlClick(_url) {
      let url = _url;

      if (!/^local:\/\//i.test(url)) url = utils.absoluteLink(url, 'https://myanimelist.net');

      if (!this.fill(url)) {
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          // eslint-disable-next-line no-alert
          alert(api.storage.lang('minimalClass_Popup'));
        }
      }
    },
    fillBase(url) {
      con.log('Fill Base', url, this.history);
      if (!(ignoreNullBase && url === null)) {
        this.baseFallback = url;
      }
      if (url === '') {
        this.renderUrl = url;
      }
    },
    setPage(page) {
      this.page = page;
      if (typeof this.page.singleObj === 'undefined') {
        this.$set(this.page, 'singleObj', undefined);
      }
    },
    backbuttonClick() {
      con.log('History', this.history);
      if (this.history.length > 0) {
        this.setCurrent(this.history.pop());
      }
    },
    bookClick() {
      // eslint-disable-next-line
      const minimal = j.$(this.$el);
      if (this.bookIcon !== 'book') {
        this.selectTab('overview');
      } else {
        if (this.renderObj) this.tabs.bookmarks.type = this.renderObj.getType();
        this.selectTab('bookmarks');
      }
    },
    keywordSet() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.tabs.search.keyword = this.keyword;
      }, 300);
    },
    getCurrent(tab, url = this.renderUrl) {
      return {
        renderUrl: url,
        currentTab: tab,
        tabData: j.$.extend(true, {}, this.tabs[tab]),
      };
    },
    setCurrent(historyElement) {
      con.log('Set Current', historyElement);
      if (typeof historyElement.tabData.keyword !== 'undefined') {
        this.keyword = historyElement.tabData.keyword;
      }
      this.tabs[historyElement.currentTab] = historyElement.tabData;
      this.renderUrl = historyElement.renderUrl;
      if (this.currentTab !== historyElement.currentTab) {
        ignoreCurrentTab = true;
      }
      this.currentTab = historyElement.currentTab;
    },
    rebuildListSync() {
      this.currentTab = '';

      this.$nextTick(() => {
        this.currentTab = 'listSync';
      });
    },
    searchClick(item) {
      this.urlClick(item.url);
    },
    openLink(url) {
      const link = document.createElement('a');
      link.href = url;
      document.getElementById('malList').appendChild(link);
      link.click();
    },
    async openRandom(status, type) {
      if (!randomListCache[type].length) {
        utils.flashm('Loading');
        const listProvider = await getList(status, type);
        await listProvider
          .getCompleteList()
          .then(async list => {
            randomListCache[type] = list;
          })
          .catch(e => {
            con.error(e);
          });
      }
      if (randomListCache[type].length > 1) {
        this.openLink(randomListCache[type][Math.floor(Math.random() * randomListCache[type].length)].url);
      } else {
        utils.flashm('List is too small!');
      }
    },
  },
};
</script>
