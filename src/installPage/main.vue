<template>
<!--
  Material Design Lite
  Copyright 2015 Google Inc. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      https://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License
-->
<div class="demo-layout mdl-layout mdl-layout--fixed-header mdl-js-layout mdl-color--grey-100">
  <header class="demo-header mdl-layout__header mdl-layout__header--scroll mdl-color--grey-100 mdl-color-text--grey-800">
    <div class="mdl-layout__header-row">

      <span class="mdl-layout-title">
      <img id=iconimage height="32" width="32" src="https://github.com/lolamtisch/MALSync/blob/master/assets/icons/icon128.png?raw=true"></img>Mal-Sync</span>
      <div class="mdl-layout-spacer"></div>
    </div>
  </header>
  <div class="demo-ribbon"></div>
  <main class="demo-main mdl-layout__content">
    <div class="demo-container mdl-grid">
      <div class="mdl-cell mdl-cell--2-col mdl-cell--hide-tablet mdl-cell--hide-phone"></div>
      <div class="demo-content mdl-color--white mdl-shadow--4dp content mdl-color-text--grey-800 mdl-cell mdl-cell--8-col">

        <h2 class="noMarginTop mainHeader">{{lang("minimalClass_versionMsg_Text_1")}}</h2>
        <h4>{{lang("installPage_Mode")}}</h4>
        <span class="mdl-list__item-secondary-action">
          <select name="myinfo_score" id="syncMode" class="inputtext mdl-textfield__input" style="outline: none;" v-model="syncMode">
            <option value="MAL">MyAnimeList</option>
            <option value="ANILIST">AniList</option>
            <option value="KITSU">Kitsu</option>
          </select>
        </span>
        <li class="mdl-list__item" v-if="options.syncMode == 'ANILIST'">
          <span class="mdl-list__item-primary-content">
            AniList
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">{{lang("settings_Authenticate")}}</a>
          </span>
        </li>
        <li class="mdl-list__item" v-if="options.syncMode == 'KITSU'">
          <span class="mdl-list__item-primary-content">
            Kitsu
          </span>
          <span class="mdl-list__item-secondary-action">
            <a target="_blank" href="https://kitsu.io/404?mal-sync=authentication">{{lang("settings_Authenticate")}}</a>
          </span>
        </li>

        <h4>{{lang("installPage_Howto")}}</h4>
        <p>{{lang("installPage_Howto_Description")}}</p>

        <h4>{{lang("installPage_Wrong")}}</h4>
        <p>{{lang("installPage_Wrong_Description")}}</p>
        <button v-on:click='show = !show' class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
          {{lang("installPage_Open_Close")}}
        </button>
        <p v-if="show"><img id=hiddenimage src="https://github.com/Franciscoseipel/Mal-for-Kissanime-Greasymonkey-/raw/master/Screenshots/Wrong%20recognition.gif" alt="Wrong recognition"></p>

        <h4>{{lang("minimalClass_versionMsg_Text_4")}}</h4>
        <a target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
          <img alt="Filter List" src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square">
        </a>
        <h4>{{lang("minimalClass_versionMsg_Text_2")}}</h4>
        <a target="_blank" href="https://discordapp.com/invite/cTH4yaw">
          <img alt="Discord" src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&amp;logo=discord&amp;label=Discord&amp;colorB=7289DA">
        </a>
        <a target="_blank" href="https://github.com/lolamtisch/MALSync/issues">
          <img alt="Github Issues" src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white">
        </a>

        <h4>{{lang("minimalClass_versionMsg_Text_3")}}</h4>
        <a target="_blank" href="https://github.com/lolamtisch/MALSync">
          <img alt="Github" src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github">
        </a>
      </div>
    </div>
  </main>
</div>
</template>

<style lang="less">
#iconimage {
  filter: contrast(1.1);
  margin-top:-5px;
  margin-right:10px;
  border: 7px solid white;
  border-radius: 50%;
  height: 32px;
  width: 32px;
}
#hiddenimage {
  height:100%;
  width:100%;
}
.demo-ribbon {
  width: 100%;
  height: 40vh;
  background-color: #3F51B5;
  flex-shrink: 0;
}

.demo-main {
  margin-top: -35vh;
  flex-shrink: 0;
}

.demo-header .mdl-layout__header-row {
  padding-left: 40px;
}

.demo-container {
  max-width: 1600px;
  width: calc(100% - 16px);
  margin: 0 auto;
}

.demo-content {
  border-radius: 2px;
  padding: 80px 56px;
  margin-bottom: 80px;
}

.demo-layout.is-small-screen .demo-content {
  padding: 40px 28px;
}

.demo-content h3 {
  margin-top: 48px;
}

.noMarginTop{
  margin-top: 0;
}

.mainHeader{
  margin-bottom: 56px;
}
</style>

<script type="text/javascript">
  export default {
    components: {
    },
    data: () => ({
      options: api.settings.options,
      show: false,
    }),
    watch: {
    },
    methods: {
      lang: api.storage.lang,
    },
    mounted() {
      componentHandler.upgradeDom();
    },
    computed: {
      syncMode: {
        get: function () {
          return api.settings.get('syncMode');
        },
        set: function (value) {
          api.settings.set('syncMode', value);
        }
      },
    },
  }
</script>


