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
    <header
      class="demo-header mdl-layout__header mdl-layout__header--scroll mdl-color--grey-100 mdl-color-text--grey-800"
    >
      <div class="mdl-layout__header-row">
        <span class="mdl-layout-title">
          <img
            id="iconimage"
            height="32"
            width="32"
            src="https://github.com/MALSync/MALSync/blob/master/assets/icons/icon128.png?raw=true"
          />Mal-Sync</span
        >
        <div class="mdl-layout-spacer"></div>
      </div>
    </header>
    <div class="demo-ribbon"></div>
    <main class="demo-main mdl-layout__content">
      <div class="demo-container mdl-grid">
        <div class="mdl-cell mdl-cell--2-col mdl-cell--hide-tablet mdl-cell--hide-phone"></div>
        <div class="mdl-cell mdl-cell--8-col">
          <div class="demo-content mdl-color--white mdl-shadow--4dp content mdl-color-text--grey-800">
            <h3 class="noMarginTop mainHeader">
              {{ lang('minimalClass_versionMsg_Text_1') }}
            </h3>
            <h4>{{ lang('installPage_Mode') }}</h4>
            <span class="mdl-list__item-secondary-action">
              <select
                id="syncMode"
                v-model="syncMode"
                name="myinfo_score"
                class="inputtext mdl-textfield__input"
                style="outline: none;"
              >
                <option value="" disabled selected hidden>-- {{ lang('Select') }} --</option>
                <option value="MAL">MyAnimeList</option>
                <option value="ANILIST">AniList</option>
                <option value="KITSU">Kitsu</option>
                <option value="SIMKL">Simkl</option>
              </select>
            </span>
            <div v-if="options.syncMode !== ''" class="syncExtended">
              <li v-if="options.syncMode == 'SIMKL'" class="mdl-list__item">
                <span class="mdl-list__item-primary-content">
                  Simkl
                </span>
                <span class="mdl-list__item-secondary-action">
                  <a
                    target="_blank"
                    href="https://simkl.com/oauth/authorize?response_type=code&client_id=39e8640b6f1a60aaf60f3f3313475e830517badab8048a4e52ff2d10deb2b9b0&redirect_uri=https://simkl.com/apps/chrome/mal-sync/connected/"
                    >{{ lang('settings_Authenticate') }}</a
                  >
                </span>
              </li>
              <dropdown v-if="options.syncMode == 'SIMKL'" option="syncModeSimkl" text="Manga Sync Mode">
                <option value="MAL">MyAnimeList</option>
                <option value="ANILIST">AniList</option>
                <option value="KITSU">Kitsu</option>
              </dropdown>
              <li
                v-if="options.syncMode == 'MAL' || (options.syncMode == 'SIMKL' && options.syncModeSimkl == 'MAL')"
                class="mdl-list__item"
              >
                <span class="mdl-list__item-primary-content">
                  MyAnimeList
                </span>
                <span class="mdl-list__item-secondary-action">
                  <a target="_blank" href="https://malsync.moe/mal/oauth">{{ lang('settings_Authenticate') }}</a>
                </span>
              </li>
              <li
                v-if="
                  options.syncMode == 'ANILIST' || (options.syncMode == 'SIMKL' && options.syncModeSimkl == 'ANILIST')
                "
                class="mdl-list__item"
              >
                <span class="mdl-list__item-primary-content">
                  AniList
                </span>
                <span class="mdl-list__item-secondary-action">
                  <a
                    target="_blank"
                    href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token"
                    >{{ lang('settings_Authenticate') }}</a
                  >
                </span>
              </li>
              <li
                v-if="options.syncMode == 'KITSU' || (options.syncMode == 'SIMKL' && options.syncModeSimkl == 'KITSU')"
                class="mdl-list__item"
              >
                <span class="mdl-list__item-primary-content">
                  Kitsu
                </span>
                <span class="mdl-list__item-secondary-action">
                  <a target="_blank" href="https://kitsu.io/404?mal-sync=authentication">{{
                    lang('settings_Authenticate')
                  }}</a>
                </span>
              </li>
            </div>

            <h4>{{ lang('installPage_Howto') }}</h4>
            <p v-dompurify-html="lang('installPage_Howto_Description')"></p>

            <h4>{{ lang('installPage_Wrong') }}</h4>
            <p>{{ lang('installPage_Wrong_Description') }}</p>
            <p class="correctionGif">
              <img
                id="hiddenimage"
                height="338"
                width="600"
                src="https://raw.githubusercontent.com/lolamtisch/KissAnimeList/master/Screenshots/Wrong%20recognition.gif"
                alt="Wrong recognition"
              />
            </p>

            <h4>Quicklinks</h4>
            <quicklinksEdit />

            <h4>{{ lang('minimalClass_versionMsg_Text_4') }}</h4>
            <a target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
              <img alt="Filter List" src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square" />
            </a>
            <h4>{{ lang('minimalClass_versionMsg_Text_2') }}</h4>
            <a target="_blank" href="https://discord.com/invite/cTH4yaw">
              <img
                alt="Discord"
                src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&amp;logo=discord&amp;label=Discord&amp;colorB=7289DA"
              />
            </a>
            <a target="_blank" href="https://github.com/MALSync/MALSync/issues">
              <img
                alt="Github Issues"
                src="https://img.shields.io/github/issues/MALSync/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white"
              />
            </a>

            <h4>{{ lang('minimalClass_versionMsg_Text_3') }}</h4>
            <a target="_blank" href="https://github.com/MALSync/MALSync">
              <img
                alt="Github"
                src="https://img.shields.io/github/last-commit/MALSync/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github"
              />
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="less">
p {
  font-size: 16px;
}

