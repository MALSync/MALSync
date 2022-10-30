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
    <div class="demo-ribbon"></div>
    <main class="demo-main mdl-layout__content">
      <div class="demo-container mdl-grid">
        <div class="mdl-cell mdl-cell--1-col mdl-cell--hide-tablet mdl-cell--hide-phone"></div>
        <div class="mdl-cell mdl-cell--10-col">
          <div
            class="demo-content mdl-color--white mdl-shadow--4dp content mdl-color-text--grey-800"
          >
            <div class="section">
              <h3 class="noMarginTop mainHeader">
                {{ lang('minimalClass_versionMsg_Text_1') }} 🎉
              </h3>
              <p>
                <strong>
                  Let’s do a simple briefing to get you started — takes less than a minute!
                </strong>
              </p>
            </div>
            <div class="section" style="margin-bottom: 49px">
              <h4 style="margin-bottom: 9px">📂 {{ lang('installPage_Mode') }}</h4>
              <template v-for="comp in tracking" :key="comp.key">
                <SettingsRendering :comp="comp" />
              </template>
            </div>

            <div class="section">
              <h4>🔁 {{ lang('installPage_Howto') }}</h4>
              <p v-dompurify-html="lang('installPage_Howto_Description')"></p>
              <p>
                <strong>anime:</strong><br />
                The sync waits until 85% of the video is watched.
              </p>
              <p>
                <strong>For manga:</strong><br />
                The sync happens on page load.
              </p>
              <p>
                Synchronization can be configured in the
                <a class="open-settings" href="#">settings</a> — feel free to customize it your way!
              </p>
            </div>

            <div class="section">
              <h4>⚒️ {{ lang('installPage_Wrong') }}</h4>
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
            </div>

            <div class="section">
              <h4>🔗 Choose preferred quicklinks — your favorite sites one-click away</h4>
              <p>
                Quicklinks, basically, are buttons that open up your streaming/reading site of
                choice — they will be located on every overview page for any anime/manga.
              </p>
              <p>
                For example, if you like to watch anime on Crunchyroll, then Crunchyroll’s quicklink
                will appear on every anime page. It’s a convinient way to access your favorite sites
                with just one click!
              </p>
              <SettingsStreaming />
            </div>

            <div class="section">
              <h4>📃 {{ lang('minimalClass_versionMsg_Text_4') }}</h4>
              <a target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
                <img
                  alt="Filter List"
                  src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square"
                />
              </a>
            </div>

            <div class="section">
              <h4>💬 {{ lang('minimalClass_versionMsg_Text_2') }}</h4>
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
            </div>

            <div>
              <h4>🧑🏻‍💻 {{ lang('minimalClass_versionMsg_Text_3') }}</h4>
              <a target="_blank" href="https://github.com/MALSync/MALSync">
                <img
                  alt="Github"
                  src="https://img.shields.io/github/last-commit/MALSync/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="less">
@import '../_minimal/less/_main.less';

html,
h1,
h2,
h3,
h4,
h5,
h6,
p {
  font-family: Montserrat, sans-serif;
}

h3 {
  font-size: 32px;
  line-height: 39px;
  margin-bottom: 30px;
}

h4 {
  font-size: 24px;
  line-height: 29px;
  margin-bottom: 24px;
  margin-top: 0;
}

.section {
  margin-bottom: 64px;
}

p {
  font-size: 16px;
}

a {
  color: rgb(255 64 129);
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
  padding: 25px 30px;
  margin-bottom: 80px;
}

.demo-layout.is-small-screen .demo-content {
  padding: 40px 28px;
}

.noMarginTop {
  margin-top: 0;
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
