<template>
  <ul class="demo-list-control mdl-list" style="margin: 0px; padding: 0px;">
    <div class="mdl-grid">
      <div id="page-config" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;"></div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">General</h2>
        </div>
        <checkbox option="autoTracking">'Autotracking'+utils.getTooltip('Autotracking is the function where this script automatically updates the anime`s you watch with your MAL account.','','bottom')</checkbox>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            Mode
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="syncMode" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="MAL">MyAnimeList</option>
              <option value="ANILIST">AniList</option>
            </select>
          </span>
        </li>
        <li class="mdl-list__item anilistShow" style="display: none;">
          <span class="mdl-list__item-primary-content">
            AniList
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">Authenticate</a>
          </span>
        </li>
        <li class="mdl-list__item">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
                <input class="mdl-textfield__input" type="number" step="1" id="malDelay" value="${api.settings.get('delay')}">
            <label class="mdl-textfield__label" for="malDelay">Autotracking delay (Seconds)</label>
            </div>
        </li>
      </div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">Streaming Site Links</h2>
          ${utils.getTooltip('If disabled, the streaming site will no longer appear in an animes sidebar on MAL.')}
        </div>
        <checkbox option="SiteSearch">Search</checkbox>
        <checkbox option="Kissanime">KissAnime</checkbox>
        <checkbox option="Masterani">MasterAnime</checkbox>
        <checkbox option="9anime">9anime</checkbox>
        <checkbox option="Crunchyroll">Crunchyroll</checkbox>
        <checkbox option="Gogoanime">Gogoanime</checkbox>
        <checkbox option="Twistmoe">twist.moe</checkbox>
        <checkbox option="Anime4you">Anime4You (Ger)</checkbox>
        <checkbox option="Kissmanga">KissManga</checkbox>
        <checkbox option="Mangadex">MangaDex</checkbox>
        <checkbox option="Mangarock">Mangarock</checkbox>
      </div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">MyAnimeList</h2>
        </div>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            Thumbnails
            ${utils.getTooltip('The option is for resizing the thumbnails on MAL.<br>Like thumbnails for characters, people, recommendations, etc.')}
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="malThumbnail" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="144">Large</option>
              <option value="100">Medium</option>
              <option value="60">Small</option>
              <option value="0">MAL Default</option>
            </select>
          </span>
        </li>
        <checkbox option="friendScore">Friend scores on detail page</checkbox>
      </div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">MyAnimeList / AniList</h2>
        </div>
        <checkbox option="epPredictions">Estimate episode number</checkbox>
        <checkbox option="malTags">Use Tags/Notes'+utils.getTooltip('If enabled: On your MAL Anime List and the bookmark list in miniMAL, an icon-link will be added to the last used streaming site you were using to watch an anime.<br>Simply click the icon to continue watching the anime.','','bottom')</checkbox>
        <checkbox option="malContinue">Continue watching links</checkbox>
        <checkbox option="malResume">Resume watching links</checkbox>
      </div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">miniMAL</h2>
          <!--<span style="margin-left: auto; color: #7f7f7f;">Shortcut: Ctrl + m</span>-->
        </div>
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            Display to the
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="myinfo_score" id="posLeft" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </span>
        </li>
        <!--${materialCheckbox('miniMALonMal','Display on MyAnimeList')/*TODO*/}
        ${materialCheckbox('displayFloatButton','Floating menu button')}
        ${materialCheckbox('outWay','Move video out of the way')}-->
        <li class="mdl-list__item" style="display: inline-block; width: 49%;">
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
            <input class="mdl-textfield__input" type="text" step="1" id="miniMalHeight" value="${api.settings.get('miniMalHeight')}">
            <label class="mdl-textfield__label" for="miniMalHeight">Height (px / %)
            </label>
          </div>
        </li>
        <li class="mdl-list__item" style="display: inline-block; width: 50%;">
          <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
            <input class="mdl-textfield__input" type="text" step="1" id="miniMalWidth" value="${api.settings.get('miniMalWidth')}">
            <label class="mdl-textfield__label" for="miniMalWidth">Width (px / %)</label>
          </div>
        </li>
      </div>

      <div id="updateCheck" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">Update Check</h2>
          ${utils.getTooltip('Checks for new episodes in the background.')}
          <div id="updateCheckAgo" style="margin-left: auto;"></div>
        </div>

        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            Interval
          </span>
          <span class="mdl-list__item-secondary-action">
            <select name="updateCheckTime" id="updateCheckTime" class="inputtext mdl-textfield__input" style="outline: none;">
              <option value="0">Off</option>
              <option value="60">1h</option>
              <option value="240">4h</option>
              <option value="720">12h</option>
              <option value="1440">24h</option>
              <option value="2880">48h</option>
            </select>
          </span>
        </li>
        <span class="updateCheckEnable" style="display: none;">
          <checkbox option="updateCheckNotifications">Notifications</checkbox>
        </span>
        <li class="mdl-list__item updateCheckEnable" style="display: none;"><button type="button" id="updateCheckUi" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Debugging</button></li>
      </div>

      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
        <div class="mdl-card__title mdl-card--border">
          <h2 class="mdl-card__title-text">ETC</h2>
        </div>
        <span class="option-extension" style="display: none;"><checkbox option="userscriptMode">Userscript mode'+utils.getTooltip('Disables the content script. This makes it possible to have the extension and userscript enabled at the same time.','','bottom')</checkbox></span>
        <span class="option-extension-popup" style="display: none;"><checkbox option="strictCookies">Strict Cookies</checkbox></span>
        <li class="mdl-list__item"><button type="button" id="clearCache" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Clear Cache</button></li>
      </div>
      <div id="contributer" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp"></div>
      <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">

        <li class="mdl-list__item">

          <div style="line-height: 30px;">

            <a href="https://malsync.lolamtisch.de/changelog#${api.storage.version()}">
              <img src="https://img.shields.io/badge/Changelog-${api.storage.version()}-green.svg?style=flat-square&logo=data:image/png;base64,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"/>
            </a><br/>

            <a href="https://discordapp.com/invite/cTH4yaw">
              <img src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA"/>
            </a><br/>

            <a href="https://github.com/lolamtisch/MALSync">
              <img src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&logo=github&logoColor=white&label=Github"/>
            </a><br/>

            <a href="https://github.com/lolamtisch/MALSync/issues">
              <img src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&logo=github&logoColor=white"/>
            </a><br/>

            <a href="https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel?hl=en">
              <img src="https://img.shields.io/badge/Chrome-Download-brightgreen.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white"/>
            </a><br/>

            <a href="https://addons.mozilla.org/en-US/firefox/addon/mal-sync">
              <img src="https://img.shields.io/badge/Firefox-Download-brightgreen.svg?style=flat-square&label=Firefox&logo=mozilla%20firefox&logoColor=white"/>
            </a><br/>

            <a href="https://greasyfork.org/de/scripts/372847-mal-sync">
              <img src="https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white"/>
            </a>

          </div>
        </li>
      </div>
    </div>
  </ul>
</template>

<script type="text/javascript">
  import checkbox from './components/settingsCheckbox.vue'
  export default {
    components: {
      checkbox
    },
    data: function() {
      return {
        options: api.settings.options,
      };
    }
  }
</script>
