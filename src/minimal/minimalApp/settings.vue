<template>
  <ul class="demo-list-control mdl-list" style="margin: 0px; padding: 0px;">
    <div class="mdl-grid">
      <div id="page-config" class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;"></div>

      <correction v-if="page && page.UILoaded" :page="page"></correction>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">{{lang("settings_General")}}</h2>
        </div>

        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_Mode")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="syncMode" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="MAL">MyAnimeList</option>
              <option value="ANILIST">AniList</option>
              <option value="KITSU">Kitsu</option>
              <option value="SIMKL">Simkl</option>
            </select>
          </span>
        </li>

        <li class="mdl-list__item" v-if="options.syncMode == 'SIMKL'">
          <span class="mdl-list__item-primary-content">
            Simkl
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://simkl.com/oauth/authorize?response_type=code&client_id=39e8640b6f1a60aaf60f3f3313475e830517badab8048a4e52ff2d10deb2b9b0&redirect_uri=https://simkl.com/apps/chrome/mal-sync/connected/">{{lang("settings_Authenticate")}}</a>
          </span>
        </li>
        <dropdown option="syncModeSimkl" text="Manga Sync Mode" v-if="options.syncMode == 'SIMKL'">
          <option value="MAL">MyAnimeList</option>
          <option value="ANILIST">AniList</option>
          <option value="KITSU">Kitsu</option>
        </dropdown>

        <li class="mdl-list__item" v-if="options.syncMode == 'ANILIST' || (options.syncMode == 'SIMKL' && options.syncModeSimkl == 'ANILIST')">
          <span class="mdl-list__item-primary-content">
            AniList
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">{{lang("settings_Authenticate")}}</a>
          </span>
        </li>

        <li class="mdl-list__item" v-if="options.syncMode == 'KITSU' || (options.syncMode == 'SIMKL' && options.syncModeSimkl == 'KITSU')">
          <span class="mdl-list__item-primary-content">
            Kitsu
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://kitsu.io/404?mal-sync=authentication">{{lang("settings_Authenticate")}}</a>
          </span>
        </li>


        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_Animesync")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="autoTrackingModeanime" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="video">{{lang("settings_Animesync_Video")}}</option>
              <option value="instant">{{lang("settings_Animesync_Instant")}}</option>
              <option value="manual">{{lang("settings_Animesync_Manual")}}</option>
            </select>
          </span>
        </li>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_Mangasync")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="autoTrackingModemanga" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="instant">{{lang("settings_Animesync_Instant")}}</option>
              <option value="manual">{{lang("settings_Animesync_Manual")}}</option>
            </select>
          </span>
        </li>
        <numberInput v-show="options.autoTrackingModeanime == 'video' || options.autoTrackingModemanga == 'video'" option="videoDuration" :min="10" :max="99">{{lang("settings_AutoTracking_Video",[options.videoDuration])}}</numberInput>

        <numberInput v-show="options.autoTrackingModeanime == 'instant' || options.autoTrackingModemanga == 'instant'" option="delay">{{lang("settings_AutoTracking_Instant",[options.delay])}}</numberInput>

        <checkbox option="localSync">{{lang("settings_LocalSync")}}
          <a href="https://github.com/lolamtisch/MALSync/wiki/Local-Sync" target="_blank" style="margin-left: auto; margin-right: 10px;">[INFO]</a>
        </checkbox>
        <li v-show="options.localSync" class="mdl-list__item">
          <button type="button" id="export" v-on:click="exportFallbackSync()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">{{lang("settings_LocalSync_Export")}}</button>
          <fileUpload style="margin-left: 15px;" @upload="importFallbackSync">{{lang("settings_LocalSync_Import")}}</fileUpload>
        </li>

      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">{{lang("settings_StreamingSite")}}</h2>
          <tooltip>{{lang("settings_StreamingSite_text")}}</tooltip>
        </div>
        <checkbox option="SiteSearch">{{lang("Search")}}</checkbox>
        <checkbox option="Kissanime">KissAnime</checkbox>
        <checkbox option="9anime">9anime</checkbox>
        <checkbox option="Crunchyroll">Crunchyroll</checkbox>
        <checkbox option="Netflix">Netflix</checkbox>
        <checkbox option="Gogoanime">Gogoanime</checkbox>
        <checkbox option="Twistmoe">twist.moe</checkbox>
        <checkbox option="Anime4you">Anime4You (Ger)</checkbox>
        <checkbox option="Kissmanga">KissManga</checkbox>
        <checkbox option="Mangadex">MangaDex</checkbox>
        <checkbox option="Mangarock">Mangarock</checkbox>
        <checkbox option="MangaNelo">MangaNelo</checkbox>
        <checkbox option="Novelplanet">Novelplanet</checkbox>
        <checkbox option="Proxeranime">Proxer (Anime)</checkbox>
        <checkbox option="Proxermanga">Proxer (Manga)</checkbox>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">MyAnimeList</h2>
        </div>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_Thumbnails")}}
            <tooltip><span v-html="lang('settings_Thumbnails_text')"></span></tooltip>
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="malThumbnail" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="144">{{lang("settings_Thumbnails_Large")}}</option>
              <option value="100">{{lang("settings_Thumbnails_Medium")}}</option>
              <option value="60">{{lang("settings_Thumbnails_Small")}}</option>
              <option value="0">{{lang("settings_Thumbnails_Default")}}</option>
            </select>
          </span>
        </li>
        <checkbox option="friendScore">{{lang("settings_FriendScore")}}</checkbox>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">MyAnimeList / AniList / Kitsu / Simkl</h2>
        </div>
        <checkbox option="epPredictions">{{lang("settings_epPredictions")}}</checkbox>
        <checkbox option="malTags">
          {{lang("settings_malTags")}}
          <tooltip direction="bottom">
            <span v-html="lang('settings_malTags_Text')"></span>
          </tooltip>
        </checkbox>
        <checkbox option="malContinue" v-show="options.malTags">{{lang("settings_malContinue")}}</checkbox>
        <checkbox option="malResume" v-show="options.malTags">{{lang("settings_malResume")}}</checkbox>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">miniMAL</h2>
          <!--<span style="margin-left: auto; color: #7f7f7f;">Shortcut: Ctrl + m</span>-->
        </div>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            Theme
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="theme" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="serial">Serial</option>
            </select>
          </span>
        </li>
        <span class="option-extension" style="display: none;"><checkbox option="minimalWindow">{{lang("settings_miniMAL_window")}}</checkbox></span>
        <checkbox option="floatButtonStealth">{{lang("settings_miniMAL_floatButtonStealth")}}</checkbox>
        <checkbox option="floatButtonHide">{{lang("settings_miniMAL_floatButtonHide")}}</checkbox>
        <checkbox option="autoCloseMinimal">{{lang("settings_miniMAL_autoCloseMinimal")}}</checkbox>

        <li v-if="commands" class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_miniMAL_Open")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            {{commands._execute_browser_action.shortcut}}
            <span v-if="!commands._execute_browser_action.shortcut"><a href="https://github.com/lolamtisch/MALSync/wiki/Shortcuts" target="_blank">{{lang("settings_miniMAL_NotSet")}}</a></span>
          </span>
        </li>

        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_miniMAL_Display")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="posLeft" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="left">{{lang("settings_miniMAL_Display_Left")}}</option>
              <option value="right">{{lang("settings_miniMAL_Display_Right")}}</option>
            </select>
          </span>
        </li>
        <!--${materialCheckbox('miniMALonMal','Display on MyAnimeList')/*TODO*/}
        ${materialCheckbox('displayFloatButton','Floating menu button')}
        ${materialCheckbox('outWay','Move video out of the way')}-->
        <li class="mdl-list__item" style="display: inline-block; width: 49%;">
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
            <input class="mdl-textfield__input" type="text" step="1" id="miniMalHeight" :value="options.miniMalHeight">
            <label class="mdl-textfield__label" for="miniMalHeight">
              {{lang("settings_miniMAL_Height")}}
            </label>
          </div>
        </li>
        <li class="mdl-list__item" style="display: inline-block; width: 50%;">
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
            <input class="mdl-textfield__input" type="text" step="1" id="miniMalWidth" :value="options.miniMalWidth">
            <label class="mdl-textfield__label" for="miniMalWidth">
              {{lang("settings_miniMAL_Width")}}
            </label>
          </div>
        </li>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">{{lang("settings_Video_Player")}}</h2>
        </div>

        <checkbox option="autofull">{{lang("settings_Video_Fullscreen")}}</checkbox>
        <checkbox option="autoresume">{{lang("settings_Video_Resume")}}</checkbox>

        <li v-if="commands" class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{commands.intro_skip_forward.description}}
          </span>
          <span class="mdl-list__item-secondary-action">
            {{commands.intro_skip_forward.shortcut}}
            <span v-if="!commands.intro_skip_forward.shortcut"><a href="https://github.com/lolamtisch/MALSync/wiki/Shortcuts" target="_blank">{{lang("settings_miniMAL_NotSet")}}</a></span>
          </span>
        </li>

        <li v-if="commands" class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{commands.intro_skip_backward.description}}
          </span>
          <span class="mdl-list__item-secondary-action">
            {{commands.intro_skip_backward.shortcut}}
            <span v-if="!commands.intro_skip_backward.shortcut"><a href="https://github.com/lolamtisch/MALSync/wiki/Shortcuts" target="_blank">{{lang("settings_miniMAL_NotSet")}}</a></span>
          </span>
        </li>

        <numberInput option="introSkip" :min="5">{{lang("settings_introSkip", [options.introSkip])}}</numberInput>

      </div>

      <div id="updateCheck" class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">{{lang("settings_UpdateCheck")}}</h2>
          <tooltip>
            {{lang("settings_UpdateCheck_Text")}}
          </tooltip>
          <div id="updateCheckAgo" style="margin-left: auto;"></div>
        </div>

        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            {{lang("settings_Interval")}}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="updateCheckTime" id="updateCheckTime" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="0">{{lang("settings_Interval_Off")}}</option>
              <option value="60">1h</option>
              <option value="240">4h</option>
              <option value="720">12h</option>
              <option value="1440">24h</option>
              <option value="2880">48h</option>
            </select>
          </span>
        </li>
        <span class="updateCheckEnable" style="display: none;">
          <checkbox option="updateCheckNotifications">{{lang("settings_Notifications")}}</checkbox>
        </span>
        <li class="mdl-list__item updateCheckEnable" style="display: none;"><button type="button" id="updateCheckUi" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">{{lang("settings_Debugging")}}</button></li>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">Discord Rich Presence</h2>
          <a style="margin-left: auto;" href="https://github.com/lolamtisch/MALSync/wiki/Discord-Rich-Presence" target="_blank"> More Info</a>
        </div>
            <checkbox option="presenceHidePage">{{lang("settings_presenceHidePage")}}</checkbox>
      </div>

      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">{{lang("settings_ETC")}}</h2>
        </div>
        <checkbox option="forceEn">Force english</checkbox>
        <span class="option-extension" style="display: none;"><checkbox option="userscriptMode">{{lang("settings_Userscriptmode")}}<tooltip direction="bottom">{{lang("settings_Userscriptmode_Text")}}</tooltip></checkbox></span>
        <span class="option-extension-popup" style="display: none;"><checkbox option="strictCookies">{{lang("settings_StrictCookies")}}<tooltip>{{lang("settings_StrictCookies_Text")}}</tooltip></checkbox></span>

        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            List Sync
          </span>
          <span class="mdl-list__item-secondary-action">
            <button type="button" id="listSyncUi" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Sync</button>
          </span>
        </li>

        <li class="mdl-list__item">
          <button type="button" id="clearCache" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">{{lang("settings_ClearCache")}}</button>
          <button type="button" id="cleanTagsUi" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-left: 20px;">Clean Tags</button>
        </li>
      </div>
      <div @click="myOpen()" v-bind:class="{'open': isOpen}" id="contributer" class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div style="display: table; width: 100%;">
          <template v-for="(contributerGroup, group) in contributer" class="inline-block">
            <div class="group">{{group}}</div>
            <div v-for="contr in contributerGroup" class="inline-block">
              <div class="user">
                <div class="image align-middle">
                  <clazy-load :src="contr.gif" v-if="contr.gif">
                    <img :src="contr.gif" class="lazy init gif" style="max-width: 100%;">
                  </clazy-load>
                  <clazy-load :src="contr.image">
                    <img :src="contr.image" class="lazy init" style="max-width: 100%;">
                  </clazy-load>
                </div>
                <div class="text align-middle">
                  <div class="name" :style="'color:'+ contr.color" :title="contr.name">
                    {{contr.name}}
                  </div>
                  <div class="subtext" v-if="contr.subText">{{contr.subText}}</div>
                </div>
              </div>
            </div>
          </template>
          <div class="user pop">
            <div class="image align-middle">
              <i class="material-icons" style="color: white; padding: 4px 4px; cursor: pointer;">
                arrow_right_alt
              </i>
            </div>
          </div>
          <a rel="noreferrer" href="https://discordapp.com/invite/cTH4yaw" class="discord">
            <div style="height: 20px; margin: -15px; margin-top: 15px; background: -webkit-linear-gradient(top, #ffffff 0%,#738bd7 74%);"></div>
            <clazy-load src="https://discordapp.com/api/guilds/358599430502481920/widget.png?style=banner3" style="background: linear-gradient(to bottom, #738bd7 0%,#738bd7 64%,#697ec4 64%,#697ec4 100%); background-color: #697ec4; position: relative; overflow: hidden; margin-left: -15px; margin-right: -15px; margin-bottom: -15px; margin-top: 15px;">
              <img style="margin: auto; display: block;" src="https://discordapp.com/api/guilds/358599430502481920/widget.png?style=banner3">
            </clazy-load>
          </a>
        </div>
      </div>
      <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">

        <li class="mdl-list__item">
          <div style="line-height: 30px;">

            <clazy-load tag="a" rel="noreferrer" :href="version.link" :src="version.img">
              <img :src="version.img"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://discordapp.com/invite/cTH4yaw" src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA">
              <img src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://github.com/lolamtisch/MALSync" src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&logo=github&logoColor=white&label=Github">
              <img src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&logo=github&logoColor=white&label=Github"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://github.com/lolamtisch/MALSync/issues" src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&logo=github&logoColor=white">
              <img src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&logo=github&logoColor=white"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel?hl=en" src="https://img.shields.io/badge/Chrome-Download-brightgreen.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white">
              <img src="https://img.shields.io/badge/Chrome-Download-brightgreen.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://addons.mozilla.org/en-US/firefox/addon/mal-sync" src="https://img.shields.io/badge/Firefox-Download-brightgreen.svg?style=flat-square&label=Firefox&logo=mozilla%20firefox&logoColor=white">
              <img src="https://img.shields.io/badge/Firefox-Download-brightgreen.svg?style=flat-square&label=Firefox&logo=mozilla%20firefox&logoColor=white"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>
            <br/>

            <clazy-load tag="a" rel="noreferrer" href="https://greasyfork.org/de/scripts/372847-mal-sync" src="https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white">
              <img src="https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white"/>
              <span slot="placeholder">
                {{lang("Loading")}}
              </span>
            </clazy-load>

          </div>
        </li>
      </div>
    </div>
  </ul>