#iconimage {
  filter: contrast(1.1);
  margin-top: -5px;
  margin-right: 10px;
  border: 7px solid white;
  border-radius: 50%;
  height: 32px;
  width: 32px;
}
.correctionGif {
  background-color: black;
  max-width: 100%;
  min-height: 338px;
  position: relative;
  #hiddenimage {
    height: 100%;
    object-fit: contain;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.demo-ribbon {
  width: 100%;
  height: 40vh;
  background-color: #3f51b5;
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

.noMarginTop {
  margin-top: 0;
}

.mainHeader {
  margin-bottom: 56px;
}

.syncExtended {
  background-color: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-top: none;
}

#quicklinkedit {
  background-color: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.12);

  .backbutton-settings,
  .custom {
    display: none;
  }
  .quicklinks {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
    .quicklink {
      opacity: 0.5;
      font-size: 13px;
      cursor: pointer;
      &.active {
        opacity: 1;
      }
      &.home {
        background-color: #ff6767;
      }
      &.search {
        background-color: #e4e461;
      }
      &.database {
        background-color: #90e963;
      }
      &.custom {
        background-color: white;
      }
    }
  }
  .darkbox {
    background-color: #0000002b;
    padding: 5px;
  }
  td {
    padding: 7px 2px;
  }
}
</style>

<script type="text/javascript">
import quicklinksEdit from '../minimal/minimalApp/components/quicklinksEdit.vue';
import dropdown from '../minimal/minimalApp/components/settingsDropdown.vue';

export default {
  components: {
    dropdown,
    quicklinksEdit,
  },
  data: () => ({
    options: api.settings.options,
    show: false,
    mode: '',
  }),
  computed: {
    syncMode: {
      get() {
        return this.mode;
      },
      set(value) {
        this.mode = value;
        if (!value) return;
        api.settings.set('syncMode', value);
      },
    },
  },
  watch: {},
  mounted() {
    // eslint-disable-next-line
    componentHandler.upgradeDom();

    const [settingsEl] = document.getElementsByClassName('open-settings');
    settingsEl.addEventListener('click', function() {
      con.log('Open Settings');
      chrome.runtime.openOptionsPage();
    });
  },
  methods: {
    lang: api.storage.lang,
  },
};
</script>
