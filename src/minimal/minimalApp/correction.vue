<template>
  <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
    <div class="mdl-card__title mdl-card--border">
        <h2 class="mdl-card__title-text">
          {{title}}
        </h2>
        <a href="https://github.com/lolamtisch/MALSync/wiki/Troubleshooting" style="margin-left: auto;">Help</a>
      </div>
      <div class="mdl-list__item">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="number" step="1" id="malOffset" v-model="offset">
          <label class="mdl-textfield__label" for="malOffset">Episode Offset</label>
          <tooltip direction="left" style="float: right; margin-top: -17px;">
            Input the episode offset, if an anime has 12 episodes, but uses the numbers 0-11 rather than 1-12, you simply type " +1 " in the episode offset.
          </tooltip>
        </div>
      </div>
      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malUrlInput" v-model="malUrl">
          <label class="mdl-textfield__label" for="malUrlInput">MyAnimeList Url</label>
          <tooltip direction="left" style="float: right; margin-top: -17px;">
            Only change this URL if it points to the wrong anime page on MAL.
          </tooltip>
        </div>
      </div>

      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <label class="mdl-textfield__label" for="malSearch">
            Correction Search
          </label>
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malSearch">
          <tooltip direction="left" style="float: right; margin-top: -17px;">
            This field is for finding an anime, when you need to correct the "MyAnimeList Url" shown above.<br>
            To make a search, simply begin typing the name of an anime, and a list with results will automatically appear as you type.
          </tooltip>
        </div>
      </div>
      <div class="mdl-list__item" style="min-height: 0; padding-bottom: 0; padding-top: 0;">
        <div class="malResults" id="malSearchResults"></div>
      </div>

      <div class="mdl-list__item">
        <button @click="update()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="malSubmit">Update</button>
        <button @click="reset()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" id="malReset" style="margin-left: 5px;">Reset</button>
        <button @click="noMal()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" id="malNotOnMal" style="margin-left: 5px; float: right; margin-left: auto;" title="If the Anime/Manga can't be found on MAL">No MAL</button>
      </div>
  </div>
</template>

<script type="text/javascript">
  import tooltip from './components/tooltip.vue'
  export default {
    components: {
      tooltip,
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
      }
    },
    watch: {
      url: function(url){
        this.malUrl = this.url;
      },
    },
    mounted: function(){
      this.malUrl = this.url;
      j.$(this.$el).closest('html').find("head").click();
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
      offset: {
        get: function () {
          var offset = this.page.getOffset();
          if(offset == 0){
            return '';
          }
          return offset;
        },
        set: function(offset){
          if(offset !== null){
            if(offset !== ''){
              this.page.setOffset(offset);
              utils.flashm("New Offset ("+offset+") set.");
            }else{
              this.page.setOffset("0");
              utils.flashm("Offset reset");
            }
          }
        }
      }
    },
    methods: {
      submit: function(malUrl){
        var toDatabase = false;
        if (typeof this.page.page.database != 'undefined' && confirm('Submit database correction request?')) {
            toDatabase = 'correction';
        }
        this.$set(this.page, 'malObj', undefined);
        this.page.setCache(malUrl, toDatabase);
        utils.flashm( "new url '"+malUrl+"' set." , false);
        this.page.handlePage();
      },
      noMal: function(){
        this.submit('');
      },
      reset: function(){
        this.page.deleteCache();
        this.$set(this.page, 'malObj', undefined);
        utils.flashm( "MyAnimeList url reset" , false);
        this.page.handlePage();
      },
      update: function(){
        this.submit(this.malUrl);
      }
    }
  }
</script>