</template>

<script type="text/javascript">
  import checkbox from './components/settingsCheckbox.vue'
  import numberInput from './components/settingsNumberInput.vue'
  import dropdown from './components/settingsDropdown.vue'
  import fileUpload from './components/settingsFileUpload.vue'
  import tooltip from './components/tooltip.vue'
  import correction from './correction.vue';

  import {exportData, importData} from "./../../provider/Local/userList";

  export default {
    components: {
      correction,
      tooltip,
      checkbox,
      numberInput,
      dropdown,
      fileUpload
    },
    props: {
      page: {
        type: Object,
        default: null
      },
    },
    mounted: function(){
      api.request.xhr('GET', 'https://kissanimelist.firebaseio.com/Data2/Notification/Contributer.json').then((response) => {
        try{
          this.contributer = JSON.parse(response.responseText.replace(/(^"|"$)/gi,'').replace(/\\"/g, '"'));
        }catch(e){
          con.error('Contributer Could not be retieved', e);
          return;
        }
        con.log('Contributer', this.contributer);
      });
      if(api.type == 'webextension' && j.$('#Mal-Sync-Popup').length){
        chrome.commands.getAll((commands) => {
          con.info('Commands', commands);

          var tempCommands = commands.reduce(function ( total, current ) {
            total[ current.name ] = current;
            return total;
          }, {});

          this.commands = tempCommands;
        })
      }

    },
    methods: {
      lang: api.storage.lang,
      myOpen: function(){
        this.isOpen = !this.isOpen;
      },
      importFallbackSync: function(filecontent){
        con.log('Import FallbackSync', filecontent);
        try{
          var iData = JSON.parse(filecontent);
          con.log('data', iData);
          var firstData = iData[Object.keys(iData)[0]];
          if(!firstData.hasOwnProperty("name")) throw 'No name';
          if(!firstData.hasOwnProperty("progress")) throw 'No progress';
          if(!firstData.hasOwnProperty("score")) throw 'No score';
          if(!firstData.hasOwnProperty("status")) throw 'No status';
          if(!firstData.hasOwnProperty("tags")) throw 'No tags';

          importData(iData).then(() => {
            utils.flashm('File imported');
          });

        }catch(e){
          alert('File has wrong formating');
          con.error('File has wrong formating:', e);
        }
      },
      exportFallbackSync: async function(){
        var exportObj = await exportData();
        con.log('Export', exportObj);

        var filecontent = 'data:text/csv;charset=utf-8,'+JSON.stringify(exportObj);
        var encodedUri = encodeURI(filecontent);
        try{
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "malsync_"+new Date().toJSON().slice(0,10).replace(/-/g,'/')+".txt");
          document.body.appendChild(link);

          link.click();
        }catch(e){
          window.open(encodedUri);
        }
        utils.flashm('File exported');
      }
    },
    data: function() {
      return {
        contributer: [],
        isOpen: false,
        options: api.settings.options,
        commands: null,
        version: {
          link: `https://malsync.lolamtisch.de/changelog#${api.storage.version()}`,
          img: `https://img.shields.io/badge/Changelog-${api.storage.version()}-green.svg?style=flat-square&logo=data:image/png;base64,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`
        }
      };
    }
  }
</script>
