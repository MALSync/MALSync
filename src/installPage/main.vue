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
          <div
            class="demo-content mdl-color--white mdl-shadow--4dp content mdl-color-text--grey-800"
          >
            <h3 class="noMarginTop mainHeader">
              {{ lang('minimalClass_versionMsg_Text_1') }}
            </h3>
            <h4>{{ lang('installPage_Mode') }}</h4>
            <template v-for="comp in tracking" :key="comp.key">
              <SettingsRendering :comp="comp" />
            </template>

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
            <SettingsStreaming />

            <h4>{{ lang('minimalClass_versionMsg_Text_4') }}</h4>
            <a target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
              <img
                alt="Filter List"
                src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square"
              />
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
@import '../_minimal/less/_main.less';

p {
  font-size: 16px;
}

a {
  color: rgb(255, 64, 129);
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
  border: 1px solid rgb(0 0 0 / 12%);
  border-top: none;
}
</style>

<script lang="ts">
import SettingsRendering from '../_minimal/components/settings/settings-rendering.vue';
import { trackingSimple } from '../_minimal/components/settings/settings-structure-tracking';
import SettingsStreaming from '../_minimal/components/settings/settings-streaming.vue';

export default {
  components: {
    SettingsStreaming,
    SettingsRendering,
  },
  data: () => ({
    options: api.settings.options,
    show: false,
    mode: '',
    tracking: trackingSimple,
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
    const settingsEl = document.getElementsByClassName('open-settings')[0];
    settingsEl.addEventListener('click', () => {
      con.log('Open Settings');
      chrome.runtime.openOptionsPage();
    });
  },
  methods: {
    lang: api.storage.lang,
  },
};
</script>
