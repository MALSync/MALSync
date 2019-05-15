<template>
  <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" :style="wrong? 'border: 1px solid red;': ''">
    <div class="mdl-card__title mdl-card--border">
        <h2 class="mdl-card__title-text" v-html="title">

        </h2>
        <a href="https://github.com/lolamtisch/MALSync/wiki/Troubleshooting" style="margin-left: auto;">{{lang("Help")}}</a>
      </div>
      <div class="mdl-list__item">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="number" step="1" id="malOffset" v-model="offset">
          <label class="mdl-textfield__label" for="malOffset">{{lang("correction_Offset")}}</label>
        </div>
        <tooltip direction="left" style="float: right; margin-bottom: -17px;">
          {{lang("correction_Offset_text")}}
        </tooltip>
      </div>
      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malUrlInput" v-model="malUrl">
          <label class="mdl-textfield__label" for="malUrlInput" style="color: rgb(63,81,181); font-size: 12px; top: 4px; visibility: visible;">MyAnimeList<span v-if="options.syncMode !== 'MAL'" style="text-transform: lowercase;">/{{options.syncMode}}</span> Url</label>
        </div>
        <tooltip direction="left" style="float: right; margin-bottom: -17px;">
          {{lang("correction_WrongUrl")}}
        </tooltip>
      </div>

      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <label class="mdl-textfield__label" for="malSearch">
            {{lang("correction_Search")}}
          </label>
          <input v-model="searchKeyword" @focus="searchFocus()"  class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malSearch">
        </div>
        <tooltip direction="left" style="float: right; margin-bottom: -17px;">
          <span v-html="lang('correction_Search_text')"></span>
        </tooltip>
      </div>
      <div class="mdl-list__item" style="min-height: 0; padding-bottom: 0; padding-top: 0;">
        <div class="malResults" id="malSearchResults"></div>
      </div>

      <div class="mdl-list__item">
        <button @click="update()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="malSubmit">{{lang("Update")}}</button>
        <button @click="reset()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" id="malReset" style="margin-left: 5px;">{{lang("Reset")}}</button>
        <button @click="noMal()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" id="malNotOnMal" style="margin-left: 5px; float: right; margin-left: auto;" :title="lang('correction_NoMal')">No MAL</button>
      </div>

      <searchVue :keyword="searchKeyword" :type="searchType" v-show="searchKeyword">
        <div class="mdl-grid" style="justify-content: space-around;">
          <select v-model="searchType" name="myinfo_score" id="userListType" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
          </select>
          <a class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem nojs" href="" style="cursor: pointer;">
            <div style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;"/>
            <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
              <span style="font-size: 20px; font-weight: 400; line-height: 1;">
              {{lang("correction_NoEntry")}}</span>
              <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">
              {{lang("correction_NoMal")}}</p>
            </div>
          </a>
        </div>
      </searchVue>
  </div>
</template>

<script type="text/javascript">
  import tooltip from './components/tooltip.vue'
  import searchVue from './search.vue'

  export default {
    components: {
      tooltip,
      searchVue,
    },
    props: {
      page: {
        type: Object,
        default: null
      },
    },
    data: function() {
      return {
        malUrl: '',
        searchType: this.page.page.type,
        searchKeyword: '',
        options: api.settings.options,
      }
    },
    watch: {
      url: function(url){
        if(!/^local:\/\//i.test(this.url)) this.malUrl = this.url;
      },
      wrong: function(wrong){
        if(wrong){
          this.$parent.$parent.currentTab = 'settings';
        }
      }
    },
    mounted: function(){
      if(!/^local:\/\//i.test(this.url)) this.malUrl = this.url;
      j.$(this.$el).closest('html').find("head").click();
      var This = this;
      j.$(this.$el).on('click', '.searchItem', function(e){
        e.preventDefault();
        This.submit(j.$(this).attr('href'));
      });
      if(this.wrong){
        this.$parent.$parent.currentTab = 'settings';
      }
    },
    computed: {
      title: function(){
        if(typeof this.page.malObj != 'undefined'){
          return this.page.malObj.name;
        }
        return 'Not Found';
      },
      url: function(){
        if(typeof this.page.malObj != 'undefined'){
          return this.page.malObj.url;
        }
        return '';
      },
      wrong: function(){
        if(typeof this.page != 'undefined' && typeof this.page.malObj != 'undefined' && this.page.malObj.wrong){
          return true;
        }
        return false;
      },
      offset: {
        get: function () {
          var offset = this.page.getOffset();
          if(offset === 0){
            return '';
          }
          return offset;
        },
        set: function(offset){
          if(offset !== null){
            if(offset !== ''){
              this.page.setOffset(offset);
              utils.flashm(api.storage.lang("correction_NewOffset",[offset]));
            }else{
              this.page.setOffset("0");
              utils.flashm(api.storage.lang("correction_OffsetReset"));
            }
          }
        }
      }
    },
    methods: {
      lang: api.storage.lang,
      submit: function(malUrl){
        var toDatabase = false;
        if (typeof this.page.page.database != 'undefined' && confirm('Submit database correction request?')) {
            toDatabase = 'correction';
        }
        this.$set(this.page, 'malObj', undefined);
        this.page.setCache(malUrl, toDatabase);
        utils.flashm(api.storage.lang("correction_NewUrl",[malUrl]) , false);
        this.page.handlePage();
      },
      noMal: function(){
        this.submit('');
      },
      reset: function(){
        this.page.deleteCache();
        this.$set(this.page, 'malObj', undefined);
        utils.flashm(api.storage.lang("correction_NewUrlReset") , false);
        this.page.handlePage();
      },
      update: function(){
        this.submit(this.malUrl);
      },
      searchFocus: function(){
        if(this.searchKeyword == ''){
          this.searchKeyword = this.title;
        }
      }
    }
  }
</script>
