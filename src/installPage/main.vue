<template>
  <div>
    <div class = "mdl-layout mdl-js-layout mdl-layout--fixed-header">
     <header class = "mdl-layout__header">
      <div class = "mdl-layout__header-row">      
       <span class = "mdl-layout-title">Mal-Sync</span>          
     </div>       
   </header>     

   <main class = "mdl-layout__content">    
    <div class = "mdl-tabs mdl-js-tabs">
     <div class = "mdl-tabs__tab-bar"> 
      <a href = "#tab1-panel" class = "mdl-tabs__tab is-active">{{lang("installPage_Welcome")}}</a>
      <a href = "#tab2-panel" class = "mdl-tabs__tab">{{lang("settings_Mode")}}</a>
      <a href = "#tab3-panel" class = "mdl-tabs__tab">Tab 3</a>
    </div>

    <!--Tab 1 Welcome-->
    <div class = "mdl-tabs__panel is-active" id = "tab1-panel">
      <h4>{{lang("minimalClass_versionMsg_Text_1")}}</h4>

      <p v-html="lang('minimalClass_versionMsg_Text_4')"></p>
      <a class="link" target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
        <img alt="Filter List" src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square">
      </a>
      <p>{{lang("minimalClass_versionMsg_Text_2")}}</p>
      <a class="link" rel="noreferrer" target="_blank" href="https://github.com/lolamtisch/MALSync/issues"><img src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white"> </a>
      <a class="link" rel="noreferrer" target="_blank" href="https://discordapp.com/invite/cTH4yaw"><img src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&amp;logo=discord&amp;label=Chat%20%2F%20Support&amp;colorB=7289DA"> </a>
    </p>

    <p>{{lang("minimalClass_versionMsg_Text_3")}}</p>
    <a class="link" rel="noreferrer" target="_blank" href="https://github.com/lolamtisch/MALSync"><img src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github"> </a>

    <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
      <i class="material-icons">navigate_next</i>
      <a href="#tab2-panel"></a>
    </button>
  </div>
  <!--Tab 2 Mode-->
  <div class = "mdl-tabs__panel" id = "tab2-panel">

    <p>{{lang("installPage_Mode")}}</p>

    <span class="mdl-list__item-secondary-action">
      <select name="myinfo_score" id="syncMode" class="inputtext mdl-textfield__input">
        <option value="MAL">MyAnimeList</option>
        <option value="ANILIST">AniList</option>
        <option value="KITSU">Kitsu</option>
      </select>
    </span>
  </div>
  <!--Tab 3-->
  <div class = "mdl-tabs__panel" id = "tab3-panel">
    <p>Tab 3 Content</p>
  </div>
</div>
</main>
</div>  
</div>
</template>

<style lang="less">
.link{
  display: block;
}
.mdl-button {
  margin-top:5px;
}
</style>

<script type="text/javascript">
  export default {
    components: {
    },
    data: () => ({
      options: api.settings.options,
    }),
    watch: {
    },
    methods: {
      lang: api.storage.lang,
    },
    mounted() {
      componentHandler.upgradeDom();
    }
  }
</script>
